'use client';

import { useTone } from './toneContext';
import { Section, SectionLabel, SectionTitle, HL } from './SectionFrame';

interface Row {
  k: string;
  v: string;
  dim?: boolean;
}

interface Brand {
  brand: string;
  us?: boolean;
  rows: Row[];
}

const sides: Brand[] = [
  {
    brand: '결정사',
    rows: [
      { k: '가격', v: '수백만원' },
      { k: '범위', v: '내부 DB', dim: true },
      { k: '소요', v: '1~3개월', dim: true },
      { k: '검증', v: '매니저' },
    ],
  },
  {
    brand: '소개팅앱',
    rows: [
      { k: '가격', v: '월 구독' },
      { k: '범위', v: '앱 내부', dim: true },
      { k: '소요', v: '즉시', dim: true },
      { k: '검증', v: '없음', dim: true },
    ],
  },
];

const center: Brand = {
  brand: 'casting',
  us: true,
  rows: [
    { k: '가격', v: '4~10만원대' },
    { k: '범위', v: '앱 밖까지' },
    { k: '소요', v: '2~3일+' },
    { k: '검증', v: 'AI+매니저' },
  ],
};

export function PriceCompare() {
  const tone = useTone();
  return (
    <Section>
      <SectionLabel>가격 비교</SectionLabel>
      <SectionTitle>
        근데 <HL>가격은</HL> 훨씬 합리적
      </SectionTitle>

      <div className="grid grid-cols-[1fr_1.3fr_1fr] gap-2 items-start">
        {[sides[0], center, sides[1]].map((c) => {
          const isUs = !!c.us;
          return (
            <div
              key={c.brand}
              className={`rounded-[14px] py-4 px-2.5 border-[1.5px] border-brand-line text-center relative ${
                isUs
                  ? 'bg-brand-orange text-white shadow-[3px_4px_0_var(--line)] -mt-1 scale-[1.04] z-10'
                  : 'bg-[#E8E3D6]'
              }`}
            >
              <div
                className={`font-display font-extrabold tracking-[-0.02em] mb-[11px] pb-[9px] whitespace-nowrap overflow-hidden text-ellipsis border-b ${
                  isUs ? 'text-[13.5px] border-white/30' : 'text-[12.5px] border-black/10'
                }`}
              >
                {c.brand}
              </div>
              {c.rows.map((r, i) => (
                <div
                  key={r.k}
                  className={`py-2 text-[12px] leading-[1.35] ${
                    isUs ? 'text-white' : 'text-brand-ink-soft'
                  } ${i < c.rows.length - 1 ? (isUs ? 'border-b border-dashed border-white/20' : 'border-b border-dashed border-black/10') : ''}`}
                >
                  <div
                    className={`text-[10px] mb-[3px] tracking-[0.02em] ${
                      isUs ? 'text-white/80' : 'text-brand-ink-mute'
                    }`}
                  >
                    {r.k}
                  </div>
                  <div
                    className={`font-display font-bold ${
                      isUs
                        ? 'text-[13.5px] text-white'
                        : r.dim
                          ? 'text-[12.5px] text-brand-ink-mute font-normal'
                          : 'text-[12.5px] text-brand-ink'
                    }`}
                  >
                    {r.v}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div className="mt-[18px] text-center font-hand text-[14px] text-brand-ink-soft">
        결정사 가격의 <b className="text-brand-orange-deep font-bold">1/10</b>
        {tone === 'formal' ? ', 찾는 범위는 훨씬 넓어요.' : ', 근데 찾는 범위는 훨씬 넓어.'}
      </div>
    </Section>
  );
}
