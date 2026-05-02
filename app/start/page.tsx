'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  type?: 'choice' | 'mbti' | 'age' | 'height' | 'job' | 'major' | 'gu';
  options?: { label: string; value: string }[];
  // 성별에 따라 옵션이 달라지는 경우 (이상형 키·체형, 본인 체형 등)
  optionsByGender?: {
    male: { label: string; value: string }[];
    female: { label: string; value: string }[];
  };
}

// 시/도별 구·시 옵션 (Q22→Q23 분기)
const GU_OPTIONS: Record<string, { label: string; value: string }[]> = {
  seoul: [
    { label: '강남구', value: 'gangnam' }, { label: '강동구', value: 'gangdong' },
    { label: '강북구', value: 'gangbuk' }, { label: '강서구', value: 'gangseo' },
    { label: '관악구', value: 'gwanak' }, { label: '광진구', value: 'gwangjin' },
    { label: '구로구', value: 'guro' }, { label: '금천구', value: 'geumcheon' },
    { label: '노원구', value: 'nowon' }, { label: '도봉구', value: 'dobong' },
    { label: '동대문구', value: 'dongdaemun' }, { label: '동작구', value: 'dongjak' },
    { label: '마포구', value: 'mapo' }, { label: '서대문구', value: 'seodaemun' },
    { label: '서초구', value: 'seocho' }, { label: '성동구', value: 'seongdong' },
    { label: '성북구', value: 'seongbuk' }, { label: '송파구', value: 'songpa' },
    { label: '양천구', value: 'yangcheon' }, { label: '영등포구', value: 'yeongdeungpo' },
    { label: '용산구', value: 'yongsan' }, { label: '은평구', value: 'eunpyeong' },
    { label: '종로구', value: 'jongno' }, { label: '중구', value: 'jung_s' },
    { label: '중랑구', value: 'jungnang' },
  ],
  gyeonggi: [
    { label: '수원시', value: 'suwon' }, { label: '성남시', value: 'seongnam' },
    { label: '고양시', value: 'goyang' }, { label: '용인시', value: 'yongin' },
    { label: '부천시', value: 'bucheon' }, { label: '안산시', value: 'ansan' },
    { label: '안양시', value: 'anyang' }, { label: '남양주시', value: 'namyangju' },
    { label: '화성시', value: 'hwaseong' }, { label: '평택시', value: 'pyeongtaek' },
    { label: '의정부시', value: 'uijeongbu' }, { label: '시흥시', value: 'siheung' },
    { label: '파주시', value: 'paju' }, { label: '광명시', value: 'gwangmyeong' },
    { label: '김포시', value: 'gimpo' }, { label: '군포시', value: 'gunpo' },
    { label: '광주시', value: 'gwangju_gg' }, { label: '이천시', value: 'icheon' },
    { label: '양주시', value: 'yangju' }, { label: '오산시', value: 'osan' },
    { label: '구리시', value: 'guri' }, { label: '안성시', value: 'anseong' },
    { label: '포천시', value: 'pocheon' }, { label: '의왕시', value: 'uiwang' },
    { label: '하남시', value: 'hanam' }, { label: '여주시', value: 'yeoju' },
    { label: '동두천시', value: 'dongducheon' }, { label: '과천시', value: 'gwacheon' },
    { label: '양평군', value: 'yangpyeong' }, { label: '가평군', value: 'gapyeong' },
    { label: '연천군', value: 'yeoncheon' },
  ],
  incheon: [
    { label: '중구', value: 'jung_i' }, { label: '동구', value: 'dong_i' },
    { label: '미추홀구', value: 'michuhol' }, { label: '연수구', value: 'yeonsu' },
    { label: '남동구', value: 'namdong' }, { label: '부평구', value: 'bupyeong' },
    { label: '계양구', value: 'gyeyang' }, { label: '서구', value: 'seo_i' },
    { label: '강화군', value: 'ganghwa' }, { label: '옹진군', value: 'ongjin' },
  ],
};

const RELIGION_SELF_OPTIONS = [
  { label: '없어', value: 'none' },
  { label: '기독교', value: 'christian' },
  { label: '천주교', value: 'catholic' },
  { label: '불교', value: 'buddhist' },
  { label: '기타', value: 'other_religion' },
];

const PHOTO_SLOTS = [
  { label: '내 사진', sub: '', required: true },
  { label: '', sub: '', required: false },
  { label: '', sub: '', required: false },
  { label: '', sub: '', required: false },
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
        { label: '보통이 좋아 (156~165cm)', value: 'fem_avg' },
        { label: '아담해야 돼 (155cm 이하)', value: 'fem_petite' },
        { label: '큰 게 좋아 (167cm~)', value: 'fem_tall' },
        { label: '상관없어', value: 'any_height' },
      ],
      // 여자 → 남자 키
      female: [
        { label: '키 커야 돼 (180cm~)', value: 'male_very_tall' },
        { label: '보통 이상이면 돼 (172cm~)', value: 'male_avg_plus' },
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
        { label: '글래머러스가 좋아', value: 'fem_glamour' },
        { label: '마른 게 좋아', value: 'fem_slim' },
        { label: '보통이면 돼', value: 'fem_average' },
        { label: '상관 없어', value: 'any_body' },
      ],
      // 여자 → 남자 체형
      female: [
        { label: '근육 탄탄해야 돼', value: 'male_muscular' },
        { label: '보통이면 돼', value: 'male_average' },
        { label: '스키니한 게 좋아', value: 'male_slim' },
        { label: '상관 없어', value: 'any_body' },
      ],
    },
  },
];

// ── Chapter 2 — 관계·라이프 선호 + 거주지 (8문항, 종교 분기 +1 / 시·도 자유입력) ──
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
        { label: '글래머', value: 'self_glamour' },
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

export default function StartPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('chapter1');
  const [step, setStep] = useState(0);
  const [ch1Answers, setCh1Answers] = useState<string[]>([]);
  const [ch2Answers, setCh2Answers] = useState<string[]>([]);
  const [ch3Answers, setCh3Answers] = useState<string[]>([]);
  const [photo, setPhoto] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [guestUid, setGuestUid] = useState<string | null>(null);
  const guestPromiseRef = useRef<Promise<string> | null>(null);
  const [mbti, setMbti] = useState<string[]>(['', '', '', '']);
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [jobDetail, setJobDetail] = useState('');
  const [majorDetail, setMajorDetail] = useState('');
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
      guestPromiseRef.current = api('/start', { method: 'POST' }).then((data: any) => {
        setGuestUid(data.guest_uid);
        setTrackingGuestUid(data.guest_uid);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('sto_guest_uid', data.guest_uid);
        }
        if (data.access_token) {
          setCastingSession(data.guest_uid, data.access_token);
        }
        return data.guest_uid as string;
      });
    }
    return guestPromiseRef.current;
  }, [guestUid]);

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

  // 답변을 step 인덱스에 저장 (이미 있으면 덮어쓰기). 뒤로 가도 답변 유지됨
  function setAnswerAt(ch: 1 | 2 | 3, idx: number, value: string) {
    const setter = ch === 1 ? setCh1Answers : ch === 2 ? setCh2Answers : setCh3Answers;
    setter((p) => {
      const next = [...p];
      next[idx] = value;
      return next;
    });
  }

  // ── Chapter 2 인덱스 헬퍼 ──
  const RELIGION_STEP_IDX = CHAPTER2_QUESTIONS.findIndex(
    (q) => q.options?.some((o) => o.value === 'pref_any_religion'),
  );
  const sidoCh2Idx = CHAPTER2_QUESTIONS.findIndex(
    (q) => q.options?.some((o) => o.value === 'seoul'),
  );

  // ── Chapter 3 인덱스 헬퍼 ──
  const occupationCh3Idx = CHAPTER3_QUESTIONS.findIndex(
    (q) => q.options?.some((o) => o.value === 'student'),
  );

  function shouldSkipChapter3(idx: number, answers: string[] = ch3Answers): boolean {
    const q = CHAPTER3_QUESTIONS[idx];
    if (!q) return false;
    if (q.type === 'job') {
      return answers[occupationCh3Idx] === 'student';
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
      } else if (q?.type === 'major') {
        setMajorDetail(stored);
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
        // 무교 → 본인 종교 SKIP
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
      if (step === sidoCh2Idx && value === 'other_region') {
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

  function handleMajorSubmit() {
    const trimmed = majorDetail.trim();
    if (!trimmed) return;
    persistAnswer('전공이 정확히 뭐야?', trimmed);
    setAnswerAt(3, step, trimmed);
    advanceChapter3FromStep(step);
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
    if (phase === 'chapter2' && step === sidoCh2Idx && otherRegionInput) {
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
    setOtherRegionInput(false);
    setOtherRegion('');
    setPhase('chapter2');
  }

  function handleStartChapter3() {
    setStep(0);
    setCh3Answers([]);
    setJobDetail('');
    setMajorDetail('');
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
                placeholder={
                  ch1Answers[0] === 'female'
                    ? '예) 난 아랍상이 좋아\n예) 난 ENTP랑 잘 맞더라\n예) 내 이상형을 더 말해주자면...'
                    : ch1Answers[0] === 'male'
                    ? '예) 난 귀엽게 생긴 사람이 좋아\n예) 내가 스케줄 근무라 상대도 비슷했으면 해\n예) 내 이상형을 더 말해주자면...'
                    : '예) 내 이상형을 더 말해주자면...'
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
  const isMajorStep = phase === 'chapter3' && currentQ?.type === 'major';
  const isGuStep = false;
  const isSidoStep = phase === 'chapter2' && step === sidoCh2Idx;
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
    const occupation = ch3Answers[occupationCh3Idx];
    if (occupation === 'office') displaySubtitle = '예: 마케팅 PM, UX 디자이너, 백엔드 개발자...';
    else if (occupation === 'professional') displaySubtitle = '예: 변호사, 의사, 회계사, 약사...';
    else if (occupation === 'public') displaySubtitle = '예: 7급 공무원, 교사, 경찰관...';
    else if (occupation === 'freelance') displaySubtitle = '예: 카페 운영, 크리에이터, 일러스트레이터...';
    else if (occupation === 'other_job') displaySubtitle = '어떤 일인지 자세히 적어줘!';
  } else if (isSidoStep && otherRegionInput) {
    displaySubtitle = '자세히 알려줘!';
  }

  const guOptions: { label: string; value: string }[] = [];

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
                        setAnswerAt(2, step, String(n));
                        setTimeout(() => advanceChapter2FromStep(step), 100);
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
                        setAnswerAt(2, step, String(n));
                        setTimeout(() => advanceChapter2FromStep(step), 100);
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
            ) : isMajorStep ? (
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  value={majorDetail}
                  onChange={(e) => {
                    if (e.target.value.length <= 50) setMajorDetail(e.target.value);
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleMajorSubmit(); }}
                  placeholder="예: 컴퓨터공학, 경영학..."
                  autoFocus
                  className="w-full px-5 py-4 rounded-2xl text-base font-medium outline-none transition-shadow focus:shadow-lg"
                  style={{
                    color: C.ink,
                    background: '#FFFFFF',
                    border: `2px solid ${C.ink}`,
                  }}
                />
                <button
                  onClick={handleMajorSubmit}
                  disabled={!majorDetail.trim()}
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
            ) : isGuStep ? (
              <div className="flex flex-col gap-3">
                <select
                  value={ch3Answers[step] || ''}
                  onChange={(e) => { if (e.target.value) handleSelect(e.target.value); }}
                  className="w-full px-5 py-4 rounded-2xl text-base font-semibold outline-none appearance-none cursor-pointer"
                  style={{
                    color: C.ink,
                    background: '#FFFFFF',
                    border: `2px solid ${C.ink}`,
                    boxShadow: `3px 3px 0 ${C.ink}`,
                    backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%232C1D07' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    paddingRight: '3rem',
                  }}
                >
                  <option value="" disabled>구·시를 선택해줘</option>
                  {guOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
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
                    const selected = ch3Answers[step] === opt.value;
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
