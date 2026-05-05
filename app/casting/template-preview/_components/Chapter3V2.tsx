'use client';

import { MatchAnalysis } from '@/lib/report/types';
import { ChapterCard } from '@/components/report/ChapterCard';
import { RadarChart } from '@/components/report/RadarChart';
import { SafeText } from '@/components/report/SafeText';
import { useTone } from '@/components/report/toneContext';

interface Chapter3V2Props {
  match: MatchAnalysis;
  number?: string;
}

export function Chapter3V2({ match, number = 'CHAPTER 3' }: Chapter3V2Props) {
  const tone = useTone();

  const title = tone === 'formal' ? '왜 잘 맞는지 알려드릴게요' : '너랑 왜 잘 맞냐면';
  const lead =
    tone === 'formal'
      ? `연애에서 중요한 6가지 축을 기반으로, 의뢰인님과 이 분이 얼마나 잘 맞는지 살펴봤어요.`
      : `연애에서 중요한 6가지 축을 기반으로, 의뢰인이랑 이 분이 얼마나 잘 맞는지 살펴봤어.`;

  return (
    <ChapterCard number={number} title={title} lead={lead}>
      {/* 궁합 헤드라인 — "상위 N% 매칭" 메인 + "💞 두 사람의 궁합" 펄 라벨 eyebrow */}
      <div className="mt-2 mb-5 flex flex-col items-center">
        <div
          className="inline-flex items-center bg-brand-mustard text-brand-ink
                     font-display font-bold text-[13px] px-[12px] py-1 rounded-full
                     border-[1.5px] border-brand-line tracking-[-0.01em] mb-3"
        >
          두 사람의 궁합
        </div>
        <div className="font-display font-extrabold text-brand-ink tracking-[-0.03em] leading-none flex items-baseline gap-1">
          <span className="text-[20px]">상위</span>
          <span className="text-[34px] text-brand-orange">{match.topPercent}%</span>
          <span className="text-[20px]">매칭</span>
        </div>
      </div>

      {/* 레이더 차트 */}
      <RadarChart data={match.radarData} />

      {/* 범례 — 차트 아래 */}
      <div className="flex justify-center gap-5 mt-3 mb-4 text-[13px] text-brand-ink-soft">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-[3px] bg-brand-orange" />
          일치도
        </span>
      </div>

      {/* 매칭 근거 노트 */}
      <div className="mt-4 flex flex-col gap-2.5">
        {match.notes.map((note, i) => (
          <div
            key={i}
            className="bg-brand-bg-deep border-l-[3px] border-brand-orange px-3.5 py-[11px] rounded-lg text-[13.5px] text-brand-ink-soft leading-[1.6] [&_b]:font-display [&_b]:text-brand-ink"
          >
            <SafeText>{note}</SafeText>
          </div>
        ))}
      </div>
    </ChapterCard>
  );
}
