'use client';

import Image from 'next/image';
import { MatchAnalysis } from '@/lib/report/types';
import { ChapterCard } from './ChapterCard';
import { SafeText } from './SafeText';
import { useTone } from './toneContext';

interface Props {
  match: MatchAnalysis;
  /** 시뮬레이션 장면 이미지(3:4). 없으면 텍스트만 노출. */
  sceneImage?: string;
  /** ChapterCard 번호. 페이지에서 chapter 순번을 결정. */
  number?: string;
}

export function Chapter4Simulation({ match, sceneImage, number = 'CHAPTER 3' }: Props) {
  const tone = useTone();

  // simulation 텍스트가 없으면 카드 자체를 숨긴다 — 빈 박스 노출 방지.
  if (!match.simulation?.trim()) return null;

  const lead =
    tone === 'formal'
      ? '두 분이 처음 만나면 어떻게 될지, 예측해 봤어요!'
      : '두 사람이 처음 만나면 어떻게 될지, 예측해 봤어!';

  return (
    <ChapterCard number={number} title="🎬 만약 두 사람이 만난다면" lead={lead}>
      <div className="bg-brand-bg-deep border-[1.5px] border-brand-line rounded-[14px] overflow-hidden">
        {sceneImage && (
          <div className="relative aspect-[3/4] w-full bg-[linear-gradient(135deg,#E8D5B7_0%,#C9A574_100%)]">
            <Image
              src={sceneImage}
              alt=""
              fill
              sizes="(max-width: 480px) 100vw, 480px"
              draggable={false}
              className="object-cover select-none pointer-events-none"
              style={{ objectPosition: '50% 30%' }}
            />
          </div>
        )}
        <div className="p-5 text-[14px] text-brand-ink leading-[1.7] [&_b]:font-display [&_b]:font-bold">
          <SafeText>{match.simulation}</SafeText>
        </div>
      </div>
    </ChapterCard>
  );
}
