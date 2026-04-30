/**
 * Personalization 레이어 타입 정의.
 * UserAnswers: 설문 답변 (실제 DB에 저장된 형태).
 * PersonalizedContent: LLM이 나중에 생성할 개인화 콘텐츠 — 이번 단계에서는 수동 Mock.
 */

export interface UserAnswers {
  // ── 이상형 ──
  // prod 응답에 일부 키만 들어오는 경우가 있어 모두 옵셔널.
  idealType: {
    attractionFactor?: string;
    agePreference?: string;
    heightPreference?: string;
    bodyType?: string;
    relationshipPriority?: string;
    contactStyle?: string;
    religionImportance?: string;
    dealBreaker?: string;
    firstMeeting?: string;
  };

  // ── 본인 정보 (옵셔널) ──
  selfInfo?: {
    // prod backend 키
    age?: string;
    gender?: string;
    location?: string;
    occupation?: string;
    jobDetail?: string;
    height?: string;
    weekend?: string;
    drinking?: string;
    datingFrequency?: string;
    mbti?: string;
    dateStyle?: string;
    skinship?: string;
    marriageIntent?: string;
    income?: string;
    // legacy / mock 키 (mock-users.ts, result-v7 호환용)
    ageRange?: string;
    relationshipStyle?: string;
    readiness?: string;
  };

  // ── 성격 (옵셔널) ──
  personality?: {
    jealousy?: string;
    conflictStyle?: string;
    selfDescription?: string;
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
    /** 후보별 매칭 한 줄 — ReadingCard 마지막 문단 자리. 없으면 컴포넌트 기본 카피로 폴백. */
    candidateMatch?: string;
  };
}
