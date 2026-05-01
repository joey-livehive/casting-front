'use client';

import Image from 'next/image';
import { useSheet } from './sheetContext';
import { useTone } from './toneContext';
import { Section, SectionLabel, SectionTitle, HL } from './SectionFrame';

interface RemainingHint {
  source: string;
  location: string;
  /** 카드 배경 그라디언트 (photo 없을 때 fallback) */
  bg: string;
}

const hints: RemainingHint[] = [
  { source: 'Instagram', location: '28세', bg: 'linear-gradient(135deg, #E8D5B7 0%, #C9A574 100%)' },
  { source: 'LinkedIn', location: '31세', bg: 'linear-gradient(135deg, #D4B896 0%, #8A7C60 100%)' },
  { source: '프리미엄 헬스장', location: '29세', bg: 'linear-gradient(135deg, #EBD9B6 0%, #B59B78 100%)' },
  { source: '와인바·북카페', location: '27세', bg: 'linear-gradient(135deg, #D6C3A2 0%, #7A6850 100%)' },
];

export function RemainingCandidates({ photos }: { photos?: string[] }) {
  const { openSheet } = useSheet();
  const tone = useTone();

  return (
    <Section>
      <SectionLabel>남은 4명</SectionLabel>
      <SectionTitle className="!text-[22px]">
        이 외에도 <HL>최소 4명</HL>이
        <br />
        {tone === 'formal' ? '사람이 어울리실 것 같아요!' : '사람이 어울릴 것 같아!'}
      </SectionTitle>

      <div
        className="grid grid-cols-2 gap-3"
        onContextMenu={(e) => e.preventDefault()}
      >
        {hints.map((h, i) => {
          const photo = photos?.[i];
          return (
            <button
              key={h.source}
              type="button"
              onClick={() => openSheet('remaining_candidates')}
              aria-label={`${h.source}에서 찾은 후보 · 결제 후 공개`}
              className="relative aspect-[4/5] rounded-[14px] overflow-hidden border-[1.5px] border-brand-line
                         shadow-[3px_4px_0_var(--line)]
                         active:scale-[0.97] transition-transform select-none"
              style={photo ? undefined : { background: h.bg }}
            >
              {photo ? (
                <Image
                  src={photo}
                  alt=""
                  fill
                  sizes="(max-width: 480px) 50vw, 240px"
                  draggable={false}
                  className="object-cover select-none"
                  style={{
                    filter: 'blur(8px) saturate(1.05)',
                    transform: 'scale(1.1)',
                    pointerEvents: 'none',
                    WebkitUserSelect: 'none',
                    WebkitTouchCallout: 'none',
                    WebkitUserDrag: 'none',
                  } as React.CSSProperties}
                />
              ) : (
                <div className="absolute inset-0 backdrop-blur-[12px] bg-brand-bg/20 pointer-events-none" />
              )}

              {/* 중앙 자물쇠 */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-brand-ink/80 flex items-center justify-center text-white text-[20px] backdrop-blur-[4px]">
                🔒
              </div>

              {/* 하단 정보 */}
              <div className="absolute bottom-0 left-0 right-0 bg-[linear-gradient(180deg,transparent,rgba(28,26,23,0.88))] pt-10 pb-2.5 px-3 text-white">
                <div className="font-display font-bold text-[13px] tracking-[-0.01em]">
                  {h.source}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 text-center font-hand text-[13px] text-brand-ink-soft">
        결제 후 더 정확한 매칭을 진행하여 {tone === 'formal' ? '순차 전달돼요' : '순차 전달돼'}
      </div>
    </Section>
  );
}
