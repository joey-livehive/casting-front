'use client';

import { useCountdown } from '@/hooks/useCountdown';
import { useSheet } from './sheetContext';

export function FixedBottomCta() {
  const { formatted } = useCountdown(12 * 60);
  const { openSheet } = useSheet();

  return (
    <div
      className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto z-[100]
                 bg-brand-bg border-t border-brand-line/15
                 shadow-[0_-8px_24px_rgba(28,26,23,0.06)]
                 px-4"
      style={{
        paddingTop: '14px',
        paddingBottom: 'calc(14px + env(safe-area-inset-bottom))',
      }}
    >
      <div className="flex items-center gap-3.5">
        <div className="shrink-0 flex flex-col gap-1 self-center">
          <div className="text-[11px] text-brand-urgent font-bold tracking-[0.02em]">
            특별 할인
          </div>
          <div className="font-display font-extrabold text-[26px] max-[380px]:text-[22px] text-brand-ink leading-none tabular-nums tracking-[-0.01em]">
            {formatted}
          </div>
        </div>
        <button
          type="button"
          onClick={() => openSheet('fixed_bottom_cta')}
          aria-label="엄선된 사람 소개 받기"
          className="flex-1 bg-brand-orange text-white rounded-full
                     py-[18px] px-5 font-display font-extrabold text-[16px] max-[380px]:text-[15px]
                     tracking-[-0.02em] whitespace-nowrap
                     animate-cta-glow active:scale-[0.97] transition-transform"
        >
          엄선된 사람 소개 받기
        </button>
      </div>
    </div>
  );
}
