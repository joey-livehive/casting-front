/**
 * 고정 해석 텍스트 카탈로그.
 * 이 파일의 내용은 LLM 이 생성하지 않는다.
 * 모든 유저에게 동일하게 보이는 "범용 해석" 이다.
 */

// ─────────────────────────────────────
// Chapter 1 — Four Traits
// ─────────────────────────────────────

export const TRAIT_01_CONTENT = {
  no: '01',
  title: '정서적 안정감이 1순위입니다',
  description:
    '감정 기복이 큰 상대는 의뢰인님을 지치게 합니다. ' +
    '말보다 꾸준함으로 증명받고 싶어하는 유형이며, ' +
    '예측 가능한 관계를 편안하게 느낍니다.',
  need: '일관된 리듬으로 연락하는 사람',
};

export const TRAIT_02_CONTENT = {
  no: '02',
  title: '자기 일에 진심인 사람에게 끌립니다',
  description:
    '커리어든 취미든, 자기 세계가 뚜렷한 사람에게 매력을 느낍니다. ' +
    '나태함이나 방향성 없는 태도는 빠르게 호감을 떨어뜨립니다.',
  need: '몰입할 대상이 있는 사람',
};

export const TRAIT_03_CONTENT = {
  no: '03',
  title: '디테일한 관심에서 사랑을 느낍니다',
  description:
    '과한 표현이나 이벤트보다 사소한 걸 기억해주는 사람에게 ' +
    '강한 애정을 느낍니다. "지난주에 말했던 그거"를 기억하는 유형입니다.',
  need: '기억력 좋고 관찰력 있는 사람',
};

export const TRAIT_04_CONTENT = {
  no: '04',
  title: '갈등을 회피하지 않아야 합니다',
  description:
    '무관심이 의뢰인님께는 가장 큰 상처입니다. ' +
    '부딪혀도 대화로 푸는 사람을 원하며, 그런 사람에게만 마음을 엽니다.',
  need: '감정을 언어로 풀어내는 사람',
};

export const TRAITS = [
  TRAIT_01_CONTENT,
  TRAIT_02_CONTENT,
  TRAIT_03_CONTENT,
  TRAIT_04_CONTENT,
] as const;

// ─────────────────────────────────────
// Reading Card — 편지 고정 문단
// ─────────────────────────────────────

export const READING_CARD_CONTENT = {
  tag: 'A Note to OO',
  fromLabel: 'from your casting manager',
  title: '선택지에서 읽어낸\n의뢰인님의 여섯 가지 성향.',

  // 문단 1 — 개인화 도입 뒤에 이어짐
  paragraph1:
    '의뢰인님은 말보다 행동으로 확인받을 때 안정감을 느끼는 분입니다. ' +
    '큰 이벤트보다 일상의 작은 기억이 오래 남는 유형입니다.',

  // 문단 2 — 개인화 도입 뒤에 이어짐
  paragraph2:
    '혼자서도 충분하지만, 함께 더 나아갈 수 있는 사람을 기다리고 있습니다. ' +
    '기준이 명확한 분이라 가식은 빠르게 읽히며, 진정성이 확인된 관계에서만 마음을 엽니다.',

  // 문단 3 — 완전 고정 (개인화 도입 없음)
  paragraph3:
    '관계에 에너지 쏟기가 버거운 시점입니다. ' +
    '이 분의 ◯◯◯◯한 안정감이 의뢰인님께 잘 맞는 선택으로 판단했습니다.',

  probabilityLabel: '예상 만족도',
  probabilityValue: 89,
  cases: 'BASED ON 23,481 CASES',
} as const;

// ─────────────────────────────────────
// Fallback — LLM 실패 또는 관련 답변 없을 때
// ─────────────────────────────────────

export const FALLBACK_INTROS = {
  trait: '의뢰인님의 선택지에서 이런 패턴이 드러납니다.',
  readingCardParagraph1: '의뢰인님께서 남겨 주신 답변을 바탕으로 정리했습니다.',
  readingCardParagraph2: '의뢰인님의 성향 전반에서 다음과 같은 특징이 읽힙니다.',
} as const;
