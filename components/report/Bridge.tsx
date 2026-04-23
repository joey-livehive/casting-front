'use client';

import { useTone } from './toneContext';

export function BridgeGradient() {
  return (
    <div
      aria-hidden
      className="h-[70px] -mt-px"
      style={{
        background:
          'linear-gradient(180deg, #F5EFE4 0%, #D6C3A2 30%, #8A6E52 65%, #2E2A23 100%)',
      }}
    />
  );
}

export function BridgeIntro() {
  const tone = useTone();
  return (
    <div className="pt-6 pb-20 px-7 text-center relative">
      <div className="font-hand text-[15px] text-brand-mustard mb-[18px] opacity-90 tracking-[0.02em] flex items-center justify-center gap-2">
        <span aria-hidden className="opacity-70">
          ✦
        </span>
        intermission
        <span aria-hidden className="opacity-70">
          ✦
        </span>
      </div>
      <h2 className="font-display font-extrabold text-[28px] leading-[1.4] tracking-[-0.03em] text-dark-text">
        어떻게{' '}
        <span className="relative inline-block font-extrabold text-brand-orange-bright">
          &ldquo;{tone === 'formal' ? '오직 당신만을' : '너만을'}&rdquo;
          <span
            aria-hidden
            className="absolute left-0 right-0 bottom-1 h-[3px] rounded-full bg-brand-orange-bright/70"
          />
        </span>{' '}
        위한
        <br />
        {tone === 'formal' ? '사람을 찾는지 알려드릴게요' : '사람을 찾는지 알려줄게'}
      </h2>
    </div>
  );
}

export function BridgeBack() {
  return <div className="h-20 bg-[linear-gradient(180deg,var(--dark)_0%,var(--bg)_100%)]" />;
}
