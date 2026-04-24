/**
 * Personalization 레이어 타입 정의.
 * UserAnswers: 설문 답변 (실제 DB에 저장된 형태).
 * PersonalizedContent: LLM이 나중에 생성할 개인화 콘텐츠 — 이번 단계에서는 수동 Mock.
 */

export interface UserAnswers {
  // ── 이상형 (필수) ──
  idealType: {
    attractionFactor: string;
    agePreference: string;
    heightPreference: string;
    bodyType: string;
    relationshipPriority: string;
    contactStyle: string;
    religionImportance: string;
    dealBreaker: string;
    firstMeeting: string;
  };

  // ── 본인 정보 (옵셔널) ──
  selfInfo?: {
    ageRange?: string;
    gender?: string;
    location?: string;
    weekend?: string;
    drinking?: string;
    relationshipStyle?: string;
    readiness?: string;
  };

  // ── 자유 응답 (옵셔널) ──
  freeResponse?: {
    strictCriteria?: string;
    messageToUs?: string;
  };
}

export interface PersonalizedContent {
  chapter1Traits: {
    /** [LLM_GENERATED] Trait 01 (정서적 안정감) 앞에 붙는 1~2문장 */
    trait01Intro: string;
    /** [LLM_GENERATED] Trait 02 (자기 일에 진심) */
    trait02Intro: string;
    /** [LLM_GENERATED] Trait 03 (디테일한 관심) */
    trait03Intro: string;
    /** [LLM_GENERATED] Trait 04 (갈등 회피 X) */
    trait04Intro: string;
  };
  readingCard: {
    /** [LLM_GENERATED] 문단 1 도입 — 이상형 답변 인용 */
    paragraph1Opening: string;
    /** [LLM_GENERATED] 문단 2 도입 — 자유응답 or 본인정보 or 폴백 */
    paragraph2Opening: string;
  };
}
