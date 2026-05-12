/**
 * Casting backend API 클라이언트.
 *
 * 인증 모델: 첫 호출(`POST /casting/guests/start`)이 `access_token`을 반환하고,
 * 이후 PATCH/POST 호출은 `x-casting-guest-token` 헤더로 본인 확인을 한다.
 * 토큰은 sessionStorage 에 `casting_guest_token` 키로 저장한다.
 */

export const CASTING_API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.publicvoid.im';

const TOKEN_KEY = 'casting_guest_token';
const GUEST_KEY = 'casting_guest_uid';
const USER_TOKEN_KEY = 'casting_user_token';
const USER_UID_KEY = 'casting_user_uid';

export function getCastingToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setCastingSession(guestUid: string, token: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(GUEST_KEY, guestUid);
}

export function getCastingGuestUid(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(GUEST_KEY);
}

export function clearCastingSession(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(GUEST_KEY);
}

// ─── 회원(User) 세션 — 매직링크 인증 후 cookie + localStorage 양쪽에 저장.
// cookie 는 백엔드가 set-cookie 로 심어주지만, fetch 헤더로도 보내기 위해
// localStorage 백업본을 유지한다 (다른 디바이스/브라우저는 별도 매직링크 로그인).

export function getCastingUserToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(USER_TOKEN_KEY);
}

export function getCastingUserUid(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(USER_UID_KEY);
}

export function setCastingUserSession(userUid: string, token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_TOKEN_KEY, token);
  localStorage.setItem(USER_UID_KEY, userUid);
}

export function clearCastingUserSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_TOKEN_KEY);
  localStorage.removeItem(USER_UID_KEY);
}

interface FetchOptions extends RequestInit {
  /** true 면 token 헤더 자동 주입. 기본 true. start 호출 같은 익명 케이스에서 false. */
  auth?: boolean;
}

export async function castingFetch<T = unknown>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { auth = true, headers, ...rest } = options;
  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };
  if (auth) {
    const token = getCastingToken();
    if (token) finalHeaders['x-casting-guest-token'] = token;
  }
  const res = await fetch(`${CASTING_API_BASE}${path}`, {
    ...rest,
    headers: finalHeaders,
    credentials: 'include',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`casting_api_${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

/**
 * 회원(매직링크 인증된 사용자) 전용 fetcher.
 * Authorization: Bearer 토큰과 레거시 x-casting-user-token 헤더를 함께 주입한다.
 */
export async function castingFetchUser<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const { headers, ...rest } = options;
  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };
  const token = getCastingUserToken();
  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`;
    finalHeaders['x-casting-user-token'] = token;
  }
  const res = await fetch(`${CASTING_API_BASE}${path}`, {
    ...rest,
    headers: finalHeaders,
    credentials: 'include',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`casting_api_${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}
