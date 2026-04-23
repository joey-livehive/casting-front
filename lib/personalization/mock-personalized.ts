/**
 * Mock LLM 출력 3종.
 *
 * 각 Mock 유저(A/B/C) 에 대응하는 수동 작성 개인화 텍스트.
 * 실제 LLM 연동 시에는 이 파일이 `fallback-personalized.ts` 로 이동되고
 * LLM 실패 시 fallback 으로 사용된다.
 *
 * 모든 필드는 [LLM_GENERATED] 로 마킹되어 있어야 한다.
 */

import { PersonalizedContent } from './types';
import { MockUserKey } from './mock-users';

// ─────────────────────────────────────
// Case A — "매일 연락", "같은 종교", "성격 좋은 사람", "흡연 거부"
// ─────────────────────────────────────
export const MOCK_PERSONALIZED_A: PersonalizedContent = {
  chapter1Traits: {
    // [LLM_GENERATED]
    // Trait 01 (정서적 안정감) — 관련 답변: relationshipPriority, contactStyle
    trait01Intro:
      '의뢰인님께서는 연애에서 "매일 연락하는 거"를 가장 중요하게 꼽으셨습니다.',

    // [LLM_GENERATED]
    // Trait 02 (자기 일에 진심) — 관련 답변: attractionFactor
    trait02Intro: '"성격이 좋은 사람"에게 끌린다고 답하셨듯이,',

    // [LLM_GENERATED]
    // Trait 03 (디테일한 관심) — 관련 답변: 약함 → 폴백에 가까움
    trait03Intro: '의뢰인님의 선택지에서 섬세함에 대한 기대가 읽힙니다.',

    // [LLM_GENERATED]
    // Trait 04 (갈등 회피 X) — 관련 답변: dealBreaker
    trait04Intro: '"흡연하는 사람"을 명확히 거절하신 점은,',
  },
  readingCard: {
    // [LLM_GENERATED]
    // 문단 1 도입 — 이상형 답변 1~2개 통합
    paragraph1Opening:
      '의뢰인님께서 "매일 연락하는 거"를 연애의 우선순위로 꼽으신 점, 그리고 "같은 종교"를 선호하신 점에서,',

    // [LLM_GENERATED]
    // 문단 2 도입 — 자유응답 없음 → 본인 정보도 없음 → 폴백 성격
    paragraph2Opening: '의뢰인님의 성향 전반에서 다음과 같은 특징이 읽힙니다.',
  },
};

// ─────────────────────────────────────
// Case B — "유능한 능력", "같이 있을 때 편한 거", 자유응답 "손톱, 피부..."
// ─────────────────────────────────────
export const MOCK_PERSONALIZED_B: PersonalizedContent = {
  chapter1Traits: {
    // [LLM_GENERATED]
    trait01Intro: '"같이 있을 때 편한 거"를 연애의 우선순위로 꼽으셨습니다.',

    // [LLM_GENERATED]
    trait02Intro:
      '"유능한 능력을 가진 사람"에 끌리며, 자기 관리에 대한 기준을 명확히 갖고 계신 점에서,',

    // [LLM_GENERATED]
    trait03Intro:
      '자유 응답에서 "손톱, 피부, 머리카락 등 기본적인 자기 관리"를 언급하신 것처럼,',

    // [LLM_GENERATED]
    trait04Intro:
      '"흡연하는 사람"을 명확히 거절하셨고, 자기 관리에 대한 기대치가 뚜렷한 점을 보면,',
  },
  readingCard: {
    // [LLM_GENERATED]
    paragraph1Opening:
      '의뢰인님께서 "같이 있을 때 편한 거"를 중요하게 꼽으신 점, "각자 시간도 중요해"라는 연애 스타일까지 종합하면,',

    // [LLM_GENERATED]
    // 자유응답 있음 → 직접 인용
    paragraph2Opening:
      '의뢰인님께서 "손톱, 피부, 머리카락 등 기본적인 자기 관리가 확실했으면"이라 직접 적어 주신 점은, 단순한 외모 선호가 아닌 관계의 진정성에 대한 기준입니다.',
  },
};

// ─────────────────────────────────────
// Case C — "외모 수려", "같이 있을 때 편한 거", "밥 먹으면서", 본인 정보 일부
// ─────────────────────────────────────
export const MOCK_PERSONALIZED_C: PersonalizedContent = {
  chapter1Traits: {
    // [LLM_GENERATED]
    trait01Intro:
      '"같이 있을 때 편한 거"를 가장 중요하게 꼽으셨고, 연락 빈도에는 유연한 태도를 보이셨습니다.',

    // [LLM_GENERATED]
    trait02Intro: '"외모가 수려한 사람"에 끌린다고 답하신 점은,',

    // [LLM_GENERATED]
    trait03Intro: '첫 만남을 "밥 먹으면서"로 답하신 점에서,',

    // [LLM_GENERATED]
    trait04Intro: '"흡연하는 사람"을 명확히 거절하신 점은,',
  },
  readingCard: {
    // [LLM_GENERATED]
    paragraph1Opening:
      '의뢰인님께서 "같이 있을 때 편한 거"를 우선하시고 연락 빈도는 유연하신 점에서,',

    // [LLM_GENERATED]
    // 자유응답 없음, 본인 정보 활용
    paragraph2Opening:
      '20대 초반, "집에서 쉬어"를 주말 리듬으로 두신 점까지 보면,',
  },
};

export const MOCK_PERSONALIZED = {
  A: MOCK_PERSONALIZED_A,
  B: MOCK_PERSONALIZED_B,
  C: MOCK_PERSONALIZED_C,
} as const;

export function getMockPersonalized(key: MockUserKey = 'A'): PersonalizedContent {
  return MOCK_PERSONALIZED[key];
}
