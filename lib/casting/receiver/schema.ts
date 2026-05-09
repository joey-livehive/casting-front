// Receiver 매칭 페이지 — like 받은 사람(B) 입장의 페이지가 받는 데이터.
// 발신자(A) 정보 + 받는 사람(B) 본인 분석.
// LLM 출력 검증·타입 양쪽으로 사용.

import { z } from 'zod';

const BOLD_TAG = /<b>[\s\S]+?<\/b>/;
const QUOTED = /["'""''「」『』][\s\S]+?["'""''「」『』]/;

const Bullet = z
  .string()
  .min(8)
  .max(80)
  .regex(BOLD_TAG, '각 bullet 은 <b>...</b> 강조 한 곳 포함');

const Narrative = z.string().min(120, { message: '4~5문장 필요' }).max(600);

/** 4축 양극 막대 — 우측 라벨 비율(0~100). 라벨은 페이지가 고정으로 결정. */
export const ReceiverBipolarValuesSchema = z.object({
  /** 0=내향적, 100=외향적 */
  energy: z.number().min(0).max(100),
  /** 0=감성적, 100=이성적 */
  judgment: z.number().min(0).max(100),
  /** 0=활발한, 100=차분한 */
  selfExpression: z.number().min(0).max(100),
  /** 0=안정 추구, 100=모험 추구 */
  behavior: z.number().min(0).max(100),
});

export const ReceiverContentSchema = z.object({
  // ── 발신자(A) 메타 ─ TeaserCard 표시용 ──
  senderFaceType: z.string().min(8).max(24),
  senderAgeRange: z.string().min(2).max(20),
  senderOccupation: z.string().min(2).max(20),
  senderMbti: z.string().min(4).max(4).optional(),
  senderHeight: z.string().min(2).max(8).optional(),

  // ── CasterNote (이번엔 캐스터가 발신자를 받는 이에게 소개) ──
  senderHeadline: z
    .string()
    .min(10)
    .max(40)
    .refine((s) => !/<b>/.test(s), { message: 'senderHeadline 은 평문' })
    .refine((s) => !s.includes('!'), { message: 'senderHeadline 에 느낌표 금지' })
    .refine((s) => !/["'""''「」]/.test(s), { message: '따옴표 금지' }),
  senderCharmBullets: z.array(Bullet).length(3),

  // ── ReadingCardV2 ─ B 본인 분석 + A 소개 산문 ──
  // matchOpening 슬롯은 receiver 페이지에서 fixed 카피로 박음 → schema 에서 제외(프롬프트 단순화).
  viewerInsight: Narrative.regex(BOLD_TAG, 'viewerInsight 는 <b> 강조 1곳'),
  /** candidateMatch 슬롯에 들어가는 산문 — A 소개 */
  senderProfile: Narrative.regex(BOLD_TAG, 'senderProfile 은 <b> 강조 1곳'),

  // ── CHAPTER 1: A 성향 (CandidateDetailSection 슬롯 3개) ──
  personality: Narrative,
  datingStyle: Narrative,
  weekendStyle: Narrative,

  // ── CHAPTER 2: A 의 4축 양극 ──
  bipolarValues: ReceiverBipolarValuesSchema,
  spectrumNotes: z
    .array(
      z
        .string()
        .min(40)
        .max(220)
        .regex(BOLD_TAG, '각 note 는 <b> 강조 1곳')
    )
    .min(2)
    .max(4),

  // ── CHAPTER 3: A와의 첫 만남 시뮬레이션 ──
  simulation: z
    .string()
    .min(200)
    .max(1000)
    .regex(QUOTED, '발신자 가상 첫 멘트 따옴표 포함')
    .regex(BOLD_TAG, '<b> 강조 1곳 이상'),
});

export type ReceiverBipolarValues = z.infer<typeof ReceiverBipolarValuesSchema>;
export type ReceiverContent = z.infer<typeof ReceiverContentSchema>;
