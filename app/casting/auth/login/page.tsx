'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { castingFetch, setCastingUserSession } from '@/lib/casting/api';

const C = {
  bg: '#FEFBF4',
  ink: '#2C1D07',
  accent: '#E85D2F',
  gold: '#F7CA5D',
  muted: '#7A6A52',
} as const;

type Mode = 'password' | 'magic';
type Status = 'idle' | 'sending' | 'sent' | 'error';

/** `?next=` open-redirect 가드 — 내부 path 만 허용 (외부 URL `//evil.com`, `https://evil.com` 차단). */
function safeNext(raw: string | null): string {
  if (!raw) return '/me';
  if (!raw.startsWith('/') || raw.startsWith('//')) return '/me';
  return raw;
}

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeNext(searchParams.get('next'));

  const [mode, setMode] = useState<Mode>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setErrorMsg('이메일을 정확히 입력해줘');
      setStatus('error');
      return;
    }
    if (mode === 'password' && password.length < 8) {
      setErrorMsg('비밀번호는 8자 이상이야');
      setStatus('error');
      return;
    }
    setStatus('sending');
    setErrorMsg('');

    try {
      if (mode === 'password') {
        const data = await castingFetch<{ user_uid: string; auth_token: string }>(
          '/casting/auth/login',
          {
            method: 'POST',
            auth: false,
            body: JSON.stringify({ email, password }),
          },
        );
        setCastingUserSession(data.user_uid, data.auth_token);
        router.replace(nextPath);
        return;
      }
      await castingFetch('/casting/auth/magic-link/request', {
        method: 'POST',
        auth: false,
        body: JSON.stringify({ email }),
      });
      setStatus('sent');
    } catch (err) {
      const msg = (err as Error).message || '';
      if (msg.includes('401')) setErrorMsg('이메일 / 비밀번호를 다시 확인해줘');
      else if (msg.includes('429')) setErrorMsg('잠시 후 다시 시도해줘 (1분 제한)');
      else if (msg.includes('422')) setErrorMsg('형식을 다시 확인해줘');
      else if (msg.includes('502')) setErrorMsg('메일 발송이 잠시 막혔어. 다시 시도해줘');
      else setErrorMsg('로그인이 안 됐어. 다시 시도해줘');
      setStatus('error');
    }
  };

  return (
    <main className="min-h-dvh" style={{ background: C.bg }}>
      <div className="mx-auto max-w-md px-5 pt-14 pb-20">
        <header className="mb-8 text-center">
          <h1
            className="font-bold"
            style={{
              color: C.ink,
              fontSize: 'clamp(32px, 7vw, 44px)',
              lineHeight: 1.2,
              letterSpacing: '-1px',
            }}
          >
            로그인
          </h1>
        </header>

        {status === 'sent' ? (
          <div
            className="rounded-3xl px-6 py-8 text-center"
            style={{
              background: '#FFFFFF',
              border: `2px solid ${C.ink}`,
              boxShadow: `4px 4px 0 ${C.ink}`,
            }}
          >
            <p className="text-3xl">📨</p>
            <p className="mt-3 text-[15px]" style={{ color: C.ink, lineHeight: 1.6 }}>
              <b>{email}</b>
              <br />
              으로 로그인 링크를 보냈어.
            </p>
            <p className="mt-3 text-xs" style={{ color: C.muted }}>
              메일이 안 보이면 스팸함도 봐줘. 24시간 후 자동 만료돼.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="이메일 주소"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl text-base font-medium outline-none transition-shadow focus:shadow-lg"
              style={{
                color: C.ink,
                background: '#FFFFFF',
                border: `2px solid ${C.ink}`,
              }}
            />
            {mode === 'password' && (
              <input
                type="password"
                autoComplete="current-password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                className="w-full px-5 py-4 rounded-2xl text-base font-medium outline-none transition-shadow focus:shadow-lg"
                style={{
                  color: C.ink,
                  background: '#FFFFFF',
                  border: `2px solid ${C.ink}`,
                }}
              />
            )}
            {status === 'error' && errorMsg && (
              <p className="text-sm" style={{ color: '#C04A2B' }}>
                {errorMsg}
              </p>
            )}
            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full px-5 py-4 rounded-full font-bold text-base hover:-translate-y-0.5 transition-transform disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              style={{
                color: C.ink,
                background: C.gold,
                border: `2px solid ${C.ink}`,
                boxShadow: `4px 4px 0 ${C.ink}`,
              }}
            >
              {status === 'sending'
                ? mode === 'password'
                  ? '로그인 중…'
                  : '발송 중…'
                : mode === 'password'
                  ? '로그인'
                  : '로그인 링크 받기'}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode((m) => (m === 'password' ? 'magic' : 'password'));
                setErrorMsg('');
                setStatus('idle');
              }}
              className="w-full text-center text-sm underline pt-2"
              style={{ color: C.ink }}
            >
              {mode === 'password'
                ? '비밀번호 없이 이메일로 로그인'
                : '← 비밀번호로 로그인'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-dvh flex items-center justify-center" style={{ background: C.bg }}>
          <p className="text-sm" style={{ color: C.muted }}>
            준비 중…
          </p>
        </main>
      }
    >
      <LoginInner />
    </Suspense>
  );
}
