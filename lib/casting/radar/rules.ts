// 캐스팅 매칭 카드 6축 점수 산출 룰 (결정론, LLM 무관).
// docs/casting-template/04-radar-rules.md 와 1:1 동기화.

import type { CastingAnswers } from '@/lib/casting/prompts/types';

export interface AxisRule {
  id: string;
  /** radar chart 표시용 라벨 (\n 줄바꿈 허용) */
  label: string;
  /** matchRate 가중치 */
  weight: number;
  /** 한 사람의 답으로 0~10 점수 산출 */
  score: (answers: CastingAnswers) => number;
  /** 두 사람 답으로 alignment 산출 (1.0 / 0.7~0.8 / 0.4~0.5 / 0.2 등) */
  alignment: (viewer: CastingAnswers, candidate: CastingAnswers) => number;
}

// ── Helpers ───────────────────────────────────────────────────

function mbtiFirstLetter(a: CastingAnswers): 'E' | 'I' | null {
  const m = a['MBTI 뭐야?'];
  if (!m || m === 'unknown' || m.length < 1) return null;
  const c = m[0]?.toUpperCase();
  return c === 'E' ? 'E' : c === 'I' ? 'I' : null;
}

function mbtiLastLetter(a: CastingAnswers): 'J' | 'P' | null {
  const m = a['MBTI 뭐야?'];
  if (!m || m === 'unknown' || m.length < 4) return null;
  const c = m[3]?.toUpperCase();
  return c === 'J' ? 'J' : c === 'P' ? 'P' : null;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

// ── 1. 만남 빈도 ─────────────────────────────────────────────

const MEETING_SCORE: Record<string, number> = {
  daily_meet: 10,
  weekly_3_4: 8,
  weekly_1_2: 5,
  flexible_meet: 4,
};
const MEETING_ORDER = ['flexible_meet', 'weekly_1_2', 'weekly_3_4', 'daily_meet'];

const meetingFreq: AxisRule = {
  id: 'meeting_freq',
  label: '만남\n빈도',
  weight: 1.0,
  score: (a) => MEETING_SCORE[a['얼마나 자주 만나고 싶어?'] ?? ''] ?? 5,
  alignment: (v, c) => {
    const va = v['얼마나 자주 만나고 싶어?'];
    const ca = c['얼마나 자주 만나고 싶어?'];
    if (!va || !ca) return 0.5;
    if (va === ca) return 1.0;
    // flexible 한쪽이면 0.7 (유연이 다 받음)
    if (va === 'flexible_meet' || ca === 'flexible_meet') return 0.7;
    const vi = MEETING_ORDER.indexOf(va);
    const ci = MEETING_ORDER.indexOf(ca);
    if (vi < 0 || ci < 0) return 0.5;
    const diff = Math.abs(vi - ci);
    if (diff === 1) return 0.7;
    return 0.3; // 두 단계 이상 차이
  },
};

// ── 2. 연락 빈도 ─────────────────────────────────────────────

const CONTACT_SCORE: Record<string, number> = {
  contact_anytime: 10,
  contact_2_3h: 8,
  contact_1_2_day: 5,
  contact_relaxed: 3,
};
const CONTACT_ORDER = ['contact_relaxed', 'contact_1_2_day', 'contact_2_3h', 'contact_anytime'];

const contactFreq: AxisRule = {
  id: 'contact_freq',
  label: '연락\n빈도',
  weight: 1.2,
  score: (a) => CONTACT_SCORE[a['연락은 얼마나 자주가 좋아?'] ?? ''] ?? 5,
  alignment: (v, c) => {
    const va = v['연락은 얼마나 자주가 좋아?'];
    const ca = c['연락은 얼마나 자주가 좋아?'];
    if (!va || !ca) return 0.5;
    if (va === ca) return 1.0;
    const vi = CONTACT_ORDER.indexOf(va);
    const ci = CONTACT_ORDER.indexOf(ca);
    if (vi < 0 || ci < 0) return 0.5;
    const diff = Math.abs(vi - ci);
    if (diff === 1) return 0.7;
    if (diff === 2) return 0.4;
    return 0.2; // 양극 (anytime ↔ relaxed)
  },
};

// ── 3. 연애 스타일 (진지함) ─────────────────────────────────

const DATING_SCORE: Record<string, number> = {
  serious_dating: 10,
  casual_chat: 5,
  casual_meet: 3,
};

const datingStyle: AxisRule = {
  id: 'dating_style',
  label: '연애\n스타일',
  weight: 1.5,
  score: (a) => DATING_SCORE[a['넌 지금 얼마나 진지해?'] ?? ''] ?? 5,
  alignment: (v, c) => {
    const va = v['넌 지금 얼마나 진지해?'];
    const ca = c['넌 지금 얼마나 진지해?'];
    if (!va || !ca) return 0.5;
    if (va === ca) return 1.0;
    const set = new Set([va, ca]);
    // 가벼운 답끼리
    if (set.has('casual_chat') && set.has('casual_meet')) return 0.8;
    // 진지 ↔ 대화 (반쯤 호환)
    if (set.has('serious_dating') && set.has('casual_chat')) return 0.5;
    // 진지 ↔ 가볍게 (양극)
    if (set.has('serious_dating') && set.has('casual_meet')) return 0.2;
    return 0.5;
  },
};

// ── 4. 활동성 (데이트 + MBTI E/I) ───────────────────────────

const ACTIVITY_BASE: Record<string, number> = {
  nightlife: 10,
  outdoor: 8,
  culture: 5,
  home: 3,
};
const ACTIVITY_HIGH = new Set(['nightlife', 'outdoor']);
const ACTIVITY_LOW = new Set(['culture', 'home']);
const ACTIVITY_ORDER = ['home', 'culture', 'outdoor', 'nightlife'];

const activity: AxisRule = {
  id: 'activity',
  label: '활동성',
  weight: 0.8,
  score: (a) => {
    const base = ACTIVITY_BASE[a['어떤 데이트가 좋아?'] ?? ''] ?? 5;
    const ei = mbtiFirstLetter(a);
    const boost = ei === 'E' ? 1 : ei === 'I' ? -1 : 0;
    return clamp(base + boost, 0, 10);
  },
  alignment: (v, c) => {
    const va = v['어떤 데이트가 좋아?'];
    const ca = c['어떤 데이트가 좋아?'];
    if (!va || !ca) return 0.5;
    if (va === ca) return 1.0;
    if (ACTIVITY_HIGH.has(va) && ACTIVITY_HIGH.has(ca)) return 0.8;
    if (ACTIVITY_LOW.has(va) && ACTIVITY_LOW.has(ca)) return 0.8;
    const vi = ACTIVITY_ORDER.indexOf(va);
    const ci = ACTIVITY_ORDER.indexOf(ca);
    if (vi < 0 || ci < 0) return 0.5;
    const diff = Math.abs(vi - ci);
    if (diff === 2) return 0.5;
    return 0.2; // 양극 (nightlife ↔ home)
  },
};

// ── 5. 라이프스타일 (흡연 + 음주) ───────────────────────────

const SMOKE_SCORE: Record<string, number> = {
  no_smoke: 5,
  sometimes_smoke: 2,
  heavy_smoke: 0,
};
const DRINK_SCORE: Record<string, number> = {
  rarely_drink: 5,
  sometimes_drink: 3,
  often_drink: 1,
};

function lifestyleScore(a: CastingAnswers): number {
  const smoke = SMOKE_SCORE[a['넌 담배 피워?'] ?? ''] ?? 3;
  const drink = DRINK_SCORE[a['술은 자주 마셔?'] ?? ''] ?? 3;
  return smoke + drink; // 0~10
}

const lifestyle: AxisRule = {
  id: 'lifestyle',
  label: '라이프\n스타일',
  weight: 1.2,
  score: lifestyleScore,
  alignment: (v, c) => {
    const diff = Math.abs(lifestyleScore(v) - lifestyleScore(c));
    if (diff <= 2) return 1.0;
    if (diff <= 4) return 0.7;
    if (diff <= 6) return 0.4;
    return 0.2;
  },
};

// ── 6. 계획성 (MBTI J/P) ─────────────────────────────────────

const planning: AxisRule = {
  id: 'planning',
  label: '계획성',
  weight: 0.7,
  score: (a) => {
    const jp = mbtiLastLetter(a);
    return jp === 'J' ? 10 : jp === 'P' ? 3 : 5;
  },
  alignment: (v, c) => {
    const vj = mbtiLastLetter(v);
    const cj = mbtiLastLetter(c);
    if (vj === null && cj === null) return 0.5;
    if (vj === null || cj === null) return 0.7;
    return vj === cj ? 1.0 : 0.5;
  },
};

// ── Export ───────────────────────────────────────────────────

export const AXIS_RULES: AxisRule[] = [
  meetingFreq,
  contactFreq,
  datingStyle,
  activity,
  lifestyle,
  planning,
];

export const AXIS_LABELS = AXIS_RULES.map((r) => r.label);
export type AxisId = (typeof AXIS_RULES)[number]['id'];
