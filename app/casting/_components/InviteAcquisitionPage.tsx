'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { castingFetch, setCastingSession, setCastingUserSession } from '@/lib/casting/api';

type Channel = 'instagram' | 'caster';
type LoadState = 'loading' | 'ready' | 'error';
type ClaimState = 'idle' | 'sending_code' | 'code_sent' | 'claiming' | 'claimed' | 'error';

type InviteOpenResponse = {
  invite_token: string;
  channel: Channel;
  status: string;
  display_name?: string | null;
  claimed: boolean;
  guest_uid: string;
  access_token: string;
  report_uid?: string | null;
  report?: Record<string, any> | null;
};

type ClaimResponse = {
  user_uid: string;
  guest_uid: string;
  auth_token: string;
  email: string;
  redirect_to: string;
};

const COPY: Record<Channel, {
  eyebrow: string;
  title: string;
  intro: string;
  save: string;
}> = {
  instagram: {
    eyebrow: 'Instagram Match',
    title: '인스타에서 시작하는 무료 매칭',
    intro: '짧은 설문을 보고 지금 가장 잘 맞는 한 명을 무료로 골라드려요.',
    save: '무료 매칭 받기',
  },
  caster: {
    eyebrow: 'Caster Pick',
    title: '캐스터 추천 무료 매칭',
    intro: '설문 기준을 확인한 뒤 캐스터 풀에서 가장 가까운 한 명을 먼저 보여드려요.',
    save: '추천 매칭 받기',
  },
};

export function InviteAcquisitionPage({
  channel,
  inviteToken,
}: {
  channel: Channel;
  inviteToken: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showClaim = searchParams.get('claim') === '1';
  const copy = COPY[channel];
  const [state, setState] = useState<LoadState>('loading');
  const [claimState, setClaimState] = useState<ClaimState>('idle');
  const [invite, setInvite] = useState<InviteOpenResponse | null>(null);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (showClaim) return;
    router.replace(`/start?inviteToken=${encodeURIComponent(inviteToken)}&inviteChannel=${channel}`);
  }, [channel, inviteToken, router, showClaim]);

  useEffect(() => {
    let mounted = true;
    setState('loading');
    castingFetch<InviteOpenResponse>(`/casting/invites/${encodeURIComponent(inviteToken)}/open`, {
      method: 'POST',
      auth: false,
    })
      .then((data) => {
        if (!mounted) return;
        if (data.channel !== channel) throw new Error('channel_mismatch');
        setInvite(data);
        setCastingSession(data.guest_uid, data.access_token);
        setState('ready');
      })
      .catch(() => {
        if (!mounted) return;
        setMessage('초대 링크를 확인하지 못했어요.');
        setState('error');
      });
    return () => {
      mounted = false;
    };
  }, [channel, inviteToken]);

  async function requestPhoneCode() {
    if (claimState === 'sending_code') return;
    setClaimState('sending_code');
    setMessage('');
    try {
      await castingFetch('/casting/auth/phone/request', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      });
      setClaimState('code_sent');
      setMessage('인증번호를 보냈어요.');
    } catch {
      setClaimState('error');
      setMessage('인증번호 발송에 실패했어요.');
    }
  }

  async function verifyCodeAndClaim() {
    if (!invite || claimState === 'claiming') return;
    setClaimState('claiming');
    setMessage('');
    try {
      const verified = await castingFetch<{ phone_verification_token: string }>('/casting/auth/phone/verify', {
        method: 'POST',
        body: JSON.stringify({ phone, code }),
      });
      const claimed = await castingFetch<ClaimResponse>(`/casting/invites/${encodeURIComponent(inviteToken)}/claim`, {
        method: 'POST',
        auth: false,
        body: JSON.stringify({
          email,
          phone,
          password,
          phone_verification_token: verified.phone_verification_token,
        }),
      });
      setCastingUserSession(claimed.user_uid, claimed.auth_token);
      setClaimState('claimed');
      router.replace(claimed.redirect_to || '/me');
    } catch {
      setClaimState('error');
      setMessage('저장하지 못했어요. 입력값을 확인해 주세요.');
    }
  }

  if (!showClaim) return <Centered>설문으로 이동하는 중...</Centered>;
  if (state === 'loading') return <Centered>매칭 저장 화면을 여는 중...</Centered>;
  if (state === 'error') return <Centered>{message}</Centered>;

  return (
    <main className="min-h-dvh bg-[#FFF8E8] text-[#211A12]">
      <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-5 py-8">
        <header className="mb-7">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#D2642C]">{copy.eyebrow}</p>
          <h1 className="mt-2 text-[30px] font-black leading-tight">{copy.title}</h1>
          <p className="mt-3 text-sm leading-6 text-[#6E5D4D]">{copy.intro}</p>
        </header>

        <ClaimCard
          copy={copy}
          channel={channel}
          phone={phone}
          code={code}
          email={email}
          password={password}
          claimState={claimState}
          message={message}
          setPhone={setPhone}
          setCode={setCode}
          setEmail={setEmail}
          setPassword={setPassword}
          requestPhoneCode={requestPhoneCode}
          verifyCodeAndClaim={verifyCodeAndClaim}
        />
      </div>
    </main>
  );
}

function ClaimCard({
  copy,
  channel,
  phone,
  code,
  email,
  password,
  claimState,
  message,
  setPhone,
  setCode,
  setEmail,
  setPassword,
  requestPhoneCode,
  verifyCodeAndClaim,
}: {
  copy: (typeof COPY)[Channel];
  channel: Channel;
  phone: string;
  code: string;
  email: string;
  password: string;
  claimState: ClaimState;
  message: string;
  setPhone: (value: string) => void;
  setCode: (value: string) => void;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  requestPhoneCode: () => void;
  verifyCodeAndClaim: () => void;
}) {
  const source = channel === 'instagram' ? '인스타' : '캐스터';
  return (
    <>
      <section className="rounded-[24px] border-2 border-[#211A12] bg-white p-5 shadow-[4px_4px_0_#211A12]">
        <p className="text-xs font-bold text-[#D2642C]">설문 완료</p>
        <h2 className="mt-2 text-xl font-black leading-snug">
          설문 기준으로 무료 매칭 1명을 준비했어요
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#4D4035]">
          {source} 유입 전용 무료 매칭이에요. 저장하면 바로 마이페이지에서 결과를 볼 수 있어요.
        </p>
      </section>

      <section className="mt-5 rounded-[24px] border-2 border-[#211A12] bg-[#211A12] p-5 text-white">
        <h2 className="text-lg font-black">마이페이지에 저장하기</h2>
        <p className="mt-2 text-sm leading-6 text-white/75">
          전화번호 인증 후 무료 매칭을 계정에 연결해둘게요.
        </p>
        <div className="mt-4 space-y-2">
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="전화번호"
            className="h-12 w-full rounded-2xl border border-white/25 bg-white px-4 text-sm text-[#211A12] outline-none"
          />
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="인증번호"
              className="h-12 min-w-0 flex-1 rounded-2xl border border-white/25 bg-white px-4 text-sm text-[#211A12] outline-none"
            />
            <button
              type="button"
              onClick={requestPhoneCode}
              disabled={claimState === 'sending_code'}
              className="h-12 shrink-0 rounded-2xl bg-[#F1C94A] px-4 text-sm font-black text-[#211A12] disabled:opacity-60"
            >
              {claimState === 'sending_code' ? '발송 중' : '인증'}
            </button>
          </div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            className="h-12 w-full rounded-2xl border border-white/25 bg-white px-4 text-sm text-[#211A12] outline-none"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            type="password"
            className="h-12 w-full rounded-2xl border border-white/25 bg-white px-4 text-sm text-[#211A12] outline-none"
          />
        </div>
        {message && <p className="mt-3 text-xs text-[#F1C94A]">{message}</p>}
        <button
          type="button"
          onClick={verifyCodeAndClaim}
          disabled={claimState === 'claiming'}
          className="mt-4 h-12 w-full rounded-2xl bg-[#F1C94A] px-5 text-sm font-black text-[#211A12] disabled:opacity-60"
        >
          {claimState === 'claiming' ? '매칭 중...' : copy.save}
        </button>
      </section>
    </>
  );
}

function Centered({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#FFF8E8] px-5 text-center text-sm text-[#6E5D4D]">
      {children}
    </main>
  );
}
