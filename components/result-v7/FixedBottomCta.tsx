'use client';

import { useCountdown } from '@/hooks/useCountdown';
import { useSheet } from './sheetContext';

export function FixedBottomCta() {
  const { short } = useCountdown(12 * 60);
  const { openSheet } = useSheet();

  return (
    <div className="v7-fixed-cta">
      <div className="fc-row">
        <div className="fc-timer">
          <span className="fc-timer-label">EARLY ACCESS</span>
          <span className="fc-timer-val">{short}</span>
        </div>
        <button type="button" className="fc-btn" onClick={() => openSheet('fixed_bottom_cta')}>
          <span>사진 보기</span>
          <svg viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path
              d="M1 7H13M13 7L8 2M13 7L8 12"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="square"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
