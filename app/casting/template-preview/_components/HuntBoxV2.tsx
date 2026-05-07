import type { ReactNode } from 'react';
import { ReportData } from '@/lib/report/types';

interface HuntBoxV2Props {
  stats: ReportData['huntStats'];
  footer?: ReactNode;
  sourceLabel?: string;
}

// HuntBox v2 매칭 페이지 전용. v1 HuntBox와 동일하지만 "찾은 장소: 캐스팅 내부 POOL" 부분을
// 우표(stamp) 스타일로 강조 — mustard pill + 살짝 회전 + drop shadow
export function HuntBoxV2({ stats, footer, sourceLabel = '캐스팅 내부 POOL' }: HuntBoxV2Props) {
  const items: { n: number; unit: string; label: string }[] = [
    { n: stats.offlineGyms, unit: '곳', label: '헬스장' },
    { n: stats.instagramProfiles, unit: '명', label: 'Instagram 프로필' },
    { n: stats.linkedinProfiles, unit: '명', label: 'LinkedIn 프로필' },
    { n: stats.communities, unit: '곳', label: '동호회 · 모임' },
  ];

  return (
    <div className="px-7 mt-7">
      <div
        className="relative bg-brand-cream border-[1.5px] border-brand-line
                   rounded-[18px] pt-6 pb-[22px] px-[22px]
                   shadow-[4px_5px_0_var(--line)]"
      >
        <div
          className="absolute top-[-13px] left-[18px] bg-brand-orange text-white
                     font-hand text-[15px] px-[13px] py-1 rounded-[14px]
                     border-[1.5px] border-brand-line"
        >
          📍 찾아온 경로
        </div>

        <div className="mt-2 mb-4">
          <div className="font-hand text-[13px] text-brand-orange-deep tracking-[0.18em] uppercase mb-2">
            찾은 장소
          </div>
          <div
            className="inline-block font-display font-extrabold text-[22px] text-brand-ink
                       tracking-[-0.02em]"
          >
            {sourceLabel}
          </div>
        </div>

        <div className="pt-3 border-t border-dashed border-brand-ink/20">
          <div className="font-hand text-[14px] text-brand-orange-deep tracking-[0.18em] uppercase mb-3">
            그 외 찾아본 경로
          </div>
          <div className="grid grid-cols-1 gap-y-2.5 min-[400px]:grid-cols-2 min-[400px]:gap-x-3 min-[400px]:gap-y-4">
            {items.map((it) => (
              <div key={it.label} className="flex items-baseline gap-2">
                <div className="font-display font-extrabold text-[26px] text-brand-orange-deep tracking-[-0.04em]">
                  {it.n}
                  <span className="text-[15px] text-brand-ink-soft">{it.unit}</span>
                </div>
                <div className="text-[13px] text-brand-ink-soft">{it.label}</div>
              </div>
            ))}
          </div>
          {footer}
        </div>
      </div>
    </div>
  );
}
