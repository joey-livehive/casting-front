'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { castingFetchUser, clearCastingUserSession, getCastingUserToken } from '@/lib/casting/api';

export function ReportAuthGate({
  children,
  loginPath = '/casting/auth/login',
}: {
  children: ReactNode;
  loginPath?: string;
}) {
  const [state, setState] = useState<'checking' | 'authed' | 'guest'>('checking');

  useEffect(() => {
    if (!getCastingUserToken()) {
      setState('guest');
      return;
    }
    castingFetchUser('/casting/auth/me')
      .then(() => setState('authed'))
      .catch(() => {
        clearCastingUserSession();
        setState('guest');
      });
  }, []);

  if (state === 'checking') {
    return (
      <main className="mx-auto flex min-h-screen max-w-[480px] items-center justify-center bg-brand-bg px-6">
        <p className="text-[14px] text-brand-ink-soft">로그인 상태를 확인하는 중...</p>
      </main>
    );
  }

  if (state === 'guest') {
    const next = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '';
    const href = `${loginPath}?next=${encodeURIComponent(next)}`;
    return (
      <main className="mx-auto min-h-screen max-w-[480px] bg-brand-bg px-6 py-12 text-brand-ink">
        <div className="rounded-[16px] border border-brand-line bg-white px-5 py-6 shadow-[3px_4px_0_rgba(28,26,23,0.16)]">
          <h1 className="text-[22px] font-extrabold">로그인이 필요해요</h1>
          <p className="mt-2 text-[14px] leading-[1.6] text-brand-ink-soft">
            매칭 리포트는 가입 후 로그인한 계정에서 확인할 수 있어요.
          </p>
          <Link
            href={href}
            className="mt-5 flex h-12 items-center justify-center rounded-full bg-[#E37A3A] font-bold text-white"
          >
            가입 / 로그인
          </Link>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
