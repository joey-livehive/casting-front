// 캐스팅 매칭 카드 LLM 출력 검증 스키마.
// docs/casting-template/prompts/{person-bundle,pair-bundle}.md 의 Zod 스키마 코드화.

import { z } from 'zod';

const BOLD_TAG = /<b>[\s\S]+?<\/b>/;
const QUOTED = /["'""''「」『』][\s\S]+?["'""''「」『』]/;

// 톤 가이드 위반 단어/패턴 (system prompt 가 막지만 Zod 한 번 더 hard gate)
const FORBIDDEN_WORDS = ['곁자리', '곁을 지키', '결자리', '자유서술'];

// "OO한 결이/은/을/의" 같이 "결" 을 추상 명사로 쓰는 패턴 차단.
// "결혼", "결과", "결심", "결정", "결국" 등 일반 단어는 통과 (조사 매치 안 됨).
const ABSTRACT_GYEOL = /[가-힣](?:한|는|운|진|순|긴|단|히)\s?결(?:이|은|을|의|도|가|에|로)\b/;

// "ENFP 특유의" / "ISFJ 특유의" — MBTI 클리셰 표현.
const MBTI_CLICHE =
  /\b(?:ENFP|ENFJ|ENTP|ENTJ|ESFP|ESFJ|ESTP|ESTJ|INFP|INFJ|INTP|INTJ|ISFP|ISFJ|ISTP|ISTJ)\s*(?:특유의?|타입의?)/i;

function noForbiddenWords(s: string): boolean {
  if (FORBIDDEN_WORDS.some((w) => s.includes(w))) return false;
  if (ABSTRACT_GYEOL.test(s)) return false;
  if (MBTI_CLICHE.test(s)) return false;
  return true;
}

const META_PHRASES = /자유서술/;

// ── PERSON BUNDLE ──────────────────────────────────────────

export const CandidateBundleSchema = z.object({
  casterHeadline: z
    .string()
    .min(10)
    .max(40)
    .refine(noForbiddenWords, { message: '금지어 사용 (곁자리/곁을 지키 등)' })
    .refine((s) => !/<b>/.test(s), { message: 'casterHeadline 은 강조(<b>) 없이 평문으로' })
    .refine((s) => !s.includes('!'), { message: 'casterHeadline 에 느낌표 금지' })
    .refine((s) => !/["'""''「」]/.test(s), { message: 'casterHeadline 에 따옴표 금지' })
    .refine((s) => !/(학생|회사원|직장인|전문직|프리랜서|공직)/.test(s), {
      message: 'casterHeadline 에 직업 카테고리 단어 노출 금지 — 행동/매력으로 풀어쓰기',
    })
    .refine((s) => !/\b(ENFP|ENFJ|ENTP|ENTJ|ESFP|ESFJ|ESTP|ESTJ|INFP|INFJ|INTP|INTJ|ISFP|ISFJ|ISTP|ISTJ)\b/i.test(s), {
      message: 'casterHeadline 에 MBTI 영문 4글자 직접 노출 금지 — 한국어 형용사로 풀어쓰기',
    }),
  casterCharmBullets: z
    .array(
      z
        .string()
        .min(8)
        .max(80)
        .regex(BOLD_TAG, '각 bullet 은 <b>...</b> 강조 한 곳 포함')
        .refine(noForbiddenWords, { message: '금지어 사용' })
    )
    .length(3),
  teaserFaceType: z
    .string()
    .min(8)
    .max(24)
    .refine(noForbiddenWords, { message: '금지어 사용' }),
  personality: z
    .string()
    .min(120, { message: '4~5문장 필요' })
    .max(600)
    .refine(noForbiddenWords, { message: '금지어 사용' }),
  datingStyle: z
    .string()
    .min(120, { message: '4~5문장 필요, 한 문장 끝 금지' })
    .max(600)
    .refine(noForbiddenWords, { message: '금지어 사용' }),
  weekendStyle: z
    .string()
    .min(120, { message: '4~5문장 필요' })
    .max(600)
    .refine(noForbiddenWords, { message: '금지어 사용' }),
  readingMatchOpening: z
    .string()
    .min(60, { message: '2~3문장 필요' })
    .max(300)
    // 다리 카피라 "의뢰인님" 호명은 OK (예외). 단 의뢰인의 구체적 답변/속성 참조는 시스템 프롬프트에서 금지.
    .refine(noForbiddenWords, { message: '금지어 사용' }),
  readingCandidateMatch: z
    .string()
    .min(120, { message: '4~5문장 필요' })
    .max(600)
    .refine((s) => !s.includes('의뢰인'), { message: 'candidateBundle 에 "의뢰인" 단어 금지' })
    .refine(noForbiddenWords, { message: '금지어 사용' }),
});

export const ViewerBundleSchema = z.object({
  readingViewerInsight: z
    .string()
    .min(120, { message: '4~5문장 필요' })
    .max(600)
    .refine((s) => !/이 사람|이 분|후보/.test(s), {
      message: 'viewerBundle 에 후보 참조 금지',
    })
    .refine((s) => !META_PHRASES.test(s), {
      message: '"자유서술" 같은 메타 단어 금지 — "본인을 소개하실 때" 식으로 자연스럽게',
    })
    .refine(noForbiddenWords, { message: '금지어 사용' }),
});

export const PersonBundleSchema = z.object({
  candidateBundle: CandidateBundleSchema,
  viewerBundle: ViewerBundleSchema,
});

export type CandidateBundle = z.infer<typeof CandidateBundleSchema>;
export type ViewerBundle = z.infer<typeof ViewerBundleSchema>;
export type PersonBundleOutput = z.infer<typeof PersonBundleSchema>;

// ── PAIR BUNDLE ────────────────────────────────────────────

export const Chapter3NoteSchema = z.object({
  axis: z.string().min(2).max(20),
  narrative: z
    .string()
    .min(80, { message: '3문장 필요' })
    .max(400)
    .regex(BOLD_TAG, '각 note 는 <b>...</b> 강조 한 곳 포함')
    .refine(noForbiddenWords, { message: '금지어 사용' })
    .refine((s) => !META_PHRASES.test(s), { message: '"자유서술" 메타 단어 금지' }),
});

export const PairBundleSchema = z.object({
  chapter3Notes: z.array(Chapter3NoteSchema).length(4),
  chapter3Simulation: z
    .string()
    .min(200, { message: '6~8문장 필요' })
    .max(1000)
    .regex(QUOTED, '후보 가상 첫 멘트를 따옴표로 포함')
    .regex(BOLD_TAG, '<b>...</b> 강조 1곳 이상 포함')
    .refine(noForbiddenWords, { message: '금지어 사용' }),
});

export type Chapter3Note = z.infer<typeof Chapter3NoteSchema>;
export type PairBundleOutput = z.infer<typeof PairBundleSchema>;
