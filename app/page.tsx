'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { trackLead, trackPageView } from '../lib/tracking';

/* ─── Design tokens ─── */

const C = {
  bg: '#FEFBF4',
  ink: '#2C1D07',
  accent: '#E85D2F',
  gold: '#F7CA5D',
  dark: '#1C1208',
  cardBg: '#3D2E1A',
} as const;

/* ─── Shared CTA button ─── */

function CtaButton({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <Link
      href="/start"
      onClick={trackLead}
      className={`inline-flex items-center px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-bold text-sm sm:text-base hover:-translate-y-0.5 transition-transform ${className}`}
      style={{ background: C.gold, color: C.ink, border: `2px solid ${C.ink}`, boxShadow: `4px 4px 0 ${C.ink}` }}
    >
      {children}
    </Link>
  );
}

/* ─── Hand-drawn SVG bits ─── */

function WobblyHeart({ className = '', size = 80 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className} aria-hidden="true">
      <path
        d="M50 85 C 20 65, 8 45, 18 28 C 26 15, 42 14, 50 28 C 58 14, 74 15, 82 28 C 92 45, 80 65, 50 85 Z"
        stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─── Count-up number ─── */

function CountUp({ start = 3240, interval = 3000 }: { start?: number; interval?: number }) {
  const [count, setCount] = useState(start);
  const ref = useRef<HTMLSpanElement>(null);
  const visible = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { visible.current = entry.isIntersecting; },
      { threshold: 0.5 },
    );
    observer.observe(el);

    const id = setInterval(() => {
      if (visible.current) setCount((c) => c + 1);
    }, interval);

    return () => { observer.disconnect(); clearInterval(id); };
  }, [interval]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

/* ─── Hero heading ─── */

function HeroHeading() {
  return (
    <h1
      className="text-center font-bold"
      style={{ color: C.ink, fontSize: 'clamp(38px, 7vw, 66px)', lineHeight: '1.25', letterSpacing: '-1px' }}
    >
      너가 찾는 그 사람은
      <br />
      <span style={{ color: C.accent }}>소개팅 앱에 없어.</span>
    </h1>
  );
}

/* ─── "Where we look" — locations ─── */

const PLACES = [
  { label: 'Instagram', dot: '#E1306C', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
  ), image: '/places/instagram.webp' },
  { label: 'LinkedIn', dot: '#0A66C2', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
  ), image: '/places/linkedin.webp' },
  { label: '동네 커피샵', dot: C.ink, icon: null, image: '/places/coffee-shop.webp' },
  { label: '헬스장', dot: C.accent, icon: null, image: '/places/gym.webp' },
];

const CARD_ROTATIONS = [-3, 1.5, -1, 2.5];

const SCROLL_HEADING_STYLE = {
  fontSize: 'clamp(38px, 7vw, 100px)',
  lineHeight: '1.15',
  letterSpacing: '-1px',
} as const;

function PlacesScrollSection() {
  return (
    <section style={{ background: C.bg }}>
      {/* Heading */}
      <div className="flex flex-col items-center justify-center px-3 sm:px-6 py-20 sm:py-32">
        <h2 className="font-bold text-center" style={SCROLL_HEADING_STYLE}>
          <span style={{ color: C.accent }}>네가 원하는 사람이</span>
          <br />
          <span style={{ color: C.ink }}>어디있든</span>
          <br className="sm:hidden" />
          <span style={{ color: C.ink }}> 다 찾아줄게.</span>
        </h2>
        <CtaButton className="mt-6 sm:mt-10">이상형 알려주기</CtaButton>
      </div>

      {/* Cards */}
      <div className="flex items-center justify-center px-6 py-12 sm:py-20">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-4xl">
          {PLACES.map((p, i) => (
            <div
              key={p.label}
              className="rounded-2xl overflow-hidden"
              style={{
                background: '#FFFFFF',
                border: `2px solid ${C.ink}`,
                boxShadow: '0 8px 24px rgba(44,29,7,0.12), 0 2px 8px rgba(44,29,7,0.08)',
                rotate: `${CARD_ROTATIONS[i]}deg`,
              }}
            >
              <div className="w-full relative overflow-hidden" style={{ height: 'clamp(120px, 30vw, 220px)', background: p.dot }}>
                <Image src={p.image} alt={p.label} fill className="object-cover" sizes="(max-width: 768px) 45vw, 220px" />
              </div>
              <div
                className="p-3 sm:p-5"
                style={{ borderTop: `2px solid ${C.ink}`, background: i % 2 === 0 ? C.accent : C.gold }}
              >
                <h3
                  className="font-bold mb-1 flex items-center gap-2 text-base sm:text-xl"
                  style={{ color: i % 2 === 0 ? C.bg : C.ink }}
                >
                  {p.icon && <span style={{ color: i % 2 === 0 ? C.bg : C.ink }}>{p.icon}</span>}
                  {p.label}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Outro text */}
      <div className="flex flex-col items-center justify-center px-3 sm:px-6 py-20 sm:py-32">
        <h2 className="font-bold text-center" style={SCROLL_HEADING_STYLE}>
          <span style={{ color: C.ink }}>그리고</span>
          <br />
          <span style={{ color: C.accent }}>지구 어디든</span>
        </h2>
        <CtaButton className="mt-6 sm:mt-10">이상형 알려주기</CtaButton>
      </div>

      {/* Earth image */}
      <div className="flex justify-center pb-12 sm:pb-20">
        <Image src="/images/earth.webp" alt="지구" width={1200} height={1200} className="w-full max-w-md sm:max-w-4xl object-contain" />
      </div>
    </section>
  );
}

/* ─── Promises data ─── */

const PROMISES = [
  { icon: <svg key="target" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.bg} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
    iconBg: C.accent, title: '네 기준이\n곧 내 기준이야', desc: '성격이든, 외모든, 너에게 중요한 거 그 무엇이든.' },
  { icon: <svg key="lock" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
    iconBg: C.gold, title: '네 정보는\n누구에게도 안 보여줘', desc: '꼭 보여줘야할 때는, 너한테 먼저 물어볼게.' },
  { icon: <svg key="chat" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.bg} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
    iconBg: C.accent, title: '첫 말은\n내가 걸어볼게', desc: '조심스럽게, 그렇지만 확실하게.' },
  { icon: <svg key="search" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>,
    iconBg: C.gold, title: '그 사람을\n먼저 살펴볼게', desc: '좋은 점, 특별한 점, 조심할 점까지.' },
];

/* ─── Floating tag bubble for hero ─── */

const FLOAT_TRANSITION = { duration: 3, repeat: Infinity, ease: 'easeInOut' as const };

function FloatingTag({
  children, className, color, tailSide,
}: {
  children: React.ReactNode; className: string; color: 'orange' | 'yellow'; tailSide: 'right' | 'left';
}) {
  const bg = color === 'orange' ? C.accent : C.gold;
  const text = color === 'orange' ? C.bg : C.ink;
  const radius = tailSide === 'right' ? '12px 12px 0 12px' : '12px 12px 12px 0';

  return (
    <motion.div
      className={`absolute px-2.5 py-1.5 sm:px-4 sm:py-2 font-semibold text-xs sm:text-base z-20 whitespace-nowrap ${className}`}
      style={{ background: bg, color: text, borderRadius: radius }}
      animate={{ y: [0, -8, 0] }}
      transition={FLOAT_TRANSITION}
    >
      {children}
    </motion.div>
  );
}

/* ─── Main ─── */

export default function LandingPage() {
  useEffect(() => { trackPageView('landing'); }, []);

  return (
    <main className="relative" style={{ backgroundColor: C.bg }}>
      {/* ━━━ Bottom fixed bar ━━━ */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-5 pb-6 pt-6" style={{ background: `linear-gradient(transparent, ${C.bg} 25%)` }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight" style={{ color: C.ink, fontFamily: "'PP Editorial Old', serif" }}>
            someonetheone
          </span>
          <Link
            href="/start"
            onClick={trackLead}
            className="inline-flex items-center justify-center min-w-[160px] px-14 py-3 rounded-full font-bold text-base hover:-translate-y-0.5 transition-transform"
            style={{ color: C.ink, background: C.gold, border: `2px solid ${C.ink}`, boxShadow: `4px 4px 0 ${C.ink}` }}
          >
            시작하기
          </Link>
        </div>
      </div>

      {/* ━━━ Hero — Places scroll animation ━━━ */}
      <PlacesScrollSection />

      {/* ━━━ Hero — text + illustration ━━━ */}
      <section className="relative pb-20 px-6 sm:px-12 overflow-x-clip" style={{ paddingTop: '50px' }}>
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-4">
          <HeroHeading />
          <p className="opacity-60 mt-2 font-bold text-center text-sm sm:text-xl" style={{ color: C.ink }}>
            사소한 취향, 습관, 조심할 점까지.
          </p>

          {/* Illustration + floating tags */}
          <div className="relative flex justify-center min-h-[280px] sm:min-h-[360px] w-full max-w-lg mt-[71px] sm:mt-8 overflow-visible px-10 sm:px-8">
            <Image
              src="/images/hero-couple.webp" alt="커플 일러스트" width={539} height={479}
              className="relative z-10 h-[300px] sm:h-[400px] w-auto object-contain" priority
            />
            <FloatingTag className="-top-[28px] sm:top-0 left-0 sm:left-[5%]" color="orange" tailSide="right">
              집돌이
            </FloatingTag>
            <FloatingTag className="top-[4px] sm:top-12 left-[-5%]" color="orange" tailSide="right">
              카톡 프로필 없는 남자
            </FloatingTag>
            <FloatingTag className="-top-[28px] sm:top-2 right-0 sm:right-[-20%]" color="yellow" tailSide="left">
              음식 사진 안찍어도 되는 여자
            </FloatingTag>
            <FloatingTag className="top-[4px] sm:top-14 right-0 sm:right-[-15%]" color="yellow" tailSide="left">
              인스타 잘 안하는 여자
            </FloatingTag>
          </div>
        </div>
      </section>

      {/* ━━━ Promises ━━━ */}
      <section className="relative" style={{ padding: '16px 10px' }}>
        <div className="mx-auto rounded-3xl px-6 sm:px-12 py-16 sm:py-24" style={{ background: C.ink }}>
          <div className="text-center mb-16">
            <h2 className="font-bold" style={{ fontSize: 'clamp(42px, 5vw, 62px)', lineHeight: '1.2', letterSpacing: '-1px' }}>
              <span style={{ color: C.accent }}>그리고 난,</span>
              <br />
              <span style={{ color: C.bg }}>끝까지 네 편이야.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {PROMISES.map((p) => (
              <div key={p.title} className="rounded-2xl p-5 sm:p-8" style={{ background: C.cardBg }}>
                <span className="inline-flex items-center justify-center rounded-full mb-6" style={{ width: 48, height: 48, background: p.iconBg }}>
                  {p.icon}
                </span>
                <h3 className="font-bold whitespace-pre-line mb-3" style={{ color: C.bg, fontSize: '22px', lineHeight: '1.35', letterSpacing: '-0.5px' }}>
                  {p.title}
                </h3>
                <p className="opacity-60 text-[15px] leading-relaxed" style={{ color: C.bg }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ Intro — "나는 썸원이야" ━━━ */}
      <section className="relative py-16 sm:py-28 px-6" style={{ background: C.bg }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-bold mb-4" style={{ fontSize: 'clamp(32px, 5vw, 52px)', lineHeight: '1.3', letterSpacing: '-0.5px', color: C.ink }}>
            반가워,
            <br />
            <span style={{ color: C.accent }}>네 사람을 찾아주는 AI,</span>
            <br />
            썸원이라고 해.
          </h2>
        </div>
      </section>

      {/* ━━━ Final CTA ━━━ */}
      <section className="relative py-16 sm:py-28 px-6" style={{ background: C.dark, color: C.bg }}>
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex justify-center mb-8" style={{ color: C.gold }}>
            <WobblyHeart size={70} />
          </div>
          <h2 className="font-bold mb-6" style={{ fontSize: 'clamp(38px, 4vw, 52px)', lineHeight: '1.3', letterSpacing: '-0.5px' }}>
            이미 <CountUp start={3283} /> 명을
            <br />
            <span style={{ color: C.gold }}>찾아줬어</span>
          </h2>
          <p className="mb-10 opacity-80" style={{ fontFamily: 'var(--font-gaegu)', fontSize: '20px', lineHeight: '1.5' }}>
            전화번호만 남겨줘. 찾는 대로 알려줄게.
          </p>
          <Link
            href="/start"
            onClick={trackLead}
            className="inline-flex items-center px-10 py-4 rounded-full font-bold text-lg hover:-translate-y-0.5 transition-transform"
            style={{ color: C.ink, background: C.gold, border: `2px solid ${C.gold}`, boxShadow: `5px 5px 0 ${C.ink}` }}
          >
            지금 시작하기 →
          </Link>
        </div>
      </section>

      {/* ━━━ Footer ━━━ */}
      <footer className="py-10 pb-24 px-6" style={{ background: C.dark, borderTop: `1px solid rgba(254,249,236,0.1)` }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-semibold" style={{ color: C.bg, fontFamily: "'PP Editorial Old', serif" }}>
            someonetheone
          </span>
          <span className="text-sm opacity-60" style={{ color: C.bg }}>
            &copy; 2026 someonetheone. All rights reserved.
          </span>
        </div>
      </footer>
    </main>
  );
}
