/**
 * 개인화 레이어 타입 정의.
 *
 * 이 파일의 타입은 두 가지 도메인을 다룬다:
 * 1. UserAnswers       - 유저가 설문에서 남긴 답변 (DB 원본)
 * 2. PersonalizedContent - LLM 이 나중에 생성할 개인화 텍스트 (현재는 Mock)
 *
 * 현재 단계(UI Mock)에서는 수동 작성한 값을 컴포넌트에 주입한다.
 * Addendum 02 에서 LLM 호출로 교체 예정.
 */

export interface UserAnswers {
  // ────── 이상형 (필수 카테고리) ──────
  idealType: {
    attractionFactor: string; // 어떤 사람이 끌려? (예: "'외모'가 수려한 사람")
    agePreference: string; // 나이는 어느 정도? (예: "나보다 많은 사람")
    heightPreference: string; // 키는 어느 정도? (예: "큰 편이 좋아")
    bodyType: string; // 체형은 어때? (예: "보통" 또는 "상관없어")
    relationshipPriority: string; // 연애할 때 뭐가 제일 중요해? (예: "같이 있을 때 편한 거")
    contactStyle: string; // 연락 스타일은? (예: "연락 빈도는 상관없어")
    religionImportance: string; // 종교는 중요해? (예: "종교 없는 사람이 좋아")
    dealBreaker: string; // 이건 좀 아닌 것 같아 (예: "흡연하는 사람")
    firstMeeting: string; // 첫 만남은 어떤 게 좋아? (예: "밥 먹으면서")
  };

  // ────── 본인 정보 (옵셔널 카테고리) ──────
  selfInfo?: {
    ageRange?: string;
    gender?: string;
    location?: string;
    weekend?: string;
    drinking?: string;
    relationshipStyle?: string;
    readiness?: string;
  };

  // ────── 자유 응답 (소수만 작성, 옵셔널) ──────
  freeResponse?: {
    strictCriteria?: string;
    messageToUs?: string;
  };
}

/**
 * LLM 이 생성할 개인화 콘텐츠 구조.
 * 현재는 Mock, Addendum 02 에서 실제 LLM 호출로 교체.
 */
export interface PersonalizedContent {
  chapter1Traits: {
    trait01Intro: string; // Trait 01 (정서적 안정감) 개인화 도입
    trait02Intro: string; // Trait 02 (자기 일에 진심)
    trait03Intro: string; // Trait 03 (디테일한 관심)
    trait04Intro: string; // Trait 04 (갈등 회피 X)
  };
  readingCard: {
    paragraph1Opening: string; // 문단 1 도입 (1~2문장)
    paragraph2Opening: string; // 문단 2 도입 (자유응답 유무에 따라 달라짐)
  };
}
