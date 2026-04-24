export type Gender = 'F' | 'M';
export type Tone = 'casual' | 'formal';

export interface ReportData {
  reportId: string;
  gender: Gender;
  tone: Tone;
  userName: string;
  publishedAt: string;
  huntStats: {
    offlineGyms: number;
    instagramProfiles: number;
    linkedinProfiles: number;
    communities: number;
  };
  effort: {
    castingHours: number;
    verificationMeetings: number;
  };
  totalCandidates: number;
  teaserCandidate: Candidate;
  match: MatchAnalysis;
  /** 나머지 4명 미리보기 사진 경로들 (0~4개). 없으면 그라디언트 placeholder. */
  remainingPhotos?: string[];
}

export interface Candidate {
  nickname: string;
  faceType: string;
  ageRange: string;
  ageDetail: string;
  occupation: string;
  occupationDetail: string;
  personality: string;
  location: string;
  foundAt: string;
  hobbies: {
    visible: string[];
    hidden: number;
  };
  daySchedule: DayScheduleItem[];
  background: string;
  /** 결제 후 공개되는 호기심 훅 한 줄. <blur>...</blur> 마크업 사용. */
  secretAppeal: string;
  /** 맛보기 카드용 인물 사진 (4:5). 없으면 그라디언트 placeholder. 블러 처리는 컴포넌트가 적용. */
  teaserPhoto?: string;
  /** Chapter 2용 분위기 사진 (16:9). 없으면 그라디언트 placeholder. */
  chapter2Photo?: string;
}

export interface DayScheduleItem {
  time: string;
  activity: string;
}

export interface MatchAnalysis {
  matchRate: number;
  topPercent: number;
  radarData: {
    labels: string[];
    userDesired: number[];
    candidateActual: number[];
  };
  simulation: string;
  notes: string[];
}

export interface PricingPlan {
  id: 'starter' | 'regular' | 'premium';
  name: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  cardCount: number;
  conversationGuarantee?: number;
  recommended?: boolean;
}
