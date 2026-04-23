'use client';

import { useTone } from './toneContext';

export function FinalSignature() {
  const tone = useTone();
  return (
    <div className="pt-9 px-7 pb-7 text-center">
      <div className="font-hand text-[18px] leading-[1.75] text-brand-ink">
        {tone === 'formal' ? '회원님 시간은 소중하니까요.' : '네 시간은 소중하니까.'}
        <br />
        <span className="text-brand-orange font-bold">someonetheone</span>이
        <br />
        {tone === 'formal' ? '대신 발품 팔아둘게요. 💌' : '대신 발품 팔아둘게. 💌'}
      </div>
    </div>
  );
}
