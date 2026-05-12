'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  castingFetchUser,
  clearCastingUserSession,
  getCastingUserToken,
} from '@/lib/casting/api';

import { C } from './_lib/tokens';
import { formatPhone } from './_lib/format';
import { isEnded } from './_lib/derive';
import type { DashboardResponse, Match } from './_lib/types';

import { CreditWithRecharge } from './_components/CreditWithRecharge';
import { EmptyMatchesState } from './_components/EmptyMatchesState';
import { MatchProgress } from './_components/MatchProgress';
import { OrderRow } from './_components/OrderRow';
import { PhoneVerificationCard, type PhoneState } from './_components/PhoneVerificationCard';
import { RechargeCta } from './_components/RechargeCta';

const isDev = process.env.NODE_ENV !== 'production';
const DEV_MOCK_TOKEN = 'mock';

type LoadState = 'loading' | 'ready' | 'unauth' | 'error';

function MeInner() {
  const router = useRouter();
  const search = useSearchParams();
  const caseKey = isDev ? search.get('case')?.toLowerCase() ?? null : null;

  const [data, setData] = useState<DashboardResponse | null>(null);
  const [state, setState] = useState<LoadState>('loading');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [phoneState, setPhoneState] = useState<PhoneState>('idle');
  const [message, setMessage] = useState('');
  const [usingMock, setUsingMock] = useState(false);

  const applyData = useCallback((next: DashboardResponse) => {
    setData(next);
    setPhone(next.user.phone || '');
    setState('ready');
  }, []);

  const loadDashboard = useCallback(async () => {
    // dev 케이스 스위처: 명시 URL ?case=… 또는 mock 토큰이면 mock-cases 모듈을 동적으로 불러
    // production bundle 에는 mock 데이터가 포함되지 않는다.
    if (isDev) {
      const token = getCastingUserToken();
      const shouldUseMock = !!caseKey || !token || token === DEV_MOCK_TOKEN;
      if (shouldUseMock) {
        if (token === DEV_MOCK_TOKEN) clearCastingUserSession();
        const { CASES, DEFAULT_MOCK_KEY } = await import('./_lib/mock-cases');
        const key = caseKey && caseKey in CASES ? (caseKey as keyof typeof CASES) : DEFAULT_MOCK_KEY;
        setUsingMock(true);
        applyData(CASES[key].data);
        return;
      }
    }

    setUsingMock(false);
    if (!getCastingUserToken()) {
      setState('unauth');
      return;
    }
    setState('loading');
    try {
      const dashboard = await castingFetchUser<DashboardResponse>('/casting/auth/me/dashboard');
      applyData(dashboard);
    } catch (err) {
      const msg = (err as Error).message || '';
      if (msg.includes('401') || msg.includes('403')) {
        clearCastingUserSession();
        setState('unauth');
      } else {
        setMessage('현황을 불러오지 못했어요.');
        setState('error');
      }
    }
  }, [applyData, caseKey]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    if (state === 'unauth') router.replace('/casting/auth/login?next=/me');
  }, [router, state]);

  const { active, ended } = useMemo(() => {
    const a: Match[] = [];
    const e: Match[] = [];
    for (const m of (data?.matches || []) as Match[]) {
      if (isEnded(m)) e.push(m);
      else a.push(m);
    }
    return { active: a, ended: e };
  }, [data]);

  async function requestPhoneCode() {
    if (phone.replace(/\D/g, '').length < 10) {
      setPhoneState('error');
      setMessage('전화번호를 정확히 입력해줘.');
      return;
    }
    setPhoneState('sending');
    setMessage('');
    try {
      await castingFetchUser('/casting/auth/phone/request', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      });
      setPhoneState('sent');
      setMessage('인증번호를 보냈어요.');
    } catch (err) {
      setPhoneState('error');
      setMessage(phoneErrorMessage(err));
    }
  }

  async function verifyPhoneCode() {
    if (!code.trim()) {
      setPhoneState('error');
      setMessage('인증번호를 입력해줘.');
      return;
    }
    setPhoneState('verifying');
    setMessage('');
    try {
      await castingFetchUser('/casting/auth/phone/verify', {
        method: 'POST',
        body: JSON.stringify({ phone, code }),
      });
      setPhoneState('verified');
      setMessage('전화번호 인증 완료.');
      await loadDashboard();
    } catch (err) {
      setPhoneState('error');
      setMessage(phoneErrorMessage(err));
    }
  }

  function logout() {
    clearCastingUserSession();
    router.replace('/casting/auth/login');
  }

  if (state === 'loading') return <CenteredMessage>확인 중…</CenteredMessage>;

  if (state === 'unauth') return null;

  if (state === 'error' || !data) {
    return (
      <main className="min-h-dvh" style={{ background: C.bg }}>
        {isDev && <DevCaseSwitcherSlot current={caseKey ?? ''} usingMock={usingMock} />}
        <div className="mx-auto max-w-xl px-5 pt-14 pb-20 text-center">
          <h1 className="font-bold text-2xl" style={{ color: C.ink }}>
            현황을 불러오지 못했어요
          </h1>
          <p className="mt-3 text-sm" style={{ color: C.muted }}>
            {message || '잠시 후 다시 시도해줘.'}
          </p>
          <button
            type="button"
            onClick={loadDashboard}
            className="mt-6 rounded-full px-5 py-3 font-bold text-sm"
            style={{ background: C.gold, color: C.ink, border: `2px solid ${C.ink}`, boxShadow: `3px 3px 0 ${C.ink}` }}
          >
            다시 불러오기
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh" style={{ background: C.bg }}>
      {isDev && <DevCaseSwitcherSlot current={caseKey ?? ''} usingMock={usingMock} />}

      <div className="mx-auto max-w-xl px-5 pb-24 pt-8">
        <header className="mb-8 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: C.accent }}>
              Casting Status
            </p>
            <h1
              className="mt-1 font-bold"
              style={{ color: C.ink, fontSize: 'clamp(26px, 6vw, 34px)', lineHeight: 1.2, letterSpacing: '-0.5px' }}
            >
              캐스팅 현황
            </h1>
            <div className="mt-2 flex flex-col text-xs" style={{ color: C.muted }}>
              <span className="truncate">{data.user.email}</span>
              {data.phone_verified && data.user.phone && (
                <span>{formatPhone(data.user.phone)}</span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition-transform hover:-translate-y-0.5"
            style={{ background: '#FFFFFF', color: C.muted, border: `2px solid ${C.ink}`, boxShadow: `2px 2px 0 ${C.ink}` }}
          >
            로그아웃
          </button>
        </header>

        {!data.phone_verified && (
          <PhoneVerificationCard
            phone={phone}
            code={code}
            state={phoneState}
            message={message}
            onPhoneChange={setPhone}
            onCodeChange={setCode}
            onRequest={requestPhoneCode}
            onVerify={verifyPhoneCode}
          />
        )}

        <Section title="구매 내역" count={paidOrders(data).length}>
          <CreditWithRecharge credits={data.credits} />
          {paidOrders(data).length === 0 ? (
            <EmptyHint msg="아직 결제 완료된 구매 내역이 없어요." />
          ) : (
            paidOrders(data).map((o) => <OrderRow key={o.order_id} order={o} />)
          )}
        </Section>

        <MatchProgress active={active} ended={ended} phoneVerified={data.phone_verified} />

        <RechargeCta balance={data.credits.balance} />
      </div>
    </main>
  );
}

function paidOrders(data: DashboardResponse) {
  return data.orders.filter((o) => o.status === 'paid');
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <div className="mb-3 flex items-baseline gap-2">
        <h2 className="font-bold" style={{ color: C.ink, fontSize: 'clamp(17px, 4vw, 20px)' }}>
          {title}
        </h2>
        <span className="text-xs" style={{ color: C.muted }}>
          {count}건
        </span>
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

function EmptyHint({ msg }: { msg: string }) {
  return (
    <div
      className="rounded-2xl p-5 text-center text-sm"
      style={{ border: `2px dashed ${C.ink}33`, color: C.muted }}
    >
      {msg}
    </div>
  );
}

function CenteredMessage({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh flex items-center justify-center" style={{ background: C.bg }}>
      <p className="text-sm" style={{ color: C.muted }}>
        {children}
      </p>
    </main>
  );
}

/**
 * dev 환경에서만 동적 import — production bundle 에 mock 데이터가 따라오지 않게 한다.
 * suspense fallback 은 짧고 거의 보이지 않으므로 별도 처리 없이 null 반환.
 */
function DevCaseSwitcherSlot({ current, usingMock }: { current: string; usingMock: boolean }) {
  const [Switcher, setSwitcher] = useState<React.ComponentType<{ current: string; usingMock: boolean }> | null>(null);
  useEffect(() => {
    let mounted = true;
    void import('./_components/CaseSwitcher.dev').then((m) => {
      if (mounted) setSwitcher(() => m.CaseSwitcher);
    });
    return () => {
      mounted = false;
    };
  }, []);
  return Switcher ? <Switcher current={current} usingMock={usingMock} /> : null;
}

function phoneErrorMessage(err: unknown): string {
  const msg = (err as Error).message || '';
  if (msg.includes('429')) return '잠시 후 다시 시도해줘.';
  if (msg.includes('410')) return '인증번호가 만료됐어. 다시 받아줘.';
  if (msg.includes('400')) return '인증번호가 일치하지 않아.';
  if (msg.includes('502')) return '문자 발송에 실패했어. 잠시 후 다시 시도해줘.';
  return '처리하지 못했어. 잠시 후 다시 시도해줘.';
}

export default function MePage() {
  return (
    <Suspense fallback={<CenteredMessage>확인 중…</CenteredMessage>}>
      <MeInner />
    </Suspense>
  );
}
