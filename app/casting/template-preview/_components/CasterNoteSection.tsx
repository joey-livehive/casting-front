'use client';

import { SafeText } from '@/components/report/SafeText';
import { useTone } from '@/components/report/toneContext';

interface CasterNoteSectionProps {
  headline: string;
  charmBullets: string[];
}

export function CasterNoteSection({ headline, charmBullets }: CasterNoteSectionProps) {
  const tone = useTone();
  return (
    <div className="px-7 mt-8">
      <div className="relative bg-brand-bg-deep border-[1.5px] border-brand-line rounded-[18px] pt-[34px] px-[22px] pb-[22px]">
        <div
          className="absolute top-[-13px] left-5 bg-brand-mustard text-brand-ink
                     font-hand text-[14px] px-[13px] py-1 rounded-[14px]
                     border-[1.5px] border-brand-line"
        >
          🌏 캐스터의 한마디
        </div>

        <p className="font-display font-bold text-[17px] leading-[1.55] text-brand-ink mb-[18px]">
          &ldquo;<SafeText>{headline}</SafeText>&rdquo; {tone === 'formal' ? '어떠세요?' : '어때?'}
        </p>

        <ul className="space-y-[10px]">
          {charmBullets.map((b, i) => (
            <li
              key={i}
              className="flex gap-2 text-[14.5px] leading-[1.7] text-brand-ink-soft [&_b]:font-display [&_b]:font-bold [&_b]:text-brand-ink"
            >
              <span className="text-brand-orange font-bold mt-[1px] shrink-0">·</span>
              <span>
                <SafeText>{b}</SafeText>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
