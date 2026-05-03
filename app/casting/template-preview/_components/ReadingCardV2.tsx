'use client';

import { useTone } from '@/components/report/toneContext';
import { SafeText } from '@/components/report/SafeText';

export interface ReadingCardV2Narratives {
  /** 의뢰인 인격 분석 (4~5문장, viewerBundle.readingViewerInsight, LLM 생성) */
  viewerInsight: string;
  /**
   * 의뢰인 분석 → 후보 인물평 사이를 잇는 다리 카피 (2~3문장, candidateBundle.readingMatchOpening).
   * "그래서 이 사람이 잘 어울릴 것 같아요" 의 풍부한 버전.
   */
  matchOpening: string;
  /** 후보 인물평 (4~5문장, candidateBundle.readingCandidateMatch, viewer 참조 금지) */
  candidateMatch: string;
}

interface ReadingCardV2Props {
  userName: string;
  narratives: ReadingCardV2Narratives;
}

export function ReadingCardV2({ userName, narratives }: ReadingCardV2Props) {
  const tone = useTone();

  const lead =
    tone === 'formal'
      ? `${userName}님이 적어주신 답변과 고른 선택지를 하나하나 천천히 읽어봤어요. 사소한 표현 하나에서도 ${userName}님이 어떤 분인지 보이더라고요.`
      : `${userName}이가 적어준 답변과 고른 선택지를 하나하나 천천히 읽어봤어. 사소한 표현 하나에서도 ${userName}이가 어떤 사람인지 보이더라고.`;

  const outro =
    tone === 'formal'
      ? `이 사람을 어떻게 골랐는지 — 어떤 면에서 ${userName}님과 잘 맞을지 차근차근 알려드릴게요.`
      : `이 사람을 어떻게 골랐는지 — 어떤 면에서 ${userName}이랑 잘 맞을지 차근차근 알려줄게.`;

  return (
    <div className="px-7 mt-8">
      <div className="relative bg-brand-bg-deep border-[1.5px] border-brand-line rounded-[18px] pt-[34px] px-[22px] pb-[22px]">
        <div
          className="absolute top-[-13px] left-5 bg-brand-mustard text-brand-ink
                     font-hand text-[14px] px-[13px] py-1 rounded-[14px]
                     border-[1.5px] border-brand-line"
        >
          💌 {tone === 'formal' ? `${userName}님께 쓰는 메모` : `${userName}이에게 쓰는 메모`}
        </div>

        <div className="space-y-[14px]">
          {/* 고정 문장 1 — Lead */}
          <p className="text-[14.5px] leading-[1.7] text-brand-ink-soft [&_b]:font-display [&_b]:font-bold [&_b]:text-brand-ink">
            {lead}
          </p>

          {/* LLM #1 — 의뢰인 분석 */}
          <p className="pl-3 border-l-2 border-brand-mustard-deep text-[14.5px] leading-[1.7] text-brand-ink [&_b]:font-display [&_b]:font-bold [&_b]:text-brand-ink">
            <SafeText>{narratives.viewerInsight}</SafeText>
          </p>

          {/* LLM #2 — 매칭 다리 (후보 → 의뢰인 결로) */}
          <p className="pt-1 text-[14.5px] leading-[1.7] text-brand-ink [&_b]:font-display [&_b]:font-bold [&_b]:text-brand-ink">
            <SafeText>{narratives.matchOpening}</SafeText>
          </p>

          {/* LLM #3 — 후보 인물평 */}
          <p className="pl-3 border-l-2 border-brand-mustard-deep text-[14.5px] leading-[1.7] text-brand-ink [&_b]:font-display [&_b]:font-bold [&_b]:text-brand-ink">
            <SafeText>{narratives.candidateMatch}</SafeText>
          </p>

          {/* 고정 문장 3 — Outro (챕터 2로 다리) */}
          <p className="pt-1 text-[14.5px] leading-[1.7] text-brand-ink-soft [&_b]:font-display [&_b]:font-bold [&_b]:text-brand-ink">
            {outro}
          </p>
        </div>

        <div className="mt-[18px] pt-[14px] border-t border-dashed border-brand-ink-mute font-hand text-[13px] text-brand-ink-mute flex items-center gap-1.5">
          📊 23,481쌍의 매칭 데이터 기반 분석
        </div>
      </div>
    </div>
  );
}
