'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  castingFetchUser,
  clearCastingUserSession,
  getCastingUserToken,
} from '@/lib/casting/api';

type DashboardOrder = {
  order_id: string;
  product_id: string;
  product_name: string;
  credits: number;
  amount: number;
  status: string;
  paid_at: string | null;
  created_at: string;
};

type DashboardMatch = {
  report_uid: string;
  status: string;
  stage: string;
  partner_source: string | null;
  score: number | null;
  order_id: string | null;
  report_url: string | null;
  contact_requested_at: string | null;
  mutual_match_at: string | null;
  outreach_status: string | null;
  created_at: string;
  updated_at: string;
};

type DashboardResponse = {
  user: {
    user_uid: string;
    email: string;
    phone: string | null;
    last_login_at: string;
    created_at: string;
  };
  phone_verified: boolean;
  credits: {
    balance: number;
    total_purchased: number;
    total_used: number;
    linked_guest_count: number;
  };
  orders: DashboardOrder[];
  matches: DashboardMatch[];
};

type LoadState = 'loading' | 'ready' | 'unauth' | 'error';
type PhoneState = 'idle' | 'sending' | 'sent' | 'verifying' | 'verified' | 'error';

const C = {
  bg: '#F5EFE4',
  ink: '#1C1A17',
  muted: '#7A7064',
  line: 'rgba(28,26,23,0.14)',
  orange: '#E37A3A',
  gold: '#F1CE63',
  green: '#5F8F54',
  dark: '#23201C',
};

export default function CastingMePage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [state, setState] = useState<LoadState>('loading');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [phoneState, setPhoneState] = useState<PhoneState>('idle');
  const [message, setMessage] = useState('');

  const loadDashboard = useCallback(async () => {
    if (!getCastingUserToken()) {
      setState('unauth');
      return;
    }
    setState('loading');
    try {
      const dashboard = await castingFetchUser<DashboardResponse>('/casting/auth/me/dashboard');
      setData(dashboard);
      setPhone(dashboard.user.phone || '');
      setState('ready');
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
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    if (state === 'unauth') router.replace('/casting/auth/login');
  }, [router, state]);

  const paidOrders = useMemo(
    () => (data?.orders || []).filter((order) => order.status === 'paid'),
    [data?.orders],
  );

  async function requestPhoneCode() {
    if (phone.replace(/\D/g, '').length < 10) {
      setPhoneState('error');
      setMessage('전화번호를 정확히 입력해주세요.');
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
      setMessage('인증번호를 입력해주세요.');
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
      setMessage('전화번호 인증과 구매 내역 연동이 완료됐어요.');
      await loadDashboard();
    } catch (err) {
      setPhoneState('error');
      setMessage(phoneErrorMessage(err));
    }
  }

  if (state === 'loading') {
    return (
      <main className="mx-auto flex min-h-screen max-w-[520px] items-center justify-center" style={{ background: C.bg }}>
        <p className="text-[15px]" style={{ color: C.muted }}>현황을 불러오는 중...</p>
      </main>
    );
  }

  if (state === 'unauth') return null;

  if (state === 'error' || !data) {
    return (
      <main className="mx-auto min-h-screen max-w-[520px] px-6 py-12" style={{ background: C.bg, color: C.ink }}>
        <h1 className="text-[22px] font-bold">내 캐스팅</h1>
        <p className="mt-3 text-[14px]" style={{ color: C.muted }}>{message}</p>
        <button onClick={loadDashboard} className="mt-5 h-11 rounded-full px-5 text-white" style={{ background: C.orange }}>
          다시 불러오기
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-[520px] px-5 pb-16 pt-8" style={{ background: C.bg, color: C.ink }}>
      <header className="mb-6">
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em]" style={{ color: C.orange }}>Casting Status</p>
        <div className="mt-1 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-[26px] font-extrabold leading-tight">내 캐스팅 현황</h1>
            <p className="mt-1 text-[13px]" style={{ color: C.muted }}>{data.user.email}</p>
          </div>
          <button
            onClick={() => {
              clearCastingUserSession();
              router.replace('/casting/auth/login');
            }}
            className="h-9 shrink-0 rounded-full border px-3 text-[12px]"
            style={{ borderColor: C.line, color: C.muted }}
          >
            로그아웃
          </button>
        </div>
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

      {data.phone_verified && (
        <div className="mb-4 rounded-[12px] border bg-white px-4 py-3 text-[13px]" style={{ borderColor: C.line }}>
          <span className="font-semibold">인증된 전화번호</span>
          <span className="ml-2" style={{ color: C.muted }}>{formatPhone(data.user.phone)}</span>
        </div>
      )}

      <section className="grid grid-cols-3 gap-2">
        <Metric label="남은 소개권" value={`${data.credits.balance}장`} tone="gold" />
        <Metric label="구매한 소개권" value={`${data.credits.total_purchased}장`} />
        <Metric label="사용한 소개권" value={`${data.credits.total_used}장`} />
      </section>

      <section className="mt-6">
        <SectionTitle title="구매 목록" count={paidOrders.length} />
        <div className="space-y-2">
          {paidOrders.length === 0 ? (
            <Empty text="아직 결제 완료된 구매 내역이 없어요." />
          ) : (
            paidOrders.map((order) => <OrderRow key={order.order_id} order={order} />)
          )}
        </div>
      </section>

      <section className="mt-6">
        <SectionTitle title="진행중인 매칭" count={data.matches.length} />
        <div className="space-y-2">
          {data.matches.length === 0 ? (
            <Empty text={data.phone_verified ? '아직 생성된 매칭 카드가 없어요.' : '전화번호 인증 후 기존 매칭 내역을 찾아올게요.'} />
          ) : (
            data.matches.map((match) => <MatchRow key={match.report_uid} match={match} />)
          )}
        </div>
      </section>
    </main>
  );
}

function PhoneVerificationCard(props: {
  phone: string;
  code: string;
  state: PhoneState;
  message: string;
  onPhoneChange: (v: string) => void;
  onCodeChange: (v: string) => void;
  onRequest: () => void;
  onVerify: () => void;
}) {
  const busy = props.state === 'sending' || props.state === 'verifying';
  return (
    <section className="mb-5 rounded-[16px] border bg-white p-4 shadow-[3px_4px_0_rgba(28,26,23,0.16)]" style={{ borderColor: C.ink }}>
      <h2 className="text-[17px] font-bold">전화번호 인증이 필요해요</h2>
      <p className="mt-1 text-[13px] leading-[1.55]" style={{ color: C.muted }}>
        구매 내역과 매칭 카드는 가입 계정과 전화번호가 연결되어야 보여요.
      </p>
      <div className="mt-4 space-y-2">
        <input
          value={props.phone}
          onChange={(e) => props.onPhoneChange(e.target.value)}
          placeholder="01012345678"
          inputMode="tel"
          className="h-12 w-full rounded-[10px] border px-3 text-[15px] outline-none"
          style={{ borderColor: C.line }}
        />
        <button
          type="button"
          disabled={busy}
          onClick={props.onRequest}
          className="h-11 w-full rounded-full text-[14px] font-bold text-white disabled:opacity-50"
          style={{ background: C.dark }}
        >
          {props.state === 'sending' ? '발송 중...' : '인증번호 받기'}
        </button>
        {(props.state === 'sent' || props.state === 'verifying' || props.code) && (
          <div className="flex gap-2">
            <input
              value={props.code}
              onChange={(e) => props.onCodeChange(e.target.value)}
              placeholder="인증번호"
              inputMode="numeric"
              className="h-11 min-w-0 flex-1 rounded-[10px] border px-3 text-[15px] outline-none"
              style={{ borderColor: C.line }}
            />
            <button
              type="button"
              disabled={busy}
              onClick={props.onVerify}
              className="h-11 rounded-full px-4 text-[14px] font-bold text-white disabled:opacity-50"
              style={{ background: C.orange }}
            >
              확인
            </button>
          </div>
        )}
        {props.message && (
          <p className="text-[12px]" style={{ color: props.state === 'error' ? '#C2410C' : C.green }}>{props.message}</p>
        )}
      </div>
    </section>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: 'gold' }) {
  return (
    <div className="rounded-[12px] border bg-white p-3" style={{ borderColor: C.line, background: tone === 'gold' ? C.gold : '#fff' }}>
      <p className="text-[11px] font-semibold" style={{ color: C.muted }}>{label}</p>
      <p className="mt-1 text-[20px] font-extrabold">{value}</p>
    </div>
  );
}

function SectionTitle({ title, count }: { title: string; count: number }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <h2 className="text-[17px] font-bold">{title}</h2>
      <span className="text-[12px]" style={{ color: C.muted }}>{count}건</span>
    </div>
  );
}

function OrderRow({ order }: { order: DashboardOrder }) {
  return (
    <article className="rounded-[12px] border bg-white p-4" style={{ borderColor: C.line }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[14px] font-bold">{order.product_name}</p>
          <p className="mt-1 text-[12px]" style={{ color: C.muted }}>{order.order_id}</p>
        </div>
        <p className="text-[14px] font-extrabold">{formatWon(order.amount)}</p>
      </div>
      <div className="mt-3 flex items-center justify-between text-[12px]" style={{ color: C.muted }}>
        <span>소개권 {order.credits}장</span>
        <span>{formatDate(order.paid_at || order.created_at)}</span>
      </div>
    </article>
  );
}

function MatchRow({ match }: { match: DashboardMatch }) {
  return (
    <article className="rounded-[12px] border bg-white p-4" style={{ borderColor: C.line }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[14px] font-bold">{stageLabel(match.stage)}</p>
          <p className="mt-1 text-[12px]" style={{ color: C.muted }}>
            {match.partner_source || 'candidate'} · {match.report_uid}
          </p>
        </div>
        {match.score !== null && (
          <span className="rounded-full px-2.5 py-1 text-[12px] font-bold" style={{ background: '#FBE7D7', color: C.orange }}>
            {match.score}%
          </span>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 text-[12px]" style={{ color: C.muted }}>
        <span>{formatDate(match.created_at)}</span>
        {match.report_url ? (
          <a href={match.report_url} className="font-bold underline" style={{ color: C.ink }}>
            카드 보기
          </a>
        ) : (
          <span>{statusLabel(match.status)}</span>
        )}
      </div>
    </article>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-[12px] border border-dashed bg-white/55 px-4 py-6 text-center text-[13px]" style={{ borderColor: C.line, color: C.muted }}>
      {text}
    </div>
  );
}

function phoneErrorMessage(err: unknown): string {
  const msg = (err as Error).message || '';
  if (msg.includes('429')) return '잠시 후 다시 시도해 주세요.';
  if (msg.includes('410')) return '인증번호가 만료됐어요. 다시 받아주세요.';
  if (msg.includes('400')) return '인증번호가 일치하지 않아요.';
  if (msg.includes('502')) return '문자 발송에 실패했어요. 잠시 후 다시 시도해 주세요.';
  return '처리하지 못했어요. 잠시 후 다시 시도해 주세요.';
}

function stageLabel(stage: string): string {
  const labels: Record<string, string> = {
    preparing: '매칭 카드 준비 중',
    ready: '매칭 카드 도착',
    contact_requested: '연결 요청 진행 중',
    connected: '연결 완료',
    failed: '생성 실패',
  };
  return labels[stage] || stage;
}

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    queued: '대기 중',
    generating: '생성 중',
    published: '발행 완료',
    failed: '실패',
  };
  return labels[status] || status;
}

function formatWon(value: number): string {
  return `${value.toLocaleString('ko-KR')}원`;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

function formatPhone(value: string | null): string {
  if (!value) return '';
  const d = value.replace(/\D/g, '');
  if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return value;
}
