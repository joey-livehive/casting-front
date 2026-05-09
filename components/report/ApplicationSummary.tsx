import type { UserAnswers } from '@/lib/personalization/types';

/**
 * 유저가 온보딩에서 답한 내용을 원본 그대로 복기하는 섹션.
 * "의뢰인님이 이런 거 원했잖아" 훅을 페이지 최상단 진입점에 배치.
 * Hero 아래, HuntBox 위에 위치하여 모든 개인화 해석의 근거가 됨.
 *
 * 카피: 질문은 온보딩 때 유저가 봤던 반말 그대로.
 * 답변은 userAnswers에서 raw 값 그대로.
 * 섹션 헤더/서브는 우리 서비스 톤(요체).
 */

type IdealKey = keyof UserAnswers['idealType'];
type SelfKey = keyof NonNullable<UserAnswers['selfInfo']>;
type PersonalityKey = keyof NonNullable<UserAnswers['personality']>;

const IDEAL_TYPE_QUESTIONS: { q: string; k: IdealKey }[] = [
  { q: '어떤 사람이 끌려?', k: 'attractionFactor' },
  { q: '나이는 어느 정도?', k: 'agePreference' },
  { q: '키는 어느 정도?', k: 'heightPreference' },
  { q: '체형은 어때?', k: 'bodyType' },
  { q: '연애할 때 뭐가 제일 중요해?', k: 'relationshipPriority' },
  { q: '연락 스타일은?', k: 'contactStyle' },
  { q: '종교는 중요해?', k: 'religionImportance' },
  { q: '이건 좀 아닌 것 같아', k: 'dealBreaker' },
  { q: '첫 만남은 어떤 게 좋아?', k: 'firstMeeting' },
];

// ks: 첫 번째로 채워진 키의 값을 사용 (prod 키 우선, legacy 키 fallback)
const SELF_INFO_QUESTIONS: { q: string; ks: SelfKey[] }[] = [
  { q: '나이가 어떻게 돼?', ks: ['age', 'ageRange'] },
  { q: '성별이 어떻게 돼?', ks: ['gender'] },
  { q: '어디쯤 살아?', ks: ['location'] },
  { q: '키가 어떻게 돼?', ks: ['height'] },
  { q: 'MBTI가 뭐야?', ks: ['mbti'] },
  { q: '무슨 일 해?', ks: ['occupation'] },
  { q: '구체적으로 어떤 일?', ks: ['jobDetail'] },
  { q: '연소득은 얼마야?', ks: ['income'] },
  { q: '주말에 보통 뭐 해?', ks: ['weekend'] },
  { q: '술은 어때?', ks: ['drinking'] },
  { q: '연애 스타일은?', ks: ['datingFrequency', 'relationshipStyle'] },
  { q: '데이트는 어떤 스타일이 좋아?', ks: ['dateStyle'] },
  { q: '스킨십은 어느 정도가 편해?', ks: ['skinship'] },
  { q: '결혼 생각은 있어?', ks: ['marriageIntent'] },
  { q: '지금 연애 준비됐어?', ks: ['readiness'] },
];

const PERSONALITY_QUESTIONS: { q: string; k: PersonalityKey }[] = [
  { q: '질투 많이 하는 편이야?', k: 'jealousy' },
  { q: '싸웠을 땐 어떤 편이야?', k: 'conflictStyle' },
  { q: '사람들이 널 뭐라고 평가해?', k: 'selfDescription' },
];

// form `사람들이 널 뭐라고 평가해?` 옵션 token → 표시 라벨
const SELF_DESCRIPTION_LABELS: Record<string, string> = {
  lively: '활발해',
  warm: '다정해',
  calm: '차분해',
  serious: '진중해',
  fun: '재밌어',
  comfortable: '편안해',
  honest: '솔직해',
  smart: '똑똑해',
};

const ANSWER_LABELS: Record<string, string> = {
  any_frequency: '연락 빈도 무관',
  contact_anytime: '수시로 연락',
  contact_2_3h: '2~3시간에 한 번',
  contact_1_2_day: '하루 1~2번',
  contact_relaxed: '여유롭게 연락',
  any_religion: '종교 무관',
  pref_any_religion: '종교 무관',
  pref_no_religion: '무교 선호',
  pref_same_religion: '같은 종교 선호',
  never: '전혀 안 마셔',
  rarely_drink: '거의 안 마셔',
  sometimes_drink: '가끔 마셔',
  often_drink: '자주 마셔',
  no_smoke: '비흡연',
  sometimes_smoke: '가끔 흡연',
  heavy_smoke: '흡연',
};

function formatAnswer(raw: string): string {
  if (raw.startsWith('other_region:')) return raw.replace('other_region:', '');
  return ANSWER_LABELS[raw] ?? raw;
}

function formatPersonalityAnswer(key: PersonalityKey, raw: string): string {
  if (key === 'selfDescription') {
    return raw
      .split(',')
      .map((tok) => SELF_DESCRIPTION_LABELS[tok.trim()] ?? tok.trim())
      .filter(Boolean)
      .join(', ');
  }
  return formatAnswer(raw);
}

interface ApplicationSummaryProps {
  userAnswers: UserAnswers;
  /** 상단 stamp 라벨 override. 미지정 시 "📋 의뢰서 복기". */
  headerLabel?: string;
  /** 헤더 제목 override. 미지정 시 "의뢰인님의 취향". */
  heading?: string;
  /** 헤더 부제 override. 미지정 시 "의뢰인님이 남겨 주신 그대로 담아왔어요." */
  subheading?: string;
}

export function ApplicationSummary({
  userAnswers,
  headerLabel = '📋 의뢰서 복기',
  heading = '의뢰인님의 취향',
  subheading = '의뢰인님이 남겨 주신 그대로 담아왔어요.',
}: ApplicationSummaryProps) {
  const idealRows = IDEAL_TYPE_QUESTIONS.flatMap(({ q, k }) => {
    const a = userAnswers.idealType[k];
    return a ? [{ q, a: formatAnswer(a), key: k as string }] : [];
  });

  const selfRows = SELF_INFO_QUESTIONS.flatMap(({ q, ks }) => {
    for (const k of ks) {
      const a = userAnswers.selfInfo?.[k];
      if (a) return [{ q, a: formatAnswer(a), key: ks[0] as string }];
    }
    return [];
  });

  const personalityRows = PERSONALITY_QUESTIONS.flatMap(({ q, k }) => {
    const a = userAnswers.personality?.[k];
    return a ? [{ q, a: formatPersonalityAnswer(k, a), key: k as string }] : [];
  });

  // 비어있는 그룹은 끼워 넣지 않고, 첫 그룹은 divider 없이 렌더한다.
  const groups: { label: string; node: React.ReactNode }[] = [];

  if (idealRows.length > 0) {
    groups.push({
      label: '이상형',
      node: idealRows.map(({ q, a, key }) => <Row key={key} q={q} a={a} />),
    });
  }
  if (selfRows.length > 0) {
    groups.push({
      label: '본인 정보',
      node: selfRows.map(({ q, a, key }) => <Row key={key} q={q} a={a} />),
    });
  }
  if (personalityRows.length > 0) {
    groups.push({
      label: '성격',
      node: personalityRows.map(({ q, a, key }) => <Row key={key} q={q} a={a} />),
    });
  }
  if (userAnswers.freeResponse?.strictCriteria) {
    groups.push({
      label: '까다로운 기준',
      node: (
        <p className="text-[13.5px] text-brand-ink leading-[1.7] pl-3 border-l-2 border-brand-mustard-deep">
          {userAnswers.freeResponse.strictCriteria}
        </p>
      ),
    });
  }
  if (userAnswers.freeResponse?.messageToUs) {
    groups.push({
      label: '나한테 하고 싶은 말',
      node: (
        <p className="text-[14px] text-brand-ink leading-[1.65] pl-3 border-l-2 border-brand-mustard-deep font-hand">
          &ldquo;{userAnswers.freeResponse.messageToUs}&rdquo;
        </p>
      ),
    });
  }

  return (
    <div className="px-7 mt-7">
      <div
        className="relative bg-brand-cream border-[1.5px] border-brand-line rounded-[18px]
                   pt-[30px] px-[22px] pb-[22px] shadow-[4px_5px_0_var(--line)]"
      >
        <div
          className="absolute top-[-13px] left-[18px] bg-brand-mustard text-brand-ink
                     font-hand text-[15px] px-[13px] py-1 rounded-[14px]
                     border-[1.5px] border-brand-line"
        >
          {headerLabel}
        </div>

        <h3 className="font-display font-bold text-[21px] leading-[1.35] tracking-[-0.025em] mb-1.5 text-brand-ink">
          {heading}
        </h3>
        <p className="text-[13px] text-brand-ink-soft leading-[1.6] mb-5">
          {subheading}
        </p>

        {groups.map(({ label, node }, i) => (
          <Group key={label} label={label} divider={i > 0}>
            {node}
          </Group>
        ))}
      </div>
    </div>
  );
}

function Group({
  label,
  children,
  divider = false,
}: {
  label: string;
  children: React.ReactNode;
  divider?: boolean;
}) {
  return (
    <div className={divider ? 'mt-4 pt-4 border-t border-dashed border-brand-ink/15' : undefined}>
      <div className="font-hand text-[12px] text-brand-orange-deep tracking-[0.18em] uppercase mb-2.5">
        {label}
      </div>
      {children}
    </div>
  );
}

function Row({ q, a }: { q: string; a: string }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-3 py-[7px] text-[13px] leading-[1.55]">
      <div className="text-brand-ink-mute font-medium">{q}</div>
      <div className="text-brand-ink font-display font-bold">{a}</div>
    </div>
  );
}
