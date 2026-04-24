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

const IDEAL_TYPE_QUESTIONS: { q: string; k: keyof UserAnswers['idealType'] }[] = [
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

const SELF_INFO_QUESTIONS: { q: string; k: keyof NonNullable<UserAnswers['selfInfo']> }[] = [
  { q: '나이대가 어떻게 돼?', k: 'ageRange' },
  { q: '성별이 어떻게 돼?', k: 'gender' },
  { q: '어디쯤 살아?', k: 'location' },
  { q: '주말에 보통 뭐 해?', k: 'weekend' },
  { q: '술은 어때?', k: 'drinking' },
  { q: '연애 스타일은?', k: 'relationshipStyle' },
  { q: '지금 연애 준비됐어?', k: 'readiness' },
];

export function ApplicationSummary({ userAnswers }: { userAnswers: UserAnswers }) {
  const selfRows = SELF_INFO_QUESTIONS.flatMap(({ q, k }) => {
    const a = userAnswers.selfInfo?.[k];
    return a ? [{ q, a }] : [];
  });

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
          📋 의뢰서 복기
        </div>

        <h3 className="font-display font-bold text-[21px] leading-[1.35] tracking-[-0.025em] mb-1.5 text-brand-ink">
          의뢰인님의 취향
        </h3>
        <p className="text-[13px] text-brand-ink-soft leading-[1.6] mb-5">
          의뢰인님이 남겨 주신 그대로 담아왔어요.
        </p>

        <Group label="이상형">
          {IDEAL_TYPE_QUESTIONS.map((row) => (
            <Row key={row.k} q={row.q} a={userAnswers.idealType[row.k]} />
          ))}
        </Group>

        {selfRows.length > 0 && (
          <Group label="본인 정보" divider>
            {selfRows.map(({ q, a }) => (
              <Row key={q} q={q} a={a} />
            ))}
          </Group>
        )}

        {userAnswers.freeResponse?.strictCriteria && (
          <Group label="까다로운 기준" divider>
            <p className="text-[13.5px] text-brand-ink leading-[1.7] pl-3 border-l-2 border-brand-mustard-deep">
              {userAnswers.freeResponse.strictCriteria}
            </p>
          </Group>
        )}

        {userAnswers.freeResponse?.messageToUs && (
          <Group label="나한테 하고 싶은 말" divider>
            <p className="text-[14px] text-brand-ink leading-[1.65] pl-3 border-l-2 border-brand-mustard-deep font-hand">
              &ldquo;{userAnswers.freeResponse.messageToUs}&rdquo;
            </p>
          </Group>
        )}
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
