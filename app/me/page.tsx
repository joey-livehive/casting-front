'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  castingFetchUser,
  clearCastingUserSession,
  getCastingUserToken,
} from '@/lib/casting/api';

/* ─── Design tokens (home 톤 일관) ─── */

const C = {
  bg: '#FEFBF4',
  ink: '#2C1D07',
  accent: '#E85D2F',
  gold: '#F7CA5D',
  ok: '#4F9D6B',
  bad: '#C04A2B',
  muted: '#7A6A52',
  line: 'rgba(44,29,7,0.14)',
} as const;

/* ─── 백엔드 응답 스키마 (GET /casting/auth/me/dashboard) ─── */

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

type Stage = 'preparing' | 'ready' | 'contact_requested' | 'connected' | 'failed';
type ReportStatus = 'queued' | 'generating' | 'published' | 'failed';

type DashboardMatch = {
  report_uid: string;
  status: ReportStatus | string;
  stage: Stage | string;
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
  credits: { balance: number; total_purchased: number; total_used: number; linked_guest_count: number };
  orders: DashboardOrder[];
  matches: DashboardMatch[];
};

/* ─── Mock augment — 실 API 응답에는 없는 dev 전용 필드 ─── */

type MockMatchExtras = {
  partner_nickname?: string;
  partner_age?: number;
  partner_region?: string;
  partner_job?: string;
  partner_tagline?: string;
  viewer_action?: 'none' | 'like' | 'pass' | 'contact_request' | 'block' | 'report';
  ended_at?: string;
};

/* 백엔드 ProfileSource enum — partner_source 가능 값 */
const PROFILE_SOURCE_LABEL: Record<string, string> = {
  instagram: '인스타 후보',
  twitter: '트위터 후보',
  tiktok: '틱톡 후보',
  manual: '운영자 큐레이션',
  photo_only: '사진 후보',
  // 'guest' 는 내부 회원이라 별도 라벨 없음
};
type Match = DashboardMatch & MockMatchExtras;

/* 진행 내역 타임라인 — 아코디언 안 표시용 */
type TimelineEvent = {
  at: string;
  label: string;
  by: 'system' | 'me' | 'operator' | 'partner';
};

/* ─── Mock 케이스 ─── */

const HOURS = 1000 * 60 * 60;
const DAYS = HOURS * 24;
const iso = (msAgo: number) => new Date(Date.now() - msAgo).toISOString();

const MOCK_USER = {
  user_uid: 'mock-uid',
  email: 'mock@example.com',
  phone: '01012345678',
  last_login_at: iso(2 * HOURS),
  created_at: iso(30 * DAYS),
};

const STARTER_ORDER: DashboardOrder = {
  order_id: 'order-mock-1',
  product_id: 'starter',
  product_name: '스타터 · 5명 만남',
  credits: 5,
  amount: 39900,
  status: 'paid',
  paid_at: iso(30 * DAYS),
  created_at: iso(30 * DAYS),
};

const CASE_A: DashboardResponse = {
  user: MOCK_USER,
  phone_verified: true,
  credits: { balance: 4, total_purchased: 5, total_used: 1, linked_guest_count: 1 },
  orders: [STARTER_ORDER],
  matches: [
    {
      report_uid: 'A-001',
      status: 'published',
      stage: 'contact_requested',
      partner_source: 'guest',
      score: 86,
      order_id: STARTER_ORDER.order_id,
      report_url: '/casting/reports/A-001',
      contact_requested_at: iso(6 * HOURS),
      mutual_match_at: null,
      outreach_status: null,
      created_at: iso(2 * DAYS),
      updated_at: iso(6 * HOURS),
      partner_nickname: '연주',
      partner_age: 28,
      partner_region: '서울 마포',
      partner_job: '브랜드 디자이너',
      partner_tagline: '주말마다 책방 가는 분',
      viewer_action: 'contact_request',
    } as Match,
  ],
};

const CASE_B: DashboardResponse = {
  user: MOCK_USER,
  phone_verified: true,
  credits: { balance: 0, total_purchased: 5, total_used: 5, linked_guest_count: 1 },
  orders: [STARTER_ORDER],
  matches: [
    {
      report_uid: 'B-001',
      status: 'published',
      stage: 'connected',
      partner_source: 'guest',
      score: 92,
      order_id: STARTER_ORDER.order_id,
      report_url: '/casting/reports/B-001',
      contact_requested_at: iso(2 * DAYS),
      mutual_match_at: iso(6 * HOURS),
      outreach_status: null,
      created_at: iso(4 * DAYS),
      updated_at: iso(6 * HOURS),
      partner_nickname: '서윤',
      partner_age: 27,
      partner_region: '서울 용산',
      partner_job: '브랜드 디렉터',
      partner_tagline: '한 달에 한 번 여행 가는 분',
      viewer_action: 'contact_request',
    } as Match,
    {
      report_uid: 'B-002',
      status: 'published',
      stage: 'contact_requested',
      partner_source: 'guest',
      score: 88,
      order_id: STARTER_ORDER.order_id,
      report_url: '/casting/reports/B-002',
      contact_requested_at: iso(12 * HOURS),
      mutual_match_at: null,
      outreach_status: null,
      created_at: iso(2 * DAYS),
      updated_at: iso(12 * HOURS),
      partner_nickname: '도현',
      partner_age: 31,
      partner_region: '서울 강남',
      partner_job: '백엔드 개발자',
      partner_tagline: '주말 클라이밍 가는 분',
      viewer_action: 'contact_request',
    } as Match,
    {
      report_uid: 'B-003',
      status: 'published',
      stage: 'ready',
      partner_source: 'guest',
      score: 81,
      order_id: STARTER_ORDER.order_id,
      report_url: '/casting/reports/B-003',
      contact_requested_at: null,
      mutual_match_at: null,
      outreach_status: null,
      created_at: iso(8 * HOURS),
      updated_at: iso(8 * HOURS),
      partner_nickname: '민재',
      partner_age: 30,
      partner_region: '서울 종로',
      partner_job: '내과 의사',
      partner_tagline: '아침 러닝 좋아하는 분',
      viewer_action: 'none',
    } as Match,
    {
      report_uid: 'B-004',
      status: 'published',
      stage: 'contact_requested',
      partner_source: 'instagram',
      score: 84,
      order_id: STARTER_ORDER.order_id,
      report_url: '/casting/reports/B-004',
      contact_requested_at: iso(1 * DAYS),
      mutual_match_at: null,
      outreach_status: 'contacted',
      created_at: iso(2 * DAYS),
      updated_at: iso(1 * DAYS),
      partner_nickname: '하늬',
      partner_age: 29,
      partner_job: '잡지 에디터',
      partner_tagline: '주말마다 에세이 쓰는 분',
      viewer_action: 'contact_request',
    } as Match,
    {
      report_uid: 'B-005',
      status: 'published',
      stage: 'failed',
      partner_source: 'guest',
      score: 79,
      order_id: STARTER_ORDER.order_id,
      report_url: '/casting/reports/B-005',
      contact_requested_at: iso(3 * DAYS),
      mutual_match_at: null,
      outreach_status: null,
      created_at: iso(5 * DAYS),
      updated_at: iso(1 * DAYS),
      partner_nickname: '하늘',
      partner_age: 29,
      partner_region: '서울 성수',
      partner_job: '퍼포먼스 마케터',
      partner_tagline: '와인 모임 운영하는 분',
      viewer_action: 'contact_request',
      ended_at: iso(1 * DAYS),
    } as Match,
  ],
};

const CASE_C: DashboardResponse = {
  user: MOCK_USER,
  phone_verified: true,
  credits: { balance: 0, total_purchased: 5, total_used: 5, linked_guest_count: 1 },
  orders: [STARTER_ORDER],
  matches: [
    {
      report_uid: 'C-001',
      status: 'published',
      stage: 'failed',
      partner_source: 'guest',
      score: 80,
      order_id: STARTER_ORDER.order_id,
      report_url: '/casting/reports/C-001',
      contact_requested_at: iso(4 * HOURS),
      mutual_match_at: null,
      outreach_status: null,
      created_at: iso(2 * DAYS),
      updated_at: iso(0.2 * HOURS),
      partner_nickname: '나은',
      partner_age: 30,
      partner_job: '회계사',
      partner_tagline: '주말마다 영화관 가는 분',
      viewer_action: 'contact_request',
      ended_at: iso(0.2 * HOURS),
    } as Match,
    {
      report_uid: 'C-002',
      status: 'published',
      stage: 'failed',
      partner_source: 'guest',
      score: 78,
      order_id: STARTER_ORDER.order_id,
      report_url: '/casting/reports/C-002',
      contact_requested_at: iso(2 * DAYS),
      mutual_match_at: null,
      outreach_status: null,
      created_at: iso(3 * DAYS),
      updated_at: iso(1 * DAYS),
      partner_nickname: '수아',
      partner_age: 27,
      partner_region: '서울 마포',
      partner_job: '간호사',
      partner_tagline: '베이킹이 취미인 분',
      viewer_action: 'contact_request',
      ended_at: iso(1 * DAYS),
    } as Match,
    {
      report_uid: 'C-003',
      status: 'published',
      stage: 'failed',
      partner_source: 'guest',
      score: 75,
      order_id: STARTER_ORDER.order_id,
      report_url: '/casting/reports/C-003',
      contact_requested_at: iso(3 * DAYS),
      mutual_match_at: null,
      outreach_status: null,
      created_at: iso(5 * DAYS),
      updated_at: iso(2 * DAYS),
      partner_nickname: '예린',
      partner_age: 28,
      partner_region: '서울 종로',
      partner_job: '중학교 교사',
      partner_tagline: '독서 모임 운영하는 분',
      viewer_action: 'contact_request',
      ended_at: iso(2 * DAYS),
    } as Match,
    {
      report_uid: 'C-004',
      status: 'published',
      stage: 'failed',
      partner_source: 'guest',
      score: 73,
      order_id: STARTER_ORDER.order_id,
      report_url: '/casting/reports/C-004',
      contact_requested_at: iso(5 * DAYS),
      mutual_match_at: null,
      outreach_status: null,
      created_at: iso(6 * DAYS),
      updated_at: iso(3 * DAYS - 4 * HOURS),
      partner_nickname: '윤서',
      partner_age: 29,
      partner_region: '서울 강서',
      partner_job: '바리스타',
      partner_tagline: '주말 로스팅 취미인 분',
      viewer_action: 'contact_request',
      ended_at: iso(3 * DAYS - 4 * HOURS),
    } as Match,
    {
      report_uid: 'C-005',
      status: 'published',
      stage: 'ready',
      partner_source: 'guest',
      score: 77,
      order_id: STARTER_ORDER.order_id,
      report_url: '/casting/reports/C-005',
      contact_requested_at: null,
      mutual_match_at: null,
      outreach_status: null,
      created_at: iso(4 * DAYS),
      updated_at: iso(4 * DAYS),
      partner_nickname: '소영',
      partner_age: 26,
      partner_job: '제품 디자이너',
      partner_tagline: '동물권 활동 하는 분',
      viewer_action: 'pass',
      ended_at: iso(2 * DAYS - 3 * HOURS),
    } as Match,
  ],
};

const EMPTY_CASE: DashboardResponse = {
  user: MOCK_USER,
  phone_verified: true,
  credits: { balance: 5, total_purchased: 5, total_used: 0, linked_guest_count: 1 },
  orders: [STARTER_ORDER],
  matches: [],
};

const CASES: Record<string, { label: string; data: DashboardResponse }> = {
  a: { label: 'A · 1장 진행중', data: CASE_A },
  b: { label: 'B · 5장 혼합', data: CASE_B },
  c: { label: 'C · 5장 종료', data: CASE_C },
  empty: { label: '빈 상태', data: EMPTY_CASE },
};

/* ─── 상태 라벨 매핑 ─── */

type Tone = 'pending' | 'progress' | 'good' | 'bad';

function isExternalSource(source: string | null | undefined): boolean {
  return !!source && source !== 'guest';
}

function deriveStatusLabel(m: Match): { label: string; tone: Tone } {
  if (m.viewer_action === 'pass') return { label: '의뢰인님이 패스함', tone: 'pending' };

  if (isExternalSource(m.partner_source) && m.outreach_status) {
    const o = m.outreach_status;
    if (o === 'agreed' || o === 'signed_up') return { label: '응답 도착 · 진행 중', tone: 'good' };
    if (o === 'contacted') return { label: '운영자가 연락 중', tone: 'progress' };
    if (o === 'pending') return { label: '연결 요청 대기', tone: 'progress' };
    if (o === 'declined' || o === 'no_response' || o === 'removed') return { label: '응답 없음 / 거절', tone: 'bad' };
  }

  switch (m.stage) {
    case 'preparing':
      return { label: '카드 준비 중', tone: 'pending' };
    case 'ready':
      return { label: '아직 결정 안 함', tone: 'pending' };
    case 'contact_requested':
      if (m.mutual_match_at) return { label: '상대 수락 · 연락처 공유 임박', tone: 'good' };
      return { label: '상대에게 연락 중', tone: 'progress' };
    case 'connected':
      return { label: '연락처 공유 완료', tone: 'good' };
    case 'failed':
      return { label: '상대가 거절', tone: 'bad' };
    default:
      return { label: m.stage, tone: 'pending' };
  }
}

function toneColor(t: Tone): string {
  switch (t) {
    case 'pending': return C.muted;
    case 'progress': return C.accent;
    case 'good': return C.ok;
    case 'bad': return C.bad;
  }
}


/* ─── 종료/만료 판정 ─── */

function isEnded(m: Match): boolean {
  if (m.viewer_action === 'pass') return true;
  if (m.stage === 'connected' || m.stage === 'failed') return true;
  if (m.outreach_status && ['declined', 'no_response', 'removed'].includes(m.outreach_status)) return true;
  return false;
}

function endedAtOf(m: Match): string | null {
  return m.ended_at || m.updated_at || null;
}

function daysUntilExpire(m: Match): number | null {
  const endedAt = endedAtOf(m);
  if (!endedAt) return null;
  const endedMs = new Date(endedAt).getTime();
  const remainingDays = 3 - Math.floor((Date.now() - endedMs) / DAYS);
  return Math.max(0, remainingDays);
}

/* ─── 포맷터들 ─── */

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / (1000 * 60));
  if (m < 60) return `${Math.max(1, m)}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  return `${d}일 전`;
}

function formatWon(n: number): string {
  return `${n.toLocaleString('ko-KR')}원`;
}

function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

function formatDateShort(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

/* 진행 내역 자동 생성 — DashboardMatch 의 timestamp 필드들로 사람이 읽는 이벤트 줄 */

function addMs(iso: string, ms: number): string {
  return new Date(new Date(iso).getTime() + ms).toISOString();
}

function deriveTimeline(m: Match): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  events.push({ at: m.created_at, label: '매칭 리포트 발급', by: 'system' });

  if (m.viewer_action === 'pass') {
    events.push({ at: m.updated_at, label: '의뢰인님이 패스함', by: 'me' });
    return events;
  }

  if (m.contact_requested_at) {
    events.push({ at: m.contact_requested_at, label: '의뢰인님이 연결 요청', by: 'me' });
    if (isExternalSource(m.partner_source)) {
      events.push({ at: addMs(m.contact_requested_at, 4 * HOURS), label: '운영자가 상대에게 DM 시도', by: 'operator' });
    } else {
      events.push({ at: addMs(m.contact_requested_at, 4 * HOURS), label: '운영자가 상대에게 연락 시작', by: 'operator' });
    }
  }

  if (m.mutual_match_at) {
    events.push({ at: m.mutual_match_at, label: '상대가 연결 수락', by: 'partner' });
  }

  if (m.stage === 'connected') {
    events.push({ at: m.updated_at, label: '연락처 공유 완료', by: 'system' });
  } else if (m.stage === 'failed') {
    events.push({ at: m.updated_at, label: '상대가 응답 없음 / 거절', by: 'partner' });
  }

  return events;
}

function formatPhone(value: string | null): string {
  if (!value) return '';
  const d = value.replace(/\D/g, '');
  if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return value;
}

/* ───────────────────────────── 페이지 ───────────────────────────── */

type LoadState = 'loading' | 'ready' | 'unauth' | 'error';
type PhoneState = 'idle' | 'sending' | 'sent' | 'verifying' | 'verified' | 'error';

const isDev = process.env.NODE_ENV !== 'production';
const DEV_MOCK_TOKEN = 'mock';

function CastingMeInner() {
  const router = useRouter();
  const search = useSearchParams();
  const caseKey = search.get('case')?.toLowerCase();
  const usingMockFromUrl = !!caseKey && caseKey in CASES;

  const [data, setData] = useState<DashboardResponse | null>(null);
  const [state, setState] = useState<LoadState>('loading');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [phoneState, setPhoneState] = useState<PhoneState>('idle');
  const [message, setMessage] = useState('');

  const loadDashboard = useCallback(async () => {
    // 1) URL 에 ?case=… 가 명시되면 무조건 mock 사용.
    if (usingMockFromUrl) {
      const mock = CASES[caseKey!].data;
      setData(mock);
      setPhone(mock.user.phone || '');
      setState('ready');
      return;
    }
    // 2) dev 환경 + 토큰 없거나 dev mock 토큰이면 실 API 호출 스킵 → 기본 케이스(B) 자동 표시.
    if (isDev) {
      const existing = getCastingUserToken();
      if (!existing) {
        localStorage.setItem('casting_user_token', DEV_MOCK_TOKEN);
        localStorage.setItem('casting_user_uid', 'mock-user');
      }
      if (!existing || existing === DEV_MOCK_TOKEN) {
        const mock = CASES.b.data;
        setData(mock);
        setPhone(mock.user.phone || '');
        setState('ready');
        return;
      }
    }
    // 3) 실 토큰이면 진짜 백엔드 호출.
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
  }, [usingMockFromUrl, caseKey]);

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

  if (state === 'loading') {
    return (
      <main className="min-h-dvh flex items-center justify-center" style={{ background: C.bg }}>
        <p className="text-sm" style={{ color: C.muted }}>
          확인 중…
        </p>
      </main>
    );
  }

  if (state === 'unauth') return null;

  if (state === 'error' || !data) {
    return (
      <main className="min-h-dvh" style={{ background: C.bg }}>
        <CaseSwitcher current={caseKey || ''} usingMock={usingMockFromUrl} />
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
      <CaseSwitcher current={caseKey || ''} usingMock={usingMockFromUrl} />

      <div className="mx-auto max-w-xl px-5 pb-24 pt-8">
        <header className="mb-8">
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
            <span>{data.user.email}</span>
            {data.phone_verified && data.user.phone && (
              <span>{formatPhone(data.user.phone)}</span>
            )}
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

        <Section title="구매 내역" count={data.orders.filter((o) => o.status === 'paid').length}>
          <CreditWithRecharge credits={data.credits} />
          {data.orders.filter((o) => o.status === 'paid').length === 0 ? (
            <SectionEmpty msg="아직 결제 완료된 구매 내역이 없어요." />
          ) : (
            data.orders
              .filter((o) => o.status === 'paid')
              .map((o) => <OrderRow key={o.order_id} order={o} />)
          )}
        </Section>

        <MatchProgress
          active={active}
          ended={ended}
          phoneVerified={data.phone_verified}
        />

        <RechargeCta balance={data.credits.balance} />
      </div>
    </main>
  );
}

/* ─── 케이스 스위처 (dev only) ─── */

function CaseSwitcher({ current, usingMock }: { current: string; usingMock: boolean }) {
  if (process.env.NODE_ENV === 'production') return null;
  return (
    <div className="mx-auto max-w-xl px-5 pt-3" aria-label="dev case switcher">
      <div
        className="rounded-2xl px-3 py-2 flex flex-wrap items-center gap-1.5 text-[11px]"
        style={{ background: '#FFFFFF', border: `2px dashed ${C.ink}`, color: C.muted }}
      >
        <span className="font-bold mr-1" style={{ color: C.ink }}>
          dev
        </span>
        <Link
          href="/me"
          className="rounded-full px-2.5 py-1 font-bold"
          style={{
            background: !usingMock ? C.ink : '#FFFFFF',
            color: !usingMock ? C.bg : C.ink,
            border: `1.5px solid ${C.ink}`,
          }}
        >
          실 API
        </Link>
        {Object.entries(CASES).map(([key, c]) => {
          const isActive = current === key;
          return (
            <Link
              key={key}
              href={`/me?case=${key}`}
              className="rounded-full px-2.5 py-1 font-bold"
              style={{
                background: isActive ? C.ink : '#FFFFFF',
                color: isActive ? C.bg : C.ink,
                border: `1.5px solid ${C.ink}`,
              }}
            >
              {c.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ─── 전화번호 인증 카드 (우리 디자인 톤으로 리디자인) ─── */

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
  const sent = props.state === 'sent' || props.state === 'verifying' || !!props.code;
  return (
    <section
      className="mb-5 rounded-3xl p-5"
      style={{ background: '#FFFFFF', border: `2px solid ${C.ink}`, boxShadow: `4px 4px 0 ${C.ink}` }}
    >
      <h2 className="text-lg font-bold" style={{ color: C.ink }}>
        전화번호 인증이 필요해
      </h2>
      <p className="mt-1 text-sm" style={{ color: C.muted, lineHeight: 1.6 }}>
        구매 내역과 매칭 카드는 가입 계정과 전화번호가 연결돼야 보여.
      </p>
      <div className="mt-4 flex flex-col gap-2">
        <input
          value={props.phone}
          onChange={(e) => props.onPhoneChange(e.target.value)}
          placeholder="01012345678"
          inputMode="tel"
          className="w-full px-4 py-3 rounded-2xl text-base font-medium outline-none"
          style={{ color: C.ink, background: '#FFFFFF', border: `2px solid ${C.ink}` }}
        />
        <button
          type="button"
          disabled={busy}
          onClick={props.onRequest}
          className="w-full px-5 py-3 rounded-full font-bold text-sm disabled:opacity-40"
          style={{ background: C.gold, color: C.ink, border: `2px solid ${C.ink}`, boxShadow: `3px 3px 0 ${C.ink}` }}
        >
          {props.state === 'sending' ? '발송 중…' : '인증번호 받기'}
        </button>
        {sent && (
          <div className="flex gap-2">
            <input
              value={props.code}
              onChange={(e) => props.onCodeChange(e.target.value)}
              placeholder="인증번호"
              inputMode="numeric"
              className="min-w-0 flex-1 px-4 py-3 rounded-2xl text-base font-medium outline-none"
              style={{ color: C.ink, background: '#FFFFFF', border: `2px solid ${C.ink}` }}
            />
            <button
              type="button"
              disabled={busy}
              onClick={props.onVerify}
              className="px-4 py-3 rounded-full font-bold text-sm disabled:opacity-40"
              style={{ background: C.accent, color: '#FFFFFF', border: `2px solid ${C.ink}`, boxShadow: `3px 3px 0 ${C.ink}` }}
            >
              확인
            </button>
          </div>
        )}
        {props.message && (
          <p className="text-xs" style={{ color: props.state === 'error' ? C.bad : C.ok }}>
            {props.message}
          </p>
        )}
      </div>
    </section>
  );
}

/* ─── 만남권 잔여 + 충전 버튼 — 한 줄 박스 ─── */

function CreditWithRecharge({ credits }: { credits: DashboardResponse['credits'] }) {
  return (
    <div
      className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3"
      style={{ background: '#FFFFFF', border: `2px solid ${C.ink}`, boxShadow: `3px 3px 0 ${C.ink}` }}
    >
      <span className="text-sm font-bold" style={{ color: C.ink }}>
        남은 만남권 {credits.balance}장
      </span>
      <Link
        href="/payments"
        className="shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-transform hover:-translate-y-0.5"
        style={{ background: C.gold, color: C.ink, border: `2px solid ${C.ink}`, boxShadow: `2px 2px 0 ${C.ink}` }}
      >
        만남권 충전하기
      </Link>
    </div>
  );
}

/* ─── 섹션 ─── */

function Section({
  title,
  count,
  hint,
  children,
}: {
  title: string;
  count: number;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <div className="mb-3 flex items-baseline justify-between">
        <div className="flex items-baseline gap-2">
          <h2 className="font-bold" style={{ color: C.ink, fontSize: 'clamp(17px, 4vw, 20px)' }}>
            {title}
          </h2>
          <span className="text-xs" style={{ color: C.muted }}>
            {count}건
          </span>
        </div>
        {hint && (
          <span className="text-[11px]" style={{ color: C.muted }}>
            {hint}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

function SectionEmpty({ msg }: { msg: string }) {
  return (
    <div
      className="rounded-2xl p-5 text-center text-sm"
      style={{ border: `2px dashed ${C.ink}33`, color: C.muted }}
    >
      {msg}
    </div>
  );
}

/* ─── 구매 내역 1행 ─── */

function OrderRow({ order }: { order: DashboardOrder }) {
  return (
    <article
      className="rounded-2xl px-4 py-3"
      style={{ background: '#FFFFFF', border: `2px solid ${C.ink}`, boxShadow: `3px 3px 0 ${C.ink}` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold" style={{ color: C.ink }}>
            {order.product_name}
          </p>
          <p className="mt-0.5 text-[11px]" style={{ color: C.muted }}>
            {order.order_id}
          </p>
        </div>
        <p className="text-sm font-extrabold" style={{ color: C.ink }}>
          {formatWon(order.amount)}
        </p>
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px]" style={{ color: C.muted }}>
        <span>만남권 {order.credits}장</span>
        <span>{formatDate(order.paid_at || order.created_at)}</span>
      </div>
    </article>
  );
}

/* ─── 매칭 진행 현황 — 토글(진행중/마무리됨) + 카드 리스트 ─── */

type ProgressTab = 'active' | 'ended';

function MatchProgress({
  active,
  ended,
  phoneVerified,
}: {
  active: Match[];
  ended: Match[];
  phoneVerified: boolean;
}) {
  const [tab, setTab] = useState<ProgressTab>('active');
  const list = tab === 'active' ? active : ended;
  const total = active.length + ended.length;

  return (
    <section className="mb-8">
      <h2
        className="mb-3 font-bold"
        style={{ color: C.ink, fontSize: 'clamp(18px, 4vw, 22px)' }}
      >
        진행 현황
      </h2>

      <div className="mb-4 flex items-center gap-2">
        <TabButton active={tab === 'active'} onClick={() => setTab('active')}>
          진행 중 <span className="opacity-60">({active.length})</span>
        </TabButton>
        <TabButton active={tab === 'ended'} onClick={() => setTab('ended')}>
          마무리됨 <span className="opacity-60">({ended.length})</span>
        </TabButton>
      </div>

      {tab === 'ended' && ended.length > 0 && (
        <p className="mb-3 text-[11px]" style={{ color: C.muted }}>
          개인정보 보호를 위해 종료 후 3일 안에 사라져요.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {total === 0 ? (
          <EmptyMatchesState phoneVerified={phoneVerified} />
        ) : list.length === 0 ? (
          <SectionEmpty
            msg={tab === 'active' ? '진행 중인 매칭이 없어요.' : '마무리된 매칭이 없어요.'}
          />
        ) : (
          list.map((m) => <MatchCard key={m.report_uid} match={m} />)
        )}
      </div>
    </section>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full px-3.5 py-1.5 text-xs font-bold transition-transform"
      style={{
        background: active ? C.ink : '#FFFFFF',
        color: active ? C.bg : C.ink,
        border: `2px solid ${C.ink}`,
        boxShadow: active ? 'none' : `2px 2px 0 ${C.ink}`,
      }}
    >
      {children}
    </button>
  );
}

/* ─── 매칭 카드 — 날짜 헤더 + 직업/나이 + 캐치프레이즈 + 상태 + 아코디언 ─── */

function MatchCard({ match }: { match: Match }) {
  const status = deriveStatusLabel(match);
  const tone = toneColor(status.tone);
  const ended = isEnded(match);
  const remaining = ended ? daysUntilExpire(match) : null;
  const channelLabel =
    match.partner_source && match.partner_source !== 'guest'
      ? PROFILE_SOURCE_LABEL[match.partner_source] ?? null
      : null;
  const hideReport = match.viewer_action === 'pass';
  const [open, setOpen] = useState(false);

  return (
    <article
      className="rounded-3xl overflow-hidden"
      style={{
        background: '#FFFFFF',
        border: `2px solid ${C.ink}`,
        boxShadow: `4px 4px 0 ${C.ink}`,
        opacity: hideReport ? 0.7 : 1,
      }}
    >
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: C.muted }}>
            {formatDateShort(match.created_at)} 도착한 매칭
          </p>
          {channelLabel && (
            <span
              className="rounded-full px-2 py-[1px] text-[10px] font-bold"
              style={{ background: `${C.muted}1A`, color: C.muted, border: `1px solid ${C.muted}` }}
            >
              {channelLabel}
            </span>
          )}
        </div>

        {(match.partner_job || match.partner_age) && (
          <p className="mt-2 text-base font-bold" style={{ color: C.ink }}>
            {match.partner_job ?? '직업 미상'}
            {match.partner_age && (
              <span className="ml-1.5 font-normal" style={{ color: C.muted }}>
                | {match.partner_age}세
              </span>
            )}
          </p>
        )}

        {match.partner_tagline && (
          <p
            className="mt-1 text-[13px]"
            style={{ color: C.ink, fontStyle: 'italic', lineHeight: 1.5 }}
          >
            “{match.partner_tagline}”
          </p>
        )}

        <p
          className="mt-4 font-bold"
          style={{ color: tone, fontSize: 'clamp(16px, 4vw, 19px)', lineHeight: 1.3, letterSpacing: '-0.3px' }}
        >
          {status.label}
        </p>

        <div className="mt-1 flex items-center justify-between text-[11px]" style={{ color: C.muted }}>
          <span>{timeAgo(match.updated_at)} 업데이트</span>
          {ended && remaining !== null && (
            <span style={{ color: C.bad, fontWeight: 700 }}>
              {remaining === 0 ? '오늘 자동 삭제' : `${remaining}일 후 자동 삭제`}
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3 border-t text-sm font-bold"
        style={{ background: '#FAF6EC', color: C.ink, borderColor: C.ink }}
      >
        <span>진행 상세 보기</span>
        <span
          aria-hidden="true"
          className="inline-block transition-transform"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          ▾
        </span>
      </button>
      {open && (
        <div className="px-5 py-4 border-t" style={{ background: '#FFFCF2', borderColor: `${C.ink}33` }}>
          <Timeline events={deriveTimeline(match)} />
        </div>
      )}

      {!hideReport && match.report_url && (
        <Link
          href={match.report_url}
          className="block py-3 text-center text-sm font-bold border-t"
          style={{ background: C.gold, color: C.ink, borderColor: C.ink }}
        >
          매칭 리포트 보기
        </Link>
      )}
    </article>
  );
}

function Timeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="text-xs text-center" style={{ color: C.muted }}>
        진행 내역이 없어요.
      </p>
    );
  }
  return (
    <ol className="flex flex-col gap-3">
      {events.map((e, idx) => {
        const dotColor =
          e.by === 'me' ? C.accent : e.by === 'partner' ? C.ok : e.by === 'operator' ? C.gold : `${C.ink}66`;
        return (
          <li key={`${e.at}-${idx}`} className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="mt-1.5 block rounded-full shrink-0"
              style={{ width: 8, height: 8, background: dotColor, border: `1.5px solid ${C.ink}` }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold" style={{ color: C.ink }}>
                {e.label}
              </p>
              <p className="text-[11px]" style={{ color: C.muted }}>
                {formatDateShort(e.at)} · {timeAgo(e.at)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* ─── 빈 상태들 ─── */

function EmptyMatchesState({ phoneVerified }: { phoneVerified: boolean }) {
  return (
    <div
      className="rounded-3xl p-8 text-center"
      style={{ background: '#FFFFFF', border: `2px solid ${C.ink}`, boxShadow: `4px 4px 0 ${C.ink}` }}
    >
      <p className="font-bold text-base" style={{ color: C.ink }}>
        매칭 카드를 준비하고 있어요
      </p>
      <p className="mt-2 text-sm" style={{ color: C.muted }}>
        {phoneVerified
          ? '캐스터가 너에게 어울리는 사람을 찾고 있어. 카드가 도착하면 여기에 표시돼.'
          : '전화번호 인증 후 기존 매칭 내역을 찾아올게요.'}
      </p>
    </div>
  );
}

function RechargeCta({ balance }: { balance: number }) {
  const urgent = balance === 0;
  return (
    <div
      className="mt-10 rounded-3xl p-6 text-center"
      style={{ background: '#FFFFFF', border: `2px solid ${C.ink}`, boxShadow: `4px 4px 0 ${C.ink}` }}
    >
      <p className="font-bold text-base" style={{ color: C.ink }}>
        {urgent ? '만남권을 다 썼어요 🥺' : '더 많은 사람을 만나고 싶다면? 🌏'}
      </p>
      <Link
        href="/payments"
        className="mt-5 inline-flex items-center rounded-full px-5 py-2.5 text-sm font-bold transition-transform hover:-translate-y-0.5"
        style={{ background: C.gold, color: C.ink, border: `2px solid ${C.ink}`, boxShadow: `3px 3px 0 ${C.ink}` }}
      >
        만남권 충전하기
      </Link>
    </div>
  );
}

function phoneErrorMessage(err: unknown): string {
  const msg = (err as Error).message || '';
  if (msg.includes('429')) return '잠시 후 다시 시도해줘.';
  if (msg.includes('410')) return '인증번호가 만료됐어. 다시 받아줘.';
  if (msg.includes('400')) return '인증번호가 일치하지 않아.';
  if (msg.includes('502')) return '문자 발송에 실패했어. 잠시 후 다시 시도해줘.';
  return '처리하지 못했어. 잠시 후 다시 시도해줘.';
}

export default function CastingMePage() {
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
      <CastingMeInner />
    </Suspense>
  );
}
