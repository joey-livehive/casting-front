'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { castingFetch, setCastingUserSession } from '@/lib/casting/api';

const C = {
  bg: '#FEFBF4',
  ink: '#2C1D07',
  accent: '#E85D2F',
  gold: '#F7CA5D',
  muted: '#7A6A52',
} as const;

type Status = 'verifying' | 'expired' | 'invalid' | 'error';

function VerifyInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [status, setStatus] = useState<Status>('verifying');
  const consumedRef = useRef(false);

  useEffect(() => {
    if (consumedRef.current) return;
    const token = params.get('token');
    if (!token) {
      setStatus('invalid');
      return;
    }
    consumedRef.current = true;

    castingFetch<{
      user_uid: string;
      auth_token: string;
      email: string;
      redirect_to: string | null;
    }>('/casting/auth/magic-link/consume', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ token }),
    })
      .then((data) => {
        setCastingUserSession(data.user_uid, data.auth_token);
        const target = data.redirect_to || '/me';
        router.replace(target);
      })
      .catch((err: Error) => {
        const msg = err.message || '';
        if (msg.includes('410')) setStatus('expired');
        else if (msg.includes('404')) setStatus('invalid');
        else setStatus('error');
      });
  }, [params, router]);

  return (
    <main className="min-h-dvh flex items-center justify-center" style={{ background: C.bg }}>
      <div className="mx-auto max-w-md px-5 py-12 text-center w-full">
        {status === 'verifying' && (
          <p className="text-sm" style={{ color: C.muted }}>
            확인 중…
          </p>
        )}

        {(status === 'expired' || status === 'invalid' || status === 'error') && (
          <div
            className="rounded-3xl px-6 py-10"
            style={{
              background: '#FFFFFF',
              border: `2px solid ${C.ink}`,
              boxShadow: `4px 4px 0 ${C.ink}`,
            }}
          >
            <p className="text-4xl">🔒</p>
            <h1
              className="mt-4 font-bold"
              style={{
                color: C.ink,
                fontSize: 'clamp(22px, 5vw, 28px)',
                lineHeight: 1.3,
                letterSpacing: '-0.5px',
              }}
            >
              {status === 'expired'
                ? '링크가 만료됐어'
                : status === 'invalid'
                  ? '유효하지 않은 링크야'
                  : '확인에 실패했어'}
            </h1>
            <p className="mt-3 text-sm" style={{ color: C.muted, lineHeight: 1.6 }}>
              아래 버튼을 누르면 새 로그인 링크를 받을 수 있어.
            </p>
            <button
              onClick={() => router.push('/casting/auth/login')}
              className="mt-6 w-full px-5 py-4 rounded-full font-bold text-base hover:-translate-y-0.5 transition-transform"
              style={{
                color: C.ink,
                background: C.gold,
                border: `2px solid ${C.ink}`,
                boxShadow: `4px 4px 0 ${C.ink}`,
              }}
            >
              새 링크 받기
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-dvh flex items-center justify-center" style={{ background: C.bg }}>
          <p className="text-sm" style={{ color: C.muted }}>
            확인 중…
          </p>
        </main>
      }
    >
      <VerifyInner />
    </Suspense>
  );
}
