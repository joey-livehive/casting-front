'use client';

import Image from 'next/image';
import { Section, SectionLabel, SectionTitle, HL } from './SectionFrame';

interface Couple {
  names: string;
  meta: string;
  photo: string;
  quote: string;
}

const couples: Couple[] = [
  {
    names: 'J & S 커플',
    meta: '강남 헬스장에서 발견',
    photo: '/images/couples/couple1.webp',
    quote: '소개팅앱 몇 개월 써도 허탕만 쳤는데, 여긴 2주 만에 진짜 맞는 사람 만났어요! 서로 등산이라는 취향도 같아서 신기할 정도네요 알콩달콩 잘만나겠습니다 감사합니다!',
  },
  {
    names: 'K & H 커플',
    meta: 'Instagram 캐스팅',
    photo: '/images/couples/couple2.webp',
    quote: '제 요청사항만 보고 이 정도로 저랑 맞는 사람 데려올 줄 몰랐어요. 지금 동거 얘기 중이고 결혼도 진지하게 얘기 중입니다 ㅎㅎㅎ',
  },
  {
    names: 'M & Y 커플',
    meta: 'LinkedIn 캐스팅',
    photo: '/images/couples/couple3.webp',
    quote: '저도 남자친구도 둘 다 소개팅앱 쓰긴 싫고 더이상 사람 만날 곳도 없었는데 정말로 흔치 않은 기회로 잘 만난 것 같아요. 결정사보다 훨씬 합리적이고 소개팅앱보다 훨씬 좋은 사람들이 많은 것 같습니다!',
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
            <div className="relative aspect-[4/3] bg-brand-ink/10 overflow-hidden" onContextMenu={(e) => e.preventDefault()}>
              <Image
                src={c.photo}
                alt=""
                fill
                sizes="260px"
                draggable={false}
                className="object-cover select-none"
                style={{
                  filter: 'blur(8px) saturate(1.05)',
                  transform: 'scale(1.15)',
                  pointerEvents: 'none',
                  WebkitUserSelect: 'none',
                  WebkitTouchCallout: 'none',
                  WebkitUserDrag: 'none',
                } as React.CSSProperties}
              />
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
