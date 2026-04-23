/**
 * Mock 유저 답변 3종.
 *
 * 실제 DB 조회 대신 이 파일에서 직접 로드한다.
 * Addendum 02 에서 DB 조회 구현 시 이 파일은 fallback 으로 이동한다.
 *
 * 유저 답변 문자열은 실제 DB 값과 동일하게 유지한다 (오타/띄어쓰기 포함).
 */

import { UserAnswers } from './types';

// ─────────────────────────────────────
// Case A — 답변 중간 수준, 본인 정보 / 자유응답 없음
// ─────────────────────────────────────
export const MOCK_USER_A: UserAnswers = {
  idealType: {
    attractionFactor: "'성격'이 좋은 사람",
    agePreference: '나보다 많은 사람',
    heightPreference: '작은 편이 좋아',
    bodyType: '보통',
    relationshipPriority: '매일 연락하는 거',
    contactStyle: '수시로 연락했으면',
    religionImportance: '같은 종교였으면',
    dealBreaker: '흡연하는 사람',
    firstMeeting: '뭐든 좋아',
  },
};

// ─────────────────────────────────────
// Case B — 답변 많음 + 자유응답 있음
// ─────────────────────────────────────
export const MOCK_USER_B: UserAnswers = {
  idealType: {
    attractionFactor: "유능한 '능력'을 가진 사람",
    agePreference: '나보다 많은 사람',
    heightPreference: '큰 편이 좋아',
    bodyType: '보통',
    relationshipPriority: '같이 있을 때 편한 거',
    contactStyle: '수시로 연락했으면',
    religionImportance: '종교 없는 사람이 좋아',
    dealBreaker: '흡연하는 사람',
    firstMeeting: '카페에서 가볍게',
  },
  selfInfo: {
    ageRange: '20대 후반',
    gender: '여자',
    location: '경기/인천',
    weekend: '집에서 쉬어',
    drinking: '가끔',
    relationshipStyle: '각자 시간도 중요해',
    readiness: '좋은 사람 있으면',
  },
  freeResponse: {
    strictCriteria:
      '손톱, 피부, 머리카락 등 기본적인 자기 관리가 확실했으면 좋겠어. ' +
      '수염은 레이저 제모 한 듯이 깔끔한 사람이 좋아. ' +
      '키는 180 이상. 피부 좋아야 돼.',
    messageToUs: '내 짝 좀 찾아줘',
  },
};

// ─────────────────────────────────────
// Case C — 답변 적음, 본인 정보 일부만, 자유응답 없음
// ─────────────────────────────────────
export const MOCK_USER_C: UserAnswers = {
  idealType: {
    attractionFactor: "'외모'가 수려한 사람",
    agePreference: '나보다 많은 사람',
    heightPreference: '큰 편이 좋아',
    bodyType: '상관없어',
    relationshipPriority: '같이 있을 때 편한 거',
    contactStyle: '연락 빈도는 상관없어',
    religionImportance: '종교 없는 사람이 좋아',
    dealBreaker: '흡연하는 사람',
    firstMeeting: '밥 먹으면서',
  },
  selfInfo: {
    ageRange: '20대 초반',
    gender: '여자',
    location: '경기/인천',
    weekend: '집에서 쉬어',
    drinking: '거의 안 마셔',
  },
};

export const MOCK_USERS = {
  A: MOCK_USER_A,
  B: MOCK_USER_B,
  C: MOCK_USER_C,
} as const;

export type MockUserKey = keyof typeof MOCK_USERS;

/** URL 파라미터나 페이지 prop 으로 받아서 Mock 유저 선택 */
export function getMockUser(key: MockUserKey = 'A'): UserAnswers {
  return MOCK_USERS[key];
}

export function isMockUserKey(v: string | undefined): v is MockUserKey {
  return v === 'A' || v === 'B' || v === 'C';
}
