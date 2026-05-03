'use client';

import { useTone } from '@/components/report/toneContext';

export function HeroV2({ userName }: { userName: string }) {
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
        {userName}{tone === 'formal' ? '님을' : '이를'} 위해
        <br />
        <span className="text-brand-orange">캐스팅</span>{' '}
        {tone === 'formal' ? '해왔어요' : '해왔어'}
      </h1>
    </div>
  );
}
