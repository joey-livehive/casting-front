'use client';

import { useTone } from './toneContext';

export function DmMock() {
  const tone = useTone();
  const note = tone === 'formal' ? '💡 고객 정보는 절대 공개하지 않아요' : '💡 네 정보는 절대 공개하지 않아';
  return (
    <div className="mt-[14px] bg-white border-[1.5px] border-brand-line rounded-[14px] p-[14px] shadow-[0_6px_16px_rgba(0,0,0,0.25)]">
      <div className="flex items-center gap-2.5 pb-2.5 border-b border-dashed border-black/15 mb-2.5">
        <div className="w-8 h-8 rounded-full bg-[linear-gradient(135deg,#EC6A3D,#F5B847)] flex items-center justify-center text-white font-display font-bold text-[13px]">
          S
        </div>
        <div>
          <div className="font-display font-bold text-[13px] text-brand-ink">someonetheone</div>
          <div className="text-[11px] text-brand-ink-mute">@someonetheone_official</div>
        </div>
      </div>
      <div className="bg-brand-bg-deep rounded-[14px] rounded-tl-[4px] px-3.5 py-2.5 text-[13px] leading-[1.55] text-brand-ink max-w-[92%]">
        안녕하세요 :) someonetheone에서 활동하는 캐스팅 매니저예요.
      </div>
      <div className="mt-1.5 bg-brand-bg-deep rounded-[14px] rounded-tl-[4px] px-3.5 py-2.5 text-[13px] leading-[1.55] text-brand-ink max-w-[92%] [&_b]:font-display [&_b]:font-bold">
        피드 분위기 보고 연락드려요. 저희가 찾던 분위기랑 딱 맞으셔서요.{' '}
        혹시 <b>&ldquo;진지한 인연을 찾는 사람과 한 번 만나볼 기회&rdquo;</b> 드려도 될까요?
      </div>
      <div className="mt-3 font-hand text-[13px] text-brand-orange-deep flex items-center gap-1.5">
        {note}
      </div>
    </div>
  );
}
