export type PurchaseToast =
  | { type: 'purchase'; name: string; time: string }
  | { type: 'match'; name: string; count: number }
  | { type: 'meet'; name: string; phrase: string };

/**
 * 비율: 6 구매 / 2 매칭 / 2 만남 (총 10개).
 * 첫 번째(idx 0)는 반드시 `purchase` 타입 — 페이지 로드 3.5초 후 첫 노출되므로 결제 압박 유지.
 */
export const toastData: PurchaseToast[] = [
  { type: 'purchase', name: '강*희', time: '5분 전' },
  { type: 'purchase', name: '박*수', time: '8분 전' },
  { type: 'match', name: '이*연', count: 3 },
  { type: 'purchase', name: '최*은', time: '14분 전' },
  { type: 'meet', name: '윤*아', phrase: '어제 첫 데이트 했어요' },
  { type: 'purchase', name: '정*우', time: '27분 전' },
  { type: 'match', name: '김*린', count: 4 },
  { type: 'purchase', name: '한*원', time: '33분 전' },
  { type: 'meet', name: '임*희', phrase: '오늘 2번째 만남 중이에요' },
  { type: 'purchase', name: '장*연', time: '41분 전' },
];
