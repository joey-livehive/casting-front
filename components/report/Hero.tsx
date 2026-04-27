'use client';

import { useTone } from './toneContext';

export function Hero({ userName }: { userName: string }) {
  const tone = useTone();
  return (
    <div className="px-7 pt-6 pb-10 relative">
      <span
        className="inline-block font-hand text-[16px] bg-brand-ink text-brand-cream
                   px-3.5 py-1 rounded-[20px] mb-[22px] -rotate-2"
      >
        {tone === 'formal' ? '찾았어요, 꼭 맞는 사람' : '찾았어, 너에게 꼭 맞는 사람'}
      </span>
      <h1
        className="font-display font-extrabold text-[34px] max-[380px]:text-[28px] leading-[1.25]
                   tracking-[-0.035em] text-brand-ink"
      >
        <span className="text-brand-orange">{userName}님을 위해</span>
        {' '}
        {tone === 'formal' ? '찾아왔어요.' : '찾아왔어.'}
      </h1>
    </div>
  );
}
