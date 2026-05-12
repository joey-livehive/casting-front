'use client';

import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { track } from '@/lib/report/tracking';
import {
  castingFetch,
  castingFetchUser,
  getCastingGuestUid,
  getCastingUserToken,
  setCastingUserSession,
} from '@/lib/casting/api';

type ConfirmStatus = 'confirming' | 'paid' | 'error';
type SignupStatus = 'idle' | 'sending' | 'completed' | 'error';
type PhoneStatus = 'idle' | 'sending' | 'codeSent' | 'verifying' | 'verified' | 'error';
const GUEST_PHONE_KEY = 'casting_guest_phone';

function normalizePhone(value: string): string {
  return value.replace(/\D/g, '').slice(0, 11);
}

function formatPhone(value: string): string {
  const digits = normalizePhone(value);
  if (digits.length < 4) return digits;
  if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function SuccessInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [confirmStatus, setConfirmStatus] = useState<ConfirmStatus>('confirming');
  const [orderId, setOrderId] = useState<string | null>(null);

  // signup form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signupStatus, setSignupStatus] = useState<SignupStatus>('idle');
  const [signupError, setSignupError] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [phoneStatus, setPhoneStatus] = useState<PhoneStatus>('idle');
  const [phoneError, setPhoneError] = useState('');
  const [phoneVerificationToken, setPhoneVerificationToken] = useState('');

  useEffect(() => {
    const orderIdParam = params.get('orderId');
    const paymentKey = params.get('paymentKey');
    const amount = params.get('amount');

    if (!orderIdParam || !amount) {
      setConfirmStatus('error');
      return;
    }
    setOrderId(orderIdParam);

    const confirm = getCastingUserToken() ? castingFetchUser : castingFetch;
    confirm<{ status: string; order_id: string; signup_required?: boolean; redirect_to?: string | null }>(
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
          if (data.signup_required === false) {
            router.replace(data.redirect_to || '/me');
            return;
          }
          setConfirmStatus('paid');
          track('purchase_complete', { orderId: orderIdParam, amount: Number(amount) }, {
            pixel: 'Purchase',
            pixelData: {
              value: Number(amount),
              currency: 'KRW',
              content_ids: ['casting'],
              content_name: orderIdParam,
            },
          });
        } else {
          setConfirmStatus('error');
        }
      })
      .catch(() => setConfirmStatus('error'));
  }, [params, router]);

  useEffect(() => {
    if (!orderId) return;
    if (typeof window === 'undefined') return;
    const savedPhone = sessionStorage.getItem(GUEST_PHONE_KEY);
    if (!savedPhone) {
      setPhoneError('이전에 입력한 전화번호를 찾을 수 없어요.');
      setPhoneStatus('error');
      return;
    }
    setPhone(formatPhone(savedPhone));
    setPhoneError('');
    setPhoneStatus('idle');
  }, [orderId]);

  const requestPhoneCode = async () => {
    const digits = normalizePhone(phone);
    if (digits.length < 10 || !orderId) {
      setPhoneError('전화번호를 정확히 입력해주세요.');
      setPhoneStatus('error');
      return;
    }
    const guestUid = getCastingGuestUid();
    if (!guestUid) {
      setPhoneError('가입 정보를 찾을 수 없어요. 처음부터 다시 진행해주세요.');
      setPhoneStatus('error');
      return;
    }
    setPhoneStatus('sending');
    setPhoneError('');
    setPhoneVerificationToken('');
    try {
      await castingFetch(`/casting/guests/${guestUid}/phone`, {
        method: 'PATCH',
        body: JSON.stringify({ value: digits }),
      });
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(GUEST_PHONE_KEY, digits);
      }
      await castingFetch('/casting/auth/phone/request', {
        method: 'POST',
        body: JSON.stringify({ phone: digits, order_id: orderId }),
      });
      setPhoneStatus('codeSent');
    } catch (err) {
      const msg = (err as Error).message || '';
      if (msg.includes('429')) {
        setPhoneError('잠시 후 다시 시도해 주세요. (20초 제한)');
      } else if (msg.includes('422')) {
        setPhoneError('전화번호 형식을 확인해 주세요.');
      } else if (msg.includes('502')) {
        setPhoneError('인증번호 발송에 실패했어요. 잠시 후 다시 시도해 주세요.');
      } else {
        setPhoneError('인증번호 요청에 실패했어요.');
      }
      setPhoneStatus('error');
    }
  };

  const onClickPhoneAction = () => {
    if (phoneStatus === 'codeSent' || phoneCode.length === 6) {
      void verifyPhoneCode();
      return;
    }
    void requestPhoneCode();
  };

  const verifyPhoneCode = async () => {
    const digits = normalizePhone(phone);
    if (digits.length < 10 || phoneCode.replace(/\D/g, '').length !== 6 || !orderId) {
      setPhoneError('전화번호와 인증번호를 확인해주세요.');
      setPhoneStatus('error');
      return;
    }
    setPhoneStatus('verifying');
    setPhoneError('');
    try {
      const data = await castingFetch<{ phone_verification_token: string }>('/casting/auth/phone/verify', {
        method: 'POST',
        body: JSON.stringify({ phone: digits, code: phoneCode.replace(/\D/g, ''), order_id: orderId }),
      });
      setPhoneVerificationToken(data.phone_verification_token);
      setPhoneStatus('verified');
    } catch (err) {
      const msg = (err as Error).message || '';
      if (msg.includes('410')) {
        setPhoneError('인증번호가 만료됐어요. 다시 받아주세요.');
      } else if (msg.includes('400')) {
        setPhoneError('인증번호가 올바르지 않아요.');
      } else if (msg.includes('429')) {
        setPhoneError('인증 시도 횟수를 초과했어요. 다시 받아주세요.');
      } else {
        setPhoneError('전화번호 인증에 실패했어요.');
      }
      setPhoneStatus('error');
    }
  };

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
    const digits = normalizePhone(phone);
    if (phoneStatus !== 'verified' || !phoneVerificationToken || digits.length < 10) {
      setSignupError('전화번호 인증을 완료해주세요.');
      setSignupStatus('error');
      return;
    }
    setSignupStatus('sending');
    setSignupError('');
    try {
      const data = await castingFetch<{
        user_uid: string;
        auth_token: string;
        email: string;
        redirect_to: string | null;
      }>('/casting/auth/magic-link/request', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          order_id: orderId,
          phone: digits,
          phone_verification_token: phoneVerificationToken,
        }),
      });
      setCastingUserSession(data.user_uid, data.auth_token);
      setSignupStatus('completed');
      router.replace(data.redirect_to || '/casting/me');
    } catch (err) {
      const msg = (err as Error).message || '';
      if (msg.includes('429')) {
        setSignupError('잠시 후 다시 시도해 주세요. (1분 제한)');
      } else if (msg.includes('422')) {
        setSignupError('이메일/비밀번호 형식을 확인해 주세요. (비밀번호는 8자 이상)');
      } else if (msg.includes('502')) {
        setSignupError('가입 처리에 실패했어요. 잠시 후 다시 시도해 주세요.');
      } else {
        setSignupError('가입에 실패했어요.');
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
            마지막 단계 — 가입 완료후<br />
            매칭 카드를 보내드려요.
          </p>
        </div>

        {signupStatus === 'completed' ? (
          <div className="mx-auto max-w-[360px] bg-white rounded-[18px] p-5 border border-[#1C1A17]/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#E37A3A] flex items-center justify-center text-white text-[18px] font-bold">
                ✓
              </div>
              <div>
                <div className="font-semibold text-[15px] text-[#1C1A17]">가입이 완료됐어요</div>
                <div className="text-[13px] text-[#4A443B] mt-0.5">{email}</div>
              </div>
            </div>
            <p className="text-[#4A443B] text-[13.5px] leading-[1.55] mt-4">
              매칭 카드 페이지로 이동 중이에요.
            </p>
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
              type="text"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="비밀번호 (8자 이상)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              style={{ WebkitTextSecurity: 'disc' } as CSSProperties}
              className="w-full h-12 px-4 rounded-[12px] bg-white border border-[#1C1A17]/15 text-[15px] text-[#1C1A17] placeholder:text-[#8A8275]"
            />
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="전화번호"
              value={phone}
              onChange={(e) => {
                setPhone(formatPhone(e.target.value));
                setPhoneCode('');
                setPhoneStatus('idle');
                setPhoneVerificationToken('');
                setPhoneError('');
              }}
              className="w-full h-12 px-4 rounded-[12px] bg-white border border-[#1C1A17]/15 text-[15px] text-[#1C1A17] placeholder:text-[#8A8275]"
            />
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="인증번호 6자리"
                value={phoneCode}
                onChange={(e) => {
                  setPhoneCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                  if (phoneStatus === 'verified') {
                    setPhoneStatus('codeSent');
                    setPhoneVerificationToken('');
                  }
                }}
                className="h-12 min-w-0 flex-1 px-4 rounded-[12px] bg-white border border-[#1C1A17]/15 text-[15px] text-[#1C1A17] placeholder:text-[#8A8275]"
              />
              <button
                type="button"
                onClick={onClickPhoneAction}
                disabled={phoneStatus === 'sending' || phoneStatus === 'verifying' || phoneStatus === 'verified'}
                className="h-12 shrink-0 rounded-[12px] bg-[#1C1A17] px-4 text-[13px] font-bold text-white disabled:opacity-50"
              >
                {phoneStatus === 'sending'
                  ? '발송 중'
                  : phoneStatus === 'verifying'
                    ? '확인 중'
                    : phoneStatus === 'verified'
                      ? '인증됨'
                      : phoneStatus === 'codeSent' || phoneCode
                        ? '확인'
                        : '인증번호'}
              </button>
            </div>
            {phoneStatus === 'codeSent' && !phoneError && (
              <p className="text-[#5F8F54] text-[13px]">인증번호를 보냈어요. 5분 안에 입력해주세요.</p>
            )}
            {(phoneStatus === 'codeSent' || phoneStatus === 'error') && (
              <button
                type="button"
                onClick={requestPhoneCode}
                className="text-[#6E6254] underline text-[13px]"
              >
                인증번호 다시 받기
              </button>
            )}
            {phoneStatus === 'verified' && (
              <p className="text-[#5F8F54] text-[13px]">전화번호 인증이 완료됐어요.</p>
            )}
            {phoneStatus === 'error' && phoneError && (
              <p className="text-red-600 text-[13px]">{phoneError}</p>
            )}
            {signupStatus === 'error' && signupError && (
              <p className="text-red-600 text-[13px]">{signupError}</p>
            )}
            <button
              type="submit"
              disabled={signupStatus === 'sending' || !email || password.length < 8 || phoneStatus !== 'verified'}
              className="w-full h-12 rounded-full bg-[#E37A3A] text-white font-display font-bold disabled:opacity-50"
            >
              {signupStatus === 'sending' ? '가입 중...' : '가입하기'}
            </button>
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
