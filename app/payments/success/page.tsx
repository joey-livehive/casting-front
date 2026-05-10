'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { track } from '@/lib/report/tracking';
import { castingFetch } from '@/lib/casting/api';

type ConfirmStatus = 'confirming' | 'paid' | 'error';
type SignupStatus = 'idle' | 'sending' | 'sent' | 'error';

function SuccessInner() {
  const params = useSearchParams();
  const [confirmStatus, setConfirmStatus] = useState<ConfirmStatus>('confirming');
  const [orderId, setOrderId] = useState<string | null>(null);

  // signup form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signupStatus, setSignupStatus] = useState<SignupStatus>('idle');
  const [signupError, setSignupError] = useState('');

  useEffect(() => {
    const orderIdParam = params.get('orderId');
    const paymentKey = params.get('paymentKey');
    const amount = params.get('amount');

    if (!orderIdParam || !amount) {
      setConfirmStatus('error');
      return;
    }
    setOrderId(orderIdParam);

    castingFetch<{ status: string; order_id: string }>(
      '/casting/payments/toss/confirm',
      {
        method: 'POST',
        body: JSON.stringify({
          payment_key: paymentKey,
          order_id: orderIdParam,
          amount: Number(amount),
        }),
      },
    )
      .then((data) => {
        if (data.status === 'success') {
          setConfirmStatus('paid');
          track('purchase_complete', { orderId: orderIdParam, amount: Number(amount) }, {
            pixel: 'Purchase',
            pixelData: {
              value: Number(amount),
              currency: 'KRW',
              content_ids: ['someonetheone'],
              content_name: orderIdParam,
            },
          });
        } else {
          setConfirmStatus('error');
        }
      })
      .catch(() => setConfirmStatus('error'));
  }, [params]);

  const onSubmitSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@') || !orderId) {
      setSignupError('이메일을 정확히 입력해주세요.');
      setSignupStatus('error');
      return;
    }
    if (password.length < 8) {
      setSignupError('비밀번호는 8자 이상이어야 해요.');
      setSignupStatus('error');
      return;
    }
    setSignupStatus('sending');
    setSignupError('');
    try {
      await castingFetch('/casting/auth/magic-link/request', {
        method: 'POST',
        auth: false,
        body: JSON.stringify({ email, password, order_id: orderId }),
      });
      setSignupStatus('sent');
    } catch (err) {
      const msg = (err as Error).message || '';
      if (msg.includes('429')) {
        setSignupError('잠시 후 다시 시도해 주세요. (1분 제한)');
      } else if (msg.includes('422')) {
        setSignupError('이메일/비밀번호 형식을 확인해 주세요. (비밀번호는 8자 이상)');
      } else if (msg.includes('502')) {
        setSignupError('이메일 발송에 실패했어요. 잠시 후 다시 시도해 주세요.');
      } else {
        setSignupError('요청에 실패했어요.');
      }
      setSignupStatus('error');
    }
  };

  if (confirmStatus === 'paid') {
    return (
      <main className="max-w-[480px] mx-auto min-h-screen bg-[#F5EFE4] px-6 pt-12 pb-16">
        <div className="text-center mb-7">
          <div className="inline-flex w-14 h-14 rounded-full bg-[#F1CE63] text-[#1C1A17]
                          items-center justify-center text-[26px] font-extrabold
                          border-[2px] border-[#1C1A17] shadow-[3px_4px_0_#1C1A17] mb-4">
            ✓
          </div>
          <h1 className="font-bold text-[22px] text-[#1C1A17] mb-2">결제 완료!</h1>
          <p className="text-[#4A443B] text-[15px] leading-[1.6]">
            마지막 단계 — 이메일을 입력하면<br />
            매칭 카드를 받아볼 가입 링크를 보내드려요.
          </p>
        </div>

        {signupStatus === 'sent' ? (
          <div className="mx-auto max-w-[360px] bg-white rounded-[18px] p-5 border border-[#1C1A17]/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#E37A3A] flex items-center justify-center text-white text-[18px]">
                📨
              </div>
              <div>
                <div className="font-semibold text-[15px] text-[#1C1A17]">가입 링크를 보냈어요</div>
                <div className="text-[13px] text-[#4A443B] mt-0.5">{email}</div>
              </div>
            </div>
            <ol className="space-y-2.5 text-[13.5px] text-[#1C1A17] leading-[1.55] mt-4">
              <li className="flex gap-2.5">
                <span className="shrink-0 w-5 h-5 rounded-full bg-[#1C1A17] text-white text-[11px] font-bold flex items-center justify-center">1</span>
                <span>받은 메일에 있는 <b>“가입 완료”</b> 버튼을 눌러주세요.</span>
              </li>
              <li className="flex gap-2.5">
                <span className="shrink-0 w-5 h-5 rounded-full bg-[#1C1A17] text-white text-[11px] font-bold flex items-center justify-center">2</span>
                <span>로그인되면 매칭 카드 페이지로 자동 이동돼요.</span>
              </li>
              <li className="flex gap-2.5">
                <span className="shrink-0 w-5 h-5 rounded-full bg-[#1C1A17] text-white text-[11px] font-bold flex items-center justify-center">3</span>
                <span>매칭 카드 준비에 <b>2~3일</b>이 걸려요. 준비되면 안내드려요.</span>
              </li>
            </ol>
            <p className="text-[#8A8275] text-[12px] mt-4">
              메일이 안 보이면 스팸함도 확인해주세요. 링크는 <b>24시간</b> 후 만료됩니다.
            </p>
            <button
              onClick={() => {
                setSignupStatus('idle');
                setEmail('');
              }}
              className="mt-4 w-full text-center text-[12px] text-[#4A443B] underline"
            >
              다른 이메일로 다시 받기
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmitSignup} className="mx-auto max-w-[360px] space-y-3">
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="이메일 주소"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 rounded-[12px] bg-white border border-[#1C1A17]/15 text-[15px] text-[#1C1A17] placeholder:text-[#8A8275]"
            />
            <input
              type="password"
              autoComplete="new-password"
              placeholder="비밀번호 (8자 이상)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              className="w-full h-12 px-4 rounded-[12px] bg-white border border-[#1C1A17]/15 text-[15px] text-[#1C1A17] placeholder:text-[#8A8275]"
            />
            {signupStatus === 'error' && signupError && (
              <p className="text-red-600 text-[13px]">{signupError}</p>
            )}
            <button
              type="submit"
              disabled={signupStatus === 'sending' || !email || password.length < 8}
              className="w-full h-12 rounded-full bg-[#E37A3A] text-white font-display font-bold disabled:opacity-50"
            >
              {signupStatus === 'sending' ? '발송 중...' : '가입 링크 받기'}
            </button>
            <p className="text-center text-[12px] text-[#8A8275] pt-2">
              결제 완료 후 24시간 안에 가입을 완료해주세요.
            </p>
          </form>
        )}

        <p className="mt-8 text-center text-[12px] text-[#8A8275]">
          문의: <a href="mailto:hello@livehivecorp.com" className="font-semibold text-[#4A443B] underline">hello@livehivecorp.com</a>
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-[480px] mx-auto min-h-screen flex flex-col items-center justify-center bg-[#F5EFE4] px-6 text-center">
      {confirmStatus === 'confirming' && (
        <p className="text-[#4A443B] text-[15px]">결제 확인 중...</p>
      )}
      {confirmStatus === 'error' && (
        <>
          <div className="text-[48px] mb-4">😢</div>
          <h1 className="font-bold text-[22px] text-[#1C1A17] mb-2">결제 확인에 실패했어요</h1>
          <p className="text-[#4A443B] text-[15px] leading-[1.6]">
            결제가 완료됐다면 자동으로 처리됩니다.<br />문제가 계속되면 문의해주세요.
          </p>
        </>
      )}
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<main className="max-w-[480px] mx-auto min-h-screen flex items-center justify-center bg-[#F5EFE4]"><p className="text-[#4A443B]">결제 확인 중...</p></main>}>
      <SuccessInner />
    </Suspense>
  );
}
