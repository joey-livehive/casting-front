'use client';

import { ChapterCard } from '@/components/report/ChapterCard';
import { SafeText } from '@/components/report/SafeText';
import { useTone } from '@/components/report/toneContext';

export interface BipolarAxis {
  axisName: string;
  leftLabel: string;
  rightLabel: string;
  leftPercent: number;
}

interface Chapter3InstaSpectrumProps {
  axes: BipolarAxis[];
  notes?: string[];
  number?: string;
}

const BAR_FILL_COLOR = '#EC6A3D';
const BAR_TRACK_COLOR = '#E8DDC4';

export function Chapter3InstaSpectrum({
  axes,
  notes = [],
  number = 'CHAPTER 2',
}: Chapter3InstaSpectrumProps) {
  const tone = useTone();

  const title = tone === 'formal' ? '이 사람은 어떤 사람일까요' : '이 사람 어떤 사람이냐면';
  const lead =
    tone === 'formal'
      ? '인스타에서 살펴본 이 분의 4가지 성향 축을 보여드릴게요.'
      : '인스타에서 살펴본 이 분의 4가지 성향 축을 보여줄게.';

  return (
    <ChapterCard number={number} title={title} lead={lead}>
      <div className="mt-3 flex flex-col gap-7">
        {axes.map((axis, i) => {
          const left = Math.max(0, Math.min(100, axis.leftPercent));
          const right = 100 - left;
          return (
            <div key={i}>
              <div className="grid grid-cols-3 items-end mb-2 text-[13px] text-brand-ink-soft">
                <div className="text-left">{axis.leftLabel}</div>
                <div className="text-center font-display font-bold text-[15px] text-brand-ink">
                  {axis.axisName}
                </div>
                <div className="text-right">{axis.rightLabel}</div>
              </div>
              <div
                className="relative h-5 rounded-full overflow-hidden"
                style={{ backgroundColor: BAR_TRACK_COLOR }}
                role="img"
                aria-label={`${axis.axisName}: ${axis.leftLabel} ${left}%, ${axis.rightLabel} ${right}%`}
              >
                <div
                  className="absolute left-0 top-0 h-full rounded-full transition-[width]"
                  style={{ width: `${left}%`, backgroundColor: BAR_FILL_COLOR }}
                />
              </div>
              <div className="grid grid-cols-2 mt-1.5 text-[13px] font-display font-bold text-brand-ink">
                <div className="text-left">{left}%</div>
                <div className="text-right">{right}%</div>
              </div>
            </div>
          );
        })}
      </div>

      {notes.length > 0 && (
        <div className="mt-8 flex flex-col gap-2.5">
          {notes.map((note, i) => (
            <div
              key={i}
              className="bg-brand-bg-deep border-l-[3px] px-3.5 py-[11px] rounded-lg text-[13.5px] text-brand-ink-soft leading-[1.6] [&_b]:font-display [&_b]:text-brand-ink"
              style={{ borderLeftColor: BAR_FILL_COLOR }}
            >
              <SafeText>{note}</SafeText>
            </div>
          ))}
        </div>
      )}
    </ChapterCard>
  );
}
