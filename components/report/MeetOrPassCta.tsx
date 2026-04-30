'use client';

import { useState } from 'react';

const NEXT_STEPS = [
  '의뢰인님의 마음을 후보에게 전달해요.',
  '상대 수락 시 대화방이 개설되고, 저희 캐스터가 대화를 리드해 드려요!',
  '카드 패스 시, 의뢰인님의 피드백을 받고 더 좋은 사람을 찾아나서요!',
];

type Stage = 'idle' | 'meet_done' | 'pass_done';

function stageFromCta(value: string | undefined): Stage {
  if (value === 'meet') return 'meet_done';
  if (value === 'pass') return 'pass_done';
  return 'idle';
}

interface Props {
  /** 디자인 검수용 진입(`?cta=meet|pass`). 서버에서 props 로 주입. */
  initialCta?: string;
}

export function MeetOrPassCta({ initialCta }: Props) {
  const [stage, setStage] = useState<Stage>(() => stageFromCta(initialCta));
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (stage === 'idle') {
    return (
      <div className="px-7 mt-10">
        <div className="bg-brand-ink text-brand-cream rounded-[20px] p-5 border-[1.5px] border-brand-line">
          <div className="font-display font-bold text-[24px] mb-5 leading-[1.3]">
            어때요?
            <br />
            대화해볼래요?
          </div>
          <ol className="space-y-3">
            {NEXT_STEPS.map((step, index) => (
              <li
                key={step}
                className="flex gap-3 text-[13.5px] leading-[1.6] text-brand-cream/85"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-mustard text-[12px] font-bold text-brand-ink">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          <div className="mt-5 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setStage('meet_done')}
              className="h-[60px] rounded-2xl bg-brand-mustard font-display font-bold text-brand-ink active:scale-[0.97] transition-transform text-[16px] flex items-center justify-center"
            >
              연결해줘!
            </button>
            <button
              type="button"
              onClick={() => setStage('pass_done')}
              className="h-[60px] rounded-2xl border border-brand-cream/35 font-display font-bold text-brand-cream active:scale-[0.97] transition-transform px-3 flex flex-col items-center justify-center leading-tight"
            >
              <span>다른 카드 받을래</span>
              <span className="text-[11px] font-normal text-brand-cream/60 mt-0.5">
                (이번 카드는 사라져요🥺)
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isMeet = stage === 'meet_done';
  const heading = isMeet ? '연결되면 문자드릴게요!' : '카드 패스가 완료됐어요!';
  const subheading = isMeet
    ? '상대의 수락 여부를 확인해, 문자로 안내드릴게요!'
    : '다음 카드를 더 정교하게 골라드릴게요🥺';
  const placeholder = isMeet
    ? '예) 날 챙겨주려는 안정감이 있어 보여서 만나고 싶었어!'
    : '예) 난 옷을 더 잘입는 사람이 좋아';

  const canSubmit = feedback.trim().length > 0 && !submitted;

  return (
    <div className="px-7 mt-10">
      <div className="bg-brand-ink text-brand-cream rounded-[20px] p-5 border-[1.5px] border-brand-line">
        <div className="font-display font-bold text-[22px] mb-2 leading-[1.3]">{heading}</div>
        <div className="text-[13.5px] text-brand-cream/75 leading-[1.6] mb-5">{subheading}</div>

        <div className="bg-brand-cream/5 rounded-[14px] p-4 border border-brand-cream/15">
          <div className="font-display font-bold text-[15px] text-brand-cream mb-2">
            이유를 알려줄래요?
          </div>
          <div className="text-[12.5px] text-brand-mustard/90 leading-[1.55] mb-3">
            피드백을 주시면, 다음 카드가 더 좋아질 확률이 81% 증가해요.
          </div>
          <textarea
            value={feedback}
            onChange={(e) => {
              setFeedback(e.target.value);
              if (error) setError(null);
            }}
            disabled={submitted}
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
            onClick={() => {
              if (!feedback.trim()) {
                setError('한 줄만 남겨주세요!');
                return;
              }
              setSubmitted(true);
            }}
            disabled={!canSubmit}
            className="mt-3 w-full h-12 rounded-2xl bg-brand-mustard font-display font-bold text-brand-ink text-[15px] active:scale-[0.97] transition-transform disabled:opacity-50 disabled:active:scale-100"
          >
            {submitted ? '의견 잘 받았어요 🙌' : '의견 남기기'}
          </button>
        </div>
      </div>
    </div>
  );
}
