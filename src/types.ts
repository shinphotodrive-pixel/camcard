export interface BusinessCardData {
  id: string;
  name: {
    fullName: string;
    firstName: string;
    lastName: string;
    titleHonorific?: string;
  };
  jobTitle: string;
  department: string;
  company: {
    name: string;
    division?: string;
    legalName?: string;
  };
  phones: {
    mobile?: string;
    work?: string;
    fax?: string;
    home?: string;
  };
  emails: {
    primary: string;
    secondary?: string;
  };
  address: {
    formatted: string;
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  websites: string[];
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    instagram?: string;
  };
  industry?: string;
  notes?: string;
  rawText?: string;
  tags: string[];
  photoUrl?: string; // card front image
  backPhotoUrl?: string; // card back image
  createdAt: string;
  updatedAt: string;
  isFavorite?: boolean;
  meetingDate?: string;
  meetingLocation?: string;
  cardColorTheme?: 'slate' | 'navy' | 'emerald' | 'crimson' | 'amber' | 'purple';
}

export type AppTab = 'cards' | 'scan' | 'camcard2json' | 'mycard' | 'settings';

export type ViewMode = 'grid' | 'list' | 'carousel';

export interface ScanResult {
  card: BusinessCardData;
  vcard: string;
  source: string;
  rawJsonString: string;
  thumbnailUrl?: string;
}
