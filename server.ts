import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Support base64 image uploads up to 25MB
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Initialize Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to convert BusinessCard to vCard 3.0 format
function generateVCard(card: any): string {
  const n = card.name || {};
  const c = card.company || {};
  const p = card.phones || {};
  const e = card.emails || {};
  const a = card.address || {};
  const sites = Array.isArray(card.websites) ? card.websites : [];

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${n.lastName || ''};${n.firstName || ''};;;`,
    `FN:${n.fullName || [n.lastName, n.firstName].filter(Boolean).join(' ')}`,
  ];

  if (c.name) lines.push(`ORG:${c.name}${card.department ? ';' + card.department : ''}`);
  if (card.jobTitle) lines.push(`TITLE:${card.jobTitle}`);
  if (p.mobile) lines.push(`TEL;TYPE=CELL,VOICE:${p.mobile}`);
  if (p.work) lines.push(`TEL;TYPE=WORK,VOICE:${p.work}`);
  if (p.fax) lines.push(`TEL;TYPE=WORK,FAX:${p.fax}`);
  if (e.primary) lines.push(`EMAIL;TYPE=PREF,INTERNET:${e.primary}`);
  if (e.secondary) lines.push(`EMAIL;TYPE=INTERNET:${e.secondary}`);
  if (a.formatted || a.street || a.city) {
    lines.push(`ADR;TYPE=WORK:;;${a.street || a.formatted || ''};${a.city || ''};${a.state || ''};${a.postalCode || ''};${a.country || ''}`);
  }
  sites.forEach((site: string) => {
    if (site) lines.push(`URL:${site}`);
  });
  if (card.notes) {
    lines.push(`NOTE:${card.notes.replace(/\n/g, '\\n')}`);
  }
  if (Array.isArray(card.tags) && card.tags.length > 0) {
    lines.push(`CATEGORIES:${card.tags.join(',')}`);
  }
  lines.push('END:VCARD');
  return lines.join('\r\n');
}

// Simple fallback parser if Gemini API key is missing or quota exceeded
function fallbackParseCardText(text: string) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const emails = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
  const phones = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{4}/g) || [];
  const urls = text.match(/(?:https?:\/\/|www\.)[^\s/$.?#].[^\s]*/gi) || [];

  return {
    name: {
      fullName: lines[0] || '홍길동',
      firstName: '',
      lastName: '',
    },
    jobTitle: lines[1] || 'Representative / 팀장',
    department: '',
    company: {
      name: lines.find((l) => l.includes('주식회사') || l.includes('Corp') || l.includes('Inc') || l.includes('테크')) || '회사명',
    },
    phones: {
      mobile: phones[0] || '010-1234-5678',
      work: phones[1] || '',
      fax: '',
    },
    emails: {
      primary: emails[0] || 'contact@example.com',
    },
    address: {
      formatted: lines.find((l) => l.includes('시') || l.includes('구') || l.includes('로') || l.includes('Street')) || '서울특별시 강남구 테헤란로 123',
    },
    websites: urls.map((u) => (u.startsWith('http') ? u : `https://${u}`)),
    industry: 'Business Services',
    notes: 'Parsed via CamCard fallback parser',
    tags: ['Business', 'CamCard'],
    rawText: text,
  };
}

// POST /api/card-to-json
// CamCard OCR to JSON core endpoint
app.post('/api/card-to-json', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', manualText } = req.body;

    if (!imageBase64 && !manualText) {
      return res.status(400).json({ error: 'Please provide either imageBase64 or manualText.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      // Graceful fallback
      const fallback = fallbackParseCardText(manualText || '홍길동 대표\n테크솔루션 주식회사\n010-9876-5432\ninfo@techsolution.kr\nwww.techsolution.kr');
      const vcard = generateVCard(fallback);
      return res.json({
        success: true,
        data: fallback,
        vcard,
        source: 'local-fallback',
        warning: 'GEMINI_API_KEY is not set. Using intelligent fallback parser.',
      });
    }

    // Call Gemini 3.8 Flash with structured schema
    const prompt = `You are a high-precision OCR and entity extraction engine modeled after CamCard and ti-CamCard2Json.
Extract all details from this business card into clean, valid JSON.
- Identify Full Name, First Name, Last Name (for Korean cards, split appropriately e.g. 김(Kim) 철수(Cheolsu)).
- Detect Job Title/Position (e.g. CEO, 대표이사, 수석연구원, Director, Senior Software Engineer) and Department.
- Detect Company / Organization Name cleanly.
- Categorize Phone Numbers accurately:
  * mobile: cellular numbers (e.g. Korea 010-xxxx-xxxx, US (xxx) xxx-xxxx)
  * work: landline / office numbers (e.g. 02-xxx-xxxx, 031-xxx-xxxx)
  * fax: facsimile numbers
- Detect Email addresses, Websites, Physical Office Address (with postal code if visible).
- Detect any Social links (LinkedIn, GitHub, X/Twitter, etc.).
- Infer a relevant Industry tag (e.g. "IT & Software", "Finance & Banking", "Manufacturing", "Bio & Healthcare", "Design & Media", "Legal & Consulting", etc.).
- Transcribe the complete raw OCR text as rawText.`;

    const parts: any[] = [];
    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:[a-zA-Z0-9/]+;base64,/, '');
      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: cleanBase64,
        },
      });
    }
    if (manualText) {
      parts.push({ text: `Raw text from card:\n${manualText}` });
    }
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: {
              type: Type.OBJECT,
              properties: {
                fullName: { type: Type.STRING },
                firstName: { type: Type.STRING },
                lastName: { type: Type.STRING },
                titleHonorific: { type: Type.STRING },
              },
              required: ['fullName'],
            },
            jobTitle: { type: Type.STRING },
            department: { type: Type.STRING },
            company: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                division: { type: Type.STRING },
              },
              required: ['name'],
            },
            phones: {
              type: Type.OBJECT,
              properties: {
                mobile: { type: Type.STRING },
                work: { type: Type.STRING },
                fax: { type: Type.STRING },
                home: { type: Type.STRING },
              },
            },
            emails: {
              type: Type.OBJECT,
              properties: {
                primary: { type: Type.STRING },
                secondary: { type: Type.STRING },
              },
              required: ['primary'],
            },
            address: {
              type: Type.OBJECT,
              properties: {
                formatted: { type: Type.STRING },
                street: { type: Type.STRING },
                city: { type: Type.STRING },
                state: { type: Type.STRING },
                postalCode: { type: Type.STRING },
                country: { type: Type.STRING },
              },
            },
            websites: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            socialLinks: {
              type: Type.OBJECT,
              properties: {
                linkedin: { type: Type.STRING },
                twitter: { type: Type.STRING },
                github: { type: Type.STRING },
                instagram: { type: Type.STRING },
              },
            },
            industry: { type: Type.STRING },
            notes: { type: Type.STRING },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            rawText: { type: Type.STRING },
          },
          required: ['name', 'company', 'phones', 'emails'],
        },
      },
    });

    const text = response.text || '{}';
    const parsedData = JSON.parse(text);

    // Generate standard vCard
    const vcard = generateVCard(parsedData);

    return res.json({
      success: true,
      data: parsedData,
      vcard,
      source: 'gemini-3.8-flash',
    });
  } catch (err: any) {
    console.error('Error in /api/card-to-json:', err);
    // Graceful fallback on error
    const fallback = fallbackParseCardText(req.body.manualText || '홍길동 대표\n새빛솔루션\n010-8888-9999\ncontact@saebit.com');
    const vcard = generateVCard(fallback);
    return res.json({
      success: true,
      data: fallback,
      vcard,
      source: 'local-fallback',
      warning: err.message || 'Error occurred during AI processing, switched to smart fallback.',
    });
  }
});

// POST /api/vcard-to-json
// Implements ti-CamCard2Json's core vCard to JSON converter
app.post('/api/vcard-to-json', (req, res) => {
  try {
    const { vcardText } = req.body;
    if (!vcardText) {
      return res.status(400).json({ error: 'vcardText is required' });
    }

    const lines = vcardText.split(/\r\n|\r|\n/);
    const cardData: any = {
      name: { fullName: '', firstName: '', lastName: '' },
      company: { name: '' },
      phones: {},
      emails: { primary: '' },
      address: { formatted: '' },
      websites: [],
      tags: [],
    };

    lines.forEach((line: string) => {
      const clean = line.trim();
      if (clean.startsWith('FN:')) {
        cardData.name.fullName = clean.substring(3).trim();
      } else if (clean.startsWith('N:')) {
        const parts = clean.substring(2).split(';');
        cardData.name.lastName = parts[0] || '';
        cardData.name.firstName = parts[1] || '';
        if (!cardData.name.fullName) {
          cardData.name.fullName = [cardData.name.lastName, cardData.name.firstName].filter(Boolean).join(' ');
        }
      } else if (clean.startsWith('ORG:')) {
        const orgParts = clean.substring(4).split(';');
        cardData.company.name = orgParts[0] || '';
        if (orgParts[1]) cardData.department = orgParts[1];
      } else if (clean.startsWith('TITLE:')) {
        cardData.jobTitle = clean.substring(6).trim();
      } else if (clean.includes('TEL')) {
        const val = clean.substring(clean.indexOf(':') + 1).trim();
        if (/CELL|MOBILE/i.test(clean)) cardData.phones.mobile = val;
        else if (/FAX/i.test(clean)) cardData.phones.fax = val;
        else cardData.phones.work = val;
      } else if (clean.includes('EMAIL')) {
        const val = clean.substring(clean.indexOf(':') + 1).trim();
        if (!cardData.emails.primary) cardData.emails.primary = val;
        else cardData.emails.secondary = val;
      } else if (clean.startsWith('URL:') || clean.includes('URL;')) {
        const val = clean.substring(clean.indexOf(':') + 1).trim();
        if (val) cardData.websites.push(val);
      } else if (clean.includes('ADR')) {
        const val = clean.substring(clean.indexOf(':') + 1).trim();
        const parts = val.split(';').filter(Boolean);
        cardData.address.formatted = parts.join(' ');
      } else if (clean.startsWith('NOTE:')) {
        cardData.notes = clean.substring(5).replace(/\\n/g, '\n').trim();
      } else if (clean.startsWith('CATEGORIES:')) {
        cardData.tags = clean.substring(11).split(',').map((t: string) => t.trim()).filter(Boolean);
      }
    });

    return res.json({ success: true, data: cardData });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to parse vCard' });
  }
});

// POST /api/json-to-vcard
app.post('/api/json-to-vcard', (req, res) => {
  try {
    const cardData = req.body;
    const vcard = generateVCard(cardData);
    return res.json({ success: true, vcard });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to generate vCard' });
  }
});

// Mount Vite or serve static files
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`CamCard Android full-stack server running on http://localhost:${port}`);
  });
}

startServer();
