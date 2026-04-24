'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { trackLead, trackPageView } from '@/lib/tracking';

/* ─── 1의 자리 롤링 슬롯 (displayed → value 전환 시 1회 굴림) ─── */
function OnesRoller({ value }: { value: number }) {
  const [displayed, setDisplayed] = useState(value);
  const [pending, setPending] = useState<number | null>(null);
  const ROLL_MS = 700;

  useEffect(() => {
    if (value === displayed || pending !== null) return;
    // 십의 자리까지 함께 바뀌면 롤이 깨지므로 즉시 반영
    const sameTens = Math.floor(value / 10) === Math.floor(displayed / 10);
    if (sameTens) setPending(value);
    else setDisplayed(value);
  }, [value, displayed, pending]);

  useEffect(() => {
    if (pending === null) return;
    const t = setTimeout(() => {
      setDisplayed(pending);
      setPending(null);
    }, ROLL_MS);
    return () => clearTimeout(t);
  }, [pending]);

  return (
    <span className="countup-ones">
      <span
        key={displayed}
        className={`countup-ones__stack${pending !== null ? ' is-rolled' : ''}`}
      >
        <span className="countup-ones__digit">{displayed % 10}</span>
        <span className="countup-ones__digit">{(pending ?? displayed) % 10}</span>
      </span>
    </span>
  );
}

/* ─── 스크롤 진입 후 1회 즉시 +1, 이후 8초마다 +1 ─── */
function CountUp({ target = 3285, interval = 8000 }: { target?: number; interval?: number }) {
  const [value, setValue] = useState(target - 1);
  const ref = useRef<HTMLSpanElement>(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTriggered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!triggered) return;
    const firstRoll = setTimeout(() => setValue(target), 280);
    const id = setInterval(() => setValue((v) => v + 1), interval);
    return () => {
      clearTimeout(firstRoll);
      clearInterval(id);
    };
  }, [triggered, target, interval]);

  const formatted = value.toLocaleString();
  const prefix = formatted.slice(0, -1);

  return (
    <span ref={ref} className="countup">
      {prefix}
      <OnesRoller value={value} />
    </span>
  );
}

const TICKER_ITEMS = [
  'SOMEONETHEONE',
  'PRIVATE CASTING AGENCY',
  'EST. 2025',
  'MATCH NO. 04293',
  '3,283 CASTINGS COMPLETED',
];

function AgencyBar() {
  const repeated = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="agency-bar">
      <div className="agency-bar__track">
        {repeated.map((t, i) => (
          <span key={i}>
            {t}
            <span className="dot" style={{ marginLeft: '0.8em' }}>◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function TopNav() {
  return (
    <nav className="topnav">
      <span className="topnav__back is-hidden" />
      <span className="topnav__logo">
        someonetheone<span className="dot">.</span>
      </span>
    </nav>
  );
}

const InstagramIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ verticalAlign: '-2px', marginRight: 6 }}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

const LinkedinIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ verticalAlign: '-2px', marginRight: 6 }}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const CHANNELS: Array<{ num: string; name: string; src: string; icon?: React.ReactNode }> = [
  { num: 'CH.01', name: '인스타그램', src: '/places/instagram.webp', icon: <InstagramIcon /> },
  { num: 'CH.02', name: '링크드인', src: '/places/linkedin.webp', icon: <LinkedinIcon /> },
  { num: 'CH.03', name: '동네 커피샵', src: '/places/coffee-shop.webp' },
  { num: 'CH.04', name: '헬스장', src: '/places/gym.webp' },
];

export default function LandingPage() {
  const [ctaVisible, setCtaVisible] = useState(false);
  const polaroidRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [visibleCards, setVisibleCards] = useState<boolean[]>([false, false, false, false, false]);

  useEffect(() => {
    trackPageView('landing');
  }, []);

  useEffect(() => {
    const REVEAL_AT = 420; // px scrolled — 히어로 CTA를 지난 시점
    const onScroll = () => setCtaVisible(window.scrollY > REVEAL_AT);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    polaroidRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleCards((prev) => {
              if (prev[i]) return prev;
              const next = [...prev];
              next[i] = true;
              return next;
            });
            obs.disconnect();
          }
        },
        { threshold: 0.25 },
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <main className="app screen-fade">
      <AgencyBar />
      <TopNav />

      {/* ─── Fixed Bottom CTA (스크롤 후 슬라이드 업) ─── */}
      <div className={`landing-fixed-cta${ctaVisible ? ' is-visible' : ''}`}>
        <Link
          href="/noir/start"
          onClick={trackLead}
          className="btn btn--dark btn--lg btn--full"
        >
          시작하기 &nbsp;→
        </Link>
      </div>

      <div className="landing landing--with-fixed-cta">
        {/* ─── 01. HERO ─── */}
        <div className="hero">
          <span className="eyebrow hero__eyebrow">◆ Private Casting Agency</span>
          <h1 className="display hero__title">
            원하던 그 사람
            <br />
            <em>저희가 찾아</em>
            <br />
            모시겠습니다.
          </h1>
          <p className="hero__lede">
            나와 딱 맞는 좋은 사람,
            <br />
            사소한 모든 조건을 충족하는 그 사람,
            <br />
            온라인과 오프라인에 숨어 있는 그 분을 찾아드립니다.
          </p>
          <div className="hero__cta">
            <Link
              href="/noir/start"
              onClick={trackLead}
              className="btn btn--dark btn--lg btn--full"
            >
              이상형 적어보기 &nbsp;→
            </Link>
          </div>
        </div>

        {/* ─── 02. CHANNELS (Polaroid cards) with intro + niche couple ─── */}
        <div className="channels">
          <div className="channels__head">
            <span className="channels__label">◆ Why We Cast</span>
          </div>

          <div className="problem problem--inchannels">
            <h2 className="problem__title">
              의뢰인께서 찾으시는 분은
              <br />
              <em>소개팅 앱에 있지 않습니다.</em>
            </h2>
            <p className="problem__sub">
              <strong>사소한 취향·습관·주의할 점</strong>까지 맞는 사람은
              <br />
              절대 소개팅 앱을 하지 않습니다.
            </p>
          </div>

          {/* Niche couple + 2x2 editorial list — directly below problem copy */}
          <div className="niche__stage">
            <Image
              src="/images/hero-couple.webp"
              alt="의뢰인과 찾아드릴 상대"
              width={540}
              height={480}
              className="niche__couple"
              priority
            />

            <div className="niche__grid">
              <div className="niche__item">
                <span className="niche__mark">◆</span>쉬는 날 집에 있는 남자
              </div>
              <div className="niche__item">
                <span className="niche__mark">◆</span>메신저 프로필 없는 남자
              </div>
              <div className="niche__item">
                <span className="niche__mark">◆</span>음식 사진을 찍지 않는 여자
              </div>
              <div className="niche__item">
                <span className="niche__mark">◆</span>SNS를 안 하는 여자
              </div>
            </div>
          </div>

          <div className="channels__head channels__head--deep">
            <span className="channels__label">◆ Where We Cast</span>
          </div>

          {/* Niche heading — below Where We Cast horizontal line */}
          <div className="niche__head niche__head--inchannels">
            <h3 className="niche__title">
              좋은 사람이 있는
              <br />
              <em>&lsquo;일상&rsquo;</em>에서 찾아드립니다
            </h3>
          </div>

          <div className="channels__grid">
            {CHANNELS.map((c, i) => (
              <div
                ref={(el) => {
                  polaroidRefs.current[i] = el;
                }}
                className={`polaroid${visibleCards[i] ? ' is-visible' : ''}`}
                key={c.num}
              >
                <div className="polaroid__img">
                  <Image src={c.src} alt={c.name} fill sizes="(max-width: 480px) 45vw, 220px" />
                </div>
                <div className="polaroid__cap">
                  <span className="polaroid__name">
                    {c.icon}
                    {c.name}
                  </span>
                </div>
              </div>
            ))}
            {/* wide earth */}
            <div
              ref={(el) => {
                polaroidRefs.current[4] = el;
              }}
              className={`polaroid polaroid--wide${visibleCards[4] ? ' is-visible' : ''}`}
            >
              <div className="polaroid__img">
                <Image src="/images/earth.webp" alt="전 세계 어디든" fill sizes="(max-width: 480px) 90vw, 480px" />
              </div>
              <div className="polaroid__cap">
                <span className="polaroid__name">전 세계 어디든</span>
              </div>
            </div>
          </div>
        </div>


        {/* ─── 05. PROMISES (Dark) ─── */}
        <div className="promises">
          <div className="channels__head channels__head--dark">
            <span className="channels__label">◆ Four Commitments</span>
          </div>
          <h2 className="promises__title">
            <span className="hl">엄선된 상대</span>를
            <br />
            약속합니다.
          </h2>

          <div className="promise">
            <span className="promise__num">01</span>
            <div>
              <h3 className="promise__title">
                의뢰인의 기준이,
                <br />
                저희의 기준입니다
              </h3>
              <p className="promise__body">
                성격이든 외모든,
                <br />
                의뢰인께 중요한 것은 저희에게도 중요합니다.
              </p>
            </div>
          </div>
          <div className="promise">
            <span className="promise__num">02</span>
            <div>
              <h3 className="promise__title">
                의뢰인의 정보는
                <br />
                어디에도 공개하지 않습니다
              </h3>
              <p className="promise__body">
                꼭 필요한 경우에도,
                <br />
                반드시 의뢰인 허락을 먼저 구합니다.
              </p>
            </div>
          </div>
          <div className="promise">
            <span className="promise__num">03</span>
            <div>
              <h3 className="promise__title">
                첫 말은,
                <br />
                저희가 건네드립니다
              </h3>
              <p className="promise__body">
                조심스럽게, 그러나 확실하게.
                <br />
                의뢰인 정보는 절대 말하지 않습니다.
              </p>
            </div>
          </div>
          <div className="promise">
            <span className="promise__num">04</span>
            <div>
              <h3 className="promise__title">
                상대의 인적사항을
                <br />
                먼저 살펴드립니다
              </h3>
              <p className="promise__body">
                좋은 점, 특별한 점, 조심할 점까지.
                <br />
                리포트로 정리해 보내드립니다.
              </p>
            </div>
          </div>
        </div>

        {/* ─── 06. FINAL ─── */}
        <div className="final-hero">
          <div className="channels__head">
            <span className="channels__label">◆ Since 2025</span>
          </div>
          <div className="final-hero__caption">현재까지 성사된 만남 건수</div>
          <div className="final-hero__num">
            <CountUp target={3285} />
            <span className="final-hero__unit">건</span>
          </div>

          {/* ─── CASE RECORDS (헤더 제거, 카드만 노출) ─── */}
          <div className="cases-section cases-section--bare">
            <div className="couples-scroll">
              {[
                {
                  no: 'CASE 001 · OFFLINE',
                  photo: '/images/couples/case-002.jpg',
                  names: 'J & S',
                  meta: '강남 헬스장',
                  quote:
                    '소개팅앱 6개월을 써도 만나지 못한 사람을 2주 만에 만났습니다! 소개팅앱을 전혀 안써본 사람을 여기서 만날 수 있다는 게 너무 큰 장점같네요',
                },
                {
                  no: 'CASE 002 · INSTAGRAM',
                  photo: '/images/couples/case-new-002.jpg',
                  names: 'K & H',
                  meta: 'Instagram 캐스팅',
                  quote:
                    '제 성향을 이렇게까지 파악하고 데려올 줄 몰랐습니다. 덕분에 6개월만에 결혼 약속하고 신혼부부로 알콩달콩 잘 살고 있습니다!',
                },
                {
                  no: 'CASE 003 · LINKEDIN',
                  photo: '/images/couples/case-003.jpg',
                  names: 'M & Y',
                  meta: 'LinkedIn 캐스팅',
                  quote:
                    '가벼운 만남이 지겨웠는데, 처음부터 진지한 태도로 만남을 이어가는 중입니다. 감사합니다!',
                },
              ].map((c) => (
                <div key={c.no} className="couple-card">
                  <div className="cp-photo" onContextMenu={(e) => e.preventDefault()}>
                    <Image
                      src={c.photo}
                      alt=""
                      fill
                      sizes="240px"
                      draggable={false}
                      className="cp-photo-img"
                      style={{
                        objectFit: 'cover',
                        filter: 'blur(4px) saturate(1.05)',
                        transform: 'scale(1.08)',
                        pointerEvents: 'none',
                        WebkitUserSelect: 'none',
                        WebkitTouchCallout: 'none',
                      } as React.CSSProperties}
                    />
                  </div>
                  <div className="cp-body">
                    <div className="cp-no">{c.no}</div>
                    <div className="cp-names">{c.names}</div>
                    <div className="cp-meta">{c.meta}</div>
                    <p className="cp-quote">{c.quote}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ─── BEHIND THE SCENES (리포트 CastingProcess 이식) ─── */}
        <section className="noir-dark behind">
          <div className="behind__head-wrap">
            <div className="channels__head channels__head--dark">
              <span className="channels__label">◆ Behind The Scenes</span>
            </div>
            <div className="behind__head">
              <h2 className="sec-title">
                <span className="hl">SomeOneTheOne</span>에서
                <br />
                사람을 찾는 방식.
              </h2>
              <p className="sec-sub">
                오프라인과 온라인 양쪽에서 직접 캐스팅해오며,
                <br />
                의뢰인님의 정보는 먼저 공개되지 않습니다.
              </p>
            </div>
          </div>

          {/* SCENE 01 — Instagram */}
          <div className="casting-scene">
            <div className="scene-head">
              <span className="scene-no">SCENE 01</span>
              <span className="scene-channel">INSTAGRAM</span>
            </div>
            <div className="scene-body">
              <div className="scene-title">매니저가 직접 DM으로 접근합니다.</div>
              <p className="scene-desc">
                의뢰인님의 기준과 겹치는 프로필을 하루 평균 <b>6~8건</b> 큐레이션합니다. 매니저가 직접 메시지를 보내고, 사전 대화까지 거친 후 후보에 올립니다.
              </p>
              <div className="mock">
                <div className="mock-label">SAMPLE MESSAGE</div>
                <div className="dm-bubble">안녕하세요. someonetheone 캐스팅 매니저입니다.</div>
                <div className="dm-bubble">
                  피드에서 느껴지는 분위기가 저희 기준에 부합해 연락드립니다.{' '}
                  <b>진지한 관계를 찾는 분과의 소개</b>에 관심 있으신지 확인 드립니다.
                </div>
                <div className="dm-note">· 의뢰인님의 정보는 먼저 공개하지 않습니다.</div>
              </div>
            </div>
          </div>

          {/* SCENE 02 — Offline */}
          <div className="casting-scene">
            <div className="scene-head">
              <span className="scene-no">SCENE 02</span>
              <span className="scene-channel">OFFLINE</span>
            </div>
            <div className="scene-body">
              <div className="scene-title">오프라인 현장에서 명함으로 접근합니다.</div>
              <p className="scene-desc">
                강남권 프리미엄 헬스장·와인바·북카페와의 제휴를 통해, 매니저가{' '}
                <b>직접 눈으로 검증한 사람</b>에게만 명함을 전달합니다. 사진으로 확인할 수 없는 말투와 매너까지 점검합니다.
              </p>
              <div className="mock">
                <div className="mock-label">CASTING MANAGER CARD</div>
                <div className="biz-card">
                  <div className="biz-logo">
                    someonetheone<span className="dot">.</span>
                  </div>
                  <div className="biz-tag">Casting Manager</div>
                  <div className="biz-deco" />
                  <div className="biz-name">LEE ○○</div>
                  <div className="biz-role">Senior Casting</div>
                </div>
              </div>
            </div>
          </div>

          {/* SCENE 03 — LinkedIn */}
          <div className="casting-scene">
            <div className="scene-head">
              <span className="scene-no">SCENE 03</span>
              <span className="scene-channel">LINKEDIN</span>
            </div>
            <div className="scene-body">
              <div className="scene-title">커리어 기반으로 운명의 짝을 찾는 분만 봅니다.</div>
              <p className="scene-desc">
                LinkedIn에서 커리어·가치관·관심사를 확인하고, <b>진지한 관계를 원하는 분</b>에게만 접근합니다. 가벼운 만남을 찾는 분은 처음부터 후보에 오르지 않습니다.
              </p>
              <div className="mock">
                <div className="mock-label">TARGETING CRITERIA</div>
                <div className="dm-bubble">
                  <b>커리어 기반</b>으로 <b>진지한 운명의 짝</b>을 찾는 분만 선별합니다.
                </div>
                <div className="dm-note">· 가벼운 만남을 찾는 분은 후보에 오르지 않습니다.</div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Closing headline (BEHIND THE SCENES 아래) ─── */}
        <div className="final-hero final-hero--closing">
          <h2 className="final-hero__cta">
            <span className="final-hero__cta-lead">사소한, 어려운, 까다로운</span>
            그 모든 조건을 충족하는 사람
            <br />
            <em>The One</em>을 찾아드립니다.
          </h2>
        </div>

        {/* ─── FOOTER ─── */}
        <div className="footer">
          <div className="footer__logo">
            someonetheone<span style={{ color: 'var(--gold-deep)' }}>.</span>
          </div>
          <div className="footer__meta">Private Casting Agency · Est. 2025</div>
        </div>
      </div>
    </main>
  );
}
