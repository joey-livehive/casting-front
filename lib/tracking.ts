/**
 * Meta Pixel + DB 이벤트 트래킹 — someonetheone
 */

declare global {
  interface Window {
    fbq?: (
      action: string,
      event: string,
      params?: Record<string, unknown>
    ) => void;
  }
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// 세션 ID 생성 (탭 단위)
function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sid = sessionStorage.getItem('sto_session_id');
  if (!sid) {
    sid = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem('sto_session_id', sid);
  }
  return sid;
}

// guest_uid (설문 시작 후 저장됨)
function getGuestUid(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('sto_guest_uid');
}

export function setGuestUid(uid: string) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('sto_guest_uid', uid);
  }
}

/** DB 이벤트 전송 (fire-and-forget) */
function sendEvent(
  eventType: string,
  eventName: string,
  properties?: Record<string, unknown>,
) {
  const sessionId = getSessionId();
  if (!sessionId) return;

  fetch(`${API_BASE}/casting/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      guest_uid: getGuestUid(),
      session_id: sessionId,
      event_type: eventType,
      event_name: eventName,
      path: typeof window !== 'undefined' ? window.location.pathname : null,
      properties: properties || null,
    }),
  }).catch(() => {});
}

function devLog(label: string, params?: Record<string, unknown>) {
  if (process.env.NODE_ENV !== 'production') {
    console.log(label, params ?? '');
  }
}

// ── Meta Pixel + DB 이벤트 ──────────────────────────────────────────────────

/** 페이지 뷰 */
export function trackPageView(pageName: string) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_ids: ['someonetheone'], content_type: 'product', content_name: pageName,
    });
  }
  sendEvent('page_view', pageName);
  devLog('[Event] page_view', { pageName });
}

/** Lead — "이상형 알려주기" 버튼 클릭 */
export function trackLead() {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Lead', { content_ids: ['someonetheone'], content_type: 'product', content_name: 'start' });
  }
  sendEvent('click', 'cta_start');
  devLog('[Event] Lead / cta_start');
}

/** 설문 답변 */
export function trackAnswer(question: string, answer: string, phase: string) {
  sendEvent('submit', phase === 'intro' ? 'intro_answer' : 'detail_answer', { question, answer });
  devLog('[Event] answer', { question, answer, phase });
}

/** 까다로운 기준 제출 */
export function trackPicky(value: string) {
  sendEvent('submit', 'picky', value ? { value } : undefined);
  devLog('[Event] picky');
}

/** CompleteRegistration — 이메일 제출 */
export function trackCompleteRegistration(email: string) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'CompleteRegistration', {
      content_ids: ['someonetheone'], content_type: 'product', content_name: 'email', status: true,
    });
  }
  sendEvent('submit', 'email', { email });
  devLog('[Event] CompleteRegistration', { email });
}

/** 전화번호 제출 */
export function trackPhone(phone: string) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Contact', {
      content_ids: ['someonetheone'], content_type: 'product', content_name: 'phone',
    });
  }
  sendEvent('submit', 'phone', { phone });
  devLog('[Event] Contact / phone', { phone });
}

/** 사진 업로드 */
export function trackPhoto() {
  sendEvent('submit', 'photo');
  devLog('[Event] photo');
}

/** 하고 싶은 말 제출 */
export function trackMessage(hasMessage: boolean) {
  sendEvent('submit', 'message', { has_content: hasMessage });
  devLog('[Event] message');
}

/** SubmitApplication — 최종 설문 완료 */
export function trackSubmitApplication() {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'SubmitApplication', {
      content_ids: ['someonetheone'], content_type: 'product', content_name: 'complete',
    });
  }
  sendEvent('complete', 'survey_done');
  devLog('[Event] SubmitApplication / survey_done');
}
