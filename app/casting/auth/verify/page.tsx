'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { castingFetch, setCastingUserSession } from '@/lib/casting/api';

type Status = 'verifying' | 'expired' | 'invalid' | 'error';

function VerifyInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [status, setStatus] = useState<Status>('verifying');
  // 매직링크 토큰은 1회용이라 두 번째 호출은 410 을 받는다.
  // React StrictMode 와 리렌더로 중복 실행되지 않도록 ref 로 보호.
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
        const target = data.redirect_to || '/casting/me';
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
    <main className="max-w-[480px] mx-auto min-h-screen flex flex-col items-center justify-center bg-[#F5EFE4] px-6 text-center">
      {status === 'verifying' && (
        <p className="text-[#4A443B] text-[15px]">가입 확인 중...</p>
      )}
      {(status === 'expired' || status === 'invalid' || status === 'error') && (
        <>
          <div className="text-[48px] mb-4">🔒</div>
          <h1 className="font-bold text-[22px] text-[#1C1A17] mb-2">
            {status === 'expired'
              ? '링크가 만료되었어요'
              : status === 'invalid'
                ? '유효하지 않은 링크예요'
                : '확인에 실패했어요'}
          </h1>
          <p className="text-[#4A443B] text-[15px] leading-[1.6] mb-6">
            아래 버튼을 눌러 로그인 링크를 다시 받을 수 있어요.
          </p>
          <button
            onClick={() => router.push('/casting/auth/login')}
            className="h-12 px-8 rounded-full bg-[#E37A3A] text-white font-display font-bold"
          >
            새 링크 받기
          </button>
        </>
      )}
    </main>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <main className="max-w-[480px] mx-auto min-h-screen flex items-center justify-center bg-[#F5EFE4]">
          <p className="text-[#4A443B]">가입 확인 중...</p>
        </main>
      }
    >
      <VerifyInner />
    </Suspense>
  );
}
