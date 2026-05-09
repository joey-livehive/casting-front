'use client';

// receiver Hero — like 받은 사람 입장.
// 우리 서비스는 사용자 이름을 받지 않으므로 호칭 없이 "당신" 톤.
// 톤: 부드러운 안내가 아니라 "당신을 원하는 사람이 있다" 라는 직접적 호기심·욕망 자극.
export function ReceiverHero() {
  return (
    <div className="px-7 pt-6 pb-10 relative">
      <span
        className="inline-block font-hand text-[16px] bg-brand-ink text-brand-cream
                   px-3.5 py-1 rounded-[20px] mb-[22px] -rotate-2"
      >
        두근두근, 당신은 캐스팅 되었어요
      </span>
      <h1
        className="font-display font-extrabold text-[34px] max-[380px]:text-[28px] leading-[1.25]
                   tracking-[-0.035em] text-brand-ink"
      >
        당신을 <span className="text-brand-orange">원하는</span>
        <br />한 사람이 있어요!
      </h1>
    </div>
  );
}
