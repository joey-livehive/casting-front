'use client';

import { ReportData } from '@/lib/report/types';
import { useTone } from './toneContext';

interface HuntBoxProps {
  userName: string;
  stats: ReportData['huntStats'];
  effort: ReportData['effort'];
  total: number;
}

export function HuntBox({ userName, stats, effort, total }: HuntBoxProps) {
  const tone = useTone();
  const items: { n: number; unit: string; label: string }[] = [
    { n: stats.offlineGyms, unit: '곳', label: '오프라인 헬스장' },
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

        <div className="grid grid-cols-2 gap-x-3 gap-y-4 mt-2">
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

        <div className="mt-4 flex gap-2">
          <div
            className="flex-1 bg-brand-mustard/20 border border-brand-mustard-deep
                       rounded-xl px-3 py-[13px] text-[13px] text-brand-ink
                       leading-[1.45] text-center"
          >
            <b className="block font-display font-extrabold text-brand-orange-deep text-[15px] mb-[3px]">
              {effort.castingHours}시간
            </b>
            캐스팅 매니저 발품
          </div>
          <div
            className="flex-1 bg-brand-mustard/20 border border-brand-mustard-deep
                       rounded-xl px-3 py-[13px] text-[13px] text-brand-ink
                       leading-[1.45] text-center"
          >
            <b className="block font-display font-extrabold text-brand-orange-deep text-[15px] mb-[3px]">
              {effort.verificationMeetings}건
            </b>
            오프라인 검증 미팅
          </div>
        </div>

        <div
          className="mt-[18px] pt-4 border-t border-dashed border-brand-ink-mute
                     font-hand text-[17px] text-brand-ink leading-[1.55]"
        >
          → 그 중에서 {userName}님과 가장 잘 맞을{' '}
          <b className="text-brand-orange-deep">{total}명</b>을{' '}
          {tone === 'formal' ? '골라왔어요.' : '골라왔어.'}
          <br />
          맛보기로 딱 <b className="text-brand-orange-deep">1명</b>만 먼저{' '}
          {tone === 'formal' ? '보여드릴게요.' : '보여줄게.'}
        </div>
      </div>
    </div>
  );
}
