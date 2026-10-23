import { BusinessCardData } from '../types';

export const SAMPLE_CARDS: BusinessCardData[] = [
  {
    id: 'sample-card-1',
    name: {
      fullName: '김태원 (Tae-won Kim)',
      firstName: '태원',
      lastName: '김',
      titleHonorific: '대표이사',
    },
    jobTitle: 'Chief Executive Officer (CEO)',
    department: '경영전략총괄',
    company: {
      name: '넥스트웨이브 솔루션즈 주식회사',
      division: 'NextWave AI Tech Labs',
      legalName: 'NextWave Solutions Co., Ltd.',
    },
    phones: {
      mobile: '010-8924-5120',
      work: '02-588-4300',
      fax: '02-588-4301',
    },
    emails: {
      primary: 'taewon.kim@nextwavesol.com',
      secondary: 'ceo@nextwave.ai',
    },
    address: {
      formatted: '서울특별시 강남구 테헤란로 427 위워크타워 14층',
      street: '테헤란로 427 14층',
      city: '서울시 강남구',
      state: '서울특별시',
      postalCode: '06159',
      country: '대한민국 (Republic of Korea)',
    },
    websites: ['https://nextwave-ai.io', 'https://blog.nextwavesol.com'],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/taewonkim-nextwave',
      twitter: 'https://x.com/taewon_nextwave',
      github: 'https://github.com/taewonkim',
    },
    industry: 'AI & Cloud Infrastructure',
    notes: '2026 AI Summit 메인 세션 발표자. 차세대 엔터프라이즈 LLM 인프라 공급 협력 논의 완료. 다음 주 화요일 팔로업 미팅 예정.',
    rawText: `NEXTWAVE SOLUTIONS
김태원 Tae-won Kim | 대표이사 CEO
NextWave AI Tech Labs
M: 010-8924-5120 / T: 02-588-4300
E: taewon.kim@nextwavesol.com
W: https://nextwave-ai.io
A: 서울특별시 강남구 테헤란로 427 위워크타워 14층`,
    tags: ['VIP', 'AI 파트너', '투자/경영', '2026 Summit'],
    createdAt: '2026-10-18T09:30:00.000Z',
    updatedAt: '2026-10-22T14:15:00.000Z',
    isFavorite: true,
    meetingDate: '2026-10-18',
    meetingLocation: '코엑스 인터컨티넨탈 호텔 미팅룸 B',
    cardColorTheme: 'navy',
  },
  {
    id: 'sample-card-2',
    name: {
      fullName: 'Dr. Sarah Jenkins',
      firstName: 'Sarah',
      lastName: 'Jenkins',
      titleHonorific: 'Ph.D.',
    },
    jobTitle: 'VP of Engineering & Applied Robotics',
    department: 'Autonomous Systems Division',
    company: {
      name: 'Vanguard Dynamics Inc.',
      division: 'Silicon Valley Headquarters',
      legalName: 'Vanguard Dynamics Global Corporation',
    },
    phones: {
      mobile: '+1 (415) 892-4912',
      work: '+1 (650) 329-8000',
    },
    emails: {
      primary: 's.jenkins@vanguard-dynamics.com',
      secondary: 'sarah.j@alumni.stanford.edu',
    },
    address: {
      formatted: '500 Howard Street, Suite 800, San Francisco, CA 94105, USA',
      street: '500 Howard Street, Suite 800',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94105',
      country: 'United States',
    },
    websites: ['https://vanguarddynamics.io'],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/sarahjenkins-robotics',
      github: 'https://github.com/sarahjenkins-ai',
    },
    industry: 'Autonomous Robotics & AI',
    notes: 'Keynote speaker at Global Tech Expo. Interested in our edge vision SDK for autonomous mobile robots.',
    rawText: `VANGUARD DYNAMICS
Dr. Sarah Jenkins, Ph.D.
VP of Engineering & Applied Robotics
Autonomous Systems Division
Phone: +1 (415) 892-4912 | Office: +1 (650) 329-8000
Email: s.jenkins@vanguard-dynamics.com
Web: https://vanguarddynamics.io
500 Howard St, Suite 800, San Francisco, CA 94105`,
    tags: ['Global', 'Robotics', 'Key Partner'],
    createdAt: '2026-10-15T11:20:00.000Z',
    updatedAt: '2026-10-20T16:00:00.000Z',
    isFavorite: true,
    meetingDate: '2026-10-15',
    meetingLocation: 'San Francisco Moscone Center',
    cardColorTheme: 'slate',
  },
  {
    id: 'sample-card-3',
    name: {
      fullName: '이지은 (Ji-eun Lee)',
      firstName: '지은',
      lastName: '이',
    },
    jobTitle: 'Design Director & Brand Strategist',
    department: '브랜드 크리에이티브 본부',
    company: {
      name: '아틀리에 미니멀 스튜디오 (Atelier Minimal)',
      division: 'Creative Consultancy',
    },
    phones: {
      mobile: '010-3341-9082',
      work: '02-790-2114',
    },
    emails: {
      primary: 'jieun@atelierminimal.design',
    },
    address: {
      formatted: '서울특별시 성동구 성수이로 88 성수에이팩타워 6층',
      street: '성수이로 88 6층',
      city: '서울시 성동구',
      state: '서울특별시',
      postalCode: '04781',
      country: '대한민국',
    },
    websites: ['https://atelierminimal.design', 'https://behance.net/jieunlee-design'],
    socialLinks: {
      instagram: 'https://instagram.com/atelierminimal_official',
      linkedin: 'https://linkedin.com/in/jieun-lee-atelier',
    },
    industry: 'UI/UX & Brand Identity',
    notes: '2026 모바일 앱 UI 디자인 리뉴얼 프로젝트 총괄 디렉터. 감각적인 미니멀 스타일과 인터랙션 강점.',
    rawText: `ATELIER MINIMAL
이지은 Ji-eun Lee
Design Director / Brand Strategist
Mobile: 010-3341-9082
Email: jieun@atelierminimal.design
Web: atelierminimal.design
서울 성동구 성수이로 88 6F`,
    tags: ['디자인', '성수', '협력사'],
    createdAt: '2026-10-12T15:45:00.000Z',
    updatedAt: '2026-10-19T10:10:00.000Z',
    isFavorite: false,
    meetingDate: '2026-10-12',
    meetingLocation: '성수동 블루보틀 2층 미팅',
    cardColorTheme: 'emerald',
  },
  {
    id: 'sample-card-4',
    name: {
      fullName: 'Kenji Sato (佐藤 健二)',
      firstName: 'Kenji',
      lastName: 'Sato',
    },
    jobTitle: 'Managing Director & Head of Investment',
    department: 'Cross-Border Tech Fund',
    company: {
      name: 'Pacific Rim Ventures (パシフィック・リム・ベンチャーズ)',
      division: 'Tokyo & Singapore Office',
    },
    phones: {
      mobile: '+81 90-4412-9871',
      work: '+81 3-5521-3000',
    },
    emails: {
      primary: 'k.sato@pacificrimvc.jp',
    },
    address: {
      formatted: 'Roppongi Hills Mori Tower 32F, 6-10-1 Roppongi, Minato-ku, Tokyo 106-6132, Japan',
      street: '6-10-1 Roppongi, Roppongi Hills 32F',
      city: 'Tokyo, Minato-ku',
      state: 'Tokyo',
      postalCode: '106-6132',
      country: 'Japan',
    },
    websites: ['https://pacificrimvc.jp'],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/kenji-sato-vc',
    },
    industry: 'Venture Capital & Private Equity',
    notes: 'Series A/B lead investor in Asian B2B SaaS. Keen interest in cross-border localization tech.',
    rawText: `Pacific Rim Ventures
Kenji Sato 佐藤 健二
Managing Director
Roppongi Hills Mori Tower 32F, Minato-ku, Tokyo
Tel: +81-3-5521-3000 | Mob: +81-90-4412-9871
Email: k.sato@pacificrimvc.jp`,
    tags: ['VC', 'Investor', 'Japan', 'Series-B'],
    createdAt: '2026-10-08T08:00:00.000Z',
    updatedAt: '2026-10-17T11:00:00.000Z',
    isFavorite: true,
    meetingDate: '2026-10-08',
    meetingLocation: 'Roppongi Club Lounge, Tokyo',
    cardColorTheme: 'purple',
  },
  {
    id: 'sample-card-5',
    name: {
      fullName: '박민우 (Min-woo Park)',
      firstName: '민우',
      lastName: '박',
      titleHonorific: '변호사 / 변리사',
    },
    jobTitle: 'Senior Partner Attorney (수석 파트너 변호사)',
    department: '지식재산권(IP) 및 테크놀로지 법률팀',
    company: {
      name: '법무법인 세종로 (Sejongno Law Group)',
      legalName: 'Sejongno Attorneys at Law LLC',
    },
    phones: {
      mobile: '010-7712-4091',
      work: '02-311-8800',
      fax: '02-311-8809',
    },
    emails: {
      primary: 'mwpark@sejongnolaw.com',
    },
    address: {
      formatted: '서울특별시 종로구 세종대로 149 광화문빌딩 19층',
      street: '세종대로 149 19층',
      city: '서울시 종로구',
      state: '서울특별시',
      postalCode: '03186',
      country: '대한민국',
    },
    websites: ['https://sejongnolaw.com'],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/minwoo-park-law',
    },
    industry: 'Legal & Intellectual Property',
    notes: '스타트업 특허 포트폴리오 및 글로벌 라이선스 계약 자문 전문. 분기별 정기 법률 자문 미팅.',
    rawText: `법무법인 세종로
박민우 변호사 / 변리사
Senior Partner Attorney
T: 02-311-8800 | F: 02-311-8809 | M: 010-7712-4091
E: mwpark@sejongnolaw.com
A: 서울특별시 종로구 세종대로 149 광화문빌딩 19층`,
    tags: ['법률/IP', '자문위원', '광화문'],
    createdAt: '2026-09-28T14:00:00.000Z',
    updatedAt: '2026-10-14T09:20:00.000Z',
    isFavorite: false,
    meetingDate: '2026-09-28',
    cardColorTheme: 'crimson',
  },
  {
    id: 'sample-card-6',
    name: {
      fullName: '최유나 (Yuna Choi)',
      firstName: '유나',
      lastName: '최',
    },
    jobTitle: 'Head of Fintech Growth & Partnerships',
    department: '글로벌 제휴본부',
    company: {
      name: '페이링크 코리아 (PayLink Korea)',
      division: 'Digital Wallet Strategy Group',
    },
    phones: {
      mobile: '010-5201-6389',
      work: '02-6020-5500',
    },
    emails: {
      primary: 'yuna.choi@paylink.co.kr',
    },
    address: {
      formatted: '서울특별시 영등포구 여의대로 108 파크원 타워1 28층',
      street: '여의대로 108 28층',
      city: '서울시 영등포구',
      state: '서울특별시',
      postalCode: '07335',
      country: '대한민국',
    },
    websites: ['https://paylink.co.kr'],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/yunachoi-fintech',
    },
    industry: 'Fintech & Payment Gateway',
    notes: '여의도 핀테크 포럼에서 교환. 간편결제 SDK 연동 및 수수료 우대 프로모션 협의.',
    rawText: `PayLink Korea
최유나 Yuna Choi
Head of Fintech Growth & Partnerships
M: 010-5201-6389 | T: 02-6020-5500
E: yuna.choi@paylink.co.kr
A: 서울특별시 영등포구 여의대로 108 파크원 타워1 28층`,
    tags: ['핀테크', '제휴', '여의도'],
    createdAt: '2026-09-20T10:15:00.000Z',
    updatedAt: '2026-10-10T17:30:00.000Z',
    isFavorite: true,
    cardColorTheme: 'amber',
  },
];

export const MY_CARD_DEFAULT: BusinessCardData = {
  id: 'my-own-card',
  name: {
    fullName: '신동현 (Dong-hyun Shin)',
    firstName: '동현',
    lastName: '신',
    titleHonorific: '',
  },
  jobTitle: 'Senior Product Lead & Mobile Architect',
  department: '디지털 혁신 사업부',
  company: {
    name: '스마트모빌리티 테크 (Smart Mobility Tech)',
    division: 'Mobile Solutions Lab',
  },
  phones: {
    mobile: '010-5523-8812',
    work: '02-880-9900',
  },
  emails: {
    primary: 'shinphotodrive@gmail.com',
  },
  address: {
    formatted: '서울특별시 강남구 테헤란로 152 강남파이낸스센터 21층',
    street: '테헤란로 152 21층',
    city: '서울 강남구',
    state: '서울특별시',
    postalCode: '06236',
    country: '대한민국',
  },
  websites: ['https://smartmobility.tech', 'https://github.com/gtlaserbeast'],
  socialLinks: {
    linkedin: 'https://linkedin.com/in/shin-donghyun',
    github: 'https://github.com/gtlaserbeast',
  },
  industry: 'IT & Mobile Solutions',
  notes: 'CamCard 안드로이드 앱 사용자 - QR 코드나 vCard로 내 명함을 즉시 전송할 수 있습니다.',
  rawText: `SMART MOBILITY TECH
신동현 Dong-hyun Shin
Senior Product Lead & Mobile Architect
010-5523-8812 | 02-880-9900
shinphotodrive@gmail.com
강남파이낸스센터 21층`,
  tags: ['내명함', '주최자'],
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: new Date().toISOString(),
  cardColorTheme: 'navy',
};
