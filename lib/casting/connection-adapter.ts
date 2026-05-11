/**
 * ConnectionReport → 기존 매칭 페이지 컴포넌트 props 어댑터.
 *
 * PR 2 commit 3b — 기존 컴포넌트 (HeroV2, CasterNoteSection, TeaserCardV2,
 * ReadingCardV2, CandidateDetailSection, Chapter3V2, Chapter4Simulation,
 * ApplicationSummary) 를 ConnectionReport 한 덩어리에서 채운다.
 *
 * 매핑 안 되는 필드 (hobbies, daySchedule 등) 는 빈 값으로. commit 3c 에서
 * 인스타 합본 분해 + 4축 라벨 통일 시 보강 예정.
 */

import type { Candidate, MatchAnalysis } from '@/lib/report/types';
import type { UserAnswers } from '@/lib/personalization/types';
import type { BipolarAxis } from '@/app/casting/insta-template-preview/_components/Chapter3InstaSpectrum';
import type { AxisName, ConnectionReport } from './connection-report';

export const FIXED_USER_NAME = '의뢰인';

// v5: AxisName → 화면 라벨 (INSTA_AXIS_NOTES 의 _AXIS_LABEL 과 정합)
const AXIS_LABEL: Record<AxisName, string> = {
  energy: '사회적 에너지',
  judgment: '판단 무게중심',
  sociability: '관계의 폭',
  action: '행동 성향',
};

// partner 사진 없을 때 성별별 default placeholder (blur 처리는 컴포넌트 측)
const DEFAULT_PHOTO_BY_GENDER: Record<'male' | 'female', string> = {
  male: '/images/casting/casting_man.webp',
  female: '/images/casting/casting_woman_1.webp',
};

// v5 4축 → BipolarAxis (Chapter3InstaSpectrum 의 양극 막대용)
// 스키마 컨벤션: leftPercent = 100 - bipolarValue
// (bipolarValue 0=좌측 fully, 100=우측 fully → leftPercent 가 좌측 비율)
const AXIS_BIPOLAR: Record<AxisName, { name: string; left: string; right: string }> = {
  energy: { name: '에너지', left: '내향적', right: '외향적' },
  judgment: { name: '판단', left: '감성적', right: '이성적' },
  sociability: { name: '관계의 폭', left: '좁고 깊게', right: '넓고 폭넓게' },
  action: { name: '행동', left: '안정 추구', right: '모험 추구' },
};

export function adaptBipolarAxes(report: ConnectionReport): BipolarAxis[] {
  const bv = report.partner.person_content.bipolarValues;
  const axes: AxisName[] = ['energy', 'judgment', 'sociability', 'action'];
  return axes.map((axis) => {
    const meta = AXIS_BIPOLAR[axis];
    return {
      axisName: meta.name,
      leftLabel: meta.left,
      rightLabel: meta.right,
      leftPercent: 100 - bv[axis],
    };
  });
}

export function adaptSpectrumNotes(report: ConnectionReport): string[] {
  // v5 alternate: axisNotes 가 있으면 그 narrative 사용 (insta partner).
  // 없으면 spectrumNotes (PersonContent) fallback.
  if (report.axisNotes && report.axisNotes.length > 0) {
    return report.axisNotes.map((n) => n.narrative);
  }
  return report.partner.person_content.spectrumNotes ?? [];
}

// 직업 enum 코드 → 화면 라벨 (start/page.tsx 의 응답 옵션과 정합)
const OCCUPATION_LABEL: Record<string, string> = {
  student: '학생',
  office: '회사원',
  professional: '전문직',
  public: '공직',
  freelance: '사업/프리랜서',
  other_job: '기타',
};

export function adaptCandidate(report: ConnectionReport): Candidate {
  const { partner } = report;
  const { person_content: pc, profile } = partner;
  const basics = profile.basics;

  const photoUrl =
    profile.photos?.[0]?.url ??
    (basics.gender ? DEFAULT_PHOTO_BY_GENDER[basics.gender] : undefined);

  return {
    nickname: '○○○', // 캐스팅은 이름 안 받음 — 고정
    faceType: pc.faceType,
    ageRange: basics.age_band || (basics.age ? `${basics.age}세` : ''),
    ageDetail: '',
    // 직업 우선순위: 사용자가 적은 job_detail → occupation 한국어 매핑 → occupation_band
    occupation:
      basics.job_detail ||
      (basics.occupation ? OCCUPATION_LABEL[basics.occupation] ?? basics.occupation : '') ||
      basics.occupation_band ||
      '',
    occupationDetail: basics.job_detail || '',
    personality: '',
    location: basics.region_code || '',
    foundAt: '',
    hobbies: { visible: [], hidden: 0 },
    daySchedule: [],
    background: pc.personality,
    secretAppeal: '',
    teaserPhoto: photoUrl,
    detailPhoto: photoUrl,
    mbti: basics.mbti || undefined,
    height: basics.height_cm ? `${basics.height_cm}cm` : basics.height_band || undefined,
    recommendation: pc.casterHeadline,
  };
}

export function adaptCasterNote(report: ConnectionReport): {
  headline: string;
  charmBullets: string[];
} {
  const { partner } = report;
  return {
    headline: partner.person_content.casterHeadline,
    charmBullets: partner.person_content.casterCharmBullets.map(b => b.text),
  };
}

export function adaptHuntStats(report: ConnectionReport): {
  offlineGyms: number;
  instagramProfiles: number;
  linkedinProfiles: number;
  communities: number;
} {
  const hs = report.meta.hunt_stats || {};
  return {
    offlineGyms: hs.offlineGyms ?? 0,
    instagramProfiles: hs.instagramProfiles ?? 0,
    linkedinProfiles: hs.linkedinProfiles ?? 0,
    communities: hs.communities ?? 0,
  };
}

export function adaptReadingCard(report: ConnectionReport): {
  viewerInsight: string;
  matchOpening: string;
  candidateMatch: string;
} {
  return {
    viewerInsight: report.owner.person_content.personality,
    matchOpening: report.content.opening,
    candidateMatch: report.partner.person_content.datingStyle,
  };
}

export function adaptChapter2Narratives(report: ConnectionReport): {
  personality: string;
  datingStyle: string;
  weekendStyle: string;
} {
  const pc = report.partner.person_content;
  return {
    personality: pc.personality,
    datingStyle: pc.datingStyle,
    weekendStyle: pc.lifeStyle, // 옛 weekendStyle ≈ 새 lifeStyle
  };
}

export function adaptMatchAnalysis(report: ConnectionReport): MatchAnalysis {
  const { radar, axisNotes, content, owner, partner } = report;

  // v5 alternate: partner.source=internal → radar(6축, deterministic) 채움, axisNotes=null
  //                partner.source=insta    → axisNotes(4축, LLM narrative) 채움, radar=null
  //
  // RadarChart 는 owner(의뢰인 원하는 사람 형태) + partner(실제 상대 형태) 두 dataset
  // 겹쳐 그린다. 0~100 → 0~10 스케일.
  let labels: string[] = [];
  let ownerValues: number[] = [];
  let partnerValues: number[] = [];
  let notes: string[] = [];

  const toTen = (n: number) => Math.round((n / 10) * 10) / 10;

  if (radar) {
    // internal 시점: radar.axes 의 owner/partner 값은 이미 0~10 스케일. 그대로 사용.
    // notes 는 v5 axisNotes (4축 narrative) 가 있으면 그 narrative 사용 — radar(6축
    // 시각화) 와 axisNotes(4축 매칭 분석 카피) 가 함께 노출되는 패턴.
    labels = radar.axes.map(a => a.label);
    ownerValues = radar.axes.map(a => a.values.owner);
    partnerValues = radar.axes.map(a => a.values.partner);
    notes = axisNotes?.map(n => n.narrative) ?? [];
  } else if (axisNotes) {
    // insta 시점: 한국어 라벨 + owner/partner 의 bipolarValues 4축 값(0~100 → 0~10)
    const ob = owner.person_content.bipolarValues;
    const pb = partner.person_content.bipolarValues;
    labels = axisNotes.map(n => AXIS_LABEL[n.axis] ?? n.axis);
    ownerValues = axisNotes.map(n => toTen(ob[n.axis]));
    partnerValues = axisNotes.map(n => toTen(pb[n.axis]));
    notes = axisNotes.map(n => n.narrative);
  }

  return {
    matchRate: Math.round(radar?.score ?? 0),
    topPercent: radar?.top_percent ?? 0,
    radarData: { labels, ownerValues, partnerValues },
    simulation: content.simulation,
    notes,
  };
}

export function adaptUserAnswers(report: ConnectionReport): UserAnswers {
  const { owner } = report;
  const ideal = owner.ideal || {};
  const basics = owner.profile.basics;

  return {
    idealType: {
      attractionFactor: ideal.attraction_factor ?? undefined,
      agePreference: ideal.age_mode ?? undefined,
      heightPreference: ideal.height ?? undefined,
      bodyType: ideal.body_type ?? undefined,
      contactStyle: ideal.contact_style ?? undefined,
      dealBreaker: ideal.dealbreakers?.smoking || ideal.dealbreakers?.drinking || undefined,
      religionImportance: ideal.religion_preference ?? undefined,
    },
    selfInfo: {
      age: basics.age ? String(basics.age) : undefined,
      gender: basics.gender ?? undefined,
      location: basics.region_code ?? undefined,
      occupation: basics.occupation ?? undefined,
      jobDetail: basics.job_detail ?? undefined,
      height: basics.height_cm ? String(basics.height_cm) : undefined,
      drinking: basics.drinking_style ?? undefined,
      mbti: basics.mbti ?? undefined,
    },
    freeResponse: {},
    personality: {},
  };
}
