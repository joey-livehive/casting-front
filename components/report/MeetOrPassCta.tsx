'use client';

import { useState } from 'react';

type Mode = 'caster' | 'receiver';

// mode 별 카피·API action 한 묶음으로 관리. caster 는 PR #16 까지의 기본,
// receiver 는 like 받은 사람용. nextStep.note 는 step 본문 아래 mustard 강조 박스로 렌더.
type Step = { text: string; note?: string };

const COPY_BY_MODE = {
  caster: {
    headline: { line1: '어때요?', line2: '대화해볼래요?' },
    nextSteps: (_senderName?: string): Step[] => [
      { text: '의뢰인님의 마음을 후보에게 전달해요.' },
      { text: '상대 수락 시 대화방이 개설되고, 저희 캐스터가 대화를 리드해 드려요!' },
      { text: '카드 패스 시, 의뢰인님의 피드백을 받고 더 좋은 사람을 찾아나서요!' },
    ],
    meetButton: '연결해줘!',
    passButton: { main: '다른 카드 받을래', sub: '(이번 카드는 사라져요🥺)' },
    afterMeetHeading: '연결되면 문자드릴게요!',
    afterMeetSub: '상대의 수락 여부를 확인해, 문자로 안내드릴게요!',
    afterPassHeading: '카드 패스가 완료됐어요!',
    afterPassSub: '다음 카드를 더 정교하게 골라드릴게요🥺',
    feedbackHeadingMeet: '좋았던 이유를 알려줄래요?',
    feedbackHeadingPass: '이유를 알려줄래요?',
    feedbackPlaceholderMeet: '예) 날 챙겨주려는 안정감이 있어 보여서 만나고 싶었어!',
    feedbackPlaceholderPass: '예) 난 옷을 더 잘입는 사람이 좋아',
  },
  receiver: {
    headline: { line1: '어때요?', line2: '한번 만나볼래요?' },
    nextSteps: (_senderName?: string): Step[] => [
      { text: '어떤 분이 당신을 마음에 두고 캐스팅했어요.' },
      {
        text: '수락하시면 대화방을 열고, 저희 캐스터가 첫 대화를 리드해드려요!',
        note: '부담 갖지 마세요. 캐스터가 알아서 분위기를 풀어드릴 테니, 편하게만 계셔도 괜찮아요.',
      },
      { text: '패스하시면 그 분께 정중히 전달해드릴게요.' },
    ],
    meetButton: '가볍게 대화하기',
    passButton: { main: '이번엔 패스할래', sub: '(같은 사람을 두 번 만날 순 없어요🥺)' },
    afterMeetHeading: '연결되면 문자드릴게요!',
    afterMeetSub: '상대의 수락 여부를 확인해, 문자로 안내드릴게요!',
    afterPassHeading: '의견 잘 받았어요!',
    afterPassSub: '발신자에게 정중히 전달드릴게요🥺',
    feedbackHeadingMeet: '한 마디 남겨줄래요?',
    feedbackHeadingPass: '이유를 알려줄래요?',
    feedbackPlaceholderMeet: '예) 사진에서 분위기가 마음에 들었어요!',
    feedbackPlaceholderPass: '예) 지금은 다른 분과 이야기 중이에요',
  },
} as const;

type Stage = 'idle' | 'meet_done' | 'pass_done';
type ApiActionType = 'contact_request' | 'pass' | 'receiver_accept' | 'receiver_decline';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.publicvoid.im';

function stageFromCta(value: string | undefined): Stage {
  if (value === 'meet') return 'meet_done';
  if (value === 'pass') return 'pass_done';
  return 'idle';
}

function tokenFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const sp = new URLSearchParams(window.location.search);
  return sp.get('t') || sp.get('token');
}

async function postCta(reportId: string, action: ApiActionType, feedback?: string): Promise<void> {
  const token = tokenFromUrl();
  const url = new URL(`${API_BASE}/casting/reports/${reportId}/public-cta`);
  if (token) url.searchParams.set('token', token);
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action_type: action, feedback }),
    keepalive: true,
  });
  if (!res.ok) {
    throw new Error(`cta_failed: ${res.status}`);
  }
}

interface Props {
  /** 결제 후 페이지의 reportUid (예: STO-C324BE08). 백엔드 API 호출 시 path 로 사용. */
  reportId: string;
  /** 디자인 검수용 진입(`?cta=meet|pass`). 서버에서 props 로 주입. */
  initialCta?: string;
  /** 인스타 변형: 1번 단계 아래에 빨간 보조 안내(예: 스토리 태그/DM 연락 안내) */
  step1Note?: string;
  /** caster(기본) = 의뢰인이 후보 카드 결정. receiver = like 받은 사람이 만남 결정. */
  mode?: Mode;
  /** receiver 모드에서 NEXT_STEPS 의 ○○ 자리에 들어갈 발신자 이름. 미지정 시 ○○. */
  senderName?: string;
}

function actionFor(mode: Mode, decision: 'meet_done' | 'pass_done'): ApiActionType {
  if (mode === 'receiver') {
    return decision === 'meet_done' ? 'receiver_accept' : 'receiver_decline';
  }
  return decision === 'meet_done' ? 'contact_request' : 'pass';
}

export function MeetOrPassCta({
  reportId,
  initialCta,
  step1Note,
  mode = 'caster',
  senderName,
}: Props) {
  const [stage, setStage] = useState<Stage>(() => stageFromCta(initialCta));
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const copy = COPY_BY_MODE[mode];
  const nextSteps = copy.nextSteps(senderName);

  const decide = async (next: 'meet_done' | 'pass_done') => {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      await postCta(reportId, actionFor(mode, next));
      setStage(next);
    } catch {
      setError('네트워크 오류가 났어요. 잠시 뒤 다시 시도해주세요.');
    } finally {
      setPending(false);
    }
  };

  if (stage === 'idle') {
    return (
      <div className="px-7 mt-10">
        <div className="bg-brand-ink text-brand-cream rounded-[20px] p-5 border-[1.5px] border-brand-line">
          <div className="font-display font-bold text-[24px] mb-5 leading-[1.3]">
            {copy.headline.line1}
            <br />
            {copy.headline.line2}
          </div>
          <ol className="space-y-3">
            {nextSteps.map((step, index) => (
              <li
                key={step.text}
                className="flex gap-3 text-[13.5px] leading-[1.6] text-brand-cream/85"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-mustard text-[12px] font-bold text-brand-ink">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <span>{step.text}</span>
                  {/* caster insta 변형: 1번 단계 아래 빨간 강조 (스토리 태그/DM 등 노력 강조) */}
                  {index === 0 && step1Note && (
                    <div className="mt-1.5 pl-2.5 border-l-2 border-red-400 text-red-300 text-[12.5px] leading-[1.55]">
                      {step1Note}
                    </div>
                  )}
                  {/* mode 별 fixed step note — receiver 모드의 "부담 갖지 마세요" 같은 안심 카피. mustard 톤. */}
                  {step.note && (
                    <div className="mt-2 px-3 py-2.5 bg-brand-mustard/15 border-l-[3px] border-brand-mustard rounded-r-md text-brand-mustard text-[13px] leading-[1.6] font-medium">
                      💛 {step.note}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-5 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => decide('meet_done')}
              disabled={pending}
              className="h-[60px] rounded-2xl bg-brand-mustard font-display font-bold text-brand-ink active:scale-[0.97] transition-transform text-[16px] flex items-center justify-center disabled:opacity-60 disabled:active:scale-100"
            >
              {pending ? '전송 중…' : copy.meetButton}
            </button>
            <button
              type="button"
              onClick={() => decide('pass_done')}
              disabled={pending}
              className="h-[60px] rounded-2xl border border-brand-cream/35 font-display font-bold text-brand-cream active:scale-[0.97] transition-transform px-3 flex flex-col items-center justify-center leading-tight disabled:opacity-60 disabled:active:scale-100"
            >
              <span>{copy.passButton.main}</span>
              <span className="text-[11px] font-normal text-brand-cream/60 mt-0.5">
                {copy.passButton.sub}
              </span>
            </button>
          </div>
          {error && (
            <div className="mt-3 text-[12px] text-red-300" role="alert">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  const isMeet = stage === 'meet_done';
  const heading = isMeet ? copy.afterMeetHeading : copy.afterPassHeading;
  const subheading = isMeet ? copy.afterMeetSub : copy.afterPassSub;
  const placeholder = isMeet ? copy.feedbackPlaceholderMeet : copy.feedbackPlaceholderPass;

  const canSubmit = feedback.trim().length > 0 && !submitted;

  return (
    <div className="px-7 mt-10">
      <div className="bg-brand-ink text-brand-cream rounded-[20px] p-5 border-[1.5px] border-brand-line">
        <div className="font-display font-bold text-[22px] mb-2 leading-[1.3]">{heading}</div>
        <div className="text-[13.5px] text-brand-cream/75 leading-[1.6] mb-5">{subheading}</div>

        {submitted ? (
          /* 제출 후: 큼직한 success 카드로 화면 자체를 교체. 의견 그대로 echo. */
          <div className="bg-brand-mustard/15 rounded-[14px] p-5 border-[1.5px] border-brand-mustard">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-mustard text-brand-ink text-[18px] font-bold">
                ✓
              </span>
              <div className="font-display font-bold text-[18px] text-brand-cream leading-tight">
                의견 잘 받았어요!
              </div>
            </div>
            <div className="text-[12.5px] text-brand-cream/65 leading-[1.6] mb-3">
              {mode === 'receiver'
                ? '남기신 의견은 발신자에게 정중히 전달드릴게요.'
                : '남겨주신 의견 그대로 다음 카드 큐레이션에 반영할게요.'}
            </div>
            <div className="bg-brand-ink/40 rounded-xl border border-brand-mustard/40 px-4 py-3">
              <div className="font-hand text-[11px] text-brand-mustard/80 tracking-[0.18em] uppercase mb-1.5">
                {mode === 'receiver' ? '남기신 의견' : '의뢰인님의 의견'}
              </div>
              <div className="text-[14px] text-brand-cream leading-[1.65] whitespace-pre-wrap break-words">
                &ldquo;{feedback.trim()}&rdquo;
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-brand-cream/5 rounded-[14px] p-4 border border-brand-cream/15">
            <div className="font-display font-bold text-[15px] text-brand-cream mb-2">
              {isMeet ? copy.feedbackHeadingMeet : copy.feedbackHeadingPass}
            </div>
            <div className="text-[12.5px] text-brand-mustard/90 leading-[1.55] mb-3">
              {mode === 'receiver'
                ? '한 마디 남겨주시면 발신자가 더 잘 이해할 수 있어요.'
                : '피드백을 주시면, 다음 카드가 더 좋아질 확률이 81% 증가해요.'}
            </div>
            <textarea
              value={feedback}
              onChange={(e) => {
                setFeedback(e.target.value);
                if (error) setError(null);
              }}
              placeholder={placeholder}
              rows={4}
              aria-invalid={error ? true : undefined}
              className="w-full rounded-xl bg-brand-cream/10 border border-brand-cream/20 p-3 text-[13.5px] text-brand-cream placeholder:text-brand-cream/35 focus:outline-none focus:border-brand-mustard resize-none disabled:opacity-60"
            />
            {error && (
              <div className="mt-2 text-[12px] text-red-300" role="alert">
                {error}
              </div>
            )}
            <button
              type="button"
              onClick={async () => {
                if (!feedback.trim()) {
                  setError('한 줄만 남겨주세요!');
                  return;
                }
                if (pending) return;
                setPending(true);
                setError(null);
                try {
                  await postCta(
                    reportId,
                    actionFor(mode, isMeet ? 'meet_done' : 'pass_done'),
                    feedback.trim(),
                  );
                  setSubmitted(true);
                } catch {
                  setError('전송에 실패했어요. 잠시 뒤 다시 시도해주세요.');
                } finally {
                  setPending(false);
                }
              }}
              disabled={!canSubmit || pending}
              className="mt-3 w-full h-12 rounded-2xl bg-brand-mustard font-display font-bold text-brand-ink text-[15px] active:scale-[0.97] transition-transform disabled:opacity-50 disabled:active:scale-100"
            >
              {pending ? '전송 중…' : '의견 남기기'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
