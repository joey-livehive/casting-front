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
import type { ConnectionReport } from './connection-report';

export const FIXED_USER_NAME = '의뢰인';

export function adaptCandidate(report: ConnectionReport): Candidate {
  const { partner } = report;
  const { person_content: pc, profile } = partner;
  const basics = profile.basics;

  const photoUrl = profile.photos?.[0]?.url;

  return {
    nickname: '○○○', // 캐스팅은 이름 안 받음 — 고정
    faceType: pc.faceType,
    ageRange: basics.age_band || (basics.age ? `${basics.age}세` : ''),
    ageDetail: '',
    occupation: basics.occupation || basics.occupation_band || '',
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
    matchOpening: report.pair.opening,
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
  const { radar, pair } = report;
  const labels = radar.axes.map(a => a.label);
  // radar.axes.values 는 owner/partner 각 0~100. MatchAnalysis.values 는 0~10 스케일
  // (radar-rules.md). 두 점수의 평균을 10 스케일로.
  const values = radar.axes.map(a => {
    const avg = (a.values.owner + a.values.partner) / 2;
    return Math.round((avg / 10) * 10) / 10;
  });
  return {
    matchRate: Math.round(radar.score),
    topPercent: radar.top_percent ?? 0,
    radarData: { labels, values },
    simulation: pair.simulation,
    notes: pair.axisNotes.map(n => n.narrative),
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
