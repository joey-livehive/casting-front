'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  trackPageView,
  trackAnswer,
  trackPicky,
  trackPhoto,
  trackMessage,
  setGuestUid as setTrackingGuestUid,
} from '../../lib/tracking';

const C = {
  bg: '#FEFBF4',
  ink: '#2C1D07',
  accent: '#E85D2F',
  gold: '#F7CA5D',
  dark: '#1C1208',
} as const;

interface Question {
  title: string;
  subtitle: string;
  type?: 'choice' | 'mbti' | 'age' | 'height' | 'multi' | 'job';
  options?: { label: string; value: string }[];
}

// ── Chapter 1 — 상대에 대한 객관식 (7문항) ──
const CHAPTER1_QUESTIONS: Question[] = [
  {
    title: '어떤 사람이\n끌려?',
    subtitle: '생각하지 말고, 바로 골라봐',
    options: [
      { label: "'외모'가 수려한 사람", value: 'appearance' },
      { label: "'성격'이 좋은 사람", value: 'personality' },
      { label: "유능한 '능력'을 가진 사람", value: 'competence' },
      { label: "'분위기' 좋은 사람", value: 'vibe' },
    ],
  },
  {
    title: '상대 나이는\n어느 정도?',
    subtitle: '상대방 선호 나이대',
    options: [
      { label: '나보다 어린 사람', value: 'younger' },
      { label: '동갑이 좋아', value: 'same_age' },
      { label: '나보다 많은 사람', value: 'older' },
      { label: '상관없어', value: 'any_age' },
    ],
  },
  {
    title: '키는\n어느 정도?',
    subtitle: '선호하는 상대의 키',
    options: [
      { label: '큰 편이 좋아', value: 'tall' },
      { label: '비슷하면 좋겠어', value: 'similar' },
      { label: '작은 편이 좋아', value: 'short' },
      { label: '상관없어', value: 'any_height' },
    ],
  },
  {
    title: '체형은\n어땠음 해?',
    subtitle: '선호하는 상대의 체형',
    options: [
      { label: '마른 편', value: 'slim' },
      { label: '보통', value: 'average' },
      { label: '근육질', value: 'muscular' },
      { label: '상관없어', value: 'any_body' },
    ],
  },
  {
    title: '연락\n스타일은?',
    subtitle: '상대방한테 바라는 거',
    options: [
      { label: '수시로 연락했으면', value: 'frequent' },
      { label: '2~3시간에 한 번씩', value: 'twice_daily' },
      { label: '하루에 한 번이면 충분해', value: 'once_daily' },
      { label: '연락 빈도는 상관없어', value: 'any_frequency' },
    ],
  },
  {
    title: '이건 좀\n아닌 것 같아',
    subtitle: '절대 안 되는 거 하나',
    options: [
      { label: '많이 바쁜 사람', value: 'too_busy' },
      { label: '취미 없는 사람', value: 'no_hobby' },
      { label: '친구 자주 만나는 사람', value: 'too_social' },
      { label: '흡연하는 사람', value: 'smoker' },
    ],
  },
];

// ── Chapter 2 — 나에 대한 기본 정보 (6문항) ──
const CHAPTER2_QUESTIONS: Question[] = [
  {
    title: '성별이\n어떻게 돼?',
    subtitle: '',
    options: [
      { label: '남자', value: 'male' },
      { label: '여자', value: 'female' },
    ],
  },
  {
    title: '어디쯤\n살아?',
    subtitle: '대략적인 지역',
    options: [
      { label: '서울', value: 'seoul' },
      { label: '경기', value: 'gyeonggi' },
      { label: '인천', value: 'incheon' },
      { label: '그 외 지역', value: 'other_region' },
    ],
  },
  {
    title: '무슨 일 해?',
    subtitle: '대략적으로',
    options: [
      { label: '회사원', value: 'office' },
      { label: '전문직', value: 'professional' },
      { label: '학생', value: 'student' },
      { label: '사업/프리랜서', value: 'freelance' },
      { label: '기타', value: 'other' },
    ],
  },
  {
    title: '나이가\n어떻게 돼?',
    subtitle: '숫자로 입력해줘',
    type: 'age',
  },
  {
    title: '키가\n어떻게 돼?',
    subtitle: 'cm로 입력해줘',
    type: 'height',
  },
  {
    title: '연애\n스타일은?',
    subtitle: '나한테 가까운 거',
    options: [
      { label: '거의 매일 보고 싶어', value: 'daily_meet' },
      { label: '주 2~3번 정도', value: '2_3_week' },
      { label: '주 1번이면 충분해', value: 'weekly' },
      { label: '상황 따라 유연하게', value: 'flexible' },
    ],
  },
  {
    title: 'MBTI가\n뭐야?',
    subtitle: '모르면 건너뛰어도 돼',
    type: 'mbti',
  },
];

// ── Chapter 3 — 디테일 (11문항) ──
const CHAPTER3_QUESTIONS: Question[] = [
  {
    title: '질투 많이\n하는 편이야?',
    subtitle: '상대가 이성 친구 만났을 때',
    options: [
      { label: '솔직히 신경 쓰여', value: 'jealous' },
      { label: '미리 말해주면 괜찮아', value: 'okay_if_told' },
      { label: '별로 신경 안 써', value: 'chill' },
      { label: '상황 따라 달라', value: 'depends_jealousy' },
    ],
  },
  {
    title: '종교는\n중요해?',
    subtitle: '',
    options: [
      { label: '상관없어', value: 'any_religion' },
      { label: '같은 종교였으면', value: 'same_religion' },
      { label: '종교 없는 사람이 좋아', value: 'no_religion' },
    ],
  },
  {
    title: '주말에 보통\n뭐 해?',
    subtitle: '제일 자주 하는 거',
    options: [
      { label: '집에서 쉬어', value: 'rest_home' },
      { label: '사람 만나', value: 'meet_people' },
      { label: '나만의 취미 활동해', value: 'go_out' },
      { label: '운동해', value: 'exercise' },
    ],
  },
  {
    title: '술은\n어때?',
    subtitle: '',
    options: [
      { label: '자주 마셔', value: 'often' },
      { label: '가끔 마셔', value: 'sometimes' },
      { label: '거의 안 마셔', value: 'rarely' },
      { label: '아예 못 마셔', value: 'never' },
    ],
  },
  {
    title: '데이트는\n어떤 스타일이 좋아?',
    subtitle: '평소 가고 싶은 데',
    options: [
      { label: '집에서 같이 시간', value: 'home' },
      { label: '카페·전시·문화', value: 'culture' },
      { label: '맛집 탐방', value: 'food' },
      { label: '액티비티·여행', value: 'active' },
    ],
  },
  {
    title: '스킨십은\n어느 정도가 편해?',
    subtitle: '사귀는 사이 기준으로',
    options: [
      { label: '자주 했으면', value: 'frequent_touch' },
      { label: '분위기 따라 적당히', value: 'moderate_touch' },
      { label: '천천히 친해지는 편', value: 'slow_touch' },
      { label: '상대에 맞춰도 돼', value: 'match_partner' },
    ],
  },
  {
    title: '싸웠을 땐\n어떤 편이야?',
    subtitle: '솔직하게',
    options: [
      { label: '바로 풀어야 돼', value: 'resolve_now' },
      { label: '시간 갖고 정리해', value: 'take_time' },
      { label: '먼저 사과하는 편', value: 'apologize_first' },
      { label: '그때그때 달라', value: 'depends' },
    ],
  },
  {
    title: '사람들이 널\n뭐라고 평가해?',
    subtitle: '3개만 골라줘',
    type: 'multi',
    options: [
      { label: '활발해', value: 'lively' },
      { label: '다정해', value: 'warm' },
      { label: '차분해', value: 'calm' },
      { label: '진중해', value: 'serious' },
      { label: '재밌어', value: 'fun' },
      { label: '편안해', value: 'comfortable' },
      { label: '솔직해', value: 'honest' },
      { label: '똑똑해', value: 'smart' },
    ],
  },
  {
    title: '결혼 생각은\n있어?',
    subtitle: '지금 시점에서',
    options: [
      { label: '결혼 상대 찾는 중', value: 'seeking' },
      { label: '좋은 사람 있다면', value: 'if_right' },
      { label: '아직은 천천히 생각 중', value: 'not_sure' },
      { label: '안 할 수도 있어', value: 'maybe_not' },
    ],
  },
  {
    title: '직업이 정확히\n뭐야?',
    subtitle: '예: 마케팅 PM, 디자이너...',
    type: 'job',
  },
  {
    title: '너의 연소득은\n얼마야?',
    subtitle: '매칭에만 쓸 거야, 걱정 마',
    options: [
      { label: '3천만원 미만', value: 'under_30' },
      { label: '3천~5천', value: '30_50' },
      { label: '5천~7천', value: '50_70' },
      { label: '7천~1억', value: '70_100' },
      { label: '1억 이상', value: 'over_100' },
    ],
  },
];

const MBTI_PAIRS: [string, string][] = [
  ['E', 'I'],
  ['N', 'S'],
  ['T', 'F'],
  ['J', 'P'],
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type Phase =
  | 'chapter1'
  | 'picky'
  | 'bridge'
  | 'chapter2'
  | 'intermission'
  | 'chapter3'
  | 'photo'
  | 'message';

type Path = 'quick' | 'detailed' | null;

function BackNav({ onBack, dark = false }: { onBack: () => void; dark?: boolean }) {
  const fg = dark ? '#FEFBF4' : '#2C1D07';
  const border = dark ? 'rgba(254, 251, 244, 0.2)' : '#2C1D07';
  return (
    <nav
      className="flex items-center justify-between px-5 py-3.5"
      style={{ borderBottom: `1.5px solid ${border}` }}
    >
      <button
        onClick={onBack}
        className="flex items-center gap-1 font-semibold text-sm"
        style={{ color: fg }}
      >
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        이전
      </button>
      <span
        className="text-xl font-bold tracking-tight"
        style={{ color: fg, fontFamily: "'PP Editorial Old', serif" }}
      >
        someonetheone
      </span>
      <div className="w-12" />
    </nav>
  );
}

async function api(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}/theone/survey${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export default function StartPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('chapter1');
  const [step, setStep] = useState(0);
  const [ch1Answers, setCh1Answers] = useState<string[]>([]);
  const [ch2Answers, setCh2Answers] = useState<string[]>([]);
  const [ch3Answers, setCh3Answers] = useState<string[]>([]);
  const [picky, setPicky] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [guestUid, setGuestUid] = useState<string | null>(null);
  const [path, setPath] = useState<Path>(null);
  const [mbti, setMbti] = useState<string[]>(['', '', '', '']);
  const [otherRegionInput, setOtherRegionInput] = useState(false);
  const [otherRegion, setOtherRegion] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [jobDetail, setJobDetail] = useState('');
  const [religionInput, setReligionInput] = useState(false);
  const [religion, setReligion] = useState('');
  const [selfDescriptions, setSelfDescriptions] = useState<string[]>([]);

  const questions =
    phase === 'chapter1' ? CHAPTER1_QUESTIONS
    : phase === 'chapter2' ? CHAPTER2_QUESTIONS
    : phase === 'chapter3' ? CHAPTER3_QUESTIONS
    : [];

  useEffect(() => { trackPageView('start'); }, []);

  async function ensureGuest(): Promise<string> {
    if (guestUid) return guestUid;
    const data = await api('/start', { method: 'POST' });
    setGuestUid(data.guest_uid);
    setTrackingGuestUid(data.guest_uid);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('sto_guest_uid', data.guest_uid);
    }
    return data.guest_uid;
  }

  function persistAnswer(question: string, answer: string) {
    ensureGuest()
      .then((uid) => {
        api(`/${uid}/answer`, {
          method: 'PATCH',
          body: JSON.stringify({ question, answer }),
        }).catch(() => {});
      })
      .catch(() => {});
    trackAnswer(question, answer, phase);
  }

  function advanceChapter2() {
    if (step + 1 >= CHAPTER2_QUESTIONS.length) {
      setPhase('intermission');
    } else {
      setStep((s) => s + 1);
    }
  }

  function handleSelect(value: string) {
    const q = questions[step];

    // 지역에서 "그 외 지역" 선택 시 입력 form으로 전환
    if (phase === 'chapter2' && q?.title.startsWith('어디쯤') && value === 'other_region') {
      setOtherRegionInput(true);
      return;
    }

    // 종교(이제 step 1)에서 "같은 종교였으면" 선택 시 입력 form으로 전환
    if (phase === 'chapter3' && step === 1 && value === 'same_religion') {
      setReligionInput(true);
      return;
    }

    persistAnswer(q.title.replace('\n', ' '), value);

    if (phase === 'chapter1') {
      setCh1Answers((p) => [...p, value]);
      if (step + 1 >= CHAPTER1_QUESTIONS.length) {
        setStep(0);
        setPhase('picky');
      } else {
        setStep((s) => s + 1);
      }
    } else if (phase === 'chapter2') {
      setCh2Answers((p) => [...p, value]);
      // 성별은 /loading 카드 분기에 사용 — sessionStorage에 저장
      if (step === 0 && (value === 'male' || value === 'female') && typeof window !== 'undefined') {
        sessionStorage.setItem('sto_user_gender', value);
      }
      advanceChapter2();
    } else if (phase === 'chapter3') {
      setCh3Answers((p) => [...p, value]);
      advanceChapter3FromStep(step);
    }
  }

  function handleMbtiPick(idx: number, letter: string) {
    const next = [...mbti];
    next[idx] = letter;
    setMbti(next);
    if (next.every((l) => l)) {
      const combined = next.join('');
      persistAnswer('MBTI가 뭐야?', combined);
      setCh2Answers((p) => [...p, combined]);
      advanceChapter2();
    }
  }

  function handleMbtiUnknown() {
    persistAnswer('MBTI가 뭐야?', 'unknown');
    setCh2Answers((p) => [...p, 'unknown']);
    advanceChapter2();
  }

  function handleAgeSubmit() {
    const n = parseInt(age, 10);
    if (!n || n < 14 || n > 99) return;
    persistAnswer('나이가 어떻게 돼?', String(n));
    setCh2Answers((p) => [...p, String(n)]);
    advanceChapter2();
  }

  function handleHeightSubmit() {
    const n = parseInt(height, 10);
    if (!n || n < 130 || n > 220) return;
    persistAnswer('키가 어떻게 돼?', String(n));
    setCh2Answers((p) => [...p, String(n)]);
    advanceChapter2();
  }

  // chapter2 직업 인덱스 (CHAPTER2_QUESTIONS에서 "무슨 일 해?" 위치)
  const occupationIdx = CHAPTER2_QUESTIONS.findIndex((q) => q.title.startsWith('무슨 일'));

  function shouldSkipChapter3(idx: number): boolean {
    const q = CHAPTER3_QUESTIONS[idx];
    if (!q) return false;
    if (q.type === 'job') {
      const occ = ch2Answers[occupationIdx];
      return occ === 'student';
    }
    return false;
  }

  function advanceChapter3FromStep(s: number) {
    let next = s + 1;
    while (next < CHAPTER3_QUESTIONS.length && shouldSkipChapter3(next)) {
      next++;
    }
    if (next >= CHAPTER3_QUESTIONS.length) {
      setPhase('photo');
    } else {
      setStep(next);
    }
  }

  function handleJobSubmit() {
    const trimmed = jobDetail.trim();
    if (!trimmed) return;
    persistAnswer('직업이 정확히 뭐야?', trimmed);
    setCh3Answers((p) => [...p, trimmed]);
    advanceChapter3FromStep(step);
  }

  function handleOtherRegionSubmit() {
    const trimmed = otherRegion.trim();
    if (!trimmed) return;
    const value = `other_region:${trimmed}`;
    persistAnswer('어디쯤 살아?', value);
    setCh2Answers((p) => [...p, value]);
    setOtherRegionInput(false);
    advanceChapter2();
  }

  function handleSelfDescPick(value: string) {
    if (selfDescriptions.includes(value)) {
      setSelfDescriptions((p) => p.filter((v) => v !== value));
      return;
    }
    if (selfDescriptions.length >= 3) return;
    const next = [...selfDescriptions, value];
    setSelfDescriptions(next);
    if (next.length === 3) {
      const combined = next.join(',');
      const q = questions[step];
      persistAnswer(q.title.replace('\n', ' '), combined);
      setCh3Answers((p) => [...p, combined]);
      advanceChapter3FromStep(step);
    }
  }

  function handleReligionSubmit() {
    const trimmed = religion.trim();
    if (!trimmed) return;
    const value = `same_religion:${trimmed}`;
    persistAnswer('종교는 중요해?', value);
    setCh3Answers((p) => [...p, value]);
    setReligionInput(false);
    advanceChapter3FromStep(step);
  }

  function handleBack() {
    if (otherRegionInput) {
      setOtherRegionInput(false);
      return;
    }
    if (religionInput) {
      setReligionInput(false);
      return;
    }
    if (phase === 'chapter1' && step > 0) {
      setStep((s) => s - 1);
      setCh1Answers((p) => p.slice(0, -1));
    } else if (phase === 'picky') {
      setPhase('chapter1');
      setStep(CHAPTER1_QUESTIONS.length - 1);
      setCh1Answers((p) => p.slice(0, -1));
    } else if (phase === 'bridge') {
      setPhase('picky');
    } else if (phase === 'chapter2' && step > 0) {
      const prev = CHAPTER2_QUESTIONS[step - 1];
      if (prev?.type === 'mbti') {
        setMbti(['', '', '', '']);
      } else if (prev?.type === 'age') {
        setAge('');
      } else if (prev?.type === 'height') {
        setHeight('');
      }
      setStep((s) => s - 1);
      setCh2Answers((p) => p.slice(0, -1));
    } else if (phase === 'chapter2' && step === 0) {
      setPhase('bridge');
    } else if (phase === 'intermission') {
      setPhase('chapter2');
      setStep(CHAPTER2_QUESTIONS.length - 1);
      setCh2Answers((p) => p.slice(0, -1));
    } else if (phase === 'chapter3' && step > 0) {
      let prev = step - 1;
      while (prev > 0 && shouldSkipChapter3(prev)) {
        prev--;
      }
      setStep(prev);
      setCh3Answers((p) => p.slice(0, -1));
      setSelfDescriptions([]);
      setJobDetail('');
    } else if (phase === 'chapter3' && step === 0) {
      setPhase('intermission');
    } else if (phase === 'photo') {
      if (path === 'detailed') {
        let prev = CHAPTER3_QUESTIONS.length - 1;
        while (prev > 0 && shouldSkipChapter3(prev)) {
          prev--;
        }
        setPhase('chapter3');
        setStep(prev);
        setCh3Answers((p) => p.slice(0, -1));
      } else {
        setPhase('intermission');
      }
    } else if (phase === 'message') {
      setPhase('photo');
    }
  }

  function handlePickySubmit() {
    if (picky.trim() && guestUid) {
      api(`/${guestUid}/answer`, {
        method: 'PATCH',
        body: JSON.stringify({ question: '까다로운 기준', answer: picky.trim() }),
      }).catch(() => {});
    }
    trackPicky(picky.trim());
    setPhase('bridge');
  }

  function handleStartChapter2() {
    setStep(0);
    setCh2Answers([]);
    setMbti(['', '', '', '']);
    setAge('');
    setHeight('');
    setOtherRegion('');
    setOtherRegionInput(false);
    setPhase('chapter2');
  }

  function handlePathChoice(chosen: 'quick' | 'detailed') {
    setPath(chosen);
    if (guestUid) {
      api(`/${guestUid}/path`, {
        method: 'PATCH',
        body: JSON.stringify({ path: chosen }),
      }).catch(() => {});
    }
    trackAnswer('경로 선택', chosen, 'intermission');
    if (chosen === 'quick') {
      router.push('/loading');
    } else {
      setStep(0);
      setCh3Answers([]);
      setReligion('');
      setReligionInput(false);
      setSelfDescriptions([]);
      setJobDetail('');
      setPhase('chapter3');
    }
  }

  const fileInputRef = useRef<HTMLInputElement>(null);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handlePhotoSubmit() {
    if (photo && guestUid) {
      api(`/${guestUid}/photo`, {
        method: 'PATCH',
        body: JSON.stringify({ photo_data: photo }),
      }).catch(() => {});
    }
    trackPhoto();
    setPhase('message');
  }

  function handleMessageSubmit() {
    if (message.trim() && guestUid) {
      api(`/${guestUid}/answer`, {
        method: 'PATCH',
        body: JSON.stringify({ question: '나한테 하고 싶은 말', answer: message.trim() }),
      }).catch(() => {});
    }
    trackMessage(!!message.trim());
    router.push('/loading');
  }

  // ── Photo screen ──
  if (phase === 'photo') {
    return (
      <main
        className="min-h-screen flex flex-col"
        style={{ background: C.bg }}
      >
        <BackNav onBack={handleBack} />
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <h1
          className="font-bold text-center mb-3"
          style={{
            color: C.ink,
            fontSize: 'clamp(32px, 6vw, 48px)',
            lineHeight: '1.25',
            letterSpacing: '-0.5px',
          }}
        >
          마지막!
          <br />
          <span style={{ color: C.accent }}>사진 한 장</span>
        </h1>
        <p className="text-center text-base mb-8 opacity-70 max-w-sm" style={{ color: C.ink }}>
          네 허락 없이 절대 공개 안 해!
          <br />
          누군가 너와 비슷한 스타일을 찾는다면,
          <br />
          너에게 알려줄게
        </p>

        {photo ? (
          <div className="mb-6">
            <img
              src={photo}
              alt="업로드한 사진"
              className="w-40 h-40 rounded-2xl object-cover"
              style={{ border: `2px solid ${C.ink}` }}
            />
          </div>
        ) : null}

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-2xl transition-all hover:-translate-y-0.5"
            style={{
              color: C.ink,
              background: '#FFFFFF',
              border: `2px solid ${C.ink}`,
              boxShadow: `3px 3px 0 ${C.ink}`,
            }}
          >
            {photo ? (
              <div className="flex items-center justify-center px-5 py-4 font-semibold text-base">
                다른 사진 선택
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 px-5 py-7">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span className="font-bold text-base">사진 올리기</span>
                <span
                  className="text-xs font-semibold"
                  style={{ color: C.accent }}
                >
                  사진 올리면 매칭률이 6.8배 올라가!
                </span>
              </div>
            )}
          </button>
          <button
            onClick={handlePhotoSubmit}
            className="w-full px-5 py-4 rounded-full font-bold text-base hover:-translate-y-0.5 transition-transform"
            style={{
              color: C.ink,
              background: C.gold,
              border: `2px solid ${C.ink}`,
              boxShadow: `4px 4px 0 ${C.ink}`,
            }}
          >
            {photo ? '완료' : '나중에 할게'}
          </button>
        </div>
        </div>
      </main>
    );
  }

  // ── Message screen ──
  if (phase === 'message') {
    return (
      <main
        className="min-h-screen flex flex-col"
        style={{ background: C.bg }}
      >
        <BackNav onBack={handleBack} />
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <h1
          className="font-bold text-center mb-3"
          style={{
            color: C.ink,
            fontSize: 'clamp(32px, 6vw, 48px)',
            lineHeight: '1.25',
            letterSpacing: '-0.5px',
          }}
        >
          마지막으로,
        </h1>
        <p className="text-center text-lg mb-8 opacity-70" style={{ color: C.ink }}>
          나한테 하고 싶은 말 있어?
        </p>

        <div className="w-full max-w-md flex flex-col gap-4">
          <div className="relative">
            <textarea
              value={message}
              onChange={(e) => {
                if (e.target.value.length <= 2000) setMessage(e.target.value);
              }}
              placeholder="편하게 써줘 (선택)"
              rows={5}
              className="w-full px-5 py-4 rounded-2xl text-base font-medium outline-none transition-shadow focus:shadow-lg resize-none"
              style={{
                color: C.ink,
                background: '#FFFFFF',
                border: `2px solid ${C.ink}`,
              }}
            />
            <span
              className="absolute bottom-3 right-4 text-xs"
              style={{ color: C.ink, opacity: 0.4 }}
            >
              {message.length} / 2,000
            </span>
          </div>
          <button
            onClick={handleMessageSubmit}
            className="w-full px-5 py-4 rounded-full font-bold text-base hover:-translate-y-0.5 transition-transform"
            style={{
              color: C.ink,
              background: C.gold,
              border: `2px solid ${C.ink}`,
              boxShadow: `4px 4px 0 ${C.ink}`,
            }}
          >
            {message.trim() ? '보내기' : '괜찮아, 넘어갈게'}
          </button>
        </div>
        </div>
      </main>
    );
  }

  // ── Picky screen ──
  if (phase === 'picky') {
    return (
      <main
        className="min-h-screen flex flex-col"
        style={{ background: C.bg }}
      >
        <BackNav onBack={handleBack} />
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <h1
          className="font-bold text-center whitespace-pre-line mb-3"
          style={{
            color: C.ink,
            fontSize: 'clamp(32px, 6vw, 48px)',
            lineHeight: '1.25',
            letterSpacing: '-0.5px',
          }}
        >
          말하기 힘든{'\n'}
          <span style={{ color: C.accent }}>나만의 까다로운 기준</span>이{'\n'}있다면?
        </h1>
        <p className="text-center text-base mb-8 opacity-70" style={{ color: C.ink }}>
          한 줄만 적어도 매칭 정확도가 2.5배 올라가!
        </p>

        <div className="w-full max-w-md flex flex-col gap-4">
          <textarea
            value={picky}
            onChange={(e) => {
              if (e.target.value.length <= 500) setPicky(e.target.value);
            }}
            placeholder="예: 함께 책 이야기를 하는 사람이 좋아"
            rows={4}
            className="w-full px-5 py-4 rounded-2xl text-base font-medium outline-none transition-shadow focus:shadow-lg resize-none"
            style={{
              color: C.ink,
              background: '#FFFFFF',
              border: `2px solid ${C.ink}`,
            }}
          />
          <button
            onClick={handlePickySubmit}
            className="w-full px-5 py-4 rounded-full font-bold text-base hover:-translate-y-0.5 transition-transform"
            style={{
              color: C.ink,
              background: C.gold,
              border: `2px solid ${C.ink}`,
              boxShadow: `4px 4px 0 ${C.ink}`,
            }}
          >
            {picky.trim() ? '다음' : '딱히 없어'}
          </button>
        </div>
        </div>
      </main>
    );
  }

  // ── Bridge screen ──
  if (phase === 'bridge') {
    return (
      <main
        className="min-h-screen flex flex-col"
        style={{ background: C.dark, color: C.bg }}
      >
        <BackNav onBack={handleBack} dark />
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <h1
          className="font-bold text-center mb-6"
          style={{
            fontSize: 'clamp(36px, 7vw, 56px)',
            lineHeight: '1.25',
            letterSpacing: '-0.5px',
          }}
        >
          고마워!
        </h1>
        <p
          className="text-center text-lg sm:text-xl mb-12 leading-relaxed"
          style={{ color: C.gold }}
        >
          너에 대해서도
          <br />
          좀 더 자세히 물어봐도 돼?
        </p>
        <button
          onClick={handleStartChapter2}
          className="inline-flex items-center px-10 py-4 rounded-full font-bold text-lg hover:-translate-y-0.5 transition-transform"
          style={{
            background: C.gold,
            color: C.ink,
            border: `2px solid ${C.gold}`,
            boxShadow: `5px 5px 0 ${C.ink}`,
          }}
        >
          좋아, 물어봐
        </button>
        </div>
      </main>
    );
  }

  // ── Intermission screen ──
  if (phase === 'intermission') {
    return (
      <main
        className="min-h-screen flex flex-col"
        style={{ background: C.bg }}
      >
        <nav
          className="flex items-center justify-between px-5 py-3.5"
          style={{ borderBottom: `1.5px solid ${C.ink}` }}
        >
          <button
            onClick={handleBack}
            className="flex items-center gap-1 font-semibold text-sm"
            style={{ color: C.ink }}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            이전
          </button>
          <span
            className="text-xl font-bold tracking-tight"
            style={{ color: C.ink, fontFamily: "'PP Editorial Old', serif" }}
          >
            someonetheone
          </span>
          <div className="w-12" />
        </nav>

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <h1
              className="font-bold whitespace-pre-line mb-3"
              style={{
                color: C.ink,
                fontSize: 'clamp(32px, 6vw, 48px)',
                lineHeight: '1.25',
                letterSpacing: '-0.5px',
              }}
            >
              이제{'\n'}
              <span style={{ color: C.accent }}>매칭 가능해!</span>
            </h1>
            <p className="mb-10 opacity-70 text-base" style={{ color: C.ink }}>
              더 정확하게 매칭하려면
              <br />
              조금만 더 답해줄래?
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handlePathChoice('quick')}
                className="w-full text-left px-5 py-4 rounded-2xl font-semibold text-base transition-all hover:-translate-y-0.5"
                style={{
                  color: C.ink,
                  background: '#FFFFFF',
                  border: `2px solid ${C.ink}`,
                  boxShadow: `3px 3px 0 ${C.ink}`,
                }}
              >
                <div className="flex items-center justify-between">
                  <span>빠른 매칭 결과 보기</span>
                  <span className="text-xs opacity-60">78% 정확도</span>
                </div>
              </button>
              <button
                onClick={() => handlePathChoice('detailed')}
                className="w-full text-left px-6 py-5 rounded-2xl font-bold text-lg transition-all hover:-translate-y-0.5 relative"
                style={{
                  color: C.ink,
                  background: C.gold,
                  border: `2px solid ${C.ink}`,
                  boxShadow: `4px 4px 0 ${C.ink}`,
                }}
              >
                <span
                  className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{
                    background: C.accent,
                    color: '#FFFFFF',
                    border: `2px solid ${C.ink}`,
                  }}
                >
                  추천
                </span>
                <div className="flex items-center justify-between">
                  <span>
                    더 정확하게 매칭하기{' '}
                    <span className="opacity-60 text-xs font-medium">+1분</span>
                  </span>
                  <span className="text-sm opacity-70 font-semibold">95% 정확도</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ── Question step (chapter1 / chapter2 / chapter3) ──
  const currentQ = questions[step];
  const isMbtiStep = phase === 'chapter2' && currentQ?.type === 'mbti';
  const isAgeStep = phase === 'chapter2' && currentQ?.type === 'age';
  const isHeightStep = phase === 'chapter2' && currentQ?.type === 'height';
  const isMultiStep = phase === 'chapter3' && currentQ?.type === 'multi';
  const isJobStep = phase === 'chapter3' && currentQ?.type === 'job';
  const isOtherRegionStep = phase === 'chapter2' && currentQ?.title.startsWith('어디쯤') && otherRegionInput;
  const isReligionStep = phase === 'chapter3' && step === 1 && religionInput;

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ background: C.bg }}
    >
      <nav
        className="flex items-center justify-between px-5 py-3.5"
        style={{ borderBottom: `1.5px solid ${C.ink}` }}
      >
        {(step > 0 || phase === 'chapter2' || phase === 'chapter3') ? (
          <button
            onClick={handleBack}
            className="flex items-center gap-1 font-semibold text-sm"
            style={{ color: C.ink }}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            이전
          </button>
        ) : (
          <Link href="/" className="font-semibold text-sm" style={{ color: C.ink }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        )}
        <span
          className="text-xl font-bold tracking-tight"
          style={{ color: C.ink, fontFamily: "'PP Editorial Old', serif" }}
        >
          someonetheone
        </span>
        <div className="w-12" />
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {(phase === 'chapter1' || phase === 'chapter2' || phase === 'chapter3') ? (
          <div className="w-full max-w-md">
            <h1
              className="font-bold whitespace-pre-line mb-2"
              style={{
                color: C.ink,
                fontSize: 'clamp(32px, 6vw, 48px)',
                lineHeight: '1.25',
                letterSpacing: '-0.5px',
              }}
            >
              {isReligionStep ? '종교가\n뭐야?' : currentQ.title}
            </h1>
            <p className="mb-10 text-base" style={{ color: C.ink }}>
              <span className="opacity-60">
                {isReligionStep ? '편하게 적어줘' : currentQ.subtitle}
              </span>
              {isMultiStep && (
                <span className="ml-2 font-bold" style={{ color: C.accent }}>
                  {selfDescriptions.length} / 3
                </span>
              )}
            </p>

            {isReligionStep ? (
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  value={religion}
                  onChange={(e) => {
                    if (e.target.value.length <= 30) setReligion(e.target.value);
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleReligionSubmit(); }}
                  placeholder="예: 기독교, 불교, 가톨릭..."
                  autoFocus
                  className="w-full px-5 py-4 rounded-2xl text-base font-medium outline-none transition-shadow focus:shadow-lg"
                  style={{
                    color: C.ink,
                    background: '#FFFFFF',
                    border: `2px solid ${C.ink}`,
                  }}
                />
                <button
                  onClick={handleReligionSubmit}
                  disabled={!religion.trim()}
                  className="w-full px-5 py-4 rounded-full font-bold text-base hover:-translate-y-0.5 transition-transform disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  style={{
                    color: C.ink,
                    background: C.gold,
                    border: `2px solid ${C.ink}`,
                    boxShadow: `4px 4px 0 ${C.ink}`,
                  }}
                >
                  다음
                </button>
              </div>
            ) : isAgeStep ? (
              <div className="flex flex-col gap-3">
                <input
                  type="number"
                  inputMode="numeric"
                  value={age}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 2);
                    setAge(v);
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAgeSubmit(); }}
                  placeholder="예: 26"
                  autoFocus
                  className="w-full px-5 py-5 rounded-2xl text-center font-bold outline-none transition-shadow focus:shadow-lg"
                  style={{
                    color: C.ink,
                    background: '#FFFFFF',
                    border: `2px solid ${C.ink}`,
                    fontSize: 'clamp(28px, 6vw, 36px)',
                  }}
                />
                <button
                  onClick={handleAgeSubmit}
                  disabled={!age || parseInt(age, 10) < 14 || parseInt(age, 10) > 99}
                  className="w-full px-5 py-4 rounded-full font-bold text-base hover:-translate-y-0.5 transition-transform disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  style={{
                    color: C.ink,
                    background: C.gold,
                    border: `2px solid ${C.ink}`,
                    boxShadow: `4px 4px 0 ${C.ink}`,
                  }}
                >
                  다음
                </button>
              </div>
            ) : isHeightStep ? (
              <div className="flex flex-col gap-3">
                <input
                  type="number"
                  inputMode="numeric"
                  value={height}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 3);
                    setHeight(v);
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleHeightSubmit(); }}
                  placeholder="예: 168"
                  autoFocus
                  className="w-full px-5 py-5 rounded-2xl text-center font-bold outline-none transition-shadow focus:shadow-lg"
                  style={{
                    color: C.ink,
                    background: '#FFFFFF',
                    border: `2px solid ${C.ink}`,
                    fontSize: 'clamp(28px, 6vw, 36px)',
                  }}
                />
                <button
                  onClick={handleHeightSubmit}
                  disabled={!height || parseInt(height, 10) < 130 || parseInt(height, 10) > 220}
                  className="w-full px-5 py-4 rounded-full font-bold text-base hover:-translate-y-0.5 transition-transform disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  style={{
                    color: C.ink,
                    background: C.gold,
                    border: `2px solid ${C.ink}`,
                    boxShadow: `4px 4px 0 ${C.ink}`,
                  }}
                >
                  다음
                </button>
              </div>
            ) : isOtherRegionStep ? (
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  value={otherRegion}
                  onChange={(e) => {
                    if (e.target.value.length <= 50) setOtherRegion(e.target.value);
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleOtherRegionSubmit(); }}
                  placeholder="예: 부산, 대구, 제주, 미국 LA..."
                  autoFocus
                  className="w-full px-5 py-4 rounded-2xl text-base font-medium outline-none transition-shadow focus:shadow-lg"
                  style={{
                    color: C.ink,
                    background: '#FFFFFF',
                    border: `2px solid ${C.ink}`,
                  }}
                />
                <button
                  onClick={handleOtherRegionSubmit}
                  disabled={!otherRegion.trim()}
                  className="w-full px-5 py-4 rounded-full font-bold text-base hover:-translate-y-0.5 transition-transform disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  style={{
                    color: C.ink,
                    background: C.gold,
                    border: `2px solid ${C.ink}`,
                    boxShadow: `4px 4px 0 ${C.ink}`,
                  }}
                >
                  다음
                </button>
              </div>
            ) : isJobStep ? (
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  value={jobDetail}
                  onChange={(e) => {
                    if (e.target.value.length <= 50) setJobDetail(e.target.value);
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleJobSubmit(); }}
                  placeholder="예: 마케팅 PM, 디자이너..."
                  autoFocus
                  className="w-full px-5 py-4 rounded-2xl text-base font-medium outline-none transition-shadow focus:shadow-lg"
                  style={{
                    color: C.ink,
                    background: '#FFFFFF',
                    border: `2px solid ${C.ink}`,
                  }}
                />
                <button
                  onClick={handleJobSubmit}
                  disabled={!jobDetail.trim()}
                  className="w-full px-5 py-4 rounded-full font-bold text-base hover:-translate-y-0.5 transition-transform disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  style={{
                    color: C.ink,
                    background: C.gold,
                    border: `2px solid ${C.ink}`,
                    boxShadow: `4px 4px 0 ${C.ink}`,
                  }}
                >
                  다음
                </button>
              </div>
            ) : isMultiStep ? (
              <div>
                <div className="grid grid-cols-2 gap-3">
                  {currentQ.options?.map((opt) => {
                    const selected = selfDescriptions.includes(opt.value);
                    const disabled = !selected && selfDescriptions.length >= 3;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => handleSelfDescPick(opt.value)}
                        disabled={disabled}
                        className="px-4 py-4 rounded-2xl font-semibold text-base transition-all hover:-translate-y-0.5 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                        style={{
                          color: selected ? '#FFFFFF' : C.ink,
                          background: selected ? C.ink : '#FFFFFF',
                          border: `2px solid ${C.ink}`,
                          boxShadow: selected ? 'none' : `3px 3px 0 ${C.ink}`,
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : isMbtiStep ? (
              <div className="flex flex-col gap-4">
                {MBTI_PAIRS.map(([a, b], idx) => (
                  <div key={idx} className="flex gap-3">
                    {[a, b].map((letter) => {
                      const selected = mbti[idx] === letter;
                      return (
                        <button
                          key={letter}
                          onClick={() => handleMbtiPick(idx, letter)}
                          className="flex-1 px-5 py-5 rounded-2xl font-bold text-2xl transition-all hover:-translate-y-0.5"
                          style={{
                            color: selected ? '#FFFFFF' : C.ink,
                            background: selected ? C.ink : '#FFFFFF',
                            border: `2px solid ${C.ink}`,
                            boxShadow: selected ? 'none' : `3px 3px 0 ${C.ink}`,
                          }}
                        >
                          {letter}
                        </button>
                      );
                    })}
                  </div>
                ))}
                <button
                  onClick={handleMbtiUnknown}
                  className="mt-3 text-sm font-semibold underline opacity-60"
                  style={{ color: C.ink }}
                >
                  잘 모르겠어
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {currentQ.options?.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className="w-full text-left px-5 py-4 rounded-2xl font-semibold text-base transition-all hover:-translate-y-0.5 active:translate-y-0"
                    style={{
                      color: C.ink,
                      background: '#FFFFFF',
                      border: `2px solid ${C.ink}`,
                      boxShadow: `3px 3px 0 ${C.ink}`,
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </main>
  );
}
