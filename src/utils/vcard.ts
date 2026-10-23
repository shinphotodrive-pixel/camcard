import { BusinessCardData } from '../types';

export function businessCardToVCard(card: BusinessCardData): string {
  const n = card.name || { fullName: '', firstName: '', lastName: '' };
  const c = card.company || { name: '' };
  const p = card.phones || {};
  const e = card.emails || { primary: '' };
  const a = card.address || { formatted: '' };
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
  sites.forEach((site) => {
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

export function downloadVCard(card: BusinessCardData) {
  const vcardStr = businessCardToVCard(card);
  const blob = new Blob([vcardStr], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const fileName = `${(card.name.fullName || 'contact').replace(/[^a-zA-Z0-9가-힣_-]/g, '_')}.vcf`;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadAllVCards(cards: BusinessCardData[]) {
  const fullContent = cards.map(businessCardToVCard).join('\r\n\r\n');
  const blob = new Blob([fullContent], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `CamCard_All_Contacts_${new Date().toISOString().slice(0, 10)}.vcf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadJsonFile(data: any, fileName: string = 'camcard-data.json') {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportCardsToCsv(cards: BusinessCardData[]) {
  const headers = [
    'Full Name',
    'First Name',
    'Last Name',
    'Job Title',
    'Department',
    'Company',
    'Mobile Phone',
    'Work Phone',
    'Fax',
    'Email',
    'Secondary Email',
    'Address',
    'Website',
    'Industry',
    'Tags',
    'Notes',
    'Date Added',
  ];

  const rows = cards.map((c) => [
    c.name.fullName || '',
    c.name.firstName || '',
    c.name.lastName || '',
    c.jobTitle || '',
    c.department || '',
    c.company.name || '',
    c.phones.mobile || '',
    c.phones.work || '',
    c.phones.fax || '',
    c.emails.primary || '',
    c.emails.secondary || '',
    c.address.formatted || '',
    (c.websites || []).join('; '),
    c.industry || '',
    (c.tags || []).join('; '),
    (c.notes || '').replace(/"/g, '""'),
    c.createdAt || '',
  ]);

  const escapeCell = (val: string) => `"${val.replace(/"/g, '""')}"`;
  const csvContent =
    '\uFEFF' + // UTF-8 BOM for Excel compatibility
    [headers.map(escapeCell).join(','), ...rows.map((r) => r.map(escapeCell).join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `CamCard_Contacts_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseVCardTextToCard(vcardText: string): Partial<BusinessCardData> {
  const lines = vcardText.split(/\r\n|\r|\n/);
  const card: any = {
    id: 'card_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    name: { fullName: '', firstName: '', lastName: '' },
    company: { name: '' },
    phones: {},
    emails: { primary: '' },
    address: { formatted: '' },
    websites: [],
    tags: ['Imported-vCard'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  lines.forEach((line) => {
    const clean = line.trim();
    if (clean.startsWith('FN:')) {
      card.name.fullName = clean.substring(3).trim();
    } else if (clean.startsWith('N:')) {
      const parts = clean.substring(2).split(';');
      card.name.lastName = parts[0] || '';
      card.name.firstName = parts[1] || '';
      if (!card.name.fullName) {
        card.name.fullName = [card.name.lastName, card.name.firstName].filter(Boolean).join(' ');
      }
    } else if (clean.startsWith('ORG:')) {
      const orgParts = clean.substring(4).split(';');
      card.company.name = orgParts[0] || '';
      if (orgParts[1]) card.department = orgParts[1];
    } else if (clean.startsWith('TITLE:')) {
      card.jobTitle = clean.substring(6).trim();
    } else if (clean.includes('TEL')) {
      const val = clean.substring(clean.indexOf(':') + 1).trim();
      if (/CELL|MOBILE/i.test(clean)) card.phones.mobile = val;
      else if (/FAX/i.test(clean)) card.phones.fax = val;
      else card.phones.work = val;
    } else if (clean.includes('EMAIL')) {
      const val = clean.substring(clean.indexOf(':') + 1).trim();
      if (!card.emails.primary) card.emails.primary = val;
      else card.emails.secondary = val;
    } else if (clean.startsWith('URL:') || clean.includes('URL;')) {
      const val = clean.substring(clean.indexOf(':') + 1).trim();
      if (val) card.websites.push(val);
    } else if (clean.includes('ADR')) {
      const val = clean.substring(clean.indexOf(':') + 1).trim();
      const parts = val.split(';').filter(Boolean);
      card.address.formatted = parts.join(' ');
    } else if (clean.startsWith('NOTE:')) {
      card.notes = clean.substring(5).replace(/\\n/g, '\n').trim();
    } else if (clean.startsWith('CATEGORIES:')) {
      card.tags = clean.substring(11).split(',').map((t) => t.trim()).filter(Boolean);
    }
  });

  return card;
}
