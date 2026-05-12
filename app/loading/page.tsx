'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  trackPageView,
  trackPhone,
  trackSubmitApplication,
} from '../../lib/tracking';

const C = {
  bg: '#FEFBF4',
  ink: '#2C1D07',
  accent: '#E85D2F',
  gold: '#F7CA5D',
  dark: '#1C1208',
} as const;

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const PHASE_TEXTS = [
  '너의 연애 유형을 분석하고 있어!',
  '너의 연애 가치관을 분석하고 있어!',
  '너와 잘 맞는 사람을 찾고 있어!',
];
const PHASE_DURATIONS = [4000, 4000, 6000];
const TOTAL_MS = PHASE_DURATIONS.reduce((s, d) => s + d, 0);

const RADAR_AXES = ['표현력', '다정함', '안정성', '자유로움', '불안도'];

const BAR_LABELS = ['외모', '성격', '능력', '분위기'];

type CardData = { tag: string; match: number; desc: string; photo?: string };

// 사진은 /public/loading-cards/m1.webp ~ m5.webp, f1.webp ~ f5.webp
const MALE_CARDS: CardData[] = [
  { tag: 'INFJ · 서울 · 28', match: 94, desc: '조용한데 다정한 사람', photo: '/loading-cards/m1.webp' },
  { tag: 'ENFP · 경기 · 27', match: 91, desc: '에너지 넘치는 분위기', photo: '/loading-cards/m2.webp' },
  { tag: 'INTP · 서울 · 30', match: 89, desc: '깊이 있는 대화 가능', photo: '/loading-cards/m3.webp' },
  { tag: 'ESFJ · 인천 · 26', match: 87, desc: '챙겨주는 게 자연스러운', photo: '/loading-cards/m4.webp' },
  { tag: 'ISTJ · 서울 · 29', match: 85, desc: '안정감 있는 타입', photo: '/loading-cards/m5.webp' },
];

const FEMALE_CARDS: CardData[] = [
  { tag: 'ENFJ · 서울 · 27', match: 95, desc: '다정하고 세심한 분위기', photo: '/loading-cards/f1.webp' },
  { tag: 'INFP · 경기 · 26', match: 92, desc: '감성적이고 따뜻한 사람', photo: '/loading-cards/f2.webp' },
  { tag: 'ISFJ · 서울 · 28', match: 90, desc: '조용한데 깊이 있어', photo: '/loading-cards/f3.webp' },
  { tag: 'ENTP · 인천 · 29', match: 88, desc: '재치 있는 대화 가능', photo: '/loading-cards/f4.webp' },
  { tag: 'ESTP · 서울 · 25', match: 86, desc: '활발하고 즉흥적인', photo: '/loading-cards/f5.webp' },
];

type ReportState =
  | { status: 'idle' }
  | { status: 'generating'; reportId: string }
  | { status: 'published'; reportId: string; gender: string }
  | { status: 'failed'; reportId: string };

type Stage = 'analyzing' | 'phone' | 'waiting' | 'failed';

export default function LoadingPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>('analyzing');
  const [t, setT] = useState(0);
  const [phone, setPhone] = useState('');
  const submittedRef = useRef(false);
  const reportRef = useRef<ReportState>({ status: 'idle' });
  const [reportState, setReportState] = useState<ReportState>({ status: 'idle' });
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cards = useMemo(() => {
    if (typeof window === 'undefined') return MALE_CARDS;
    const userGender = sessionStorage.getItem('sto_user_gender');
    return userGender === 'male' ? FEMALE_CARDS : MALE_CARDS;
  }, []);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const pollReport = useCallback((reportId: string) => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/casting/preview-reports/${reportId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === 'published') {
          stopPolling();
          const rawGender = data.user_answers?.selfInfo?.gender || '';
          const g = (rawGender === '여자' || rawGender === '여성' || rawGender === 'female') ? 'F' : 'M';
          const state: ReportState = { status: 'published', reportId, gender: g };
          reportRef.current = state;
          setReportState(state);
        } else if (data.status === 'failed') {
          stopPolling();
          const state: ReportState = { status: 'failed', reportId };
          reportRef.current = state;
          setReportState(state);
        }
      } catch {}
    }, 2000);
  }, [stopPolling]);

  const createReport = useCallback(async () => {
    const guestUid = typeof window !== 'undefined'
      ? sessionStorage.getItem('sto_guest_uid')
      : null;
    if (!guestUid) return;

    try {
      const res = await fetch(`${API_BASE}/casting/preview-reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guest_uid: guestUid, version: '20' }),
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      const state: ReportState = { status: 'generating', reportId: data.report_id };
      reportRef.current = state;
      setReportState(state);
      pollReport(data.report_id);
    } catch {
      const failed: ReportState = { status: 'failed', reportId: '' };
      reportRef.current = failed;
      setReportState(failed);
    }
  }, [pollReport]);

  const retryReport = useCallback(async () => {
    const current = reportRef.current;
    if (current.status !== 'failed') return;

    // report 생성 자체가 실패한 경우 (reportId 없음) → 새로 생성
    if (!current.reportId) {
      setStage('waiting');
      await createReport();
      return;
    }

    const state: ReportState = { status: 'generating', reportId: current.reportId };
    reportRef.current = state;
    setReportState(state);
    setStage('waiting');

    try {
      const res = await fetch(`${API_BASE}/casting/preview-reports/${current.reportId}/retry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      pollReport(current.reportId);
    } catch {
      const failed: ReportState = { status: 'failed', reportId: current.reportId };
      reportRef.current = failed;
      setReportState(failed);
      setStage('failed');
    }
  }, [pollReport, createReport]);

  useEffect(() => {
    trackPageView('loading');
    trackSubmitApplication();
    createReport();

    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const elapsed = (now - start) / 1000;
      setT(elapsed);
      if (elapsed * 1000 >= TOTAL_MS) {
        setStage('phone');
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      stopPolling();
    };
  }, [createReport, stopPolling]);

  const ms = t * 1000;
  const percent = Math.min(100, Math.floor((ms / TOTAL_MS) * 100));
  const phase = ms < PHASE_DURATIONS[0]
    ? 0
    : ms < PHASE_DURATIONS[0] + PHASE_DURATIONS[1]
    ? 1
    : 2;

  function formatPhone(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length < 4) return digits;
    if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  function navigateToReport() {
    const current = reportRef.current;
    if (current.status === 'published') {
      router.push(`/report/${current.gender}/${current.reportId}`);
    }
  }

  async function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submittedRef.current) return;
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 11) return;
    submittedRef.current = true;

    const guestUid = typeof window !== 'undefined'
      ? sessionStorage.getItem('sto_guest_uid')
      : null;
    if (guestUid) {
      try {
        sessionStorage.setItem('casting_guest_phone', digits);
      } catch {}
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('casting_guest_token') : null;
      fetch(`${API_BASE}/casting/guests/${guestUid}/phone`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'x-casting-guest-token': token } : {}),
        },
        body: JSON.stringify({ value: digits }),
      }).catch(() => {});
    }
    trackPhone(digits);

    const current = reportRef.current;
    if (current.status === 'published') {
      navigateToReport();
    } else if (current.status === 'failed') {
      setStage('failed');
    } else {
      setStage('waiting');
    }
  }

  // report published 감지 — waiting 상태에서 published 되면 바로 이동
  useEffect(() => {
    if (stage === 'waiting' && reportState.status === 'published') {
      navigateToReport();
    } else if (stage === 'waiting' && reportState.status === 'failed') {
      setStage('failed');
    }
  }, [stage, reportState]);

  // ── Failed ──
  if (stage === 'failed') {
    return (
      <main
        className="min-h-screen flex flex-col"
        style={{ background: C.bg }}
      >
        <nav
          className="flex items-center justify-between px-5 py-3.5"
          style={{ borderBottom: `1.5px solid ${C.ink}` }}
        >
          <div className="w-12" />
          <span
            className="text-xl font-bold tracking-tight"
            style={{ color: C.ink, fontFamily: "'PP Editorial Old', serif" }}
          >
            casting
          </span>
          <div className="w-12" />
        </nav>

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <div className="w-full max-w-md text-center">
            <div
              className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{ background: `${C.accent}20`, border: `2px solid ${C.accent}` }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
              </svg>
            </div>
            <h1
              className="font-bold mb-3"
              style={{
                color: C.ink,
                fontSize: 'clamp(24px, 5vw, 36px)',
                lineHeight: '1.3',
              }}
            >
              리포트 생성에 실패했어
            </h1>
            <p className="mb-8 opacity-60 text-sm" style={{ color: C.ink }}>
              일시적인 문제야. 다시 시도해줘!
            </p>
            <button
              onClick={retryReport}
              className="w-full px-5 py-4 rounded-full font-bold text-base hover:-translate-y-0.5 transition-transform"
              style={{
                color: C.ink,
                background: C.gold,
                border: `2px solid ${C.ink}`,
                boxShadow: `4px 4px 0 ${C.ink}`,
              }}
            >
              다시 시도
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ── Waiting (phone 제출 후 report 아직 generating) ──
  if (stage === 'waiting') {
    return (
      <main
        className="min-h-screen flex flex-col items-center justify-center"
        style={{ background: C.dark, color: C.bg }}
      >
        <div className="text-center px-6">
          <div
            className="w-12 h-12 mx-auto mb-6 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: `${C.gold} transparent ${C.gold} ${C.gold}` }}
          />
          <h1
            className="font-bold mb-3"
            style={{
              fontSize: 'clamp(24px, 5vw, 36px)',
              lineHeight: '1.3',
              color: C.gold,
            }}
          >
            리포트 마무리 중...
          </h1>
          <p className="opacity-60 text-sm">
            거의 다 됐어! 잠깐만 기다려줘.
          </p>
        </div>
      </main>
    );
  }

  // ── Phone ──
  if (stage === 'phone') {
    return (
      <main
        className="min-h-screen flex flex-col"
        style={{ background: C.bg }}
      >
        <nav
          className="flex items-center justify-between px-5 py-3.5"
          style={{ borderBottom: `1.5px solid ${C.ink}` }}
        >
          <div className="w-12" />
          <span
            className="text-xl font-bold tracking-tight"
            style={{ color: C.ink, fontFamily: "'PP Editorial Old', serif" }}
          >
            casting
          </span>
          <div className="w-12" />
        </nav>

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <h1
              className="font-bold whitespace-pre-line mb-3"
              style={{
                color: C.ink,
                fontSize: 'clamp(28px, 5.5vw, 42px)',
                lineHeight: '1.3',
                letterSpacing: '-0.5px',
              }}
            >
              소개 카드를 받을{'\n'}
              <span style={{ color: C.accent }}>연락처</span>를 알려줘!
            </h1>
            <p className="mb-8 opacity-60 text-sm" style={{ color: C.ink }}>
              개인정보는 엄격하게 보관할게.
            </p>

            <form onSubmit={handlePhoneSubmit} className="flex flex-col gap-3">
              <input
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="010-1234-5678"
                required
                className="w-full px-5 py-4 rounded-2xl text-base font-medium outline-none transition-shadow focus:shadow-lg"
                style={{
                  color: C.ink,
                  background: '#FFFFFF',
                  border: `2px solid ${C.ink}`,
                }}
              />
              <p
                className="text-sm font-semibold mb-2 text-center"
                style={{ color: C.accent }}
              >
                이제 맛보기 카드를 무료로 받아볼 수 있어!
              </p>
              <button
                type="submit"
                className="w-full px-5 py-4 rounded-full font-bold text-base hover:-translate-y-0.5 transition-transform"
                style={{
                  color: C.ink,
                  background: C.gold,
                  border: `2px solid ${C.ink}`,
                  boxShadow: `4px 4px 0 ${C.ink}`,
                }}
              >
                제출!
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  // ── Analyzing dashboard ──
  // 한 화면, 정보 누적, 모든 요소 매 프레임 sin 진동
  return (
    <main
      className="min-h-screen relative overflow-hidden"
      style={{
        background: C.dark,
        color: C.bg,
        // 베이지 그레인 + 라디알 글로우
        backgroundImage: `
          radial-gradient(ellipse at 20% 0%, rgba(247,202,93,0.08) 0%, transparent 55%),
          radial-gradient(ellipse at 90% 100%, rgba(232,93,47,0.08) 0%, transparent 55%),
          repeating-radial-gradient(circle at 50% 50%, rgba(254,251,244,0.012) 0px, rgba(254,251,244,0.012) 1px, transparent 1px, transparent 3px)
        `,
      }}
    >
      <div className="relative w-full max-w-[440px] mx-auto px-5 pt-8 pb-8 flex flex-col items-center min-h-screen">

        <h1
          className="w-full text-lg sm:text-xl mb-6"
          style={{
            fontFamily: "'PP Editorial Old', serif",
            fontWeight: 400,
            letterSpacing: '-0.01em',
            lineHeight: 1.05,
            opacity: 0.85,
          }}
        >
          casting
        </h1>

        {/* phase별 메인 비주얼 — 위에 중앙정렬 phase 텍스트 */}
        <div className="flex-1 w-full flex flex-col items-center justify-center">
          <p
            key={phase}
            className="text-center text-lg sm:text-xl font-bold mb-5"
            style={{
              color: C.gold,
              animation: 'sto-fade-up 0.5s ease-out both',
              letterSpacing: '-0.01em',
            }}
          >
            {PHASE_TEXTS[phase]}
          </p>
          <div className="w-full flex items-center justify-center">
            {phase === 0 && <RadarPanel key="radar" t={t} />}
            {phase === 1 && <BarPanel key="bars" t={t} />}
            {phase === 2 && <CardPanel key="cards" cards={cards} />}
          </div>
        </div>

        {/* Progress bar — 두꺼운 ink/베이지 보더 */}
        <div className="w-full mt-7">
          <div
            className="relative w-full overflow-hidden rounded-full"
            style={{
              height: '34px',
              background: 'rgba(254,251,244,0.08)',
              border: `2px solid ${C.bg}`,
            }}
          >
            <div
              className="h-full transition-all duration-100 ease-out"
              style={{
                width: `${percent}%`,
                background: `linear-gradient(90deg, ${C.accent} 0%, ${C.gold} 100%)`,
              }}
            />
          </div>
          <div className="mt-3 flex justify-center">
            <span
              className="text-3xl font-bold tracking-tight"
              style={{
                fontFamily: "'PP Editorial Old', serif",
                color: C.gold,
                lineHeight: 1,
              }}
            >
              {percent}
              <span className="text-xl opacity-60">%</span>
            </span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes sto-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        @keyframes sto-fade-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes sto-card-in {
          0% { transform: translateX(28%) scale(0.92) rotate(2deg); opacity: 0; }
          100% { transform: translateX(0) scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes sto-card-out {
          0% { transform: translateX(0) scale(1) rotate(0deg); opacity: 1; }
          100% { transform: translateX(-28%) scale(0.92) rotate(-2deg); opacity: 0; }
        }
      `}</style>
    </main>
  );
}

/* ────────── Radar (sin oscillation per axis, 50~88 사이) ────────── */
function RadarPanel({ t }: { t: number }) {
  const cx = 160;
  const cy = 160;
  const R = 110;
  const n = RADAR_AXES.length;

  // 각 축이 base 70, amp 18, 다른 freq/phase로 진동 → 52~88 oscillate
  const values = RADAR_AXES.map((_, i) => {
    const base = 70;
    const amp = 18;
    const freq = 0.5 + i * 0.17;
    const phase = i * 0.9;
    return Math.max(45, Math.min(92, base + Math.sin(t * freq + phase) * amp));
  });

  const polyAt = (rRatio: number) =>
    Array.from({ length: n }, (_, i) => {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      return `${cx + R * rRatio * Math.cos(angle)},${cy + R * rRatio * Math.sin(angle)}`;
    }).join(' ');

  const dataPoints = values
    .map((v, i) => {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      const r = (R * v) / 100;
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    })
    .join(' ');

  return (
    <div
      className="relative w-full flex items-center justify-center"
      style={{
        animation: 'sto-fade-up 0.5s ease-out both',
        marginBottom: '8px',
      }}
    >
      {/* casting 톤 카드 박스 */}
      <div
        className="relative rounded-3xl p-5 flex items-center justify-center"
        style={{
          width: '100%',
          background: 'rgba(254,251,244,0.04)',
          border: `2px solid ${C.bg}`,
        }}
      >
        <svg width="320" height="320" viewBox="0 0 320 320">
          {/* 동심 펜타곤 4겹 */}
          {[0.25, 0.5, 0.75, 1].map((r, i) => (
            <polygon
              key={i}
              points={polyAt(r)}
              fill="none"
              stroke="rgba(254,251,244,0.15)"
              strokeWidth="1"
            />
          ))}
          {/* 축 (대시 라인) */}
          {Array.from({ length: n }, (_, i) => {
            const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={cx + R * Math.cos(angle)}
                y2={cy + R * Math.sin(angle)}
                stroke="rgba(254,251,244,0.2)"
                strokeWidth="1"
                strokeDasharray="3 4"
              />
            );
          })}
          {/* 점들이 축 따라 움직인 자국 — gold trail beam */}
          {values.map((v, i) => {
            const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
            const r = (R * v) / 100;
            const px = cx + r * Math.cos(angle);
            const py = cy + r * Math.sin(angle);
            return (
              <line
                key={`trail-${i}`}
                x1={cx}
                y1={cy}
                x2={px}
                y2={py}
                stroke={C.gold}
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.45"
              />
            );
          })}
          {/* 데이터 폴리곤 — 점들이 만드는 면 (담백) */}
          <polygon
            points={dataPoints}
            fill="rgba(232,93,47,0.18)"
            stroke={C.accent}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* 점 — 축 위를 출렁이며 움직임 */}
          {values.map((v, i) => {
            const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
            const r = (R * v) / 100;
            const px = cx + r * Math.cos(angle);
            const py = cy + r * Math.sin(angle);
            return (
              <circle
                key={`pt-${i}`}
                cx={px}
                cy={py}
                r="6"
                fill={C.gold}
                stroke={C.dark}
                strokeWidth="2"
              />
            );
          })}
          {/* 라벨 + 실시간 점수 */}
          {RADAR_AXES.map((label, i) => {
            const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
            const lx = cx + (R + 24) * Math.cos(angle);
            const ly = cy + (R + 24) * Math.sin(angle);
            return (
              <text
                key={label}
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={C.bg}
                fontSize="13"
                fontWeight="700"
              >
                {label}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

/* ────────── Bars — 담백, sin oscillation만 ────────── */
function BarPanel({ t }: { t: number; startedAt?: number }) {
  return (
    <div
      className="w-full rounded-3xl p-5"
      style={{
        background: 'rgba(254,251,244,0.04)',
        border: `2px solid ${C.bg}`,
        animation: 'sto-fade-up 0.5s ease-out both',
      }}
    >
      <div className="mb-5">
        <span
          className="text-[12px] font-bold"
          style={{ color: C.gold, opacity: 0.85, letterSpacing: '0.05em' }}
        >
          연애 가치관 분석
        </span>
      </div>
      <div
        className="flex items-end justify-around gap-3"
        style={{ height: '220px' }}
      >
        {BAR_LABELS.map((label, i) => {
          // sin 진동: 28~92 사이 크게 출렁
          const base = 60;
          const amp = 32;
          const freq = 1.6 + i * 0.4;
          const phase = i * 1.3;
          const live = base + Math.sin(t * freq + phase) * amp;
          const height = (live / 100) * 180;

          return (
            <div
              key={label}
              className="flex-1 flex flex-col items-center"
              style={{
                animation: `sto-fade-up 0.4s ease-out ${i * 0.12}s both`,
              }}
            >
              <div
                className="w-full flex items-end justify-center"
                style={{ height: '180px' }}
              >
                <div
                  className="w-full max-w-[48px]"
                  style={{
                    height: `${height}px`,
                    background: `linear-gradient(180deg, ${C.accent} 0%, ${C.gold} 100%)`,
                    border: `2px solid ${C.bg}`,
                    borderRadius: '8px',
                  }}
                />
              </div>
              <span
                className="mt-3 text-xs font-semibold"
                style={{ color: C.bg, opacity: 0.75 }}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ────────── Cards (auto-rotate, casting 톤) ────────── */
function CardPanel({ cards }: { cards: CardData[] }) {
  const [idx, setIdx] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setIdx((i) => (i + 1) % cards.length);
        setAnimating(false);
      }, 320);
    }, 1100);
    return () => clearInterval(interval);
  }, [cards.length]);

  const card = cards[idx];

  return (
    <div
      className="w-full mt-5 rounded-3xl p-5 relative"
      style={{
        background: 'rgba(254,251,244,0.04)',
        border: `2px solid ${C.bg}`,
        animation: 'sto-fade-up 0.6s ease-out both',
      }}
    >
      <div className="mb-3">
        <span
          className="text-[12px] font-bold"
          style={{ color: C.gold, opacity: 0.85, letterSpacing: '0.05em' }}
        >
          매칭 후보
        </span>
      </div>

      <div
        className="relative flex items-center justify-center"
        style={{ height: '380px' }}
      >
        {/* 백 카드 1 */}
        <div
          className="absolute rounded-2xl"
          style={{
            width: '230px',
            height: '350px',
            background: 'rgba(254,251,244,0.04)',
            border: `2px solid rgba(254,251,244,0.4)`,
            transform: 'translate(8px, 6px) rotate(2.5deg) scale(0.96)',
          }}
        />
        {/* 백 카드 2 */}
        <div
          className="absolute rounded-2xl"
          style={{
            width: '230px',
            height: '350px',
            background: 'rgba(254,251,244,0.06)',
            border: `2px solid rgba(254,251,244,0.6)`,
            transform: 'translate(-7px, 3px) rotate(-2.5deg) scale(0.98)',
          }}
        />
        {/* 메인 카드 — 세로형 */}
        <div
          key={idx}
          className="relative rounded-2xl flex flex-col"
          style={{
            width: '240px',
            height: '360px',
            background: C.dark,
            border: `2px solid ${C.bg}`,
            animation: animating
              ? 'sto-card-out 0.32s ease-in both'
              : 'sto-card-in 0.45s cubic-bezier(0.16,1,0.3,1) both',
            overflow: 'hidden',
          }}
        >
          {/* 사진 자리 — 위쪽 220px */}
          <div
            className="relative"
            style={{
              width: '100%',
              height: '220px',
              background: `linear-gradient(135deg, ${C.accent}cc, ${C.gold}dd)`,
              borderBottom: `2px solid ${C.bg}`,
            }}
          >
            {card.photo ? (
              <img
                src={card.photo}
                alt=""
                className="w-full h-full object-cover"
                style={{ filter: 'blur(16px)' }}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            ) : null}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.45) 0%, transparent 65%)',
                filter: 'blur(8px)',
              }}
            />
          </div>
          {/* 정보 영역 — 아래쪽 */}
          <div className="flex-1 flex flex-col justify-between p-4">
            <div>
              <p
                className="text-[10px] font-bold tracking-[0.2em] mb-2"
                style={{ color: C.gold, opacity: 0.85 }}
              >
                {card.tag}
              </p>
              <p
                className="text-sm font-semibold leading-snug"
                style={{ color: C.bg }}
              >
                {card.desc}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
