/**
 * MatchingReport → 기존 매칭 페이지 컴포넌트 props 어댑터.
 *
 * PR 2 commit 3b — 기존 컴포넌트 (HeroV2, CasterNoteSection, TeaserCardV2,
 * ReadingCardV2, CandidateDetailSection, Chapter3V2, Chapter4Simulation,
 * ApplicationSummary) 를 MatchingReport 한 덩어리에서 채운다.
 *
 * 매핑 안 되는 필드 (hobbies, daySchedule 등) 는 빈 값으로. commit 3c 에서
 * 인스타 합본 분해 + 4축 라벨 통일 시 보강 예정.
 */

import type { Candidate, MatchAnalysis } from '@/lib/report/types';
import type { UserAnswers } from '@/lib/personalization/types';
import type { BipolarAxis } from '@/app/casting/insta-template-preview/_components/Chapter3InstaSpectrum';
import type { AxisName, MatchingReport, Gender, Perspective } from './matching-report';
import { formatAnswerLabel } from './answer-labels';

export const FIXED_USER_NAME = '의뢰인';

// v5: AxisName → 화면 라벨 (INSTA_AXIS_NOTES 의 _AXIS_LABEL 과 정합)
const AXIS_LABEL: Record<AxisName, string> = {
  energy: '사회적 에너지',
  judgment: '판단 무게중심',
  sociability: '관계의 폭',
  action: '행동 성향',
};

/**
 * 사진 없을 때 성별별 default placeholder.
 * - owner page + insta partner: 실제 인스타 사진 노출 X → 무조건 이 default.
 * - cast page (partner 시점): owner 사진 없을 때 fallback.
 */
export const DEFAULT_PHOTO_BY_GENDER: Record<Gender, string> = {
  male: '/images/casting/casting_man.webp',
  female: '/images/casting/casting_woman_1.webp',
};

export function defaultPhotoFor(gender: Gender | null | undefined): string {
  return gender === 'female'
    ? DEFAULT_PHOTO_BY_GENDER.female
    : DEFAULT_PHOTO_BY_GENDER.male;
}

/** 직업 enum 코드 → 화면 라벨 (start/page.tsx 의 응답 옵션과 정합). */
export const OCCUPATION_LABEL: Record<string, string> = {
  student: '학생',
  office: '회사원',
  professional: '전문직',
  public: '공직',
  freelance: '사업/프리랜서',
  other_job: '기타',
};

function occupationLabelOf(code: string | null | undefined): string {
  if (!code) return '';
  return OCCUPATION_LABEL[code] ?? code;
}

// v5 4축 → BipolarAxis (Chapter3InstaSpectrum 의 양극 막대용)
// 스키마 컨벤션: leftPercent = 100 - bipolarValue
// (bipolarValue 0=좌측 fully, 100=우측 fully → leftPercent 가 좌측 비율)
const AXIS_BIPOLAR: Record<AxisName, { name: string; left: string; right: string }> = {
  energy: { name: '에너지', left: '내향적', right: '외향적' },
  judgment: { name: '판단', left: '감성적', right: '이성적' },
  sociability: { name: '관계의 폭', left: '좁고 깊게', right: '넓고 폭넓게' },
  action: { name: '행동', left: '안정 추구', right: '모험 추구' },
};

export function adaptBipolarAxes(report: MatchingReport): BipolarAxis[] {
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

export function adaptSpectrumNotes(report: MatchingReport): string[] {
  // v5 alternate: axisNotes 가 있으면 그 narrative 사용 (insta partner).
  // 없으면 spectrumNotes (PersonContent) fallback.
  if (report.axisNotes && report.axisNotes.length > 0) {
    return report.axisNotes.map((n) => n.narrative);
  }
  return report.partner.person_content.spectrumNotes ?? [];
}

/**
 * MatchingReport.partner → Candidate (owner page 의 매칭 상대 카드).
 *
 * 사진은 partner 의 실제 사진(있으면) 또는 성별별 default. owner page 의 insta
 * 분기는 호출처에서 한 번 더 default 로 override.
 */
export function adaptCandidate(report: MatchingReport): Candidate {
  return participantToCandidate(report.partner, '');
}

/**
 * MatchingReport.owner → Candidate (cast page 의 의뢰인 소개 카드).
 *
 * partner page 의 candidate = owner. 사진 우선순위는 동일 (real → gender default).
 */
export function adaptOwnerCandidate(report: MatchingReport): Candidate {
  return participantToCandidate(report.owner, '내부 POOL');
}

function participantToCandidate(
  participant: MatchingReport['partner'],
  foundAt: string,
): Candidate {
  const { person_content: pc, profile } = participant;
  const basics = profile.basics;
  const photoUrl = profile.photos?.[0]?.url ?? defaultPhotoFor(basics.gender);

  return {
    nickname: '○○○', // 캐스팅은 이름 안 받음 — 고정
    faceType: pc.faceType,
    ageRange: basics.age_band || (basics.age ? `${basics.age}세` : ''),
    ageDetail: '',
    // 직업 우선순위: 사용자가 적은 job_detail → occupation 한국어 매핑 → occupation_band
    occupation:
      basics.job_detail || occupationLabelOf(basics.occupation) || basics.occupation_band || '',
    occupationDetail: basics.job_detail || '',
    personality: '',
    location: formatAnswerLabel(basics.region_code),
    foundAt,
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

/**
 * owner 가 실제 업로드한 사진이 있는지. cast page(partner 시점) 의 blur 결정용.
 * 성별별 default placeholder 는 blur 대상이 아니다.
 */
export function ownerHasRealPhoto(report: MatchingReport): boolean {
  return !!report.owner.profile.photos?.[0]?.url;
}

/**
 * ReadingCard 의 viewerInsight 카피. perspective 별 prefix 톤 강제.
 * - 'owner'   : owner.personality 그대로 (의뢰인 자기 분석)
 * - 'partner' : partner.personality + "당신은 이런 분" prefix (인스타/내부 분기)
 */
export function adaptViewerInsight(
  report: MatchingReport,
  perspective: Perspective,
): string {
  if (perspective === 'owner') return report.owner.person_content.personality;
  const isInstaPartner = report.partner.profile.source === 'insta';
  const prefix = isInstaPartner
    ? 'AI가 인스타그램에서 분석한 모습으로는, 당신은 이렇게 비춰져요.'
    : '당신이 남겨주신 답변을 보면, 당신은 이런 분으로 분석돼요.';
  return `${prefix}\n\n${report.partner.person_content.personality}`;
}

export function adaptCasterNote(report: MatchingReport): {
  headline: string;
  charmBullets: string[];
} {
  const { partner } = report;
  return {
    headline: partner.person_content.casterHeadline,
    charmBullets: partner.person_content.casterCharmBullets.map(b => b.text),
  };
}

export function adaptHuntStats(report: MatchingReport): {
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

export function adaptReadingCard(report: MatchingReport): {
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

export function adaptChapter2Narratives(report: MatchingReport): {
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

export function adaptMatchAnalysis(report: MatchingReport): MatchAnalysis {
  const { radar, axisNotes, content, owner, partner } = report;

  // 채움 정책:
  //   internal partner → radar(6축, deterministic, 0~10 스케일) + axisNotes(4축 narrative)
  //   insta partner    → axisNotes 만. radar 자리에 4축 bipolarValues(0~100 → 0~10) 매핑.
  // RadarChart 는 owner(의뢰인 원하는 사람 형태) + partner(실제 상대 형태) 두 dataset.
  let labels: string[] = [];
  let ownerValues: number[] = [];
  let partnerValues: number[] = [];

  if (radar) {
    // internal: radar.axes 의 owner/partner 값은 이미 0~10 스케일.
    labels = radar.axes.map((a) => a.label);
    ownerValues = radar.axes.map((a) => a.values.owner);
    partnerValues = radar.axes.map((a) => a.values.partner);
  } else if (axisNotes) {
    // insta: bipolarValues(0~100) → 0~10 스케일.
    const ob = owner.person_content.bipolarValues;
    const pb = partner.person_content.bipolarValues;
    labels = axisNotes.map((n) => AXIS_LABEL[n.axis] ?? n.axis);
    ownerValues = axisNotes.map((n) => ob[n.axis] / 10);
    partnerValues = axisNotes.map((n) => pb[n.axis] / 10);
  }

  return {
    matchRate: Math.round(radar?.score ?? 0),
    topPercent: radar?.top_percent ?? 0,
    radarData: { labels, ownerValues, partnerValues },
    simulation: content.simulation,
    notes: axisNotes?.map((n) => n.narrative) ?? [],
  };
}

export function adaptUserAnswers(report: MatchingReport): UserAnswers {
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
