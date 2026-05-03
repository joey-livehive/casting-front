// 캐스팅 매칭 카드 radar 점수 산출 — public API.
// 사용처:
//  - PERSON 시점: computePersonRadar(answers) → 한 사람의 6축 점수
//  - PAIR 시점:   computePairRadar(viewer, candidate) → 두 hexagon + matchRate + top 4 axes

import type { CastingAnswers } from '@/lib/casting/prompts/types';
import { AXIS_RULES, AXIS_LABELS } from './rules';

export { AXIS_RULES, AXIS_LABELS } from './rules';
export type { AxisId, AxisRule } from './rules';
export {
  checkDealbreakers,
  allDealbreakersPassed,
  type DealbreakerCheck,
} from './dealbreakers';

export interface PersonRadarScores {
  /** axisId → 0~10 점수 */
  byAxis: Record<string, number>;
  /** AXIS_RULES 순서대로 0~10 점수 배열 (radar chart 입력용) */
  array: number[];
}

export function computePersonRadar(answers: CastingAnswers): PersonRadarScores {
  const byAxis: Record<string, number> = {};
  const array: number[] = [];
  for (const rule of AXIS_RULES) {
    const s = rule.score(answers);
    byAxis[rule.id] = s;
    array.push(s);
  }
  return { byAxis, array };
}

export interface AxisPairResult {
  axisId: string;
  label: string;
  viewerScore: number;
  candidateScore: number;
  alignment: number;
  /** pairScore = min(viewer, candidate) × alignment */
  pairScore: number;
  weight: number;
}

export interface PairRadar {
  labels: string[];
  /** viewer 의 6축 점수 (radar chart "userDesired") */
  userDesired: number[];
  /** candidate 의 6축 점수 (radar chart "candidateActual") */
  candidateActual: number[];
  axes: AxisPairResult[];
  /** 0~100 정수 % */
  matchRate: number;
  /** "상위 N%" — matchRate 분포 추정 lookup table 기반 결정론 */
  topPercent: number;
  /** pairScore 내림차순 상위 4 개 — PAIR BUNDLE notes 용 */
  topAxes: AxisPairResult[];
}

/**
 * matchRate → 상위 % 변환. 결정론 piecewise lookup.
 * 추후 실제 매칭 분포가 모이면 percentile 기반으로 대체.
 */
export function deriveTopPercent(matchRate: number): number {
  if (matchRate >= 90) return 3;
  if (matchRate >= 85) return 5;
  if (matchRate >= 80) return 8;
  if (matchRate >= 75) return 12;
  if (matchRate >= 70) return 18;
  if (matchRate >= 65) return 25;
  if (matchRate >= 60) return 35;
  if (matchRate >= 55) return 45;
  if (matchRate >= 50) return 55;
  if (matchRate >= 40) return 70;
  return 85;
}

export function computePairRadar(viewer: CastingAnswers, candidate: CastingAnswers): PairRadar {
  const axes: AxisPairResult[] = AXIS_RULES.map((rule) => {
    const v = rule.score(viewer);
    const c = rule.score(candidate);
    const alignment = rule.alignment(viewer, candidate);
    const pairScore = Math.min(v, c) * alignment;
    return {
      axisId: rule.id,
      label: rule.label,
      viewerScore: v,
      candidateScore: c,
      alignment,
      pairScore,
      weight: rule.weight,
    };
  });

  const num = axes.reduce((sum, a) => sum + a.pairScore * a.weight, 0);
  const den = axes.reduce((sum, a) => sum + a.weight * 10, 0);
  const matchRate = Math.round((num / den) * 100);

  const sorted = [...axes].sort((a, b) => b.pairScore - a.pairScore);
  const topAxes = sorted.slice(0, 4);

  return {
    labels: AXIS_LABELS,
    userDesired: axes.map((a) => a.viewerScore),
    candidateActual: axes.map((a) => a.candidateScore),
    axes,
    matchRate,
    topPercent: deriveTopPercent(matchRate),
    topAxes,
  };
}
