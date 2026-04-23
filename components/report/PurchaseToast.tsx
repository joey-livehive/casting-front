'use client';

import { useToastRotation } from '@/hooks/useToastRotation';
import { PurchaseToast as ToastItem } from '@/lib/report/purchaseToastData';

function renderToastBody(t: ToastItem) {
  const name = <b className="text-brand-mustard font-display font-bold">{t.name}</b>;

  if (t.type === 'purchase') {
    return (
      <>
        {name}님이{' '}
        <b className="text-brand-mustard font-display font-bold">{t.time}</b>에 구매했어요
      </>
    );
  }
  if (t.type === 'match') {
    return (
      <>
        {name}님이{' '}
        <b className="text-brand-mustard font-display font-bold">{t.count}명</b>의 상대와
        매칭됐어요
      </>
    );
  }
  // meet
  return (
    <>
      {name}님이{' '}
      <b className="text-brand-mustard font-display font-bold">{t.phrase}</b>
    </>
  );
}

export function PurchaseToast() {
  const { currentToast, visible } = useToastRotation();

  return (
    <div
      className="fixed left-0 right-0 max-w-[480px] mx-auto z-[95] pointer-events-none px-4 flex justify-end"
      style={{ bottom: 'calc(94px + env(safe-area-inset-bottom))' }}
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        className={`bg-brand-ink/95 text-white rounded-full px-3.5 py-2 text-[12px]
                    shadow-[0_6px_20px_rgba(0,0,0,0.25)]
                    border border-white/10 transition-[opacity,transform] duration-[400ms]
                    ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2.5'}`}
      >
        <div className="leading-[1.25] whitespace-nowrap">
          {currentToast ? renderToastBody(currentToast) : null}
        </div>
      </div>
    </div>
  );
}
