import { Section, SectionLabel, SectionTitle, HL } from './SectionFrame';

interface Couple {
  names: string;
  meta: string;
  placeholder: string;
  quote: string;
}

const couples: Couple[] = [
  {
    names: 'J님 & S님',
    meta: '강남 헬스장에서 찾음 · 매칭 5일',
    placeholder: '[뒷모습 사진\nplaceholder]',
    quote: '소개팅앱 6개월 써도 못 만나던 사람, 여기서 딱 2주 만에 만났어요.',
  },
  {
    names: 'K님 & H님',
    meta: 'Instagram 캐스팅 · 매칭 7일',
    placeholder: '[손만 보이는 사진\nplaceholder]',
    quote: '이렇게까지 내 성향 파악해서 데려올 줄 몰랐어요. 결혼 얘기 중이에요.',
  },
  {
    names: 'M님 & Y님',
    meta: 'LinkedIn 캐스팅 · 매칭 4일',
    placeholder: '[그림자 사진\nplaceholder]',
    quote: '가벼운 만남이 지긋지긋했는데, 여긴 시작부터 진지해서 편했어요.',
  },
];

export function CoupleTestimonials() {
  return (
    <Section>
      <SectionLabel>우리가 만든 인연</SectionLabel>
      <SectionTitle>
        이런 커플을 <HL>만들었어</HL>
      </SectionTitle>

      <div
        className="flex gap-3.5 overflow-x-auto pt-1 pb-3.5 px-7 -mx-7 snap-x snap-mandatory
                   [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {couples.map((c) => (
          <div
            key={c.names}
            className="shrink-0 w-[260px] snap-start bg-brand-cream border-[1.5px] border-brand-line
                       rounded-[18px] overflow-hidden shadow-[4px_5px_0_var(--line)]"
          >
            <div className="relative aspect-[4/3] bg-[linear-gradient(135deg,#D4B896_0%,#8A7C60_100%)] flex items-center justify-center text-white/60 font-hand text-[13px] text-center p-5 whitespace-pre-line">
              <div className="absolute top-2.5 left-2.5 bg-brand-ink text-brand-cream font-hand text-[11px] px-2 py-0.5 rounded-[10px]">
                💑 real couple
              </div>
              {c.placeholder}
            </div>
            <div className="p-4 pb-[18px]">
              <div className="font-display font-bold text-[14px] mb-1 text-brand-ink">{c.names}</div>
              <div className="font-hand text-[12px] text-brand-orange-deep mb-2.5">{c.meta}</div>
              <div className="relative pl-3.5 text-[13px] leading-[1.6] text-brand-ink-soft">
                <span
                  aria-hidden
                  className="absolute left-0 -top-1 font-display text-2xl text-brand-orange leading-none"
                >
                  &ldquo;
                </span>
                {c.quote}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
