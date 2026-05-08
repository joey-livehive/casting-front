// Insta 매칭 LLM 출력 검증 스키마.
// docs/casting-template/insta/02-prompt.md 의 출력 포맷과 1:1.

import { z } from 'zod';

const BOLD_TAG = /<b>[\s\S]+?<\/b>/;
const QUOTED = /["'""''「」『』][\s\S]+?["'""''「」『』]/;

const FORBIDDEN_WORDS = ['곁자리', '곁을 지키', '결자리', '자유서술'];
const ABSTRACT_GYEOL = /[가-힣](?:한|는|운|진|순|긴|단|히)\s?결(?:이|은|을|의|도|가|에|로)\b/;
const MBTI_CLICHE =
  /\b(?:ENFP|ENFJ|ENTP|ENTJ|ESFP|ESFJ|ESTP|ESTJ|INFP|INFJ|INTP|INTJ|ISFP|ISFJ|ISTP|ISTJ)\s*(?:특유의?|타입의?)/i;

function noForbiddenWords(s: string): boolean {
  if (FORBIDDEN_WORDS.some((w) => s.includes(w))) return false;
  if (ABSTRACT_GYEOL.test(s)) return false;
  if (MBTI_CLICHE.test(s)) return false;
  return true;
}

const Bullet = z
  .string()
  .min(8)
  .max(80)
  .regex(BOLD_TAG, '각 bullet 은 <b>...</b> 강조 한 곳 포함')
  .refine(noForbiddenWords, { message: '금지어 사용' });

const Narrative = z
  .string()
  .min(120, { message: '4~5문장 필요' })
  .max(600)
  .refine(noForbiddenWords, { message: '금지어 사용' });

/** 4축 양극 막대 — 좌측 라벨 비율 (0~100). 라벨은 페이지가 고정으로 결정. */
export const InstaBipolarValuesSchema = z.object({
  /** 0=내향적, 100=외향적 */
  energy: z.number().min(0).max(100),
  /** 0=감성적, 100=이성적 */
  judgment: z.number().min(0).max(100),
  /** 0=활발한, 100=차분한 */
  selfExpression: z.number().min(0).max(100),
  /** 0=안정 추구, 100=모험 추구 */
  behavior: z.number().min(0).max(100),
});

export const InstaContentSchema = z.object({
  // ── Teaser meta (인스타 추정) ──
  faceType: z
    .string()
    .min(8)
    .max(24)
    .refine(noForbiddenWords, { message: '금지어 사용' }),
  ageRangeEstimate: z.string().min(2).max(20),
  occupationEstimate: z.string().min(2).max(20),
  mbtiEstimate: z.string().min(4).max(4).optional(),
  heightEstimate: z.string().min(2).max(8).optional(),

  // ── Caster note ── (headline 은 TeaserCard.recommendation 으로도 재사용)
  casterHeadline: z
    .string()
    .min(10)
    .max(40)
    .refine(noForbiddenWords, { message: '금지어 사용' })
    .refine((s) => !/<b>/.test(s), { message: 'casterHeadline 은 평문' })
    .refine((s) => !s.includes('!'), { message: 'casterHeadline 에 느낌표 금지' })
    .refine((s) => !/["'""''「」]/.test(s), { message: 'casterHeadline 에 따옴표 금지' })
    .refine((s) => !/(학생|회사원|직장인|전문직|프리랜서|공직)/.test(s), {
      message: '직업 카테고리 단어 노출 금지',
    }),
  casterCharmBullets: z.array(Bullet).length(3),

  // ── Reading card ──
  viewerInsight: Narrative.regex(BOLD_TAG, 'viewerInsight 는 <b> 강조 1곳'),
  matchOpening: z
    .string()
    .min(60)
    .max(300)
    .regex(BOLD_TAG, 'matchOpening 은 <b> 강조 1곳')
    .refine(noForbiddenWords, { message: '금지어 사용' }),
  candidateMatch: Narrative.regex(BOLD_TAG, 'candidateMatch 는 <b> 강조 1곳'),

  // ── Chapter 1 narratives ──
  personality: Narrative,
  datingStyle: Narrative,
  /** weekendStyle 자리 대체 — 인스타 피드에서 보이는 매력. */
  feedCharm: Narrative,

  // ── Chapter 2: 4축 양극 ──
  bipolarValues: InstaBipolarValuesSchema,
  spectrumNotes: z
    .array(
      z
        .string()
        .min(40)
        .max(220)
        .regex(BOLD_TAG, '각 note 는 <b> 강조 1곳')
        .refine(noForbiddenWords, { message: '금지어 사용' })
    )
    .min(2)
    .max(4),

  // ── Chapter 3: simulation ──
  simulation: z
    .string()
    .min(200)
    .max(1000)
    .regex(QUOTED, '후보 가상 첫 멘트 따옴표 포함')
    .regex(BOLD_TAG, '<b> 강조 1곳 이상')
    .refine(noForbiddenWords, { message: '금지어 사용' }),
});

export type InstaBipolarValues = z.infer<typeof InstaBipolarValuesSchema>;
export type InstaContentOutput = z.infer<typeof InstaContentSchema>;
export type InstaContent = InstaContentOutput;
