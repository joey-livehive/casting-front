'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  trackPageView,
  trackAnswer,
  trackPicky,
  trackPhone,
  trackPhoto,
  trackMessage,
  trackSubmitApplication,
  setGuestUid as setTrackingGuestUid,
} from '@/lib/tracking';
import { API_BASE } from '../api';

type Phase = 'intro' | 'picky' | 'phone' | 'bridge' | 'detail' | 'photo' | 'message' | 'done';

interface Question {
  key: string;
  section: string;
  num: string;
  title: string;
  highlight?: string;
  sub: string | null;
  opts: string[];
}

const INTRO_Q: Question[] = [
  { key: 'charm', section: '이상형 · ATTRACTION', num: '01 / 09', title: '어떤 분께\n끌리시나요?', highlight: '끌리시나요', sub: '의뢰인께서 가장 먼저 눈이 가는 점을 알려주세요.', opts: ['성격이 좋은 분', '얼굴이 좋은 분', '능력이 좋은 분', '결이 좋은 분'] },
  { key: 'age', section: '이상형 · AGE', num: '02 / 09', title: '연령대는 어느 정도가\n좋으실까요?', highlight: '연령대', sub: null, opts: ['저보다 많은 분', '저와 비슷한 분', '저보다 어린 분', '상관없습니다'] },
  { key: 'height', section: '이상형 · HEIGHT', num: '03 / 09', title: '키는 어느 정도가\n좋으실까요?', highlight: '키', sub: null, opts: ['저보다 큰 편', '저와 비슷한 편', '저보다 작은 편', '상관없습니다'] },
  { key: 'body', section: '이상형 · BUILD', num: '04 / 09', title: '체형은 어느 쪽이\n좋으실까요?', highlight: '체형', sub: null, opts: ['마른 편', '보통', '탄탄한 편', '통통한 편'] },
  { key: 'value', section: '이상형 · VALUES', num: '05 / 09', title: '연애에서 가장 중요한 가치는\n무엇인가요?', highlight: '가치', sub: null, opts: ['신뢰와 안정', '설렘과 열정', '대화가 통하는 것', '독립적인 관계'] },
  { key: 'comm', section: '이상형 · COMMS', num: '06 / 09', title: '연락 스타일은\n어떤 분이 좋으실까요?', highlight: '연락 스타일', sub: null, opts: ['매일 꾸준히', '필요할 때 충분히', '여유롭게', '상관없습니다'] },
  { key: 'faith', section: '이상형 · FAITH', num: '07 / 09', title: '종교는\n어떻게 보시나요?', highlight: '종교', sub: null, opts: ['같은 종교가 좋아요', '종교 없는 분', '상관없습니다', '별도로 말씀드릴게요'] },
  { key: 'dealbreaker', section: '이상형 · DEALBREAKER', num: '08 / 09', title: '꼭 피하고 싶은 분이\n있다면요?', highlight: '피하고 싶은', sub: '복수 선택이 아닌, 가장 결정적인 한 가지만 골라주세요.', opts: ['흡연하시는 분', '음주가 잦은 분', '매사 예민하신 분', '해당사항 없음'] },
  { key: 'firstmeet', section: '이상형 · FIRST MEET', num: '09 / 09', title: '첫 만남에서 가장 보시는 건\n무엇인가요?', highlight: '첫 만남', sub: null, opts: ['분위기·첫인상', '대화의 결', '예의와 태도', '솔직한 호감 표현'] },
];

const DETAIL_Q: Question[] = [
  { key: 'myAge', section: '의뢰인 · AGE', num: '01 / 07', title: '의뢰인의 연령대를\n여쭙겠습니다.', highlight: '연령대', sub: '맞춤 캐스팅을 위해 꼭 필요한 정보입니다.', opts: ['28세 이하', '29~34세', '35~40세', '41세 이상'] },
  { key: 'gender', section: '의뢰인 · GENDER', num: '02 / 07', title: '의뢰인의 성별은\n어떻게 기입할까요?', highlight: '성별', sub: null, opts: ['여성', '남성'] },
  { key: 'region', section: '의뢰인 · REGION', num: '03 / 07', title: '주로 활동하시는\n지역은요?', highlight: '지역', sub: '캐스팅 반경을 결정하는 기준이 됩니다.', opts: ['서울', '경기·인천', '부산·경남', '그 외 지역 (따로 적겠습니다.)'] },
  { key: 'weekend', section: '의뢰인 · WEEKEND', num: '04 / 07', title: '주말은 주로\n어떻게 보내시나요?', highlight: '주말', sub: null, opts: ['집에서 충전', '운동·취미', '친구들과 약속', '새로운 곳 탐색'] },
  { key: 'drink', section: '의뢰인 · DRINK', num: '05 / 07', title: '음주는\n어떻게 하시나요?', highlight: '음주', sub: null, opts: ['거의 하지 않음', '분위기에 맞춰', '즐기는 편', '가리지 않음'] },
  { key: 'style', section: '의뢰인 · STYLE', num: '06 / 07', title: '연애 스타일은\n어느 쪽이신가요?', highlight: '연애 스타일', sub: null, opts: ['차분하고 안정적', '다정하고 표현 많음', '독립적 · 각자의 시간', '그때그때 맞춰가는'] },
  { key: 'ready', section: '의뢰인 · READINESS', num: '07 / 07', title: '지금 연애 준비도는\n어느 정도인가요?', highlight: '연애 준비도', sub: null, opts: ['당장이라도 만나고 싶음', '좋은 분이면 천천히', '아직은 탐색 단계', '마음만 열어둔 상태'] },
];

const PHOTO_MAX_BYTES = 5 * 1024 * 1024;
const ADVANCE_DELAY_MS = 180;

async function api(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}/theone/survey${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length < 4) return digits;
  if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function renderTitle(title: string, highlight?: string): React.ReactNode {
  if (!highlight) return title;
  const idx = title.indexOf(highlight);
  if (idx === -1) return title;
  return (
    <>
      {title.slice(0, idx)}
      <em>{highlight}</em>
      {title.slice(idx + highlight.length)}
    </>
  );
}

function formatDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

export default function NoirStartPage() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [introStep, setIntroStep] = useState(0);
  const [detailStep, setDetailStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [phone, setPhone] = useState('');
  const [picky, setPicky] = useState('');
  const [message, setMessage] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [guestUid, setGuestUid] = useState<string | null>(null);
  const guestPromiseRef = useRef<Promise<string> | null>(null);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const matchNo = useMemo(() => '04' + String(Math.floor(Math.random() * 900) + 100), []);

  useEffect(() => {
    trackPageView('start');
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [phase, introStep, detailStep]);

  useEffect(() => () => {
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
  }, []);

  // 동시에 여러 번 호출돼도 /start 는 1회만 — promise 를 ref 에 캐싱
  function ensureGuest(): Promise<string> {
    if (guestUid) return Promise.resolve(guestUid);
    if (guestPromiseRef.current) return guestPromiseRef.current;
    guestPromiseRef.current = api('/start', { method: 'POST' })
      .then((data: { guest_uid: string }) => {
        setGuestUid(data.guest_uid);
        setTrackingGuestUid(data.guest_uid);
        return data.guest_uid;
      })
      .catch((err) => {
        guestPromiseRef.current = null;
        throw err;
      });
    return guestPromiseRef.current;
  }

  // guest 보장 후 PATCH — UX 는 막지 않고, 실패는 조용히 무시
  function patchGuest(path: string, body: object) {
    ensureGuest()
      .then((uid) =>
        api(`/${uid}${path}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        }),
      )
      .catch(() => {});
  }

  const patchAnswer = (question: string, answer: string) =>
    patchGuest('/answer', { question, answer });

  // ─── Meta label ───
  function metaLabel() {
    if (phase === 'intro') return `BRIEF · ${String(introStep + 1).padStart(2, '0')}/09`;
    if (phase === 'picky') return 'BRIEF · NOTES';
    if (phase === 'phone') return 'CONTACT';
    if (phase === 'bridge') return 'SECTION II';
    if (phase === 'detail') return `CLIENT · ${String(detailStep + 1).padStart(2, '0')}/07`;
    if (phase === 'photo') return 'REFERENCE';
    if (phase === 'message') return 'NOTE';
    return 'RECEIPT';
  }

  const backHidden = phase === 'done' || (phase === 'intro' && introStep === 0);

  // ─── Back navigation ───
  function goBack() {
    if (phase === 'intro' && introStep > 0) {
      setIntroStep((s) => s - 1);
    } else if (phase === 'picky') {
      setPhase('intro');
      setIntroStep(INTRO_Q.length - 1);
    } else if (phase === 'phone') {
      setPhase('picky');
    } else if (phase === 'bridge') {
      setPhase('phone');
    } else if (phase === 'detail' && detailStep > 0) {
      setDetailStep((s) => s - 1);
    } else if (phase === 'detail' && detailStep === 0) {
      setPhase('bridge');
    } else if (phase === 'photo') {
      setPhase('detail');
      setDetailStep(DETAIL_Q.length - 1);
    } else if (phase === 'message') {
      setPhase('photo');
    }
  }

  // ─── Pick an option (intro/detail) ───
  // 180ms 연출 사이에 재클릭되면 타이머를 리셋해 step 이 두 번 advance 되지 않도록
  function handleSelect(q: Question, value: string) {
    setAnswers((prev) => ({ ...prev, [q.key]: value }));
    const question = q.title.replace(/\n/g, ' ');
    trackAnswer(question, value, phase);
    patchAnswer(question, value);

    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    advanceTimerRef.current = setTimeout(() => {
      advanceTimerRef.current = null;
      if (phase === 'intro') {
        if (introStep < INTRO_Q.length - 1) setIntroStep((s) => s + 1);
        else setPhase('picky');
      } else if (phase === 'detail') {
        if (detailStep < DETAIL_Q.length - 1) setDetailStep((s) => s + 1);
        else setPhase('photo');
      }
    }, ADVANCE_DELAY_MS);
  }

  function handlePickyNext() {
    const value = picky.trim();
    trackPicky(value);
    setPhase('phone');
    if (value) patchAnswer('까다로운 기준', value);
  }

  function handlePhoneNext() {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 11) return;
    trackPhone(digits);
    setPhase('bridge');
    patchGuest('/phone', { phone: digits });
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      e.target.value = '';
      return;
    }
    if (file.size > PHOTO_MAX_BYTES) {
      alert('5MB 이하 이미지만 업로드 가능합니다.');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handlePhotoNext() {
    trackPhoto();
    setPhase('message');
    if (photo) patchGuest('/photo', { photo_data: photo });
  }

  function handleMessageSubmit() {
    const value = message.trim();
    trackMessage(!!value);
    trackSubmitApplication();
    setPhase('done');
    if (value) patchAnswer('디렉터에게 전언', value);
  }

  const phoneDigits = phone.replace(/\D/g, '');
  const phoneValid = phoneDigits.length >= 10 && phoneDigits.length <= 11;
  const today = new Date();
  const eta = new Date(today.getTime() + 86400000);

  // ─── Render per phase ───
  const renderQuestion = (q: Question, selectedVal: string | undefined) => (
    <div className="phase screen-fade" key={`${phase}-${q.key}`}>
      <div className="phase__header">
        <div className="phase__section">
          <span className="phase__section-label">{q.section}</span>
          <span className="phase__section-num">{q.num}</span>
        </div>
        <h2 className="phase__title">{renderTitle(q.title, q.highlight)}</h2>
        {q.sub && <p className="phase__sub">{q.sub}</p>}
      </div>
      <div className="options">
        {q.opts.map((o, i) => (
          <button
            key={o}
            type="button"
            className={`option${selectedVal === o ? ' is-selected' : ''}`}
            onClick={() => handleSelect(q, o)}
          >
            <span className="option__marker">{String.fromCharCode(65 + i)}</span>
            {o}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <main className="app">
      <nav className="topnav">
        <button
          type="button"
          className={`topnav__back${backHidden ? ' is-hidden' : ''}`}
          onClick={goBack}
          aria-label="이전"
        >
          ←
        </button>
        <span className="topnav__logo">
          someonetheone<span className="dot">.</span>
        </span>
        <span className="topnav__meta">{metaLabel()}</span>
      </nav>


      {/* ─── INTRO ─── */}
      {phase === 'intro' && renderQuestion(INTRO_Q[introStep], answers[INTRO_Q[introStep].key])}

      {/* ─── PICKY ─── */}
      {phase === 'picky' && (
        <div className="phase screen-fade">
          <div className="phase__header">
            <div className="phase__section">
              <span className="phase__section-label">이상형 · PRIVATE NOTES</span>
              <span className="phase__section-num">추가 사항</span>
            </div>
            <h2 className="phase__title">
              말씀 드리기 어려운,
              <br />
              <em>까다로운 기준</em>이 있으신가요?
            </h2>
            <p className="phase__sub">
              다른 서비스에서 차마 꺼내지 못했던 솔직한 기준도 좋습니다. 캐스팅 디렉터만 읽습니다.
            </p>
          </div>
          <div className="field">
            <textarea
              className="textarea"
              maxLength={500}
              placeholder="예: 문장 쓰는 결이 잘 맞았으면 해요. 너무 리액션이 큰 분은 제가 지쳐서 힘들었습니다."
              value={picky}
              onChange={(e) => setPicky(e.target.value)}
            />
            <span className="field__counter">
              <span>{picky.length}</span> / 500
            </span>
          </div>
          <div className="phase__footer">
            <button type="button" className="btn btn--dark btn--full btn--lg" onClick={handlePickyNext}>
              계속하기 &nbsp;→
            </button>
          </div>
        </div>
      )}

      {/* ─── PHONE ─── */}
      {phase === 'phone' && (
        <div className="phase screen-fade">
          <div className="phase__header">
            <div className="phase__section">
              <span className="phase__section-label">연락처 · CONTACT</span>
              <span className="phase__section-num">리포트 수신용</span>
            </div>
            <h2 className="phase__title">
              리포트를 어디로
              <br />
              보내드릴까요?
            </h2>
            <p className="phase__sub">
              캐스팅이 마쳐지는 즉시, 의뢰인 번호로만 알려드립니다. 무료로 발송됩니다.
            </p>
          </div>
          <div className="field">
            <span className="field__label">◆ 휴대전화 번호</span>
            <input
              className="input"
              type="tel"
              inputMode="numeric"
              placeholder="010-0000-0000"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
            />
          </div>
          <div className="phase__footer">
            <button
              type="button"
              className="btn btn--dark btn--full btn--lg"
              disabled={!phoneValid}
              onClick={handlePhoneNext}
            >
              계속하기 &nbsp;→
            </button>
          </div>
        </div>
      )}

      {/* ─── BRIDGE ─── */}
      {phase === 'bridge' && (
        <div className="bridge screen-fade">
          <h2 className="bridge__title">
            이제, <em>의뢰인에 대해</em>
            <br />
            여쭤봐도
            <br />
            되겠습니까.
          </h2>
          <p className="bridge__body">
            캐스팅할 상대를 정확히 고르려면
            <br />
            의뢰인이 어떤 분이신지 먼저 알아야 합니다.
            <br />
            1분이면 충분합니다.
          </p>
          <div className="bridge__footer">
            <button
              type="button"
              className="btn btn--gold btn--full btn--lg"
              onClick={() => {
                setPhase('detail');
                setDetailStep(0);
              }}
            >
              계속하기 &nbsp;→
            </button>
          </div>
        </div>
      )}

      {/* ─── DETAIL ─── */}
      {phase === 'detail' && renderQuestion(DETAIL_Q[detailStep], answers[DETAIL_Q[detailStep].key])}

      {/* ─── PHOTO ─── */}
      {phase === 'photo' && (
        <div className="phase screen-fade">
          <div className="phase__header">
            <div className="phase__section">
              <span className="phase__section-label">참고 사진 · REFERENCE</span>
              <span className="phase__section-num">선택 사항</span>
            </div>
            <h2 className="phase__title">
              의뢰인 사진을
              <br />한 장 <em>참고용</em>으로 남겨주세요.
            </h2>
            <p className="phase__sub">
              캐스팅 디렉터만 열람합니다. 상대에게 공개되지 않으며, 리포트 발송 후 안전 삭제됩니다.
            </p>
          </div>

          <label className="photo-box" htmlFor="noir-photo-input">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="photo-preview" src={photo} alt="업로드한 참고 사진" />
            ) : (
              <>
                <div className="photo-box__icon">+</div>
                <span className="photo-box__label">사진 업로드</span>
                <p className="photo-box__note">정면·상반신 사진이 가장 도움이 됩니다</p>
              </>
            )}
            <input
              id="noir-photo-input"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
            />
          </label>

          <div className="photo-assurance">
            <strong>비공개 원칙</strong>
            상대방·외부에 절대 공개되지 않으며, 디렉터 1인만 열람합니다. 리포트 발송 후 7일 이내
            안전 삭제됩니다.
          </div>

          <div className="phase__footer">
            <button
              type="button"
              className={`btn ${photo ? 'btn--dark' : 'btn--outline'} btn--full btn--lg`}
              onClick={handlePhotoNext}
            >
              {photo ? '계속하기 →' : '사진 없이 진행하기'}
            </button>
          </div>
        </div>
      )}

      {/* ─── MESSAGE ─── */}
      {phase === 'message' && (
        <div className="phase screen-fade">
          <div className="phase__header">
            <div className="phase__section">
              <span className="phase__section-label">전하실 말씀 · NOTE</span>
              <span className="phase__section-num">선택 사항</span>
            </div>
            <h2 className="phase__title">
              마지막으로,
              <br />
              디렉터에게 <em>전하고 싶은 말씀</em>
              <br />
              있으신가요?
            </h2>
            <p className="phase__sub">
              위에서 고르지 못했던 맥락·사연·바람 등 무엇이든 좋습니다. 캐스팅의 결을 잡는 데 쓰입니다.
            </p>
          </div>
          <div className="field">
            <textarea
              className="textarea"
              maxLength={2000}
              placeholder="예: 최근에 오래 만나던 분과 헤어지고, 이번엔 정말 결이 맞는 분을 천천히 만나고 싶습니다."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <span className="field__counter">
              <span>{message.length}</span> / 2000
            </span>
          </div>
          <div className="phase__footer">
            <button type="button" className="btn btn--dark btn--full btn--lg" onClick={handleMessageSubmit}>
              의뢰서 제출하기 &nbsp;→
            </button>
          </div>
        </div>
      )}

      {/* ─── DONE (Receipt) ─── */}
      {phase === 'done' && (
        <div className="receipt screen-fade">
          <div className="receipt__head">
            <div className="receipt__brand">
              someonetheone<span className="dot">.</span>
            </div>
            <div className="receipt__kind">◆ CASTING BRIEF · RECEIPT</div>
            <div className="receipt__seal">
              <span>
                BRIEF
                <br />
                RECEIVED
              </span>
            </div>
          </div>

          <h2 className="receipt__title">
            의뢰서가
            <br />
            <em>접수</em>되었습니다.
          </h2>
          <p className="receipt__desc">
            전담 캐스팅 디렉터가 오늘부터 의뢰인만을 위한
            <br />
            캐스팅을 시작합니다. 마쳐지는 즉시 알려드리겠습니다.
          </p>

          <div className="receipt__grid">
            <div className="receipt__row">
              <span className="receipt__row-label">MATCH NO.</span>
              <span className="receipt__row-value mono">{matchNo}</span>
            </div>
            <div className="receipt__row">
              <span className="receipt__row-label">접수일</span>
              <span className="receipt__row-value mono">{formatDate(today)}</span>
            </div>
            <div className="receipt__row">
              <span className="receipt__row-label">예상 소요</span>
              <span className="receipt__row-value">1일 이내</span>
            </div>
            <div className="receipt__row">
              <span className="receipt__row-label">회신 예정</span>
              <span className="receipt__row-value mono">~ {formatDate(eta)}</span>
            </div>
            <div className="receipt__row">
              <span className="receipt__row-label">수신 연락처</span>
              <span className="receipt__row-value mono">{phone || '—'}</span>
            </div>
            <div className="receipt__row">
              <span className="receipt__row-label">담당</span>
              <span className="receipt__row-value">캐스팅 디렉터 1인 전담</span>
            </div>
          </div>

          <div className="phase__footer">
            <Link href="/noir" className="btn btn--dark btn--full btn--lg">
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
