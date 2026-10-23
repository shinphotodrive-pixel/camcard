export default async function handler(req: any, res: any) {
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
    const { vcardText } = req.body || {};
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

    return res.status(200).json({ success: true, data: cardData });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to parse vCard' });
  }
}
