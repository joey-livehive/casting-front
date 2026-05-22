'use client';

import { Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  trackPageView,
  trackAnswer,
  trackPhoto,
  trackMessage,
  setGuestUid as setTrackingGuestUid,
} from '../../lib/tracking';
import { castingFetch, setCastingSession } from '@/lib/casting/api';

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
  type?: 'choice' | 'mbti' | 'age' | 'height' | 'job';
  options?: { label: string; value: string }[];
  // 성별에 따라 옵션이 달라지는 경우 (이상형 키·체형, 본인 체형 등)
  optionsByGender?: {
    male: { label: string; value: string }[];
    female: { label: string; value: string }[];
  };
}

const RELIGION_SELF_OPTIONS = [
  { label: '없어', value: 'none' },
  { label: '기독교', value: 'christian' },
  { label: '천주교', value: 'catholic' },
  { label: '불교', value: 'buddhist' },
  { label: '기타', value: 'other_religion' },
];

// ── Chapter 1 — 기본 + 이상형 외형 (5문항) ──
const CHAPTER1_QUESTIONS: Question[] = [
  {
    title: '반가워!\n성별이 어떻게 돼?',
    subtitle: '',
    options: [
      { label: '남자', value: 'male' },
      { label: '여자', value: 'female' },
    ],
  },
  {
    title: '어떤 사람이\n끌려?',
    subtitle: '생각하지 말고, 바로 골라봐',
    options: [
      { label: "'외모'가 수려한 사람", value: 'appearance' },
      { label: "'성격'이 좋은 사람", value: 'personality' },
      { label: "'능력'을 가진 사람", value: 'competence' },
      { label: "'분위기' 좋은 사람", value: 'vibe' },
    ],
  },
  {
    title: '상대 나이는\n어느 정도?',
    subtitle: '상대방 선호 나이대',
    optionsByGender: {
      // 남자 → 연하 우선
      male: [
        { label: '연하가 좋아', value: 'younger' },
        { label: '연상이 좋아', value: 'older' },
        { label: '동갑이나 또래가 좋아', value: 'same_age' },
        { label: '상관 없어', value: 'any_age' },
      ],
      // 여자 → 연상 우선
      female: [
        { label: '연상이 좋아', value: 'older' },
        { label: '연하가 좋아', value: 'younger' },
        { label: '동갑이나 또래가 좋아', value: 'same_age' },
        { label: '상관 없어', value: 'any_age' },
      ],
    },
  },
  {
    title: '키는\n어느 정도?',
    subtitle: '선호하는 상대의 키',
    optionsByGender: {
      // 남자 → 여자 키
      male: [
        { label: '보통이 좋아 (156~165cm)', value: 'pref_female_height_156_165' },
        { label: '아담해야 돼 (155cm 이하)', value: 'pref_female_height_155_or_less' },
        { label: '큰 게 좋아 (167cm~)', value: 'pref_female_height_167_plus' },
        { label: '상관없어', value: 'any_height' },
      ],
      // 여자 → 남자 키
      female: [
        { label: '키 커야 돼 (180cm~)', value: 'pref_male_height_180_plus' },
        { label: '보통 이상이면 돼 (172cm~)', value: 'pref_male_height_172_plus' },
        { label: '상관없어', value: 'any_height' },
      ],
    },
  },
  {
    title: '체형은\n어땠음 해?',
    subtitle: '선호하는 상대의 체형',
    optionsByGender: {
      // 남자 → 여자 체형
      male: [
        { label: '글래머러스가 좋아', value: 'pref_female_glamorous' },
        { label: '마른 게 좋아', value: 'pref_female_slim' },
        { label: '보통이면 돼', value: 'pref_female_average' },
        { label: '상관 없어', value: 'any_body' },
      ],
      // 여자 → 남자 체형
      female: [
        { label: '근육 탄탄해야 돼', value: 'pref_male_muscular' },
        { label: '보통이면 돼', value: 'pref_male_average' },
        { label: '스키니한 게 좋아', value: 'pref_male_slim' },
        { label: '상관 없어', value: 'any_body' },
      ],
    },
  },
];

// ── Chapter 2 — 관계·라이프 선호 + 거주지 (9문항, 종교 분기 +1 / 시·도 자유입력) ──
const CHAPTER2_QUESTIONS: Question[] = [
  {
    title: '얼마나 자주\n만나고 싶어?',
    subtitle: '연애할 때 기준',
    options: [
      { label: '주 1~2번', value: 'weekly_1_2' },
      { label: '주 3~4번', value: 'weekly_3_4' },
      { label: '거의 매일', value: 'daily_meet' },
      { label: '상황 따라 유연하게', value: 'flexible_meet' },
    ],
  },
  {
    title: '연락은\n얼마나 자주가 좋아?',
    subtitle: '',
    options: [
      { label: '2~3시간 간격', value: 'contact_2_3h' },
      { label: '수시로 했으면', value: 'contact_anytime' },
      { label: '하루에 통화 1~2번', value: 'contact_1_2_day' },
      { label: '연락 잘 안 해도 편한 사이가 좋아', value: 'contact_relaxed' },
    ],
  },
  {
    title: '어떤 데이트가\n좋아?',
    subtitle: '끌리는 거 하나만',
    options: [
      { label: '카페·영화·문화', value: 'culture' },
      { label: '집에서 편하게', value: 'home' },
      { label: '액티비티·야외', value: 'outdoor' },
      { label: '술자리·핫플', value: 'nightlife' },
    ],
  },
  {
    title: '넌 지금\n얼마나 진지해?',
    subtitle: '어떤 만남을 원하는지',
    options: [
      { label: '진지한 연애 원해', value: 'serious_dating' },
      { label: '일단 대화부터 할래', value: 'casual_chat' },
      { label: '부담없이 가볍게 만나고 싶어', value: 'casual_meet' },
    ],
  },
  {
    title: '연인이\n술 마시는 건 어때?',
    subtitle: '',
    options: [
      { label: '상관없어', value: 'pref_drink_any' },
      { label: '가끔이면 괜찮아', value: 'pref_drink_sometimes' },
      { label: '안 마셨음 해', value: 'pref_drink_no' },
    ],
  },
  {
    title: '연인이\n담배 피운다면?',
    subtitle: '',
    options: [
      { label: '괜찮아', value: 'pref_smoke_ok' },
      { label: '가능하지만 선호하진 않아', value: 'pref_smoke_meh' },
      { label: '흡연자는 안돼', value: 'pref_smoke_no' },
    ],
  },
  {
    title: '상대 종교는\n중요해?',
    subtitle: '',
    options: [
      { label: '상관 없어', value: 'pref_any_religion' },
      { label: '무교였으면 해', value: 'pref_no_religion' },
      { label: '같은 종교이길 바라', value: 'pref_same_religion' },
    ],
  },
  {
    title: '상대와 거리는\n어디까지?',
    subtitle: '',
    options: [
      { label: '완전 가까웠으면 해', value: 'very_near' },
      { label: '같은 도시면 괜찮아', value: 'same_city' },
      { label: '장거리도 좋아', value: 'long_distance' },
    ],
  },
  {
    title: '넌 어디쯤\n사는데?',
    subtitle: '',
    options: [
      { label: '서울', value: 'seoul' },
      { label: '경기', value: 'gyeonggi' },
      { label: '인천', value: 'incheon' },
      { label: '부산', value: 'busan' },
      { label: '그 외 지역', value: 'other_region' },
    ],
  },
];

// ── Chapter 3 — 본인 스펙 (9문항, 학생이면 직업 디테일 SKIP) ──
const CHAPTER3_QUESTIONS: Question[] = [
  {
    title: '넌 나이가\n어떻게 돼?',
    subtitle: '숫자로 입력해줘',
    type: 'age',
  },
  {
    title: '키가\n어떻게 돼?',
    subtitle: 'cm로 입력해줘',
    type: 'height',
  },
  {
    title: '네 체형을\n알려줘',
    subtitle: '',
    optionsByGender: {
      male: [
        { label: '마른 편', value: 'self_slim' },
        { label: '보통', value: 'self_average' },
        { label: '근육 탄탄', value: 'self_muscular' },
        { label: '통통한 편', value: 'self_chubby' },
      ],
      female: [
        { label: '슬림한 편', value: 'self_slim' },
        { label: '보통', value: 'self_average' },
        { label: '글래머', value: 'self_glamorous' },
        { label: '통통한 편', value: 'self_chubby' },
      ],
    },
  },
  {
    title: '넌\n담배 피워?',
    subtitle: '',
    options: [
      { label: '안 피워', value: 'no_smoke' },
      { label: '가끔 피워', value: 'sometimes_smoke' },
      { label: '많이 피워', value: 'heavy_smoke' },
    ],
  },
  {
    title: '술은\n자주 마셔?',
    subtitle: '',
    options: [
      { label: '자주 마셔', value: 'often_drink' },
      { label: '가끔 마셔', value: 'sometimes_drink' },
      { label: '거의 안 마셔', value: 'rarely_drink' },
    ],
  },
  {
    title: 'MBTI\n뭐야?',
    subtitle: '모르면 건너뛰어도 돼',
    type: 'mbti',
  },
  {
    title: '넌\n어떤 일 해?',
    subtitle: '대략적으로',
    options: [
      { label: '학생', value: 'student' },
      { label: '회사원', value: 'office' },
      { label: '전문직', value: 'professional' },
      { label: '공직', value: 'public' },
      { label: '사업/프리랜서', value: 'freelance' },
      { label: '기타', value: 'other_job' },
    ],
  },
  // 학생이면 SKIP
  {
    title: '직업이 정확히\n뭐야?',
    subtitle: '예: 마케팅 PM, 디자이너...',
    type: 'job',
  },
  {
    title: '연소득은\n얼마야?',
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

// ── 정적 step 인덱스 (분기 로직에서 step 매칭 용) ──
const RELIGION_STEP_IDX = CHAPTER2_QUESTIONS.findIndex(
  (q) => q.options?.some((o) => o.value === 'pref_any_religion'),
);
const SIDO_STEP_IDX = CHAPTER2_QUESTIONS.findIndex(
  (q) => q.options?.some((o) => o.value === 'seoul'),
);
const OCCUPATION_STEP_IDX = CHAPTER3_QUESTIONS.findIndex(
  (q) => q.options?.some((o) => o.value === 'student'),
);

type Phase =
  | 'chapter1'
  | 'intermission1'
  | 'chapter2'
  | 'intermission2'
  | 'chapter3'
  | 'photo'
  | 'message';

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
        casting
      </span>
      <div className="w-12" />
    </nav>
  );
}

async function api(path: string, options?: RequestInit) {
  const method = (options?.method || 'GET').toUpperCase();
  const body = options?.body ? JSON.parse(options.body as string) : undefined;

  if (path === '/start') {
    return castingFetch('/casting/guests/start', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({}),
    });
  }
  let m = path.match(/^\/([^/]+)\/answer$/);
  if (m && method === 'PATCH') {
    const uid = m[1];
    return castingFetch(`/casting/guests/${uid}/answer`, {
      method: 'PATCH',
      body: JSON.stringify({ key: body?.question, value: body?.answer }),
    });
  }
  m = path.match(/^\/([^/]+)\/photo$/);
  if (m && method === 'PATCH') {
    const uid = m[1];
    return castingFetch(`/casting/guests/${uid}/photo`, {
      method: 'PATCH',
      body: JSON.stringify({ value: body?.photo_data }),
    });
  }
  throw new Error(`Unsupported casting api path: ${path} (${method})`);
}

function StartPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get('inviteToken');
  const inviteChannel = searchParams.get('inviteChannel') === 'caster' ? 'caster' : 'instagram';
  const isInviteFlow = Boolean(inviteToken);
  const [phase, setPhase] = useState<Phase>('chapter1');
  const [step, setStep] = useState(0);
  const [ch1Answers, setCh1Answers] = useState<string[]>([]);
  const [ch2Answers, setCh2Answers] = useState<string[]>([]);
  const [ch3Answers, setCh3Answers] = useState<string[]>([]);
  const [photo, setPhoto] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [guestUid, setGuestUid] = useState<string | null>(null);
  const guestPromiseRef = useRef<Promise<string> | null>(null);
  const answerWriteRef = useRef<Promise<void>>(Promise.resolve());
  const [mbti, setMbti] = useState<string[]>(['', '', '', '']);
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [jobDetail, setJobDetail] = useState('');
  // 시·도 "그 외 지역" 선택 시 자유 입력 모드
  const [otherRegionInput, setOtherRegionInput] = useState(false);
  const [otherRegion, setOtherRegion] = useState('');
  // 종교 분기 sub-step: 'pref' = 이상형 종교 선호, 'self' = 본인 종교 5지선다, 'other' = 본인 종교 자유 입력
  const [religionSubStep, setReligionSubStep] = useState<'pref' | 'self' | 'other'>('pref');
  const [religionOther, setReligionOther] = useState('');
  // 본인 종교 답변 (ch2Answers와 별도로 보관 — 같은 step에 pref/self 둘 다 필요)
  const [religionSelfAnswer, setReligionSelfAnswer] = useState<string | null>(null);

  const questions =
    phase === 'chapter1' ? CHAPTER1_QUESTIONS
    : phase === 'chapter2' ? CHAPTER2_QUESTIONS
    : phase === 'chapter3' ? CHAPTER3_QUESTIONS
    : [];

  useEffect(() => { trackPageView('start'); }, []);

  const ensureGuest = useCallback((): Promise<string> => {
    if (guestUid) return Promise.resolve(guestUid);
    if (!guestPromiseRef.current) {
      const guestRequest = inviteToken
        ? castingFetch(`/casting/invites/${encodeURIComponent(inviteToken)}/open`, {
            method: 'POST',
            auth: false,
          })
        : api('/start', { method: 'POST' });
      guestPromiseRef.current = guestRequest.then((data: any) => {
        setGuestUid(data.guest_uid);
        setTrackingGuestUid(data.guest_uid);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('sto_guest_uid', data.guest_uid);
          if (inviteToken) {
            sessionStorage.setItem('casting_invite_token', inviteToken);
            sessionStorage.setItem('casting_invite_channel', inviteChannel);
          }
        }
        if (data.access_token) {
          setCastingSession(data.guest_uid, data.access_token);
        }
        return data.guest_uid as string;
      });
    }
    return guestPromiseRef.current;
  }, [guestUid, inviteChannel, inviteToken]);

  function saveAnswer(question: string, answer: string): Promise<void> {
    const write = answerWriteRef.current
      .catch(() => undefined)
      .then(async () => {
        const uid = await ensureGuest();
        await api(`/${uid}/answer`, {
          method: 'PATCH',
          body: JSON.stringify({ question, answer }),
        });
      })
      .catch(() => undefined);
    answerWriteRef.current = write;
    return write;
  }

  function persistAnswer(question: string, answer: string) {
    saveAnswer(question, answer);
    trackAnswer(question, answer, phase);
  }

  // 답변을 step 인덱스에 저장 (이미 있으면 덮어쓰기). 뒤로 가도 답변 유지됨
  function setAnswerAt(ch: 1 | 2 | 3, idx: number, value: string) {
    const setter = ch === 1 ? setCh1Answers : ch === 2 ? setCh2Answers : setCh3Answers;
    setter((p) => {
      const next = [...p];
      next[idx] = value;
      return next;
    });
  }

  function shouldSkipChapter3(idx: number, answers: string[] = ch3Answers): boolean {
    const q = CHAPTER3_QUESTIONS[idx];
    if (!q) return false;
    if (q.type === 'job') {
      return answers[OCCUPATION_STEP_IDX] === 'student';
    }
    return false;
  }

  function advanceChapter2FromStep(s: number) {
    if (s + 1 >= CHAPTER2_QUESTIONS.length) {
      setPhase('intermission2');
    } else {
      setStep(s + 1);
    }
  }

  function advanceChapter3FromStep(s: number, answers: string[] = ch3Answers) {
    let next = s + 1;
    while (next < CHAPTER3_QUESTIONS.length && shouldSkipChapter3(next, answers)) {
      next++;
    }
    if (next >= CHAPTER3_QUESTIONS.length) {
      setPhase('photo');
    } else {
      setStep(next);
    }
  }

  // 입력형 step으로 돌아갈 때 input 상태 복원
  function restoreInputForStep(ch: 1 | 2 | 3, idx: number) {
    if (ch === 3) {
      const q = CHAPTER3_QUESTIONS[idx];
      const stored = ch3Answers[idx] || '';
      if (q?.type === 'mbti') {
        if (stored && stored.length === 4) setMbti([stored[0], stored[1], stored[2], stored[3]]);
        else setMbti(['', '', '', '']);
      } else if (q?.type === 'age') {
        setAge(stored);
      } else if (q?.type === 'height') {
        setHeight(stored);
      } else if (q?.type === 'job') {
        setJobDetail(stored);
      }
    }
  }

  function handleSelect(value: string) {
    const q = questions[step];

    // chapter2 종교 분기 (sub-step: pref → self → other)
    if (phase === 'chapter2' && step === RELIGION_STEP_IDX && religionSubStep === 'pref') {
      persistAnswer('상대 종교는 중요해?', value);
      setAnswerAt(2, step, value);
      if (value === 'pref_no_religion') {
        // 무교 선호 → 본인 종교 입력은 SKIP. 이전에 답했던 self 값은 무효화하고 백엔드도 동기화
        if (religionSelfAnswer !== null) {
          persistAnswer('넌 종교가 뭐야?', '');
          setReligionSelfAnswer(null);
          setReligionOther('');
        }
        setTimeout(() => advanceChapter2FromStep(step), 100);
      } else {
        // same/any → 본인 종교 5지선다 화면
        setTimeout(() => setReligionSubStep('self'), 100);
      }
      return;
    }
    if (phase === 'chapter2' && step === RELIGION_STEP_IDX && religionSubStep === 'self') {
      if (value === 'other_religion') {
        setReligionSubStep('other');
        return;
      }
      persistAnswer('넌 종교가 뭐야?', value);
      setReligionSelfAnswer(value);
      setTimeout(() => {
        setReligionSubStep('pref');
        advanceChapter2FromStep(step);
      }, 100);
      return;
    }

    persistAnswer(q.title.replace('\n', ' '), value);

    if (phase === 'chapter1') {
      setAnswerAt(1, step, value);
      // 성별은 /loading 카드 분기에 사용 — sessionStorage에 저장
      if (step === 0 && (value === 'male' || value === 'female') && typeof window !== 'undefined') {
        sessionStorage.setItem('sto_user_gender', value);
      }
      setTimeout(() => {
        if (step + 1 >= CHAPTER1_QUESTIONS.length) {
          setPhase('intermission1');
        } else {
          setStep((s) => s + 1);
        }
      }, 100);
    } else if (phase === 'chapter2') {
      // 시·도에서 "그 외 지역" 선택 → 자유 입력 모드로 전환
      if (step === SIDO_STEP_IDX && value === 'other_region') {
        setOtherRegionInput(true);
        return;
      }
      setAnswerAt(2, step, value);
      setTimeout(() => advanceChapter2FromStep(step), 100);
    } else if (phase === 'chapter3') {
      // 학생 분기는 ch3Answers를 즉시 봐야 하므로 nextAnswers를 advance에 직접 전달
      const nextAnswers = [...ch3Answers];
      nextAnswers[step] = value;
      setCh3Answers(nextAnswers);
      setTimeout(() => advanceChapter3FromStep(step, nextAnswers), 100);
    }
  }

  function handleMbtiPick(idx: number, letter: string) {
    const next = [...mbti];
    next[idx] = letter;
    setMbti(next);
    if (next.every((l) => l)) {
      const combined = next.join('');
      persistAnswer('MBTI 뭐야?', combined);
      setAnswerAt(3, step, combined);
      setTimeout(() => advanceChapter3FromStep(step), 200);
    }
  }

  function handleMbtiUnknown() {
    persistAnswer('MBTI 뭐야?', 'unknown');
    setAnswerAt(3, step, 'unknown');
    advanceChapter3FromStep(step);
  }

  function handleAgeSubmit() {
    const n = parseInt(age, 10);
    if (!n || n < 14 || n > 99) return;
    persistAnswer('넌 나이가 어떻게 돼?', String(n));
    setAnswerAt(3, step, String(n));
    advanceChapter3FromStep(step);
  }

  function handleHeightSubmit() {
    const n = parseInt(height, 10);
    if (!n || n < 130 || n > 220) return;
    persistAnswer('키가 어떻게 돼?', String(n));
    setAnswerAt(3, step, String(n));
    advanceChapter3FromStep(step);
  }

  function handleJobSubmit() {
    const trimmed = jobDetail.trim();
    if (!trimmed) return;
    persistAnswer('직업이 정확히 뭐야?', trimmed);
    setAnswerAt(3, step, trimmed);
    advanceChapter3FromStep(step);
  }

  function handleOtherRegionSubmit() {
    const trimmed = otherRegion.trim();
    if (!trimmed) return;
    const stored = `other_region:${trimmed}`;
    persistAnswer('어디쯤 살아?', stored);
    setAnswerAt(2, step, stored);
    setOtherRegionInput(false);
    advanceChapter2FromStep(step);
  }

  function handleReligionOtherSubmit() {
    const trimmed = religionOther.trim();
    if (!trimmed) return;
    const value = `other:${trimmed}`;
    persistAnswer('넌 종교가 뭐야?', value);
    setReligionSelfAnswer(value);
    setTimeout(() => {
      setReligionSubStep('pref');
      setReligionOther('');
      advanceChapter2FromStep(step);
    }, 100);
  }

  function handleBack() {
    // 시·도 "그 외 지역" 입력 모드 → 시·도 선택 화면으로 복귀
    if (phase === 'chapter2' && step === SIDO_STEP_IDX && otherRegionInput) {
      setOtherRegionInput(false);
      return;
    }
    // 종교 sub-step 안 → 한 단계 뒤로 (답변은 보존)
    if (phase === 'chapter2' && step === RELIGION_STEP_IDX && religionSubStep === 'other') {
      setReligionSubStep('self');
      return;
    }
    if (phase === 'chapter2' && step === RELIGION_STEP_IDX && religionSubStep === 'self') {
      setReligionSubStep('pref');
      return;
    }

    if (phase === 'chapter1' && step > 0) {
      setStep((s) => s - 1);
      return;
    }
    if (phase === 'intermission1') {
      setPhase('chapter1');
      setStep(CHAPTER1_QUESTIONS.length - 1);
      return;
    }
    if (phase === 'chapter2' && step > 0) {
      const target = step - 1;
      restoreInputForStep(2, target);
      // 종교 step으로 돌아가는 거면 sub-step pref로 (pref 답변 노출)
      if (target === RELIGION_STEP_IDX) setReligionSubStep('pref');
      setStep(target);
      return;
    }
    if (phase === 'chapter2' && step === 0) {
      setPhase('intermission1');
      return;
    }
    if (phase === 'intermission2') {
      const target = CHAPTER2_QUESTIONS.length - 1;
      restoreInputForStep(2, target);
      setPhase('chapter2');
      setStep(target);
      return;
    }
    if (phase === 'chapter3' && step > 0) {
      let prev = step - 1;
      while (prev > 0 && shouldSkipChapter3(prev)) {
        prev--;
      }
      restoreInputForStep(3, prev);
      setStep(prev);
      return;
    }
    if (phase === 'chapter3' && step === 0) {
      setPhase('intermission2');
      return;
    }
    if (phase === 'photo') {
      let prev = CHAPTER3_QUESTIONS.length - 1;
      while (prev > 0 && shouldSkipChapter3(prev)) {
        prev--;
      }
      restoreInputForStep(3, prev);
      setPhase('chapter3');
      setStep(prev);
      return;
    }
    if (phase === 'message') {
      setPhase('photo');
      return;
    }
  }

  function handleStartChapter2() {
    setStep(0);
    setCh2Answers([]);
    setReligionSubStep('pref');
    setReligionOther('');
    setReligionSelfAnswer(null);
    setOtherRegionInput(false);
    setOtherRegion('');
    setPhase('chapter2');
  }

  function handleStartChapter3() {
    setStep(0);
    setCh3Answers([]);
    setJobDetail('');
    setMbti(['', '', '', '']);
    setAge('');
    setHeight('');
    setPhase('chapter3');
  }

  // ── Photo handlers ──
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

  async function handleMessageSubmit() {
    if (message.trim()) {
      saveAnswer('나한테 하고 싶은 말', message.trim());
    }
    trackMessage(!!message.trim());
    if (isInviteFlow && inviteToken) {
      await answerWriteRef.current.catch(() => undefined);
      router.push(`/casting/${inviteChannel}/${encodeURIComponent(inviteToken)}?claim=1`);
      return;
    }
    router.push('/loading');
  }

  // ── Photo screen ──
  if (phase === 'photo') {
    return (
      <main
        className="min-h-screen flex flex-col relative"
        style={{ background: C.bg }}
      >
        {/* 헤더를 absolute로 띄워 콘텐츠 그룹이 화면(viewport) 세로 정중앙에 오도록 함 */}
        <div className="absolute top-0 inset-x-0 z-10">
          <BackNav onBack={handleBack} />
        </div>
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
            절대! 전체 공개되지 않아
            <br />
            너와 딱 맞는 사람 몇 명에게만 널 소개할게
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
                    매칭률이 9.8배 올라가
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
        <PhotoSocialToast />
      </main>
    );
  }

  // ── Message screen (까다로운 기준 흡수 placeholder) ──
  if (phase === 'message') {
    return (
      <main className="min-h-screen flex flex-col" style={{ background: C.bg }}>
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
            너에 대해
            <br />
            더 들려줄래?
          </h1>
          <p className="text-center text-lg mb-8 opacity-70" style={{ color: C.ink }}>
            너에 대해 소개해줄수록 매칭이 잘돼!
          </p>

          <div className="w-full max-w-md flex flex-col gap-4">
            <div className="relative">
              <textarea
                value={message}
                onChange={(e) => {
                  if (e.target.value.length <= 1000) setMessage(e.target.value);
                }}
                placeholder={
                  ch1Answers[0] === 'female'
                    ? '예) 주말엔 혼자 시간을 보내는 걸 즐겨! 집주변 산책을 특히 좋아해\n예) 첨엔 좀 낯가리는데 친해지면 진짜 잘 웃어\n예) 새로운 거 시도하는 걸 좋아해. 최근엔 기타 독학 중!'
                    : ch1Answers[0] === 'male'
                    ? '예) 운동 좋아해 요즘은 수영 열심히 다니는 중\n예) 말수 적은 편이지만 그래서 진국이라는 소리도 자주 들어\n예) 일 끝나면 넷플릭스 정주행 자주 해. 최근엔 드라마 굿플레이스 보는 중'
                    : '예) 평소 어떤 사람인지 편하게 들려줘!'
                }
                rows={6}
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
                {message.length} / 1,000
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

  // ── Intermission 1 (Chapter 1 → Chapter 2) ──
  if (phase === 'intermission1') {
    return (
      <main className="min-h-screen flex flex-col" style={{ background: C.dark, color: C.bg }}>
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
            우와, 빠른데?
          </h1>
          <p
            className="text-center text-lg sm:text-xl mb-12 leading-relaxed"
            style={{ color: C.gold }}
          >
            너에 대해
            <br />
            더 물어봐도 돼?
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
            오케이!
          </button>
        </div>
      </main>
    );
  }

  // ── Intermission 2 (Chapter 2 → Chapter 3) ──
  if (phase === 'intermission2') {
    return (
      <main className="min-h-screen flex flex-col" style={{ background: C.dark, color: C.bg }}>
        <BackNav onBack={handleBack} dark />
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <h1
            className="font-bold whitespace-pre-line text-center mb-6"
            style={{
              fontSize: 'clamp(36px, 7vw, 56px)',
              lineHeight: '1.25',
              letterSpacing: '-0.5px',
            }}
          >
            좋았어,{'\n'}마지막이야!
          </h1>
          <p
            className="text-center text-lg sm:text-xl mb-12 leading-relaxed"
            style={{ color: C.gold }}
          >
            딱 30초만
            <br />
            더 써보자
          </p>
          <button
            onClick={handleStartChapter3}
            className="inline-flex items-center px-10 py-4 rounded-full font-bold text-lg hover:-translate-y-0.5 transition-transform"
            style={{
              background: C.gold,
              color: C.ink,
              border: `2px solid ${C.gold}`,
              boxShadow: `5px 5px 0 ${C.ink}`,
            }}
          >
            오케이!
          </button>
        </div>
      </main>
    );
  }

  // ── Question step (chapter1 / chapter2 / chapter3) ──
  const currentQ = questions[step];
  const isMbtiStep = phase === 'chapter3' && currentQ?.type === 'mbti';
  const isAgeStep = phase === 'chapter3' && currentQ?.type === 'age';
  const isHeightStep = phase === 'chapter3' && currentQ?.type === 'height';
  const isJobStep = phase === 'chapter3' && currentQ?.type === 'job';
  const isSidoStep = phase === 'chapter2' && step === SIDO_STEP_IDX;
  const isReligionSelfStep = phase === 'chapter2' && step === RELIGION_STEP_IDX && religionSubStep === 'self';
  const isReligionOtherStep = phase === 'chapter2' && step === RELIGION_STEP_IDX && religionSubStep === 'other';

  // 종교 분기에서 헤드라인 동적 변경
  let displayTitle = currentQ?.title || '';
  let displaySubtitle = currentQ?.subtitle || '';
  if (isReligionSelfStep) {
    const prefAnswer = ch2Answers[RELIGION_STEP_IDX]; // 종교 step의 pref 답변
    displayTitle =
      prefAnswer === 'pref_same_religion'
        ? '넌 종교가\n뭐야?'
        : '넌 종교\n있어?';
    displaySubtitle = '';
  } else if (isReligionOtherStep) {
    displayTitle = '종교가\n뭐야?';
    displaySubtitle = '편하게 적어줘';
  } else if (isJobStep) {
    // 직업군 답변에 따라 예시 placeholder 동적 변경
    const occupation = ch3Answers[OCCUPATION_STEP_IDX];
    if (occupation === 'office') displaySubtitle = '예: 마케팅 PM, UX 디자이너, 백엔드 개발자...';
    else if (occupation === 'professional') displaySubtitle = '예: 변호사, 의사, 회계사, 약사...';
    else if (occupation === 'public') displaySubtitle = '예: 7급 공무원, 교사, 경찰관...';
    else if (occupation === 'freelance') displaySubtitle = '예: 카페 운영, 크리에이터, 일러스트레이터...';
    else if (occupation === 'other_job') displaySubtitle = '어떤 일인지 자세히 적어줘!';
  } else if (isSidoStep && otherRegionInput) {
    displaySubtitle = '자세히 알려줘!';
  }

  // 성별 분기 옵션: optionsByGender 있으면 ch1Answers[0]으로 분기
  const userGender = ch1Answers[0] === 'male' || ch1Answers[0] === 'female' ? ch1Answers[0] : null;
  const renderOptions = currentQ?.optionsByGender && userGender
    ? currentQ.optionsByGender[userGender]
    : currentQ?.options;

  return (
    <main className="min-h-screen flex flex-col" style={{ background: C.bg }}>
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
          casting
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
              {displayTitle}
            </h1>
            <p className="mb-10 text-base" style={{ color: C.ink }}>
              <span className="opacity-60">{displaySubtitle}</span>
            </p>

            {isReligionOtherStep ? (
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  value={religionOther}
                  onChange={(e) => {
                    if (e.target.value.length <= 30) setReligionOther(e.target.value);
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleReligionOtherSubmit(); }}
                  placeholder="예: 가톨릭, 원불교..."
                  autoFocus
                  className="w-full px-5 py-4 rounded-2xl text-base font-medium outline-none transition-shadow focus:shadow-lg"
                  style={{
                    color: C.ink,
                    background: '#FFFFFF',
                    border: `2px solid ${C.ink}`,
                  }}
                />
                <button
                  onClick={handleReligionOtherSubmit}
                  disabled={!religionOther.trim()}
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
            ) : isReligionSelfStep ? (
              <div className="flex flex-col gap-3">
                {RELIGION_SELF_OPTIONS.map((opt) => {
                  const selected =
                    religionSelfAnswer === opt.value ||
                    (opt.value === 'other_religion' && religionSelfAnswer?.startsWith('other:'));
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleSelect(opt.value)}
                      className="w-full text-left px-5 py-4 rounded-2xl font-semibold text-base transition-all hover:-translate-y-0.5 active:translate-y-0"
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
            ) : isAgeStep ? (
              <div className="flex flex-col gap-3">
                <input
                  type="number"
                  inputMode="numeric"
                  value={age}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 2);
                    setAge(v);
                    // 2자리 입력 + 유효 범위면 100ms 뒤 자동 다음
                    if (v.length === 2) {
                      const n = parseInt(v, 10);
                      if (n >= 14 && n <= 99) {
                        persistAnswer('넌 나이가 어떻게 돼?', String(n));
                        setAnswerAt(3, step, String(n));
                        setTimeout(() => advanceChapter3FromStep(step), 100);
                      }
                    }
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
                    // 3자리 입력 + 유효 범위면 100ms 뒤 자동 다음
                    if (v.length === 3) {
                      const n = parseInt(v, 10);
                      if (n >= 130 && n <= 220) {
                        persistAnswer('키가 어떻게 돼?', String(n));
                        setAnswerAt(3, step, String(n));
                        setTimeout(() => advanceChapter3FromStep(step), 100);
                      }
                    }
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
            ) : isSidoStep ? (
              otherRegionInput ? (
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    value={otherRegion}
                    onChange={(e) => {
                      if (e.target.value.length <= 30) setOtherRegion(e.target.value);
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleOtherRegionSubmit(); }}
                    placeholder="예: 전주, 대구, 제주도..."
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
              ) : (
                <div className="flex flex-col gap-3">
                  {currentQ.options?.map((opt) => {
                    const selected = ch2Answers[step] === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => handleSelect(opt.value)}
                        className="w-full text-left px-5 py-4 rounded-2xl font-semibold text-base transition-all hover:-translate-y-0.5 active:translate-y-0"
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
              )
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
                  className="w-full mt-2 text-sm font-medium underline opacity-50"
                  style={{ color: C.ink }}
                >
                  모르겠어
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {renderOptions?.map((opt) => {
                  const currentAnswer =
                    phase === 'chapter1' ? ch1Answers[step]
                    : phase === 'chapter2' ? ch2Answers[step]
                    : phase === 'chapter3' ? ch3Answers[step]
                    : null;
                  const selected = currentAnswer === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleSelect(opt.value)}
                      className="w-full text-left px-5 py-4 rounded-2xl font-semibold text-base transition-all hover:-translate-y-0.5 active:translate-y-0"
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
            )}
          </div>
        ) : null}
      </div>
    </main>
  );
}

// ── 사진 단계 사회적 증거 toast ──
// 타이밍(ms)
const TOAST_ROLL_DELAY = 900; // 등장 후 숫자 +1 롤업까지의 대기
const TOAST_HOLD_ROLL = 3200; // 숫자 문구 노출 시간 (롤링 + 확인 여유 포함)
const TOAST_HOLD_PLAIN = 2200; // 일반 문구 노출 시간
const TOAST_GAP = 450; // 퇴장 후 다음 문구 등장까지의 간격

type ToastItem = {
  emoji: string;
  roll: boolean; // 숫자 롤업 문구 여부
  render: (count: number) => ReactNode;
};

const TOAST_ITEMS: ToastItem[] = [
  {
    emoji: '🔥',
    roll: true,
    render: (count) => (
      <span>
        오늘{' '}
        <span style={{ color: C.gold }}>
          <RollingNumber value={count} />명
        </span>
        이 사진을 올렸어
      </span>
    ),
  },
  {
    emoji: '💕',
    roll: false,
    render: () => (
      <span>
        오늘 <span style={{ color: C.gold }}>35쌍</span>의 <span style={{ color: C.gold }}>커플</span>이 매칭됐어
      </span>
    ),
  },
  {
    emoji: '💛',
    roll: false,
    render: () => (
      <span>
        사진은 <span style={{ color: C.gold }}>1장</span>으로 충분해
      </span>
    ),
  },
  {
    emoji: '💛',
    roll: false,
    render: () => (
      <span>
        사진은 <span style={{ color: C.gold }}>언제든 삭제</span>할 수 있어
      </span>
    ),
  },
];

// 4개 문구를 순환하며 보여주고, 숫자 문구는 등장할 때마다 +1씩 누적해 롤업한다.
function PhotoSocialToast() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  const [count, setCount] = useState(197);

  useEffect(() => {
    setVisible(true);
    const { roll } = TOAST_ITEMS[idx];
    const hold = roll ? TOAST_HOLD_ROLL : TOAST_HOLD_PLAIN;
    const timers = [
      roll && setTimeout(() => setCount((c) => c + 1), TOAST_ROLL_DELAY),
      setTimeout(() => setVisible(false), hold),
      setTimeout(() => setIdx((p) => (p + 1) % TOAST_ITEMS.length), hold + TOAST_GAP),
    ];
    return () => timers.forEach((t) => t && clearTimeout(t));
  }, [idx]);

  const cur = TOAST_ITEMS[idx];

  return (
    <div
      aria-live="polite"
      style={{
        position: 'fixed',
        left: '50%',
        bottom: '28px',
        transform: visible
          ? 'translateX(-50%) translateY(0)'
          : 'translateX(-50%) translateY(16px)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.4s ease, transform 0.4s ease',
        pointerEvents: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '10px 18px',
        borderRadius: '9999px',
        background: C.ink,
        color: '#FFFFFF',
        fontSize: '13px',
        fontWeight: 700,
        boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
        whiteSpace: 'nowrap',
        maxWidth: '90vw',
        zIndex: 50,
      }}
    >
      <span aria-hidden>{cur.emoji}</span>
      {cur.render(count)}
    </div>
  );
}

// 숫자 슬롯머신 롤링: 자리별 0~9 세로 스택, value가 바뀌면 해당 자리만 굴러감
function RollingNumber({ value }: { value: number }) {
  const [animate, setAnimate] = useState(false);
  // 첫 렌더는 굴리지 않고 현재 값을 그대로 보여준 뒤, 이후 변경부터 애니메이션
  useEffect(() => {
    const r = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(r);
  }, []);

  return (
    <span style={{ display: 'inline-flex', verticalAlign: 'baseline' }}>
      {String(value)
        .split('')
        .map((d, i) => (
          <span
            key={i}
            style={{
              display: 'inline-block',
              height: '1em',
              lineHeight: '1em',
              overflow: 'hidden',
            }}
          >
            <span
              style={{
                display: 'flex',
                flexDirection: 'column',
                transform: `translateY(-${Number(d)}em)`,
                transition: animate
                  ? 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)'
                  : 'none',
              }}
            >
              {Array.from({ length: 10 }, (_, n) => (
                <span key={n} style={{ height: '1em', lineHeight: '1em' }}>
                  {n}
                </span>
              ))}
            </span>
          </span>
        ))}
    </span>
  );
}

export default function StartPage() {
  return (
    <Suspense fallback={null}>
      <StartPageContent />
    </Suspense>
  );
}
