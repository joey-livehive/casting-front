'use client';

import { MatchAnalysis } from '@/lib/report/types';
import { ChapterCard } from './ChapterCard';
import { RadarChart } from './RadarChart';
import { SafeText } from './SafeText';
import { useTone } from './toneContext';

export function Chapter3({ userName, match }: { userName: string; match: MatchAnalysis }) {
  const tone = useTone();
  const lead =
    tone === 'formal'
      ? `${userName}님이 원하시는 6가지 축과 이 사람의 실제 점수를 겹쳐봤어요. <b>${match.matchRate}% 일치해요.</b> 이건 상위 ${match.topPercent}%의 매칭 점수예요.`
      : `${userName}님이 원하는 6가지 축과 이 사람의 실제 점수를 겹쳐봤어. <b>${match.matchRate}% 일치해.</b> 이건 상위 ${match.topPercent}%의 매칭 점수야.`;
  const title =
    tone === 'formal' ? '왜 잘 맞는지 알려드릴게요' : '너랑 왜 잘 맞냐면';
  return (
    <ChapterCard number="CHAPTER 3" title={title} lead={lead}>
      <div className="flex justify-center gap-5 mb-1.5 text-[13px]">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-[3px] bg-brand-orange" />
          {userName}님이 원하는 사람
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-[3px] bg-brand-mustard" />
          이 사람
        </span>
      </div>

      <RadarChart data={match.radarData} />

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

      <div className="mt-5 bg-[linear-gradient(135deg,#FFF3DC_0%,var(--cream)_100%)] border-[1.5px] border-brand-line rounded-[14px] p-5">
        <div className="font-hand text-[16px] text-brand-orange-deep mb-3">
          🎬 만약 두 사람이 만난다면
        </div>
        <div className="text-[14px] text-brand-ink leading-[1.7] [&_b]:font-display [&_b]:font-bold">
          <SafeText>{match.simulation}</SafeText>
        </div>
      </div>
    </ChapterCard>
  );
}
