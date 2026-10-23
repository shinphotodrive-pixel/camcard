import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

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
    lines.push(`NOTE:${card.notes.replace(/\r?\n/g, '\\n')}`);
  }
  if (Array.isArray(card.tags) && card.tags.length > 0) {
    lines.push(`CATEGORIES:${card.tags.join(',')}`);
  }
  lines.push('END:VCARD');
  return lines.join('\r\n');
}

export default async function handler(req: any, res: any) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageBase64, mimeType = 'image/jpeg', manualText } = req.body || {};

    if (!imageBase64 && !manualText) {
      return res.status(400).json({ error: 'imageBase64 또는 manualText를 제공해주세요.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY가 서버 환경변수에 설정되지 않았습니다.',
      });
    }

    // Sanitize Base64 image
    const parts: any[] = [];
    if (imageBase64) {
      let cleanBase64 = imageBase64.trim();
      const commaIdx = cleanBase64.indexOf(',');
      if (commaIdx !== -1 && cleanBase64.slice(0, commaIdx).includes('base64')) {
        cleanBase64 = cleanBase64.slice(commaIdx + 1);
      }
      cleanBase64 = cleanBase64.replace(/\s/g, '');

      let detectedMime = mimeType || 'image/jpeg';
      const mimeMatch = imageBase64.match(/^data:([^;,]+);/);
      if (mimeMatch && mimeMatch[1]) {
        detectedMime = mimeMatch[1];
      }

      parts.push({
        inlineData: {
          mimeType: detectedMime,
          data: cleanBase64,
        },
      });
    }

    if (manualText) {
      parts.push({ text: `Raw text from card:\n${manualText}` });
    }

    const prompt = `You are CamCard AI, an ultra-precise business card OCR and entity extraction engine modeled after ti-CamCard2Json.
Analyze this business card image carefully and extract all contact and company details into JSON.
- name:
  * fullName: Full personal name as written (Korean, English, Japanese, Chinese, etc.)
  * firstName: Given name
  * lastName: Family name (e.g. 김, 이, 박, 최, Smith, Tanaka)
  * titleHonorific: Any honorific or title (e.g. 박사, 변호사, Ph.D., 회장)
- jobTitle: Job title or position (e.g. CEO, 대표이사, 수석연구원, 팀장, 매니저, Director). If none, empty string.
- department: Department or team name. If none, empty string.
- company:
  * name: Company or organization name.
  * division: Division or branch name.
- phones:
  * mobile: Cellular phone number (e.g. 010-xxxx-xxxx, +82 10-xxxx-xxxx).
  * work: Office landline phone (e.g. 02-xxx-xxxx, 031-xxx-xxxx).
  * fax: Fax number.
- emails:
  * primary: Primary email address. If none found, empty string.
  * secondary: Secondary email if present.
- address:
  * formatted: Full street/building address. If none found, empty string.
  * street, city, state, postalCode, country
- websites: Array of website URLs (e.g. ["https://company.com"]).
- socialLinks: linkedin, twitter, github, instagram.
- industry: Relevant industry category (e.g. "IT & Software", "Finance", "Healthcare", "Legal", "Consulting", "Design").
- notes: Slogan, taglines, or additional certifications.
- rawText: Complete raw text transcribed line by line from the card.
Never invent fictional details. If a field is not on the card, use empty string "".`;

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
            },
            jobTitle: { type: Type.STRING },
            department: { type: Type.STRING },
            company: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                division: { type: Type.STRING },
              },
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
        },
      },
    });

    const text = response.text || '{}';
    let parsedData: any = {};
    try {
      parsedData = JSON.parse(text);
    } catch (parseErr) {
      const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match) {
        parsedData = JSON.parse(match[1]);
      } else {
        throw parseErr;
      }
    }

    // Ensure fallback safety for sub-objects
    if (!parsedData.name) parsedData.name = { fullName: '이름 미확인' };
    if (!parsedData.company) parsedData.company = { name: '' };
    if (!parsedData.phones) parsedData.phones = {};
    if (!parsedData.emails) parsedData.emails = { primary: '' };
    if (!parsedData.address) parsedData.address = { formatted: '' };
    if (!Array.isArray(parsedData.websites)) parsedData.websites = [];
    if (!Array.isArray(parsedData.tags)) parsedData.tags = ['스캔완료'];

    // Generate standard vCard
    const vcard = generateVCard(parsedData);

    return res.status(200).json({
      success: true,
      data: parsedData,
      vcard,
      source: 'gemini-3.8-flash',
    });
  } catch (err: any) {
    console.error('Error in /api/card-to-json:', err);
    return res.status(500).json({
      success: false,
      error: err.message || '명함 분석 처리 중 오류가 발생했습니다.',
    });
  }
}
