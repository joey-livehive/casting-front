'use client';

import { useEffect, useState } from 'react';
import { PricingPlan } from '@/lib/report/types';
import { useTone } from './toneContext';
import { SafeText } from './SafeText';

const plans: PricingPlan[] = [
  {
    id: 'starter',
    name: '스타터',
    originalPrice: 49900,
    discountedPrice: 39900,
    discountPercent: 20,
    cardCount: 5,
  },
  {
    id: 'regular',
    name: '레귤러',
    originalPrice: 89900,
    discountedPrice: 69900,
    discountPercent: 22,
    cardCount: 10,
    conversationGuarantee: 3,
    recommended: true,
  },
  {
    id: 'premium',
    name: '프리미엄',
    originalPrice: 129900,
    discountedPrice: 99900,
    discountPercent: 23,
    cardCount: 20,
    conversationGuarantee: 10,
  },
];

function perPerson(plan: PricingPlan) {
  return Math.round(plan.discountedPrice / plan.cardCount).toLocaleString();
}

function planDesc(plan: PricingPlan) {
  return `엄선된 <b>${plan.cardCount}명 카드</b> 받고 대화하기`;
}

interface PurchaseBottomSheetProps {
  open: boolean;
  onClose: () => void;
  reportId: string;
}

export function PurchaseBottomSheet({ open, onClose, reportId }: PurchaseBottomSheetProps) {
  const [selectedId, setSelectedId] = useState<PricingPlan['id']>('regular');
  const selected = plans.find((p) => p.id === selectedId)!;
  const tone = useTone();

  // ESC로 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // 바디 스크롤 잠금
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  const [paying, setPaying] = useState(false);

  const handlePay = async () => {
    if (paying) return;
    setPaying(true);

    if (typeof window !== 'undefined') {
      const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
      if (fbq) {
        fbq('track', 'InitiateCheckout', {
          value: selected.discountedPrice,
          currency: 'KRW',
          content_ids: ['someonetheone'],
          content_name: `report_${reportId}_${selected.id}`,
        });
      }
    }

    try {
      const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.publicvoid.im';
      const guestUid = new URLSearchParams(window.location.search).get('guest') || undefined;

      const orderRes = await fetch(`${API}/theone/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guest_uid: guestUid, product_id: selected.id, report_id: reportId }),
      });
      if (!orderRes.ok) throw new Error('주문 생성 실패');
      const order = await orderRes.json();

      const startRes = await fetch(`${API}/theone/payments/toss/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: order.order_id,
          amount: order.amount,
          order_name: `someonetheone ${selected.name}`,
        }),
      });
      if (!startRes.ok) throw new Error('결제 시작 실패');
      const toss = await startRes.json();

      const checkoutUrl = toss.checkout?.url;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
        return;
      }
    } catch (e) {
      console.error('[purchase_error]', e);
      alert('결제 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setPaying(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/55 z-[200] transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!open}
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="결제 플랜 선택"
        className={`fixed left-0 right-0 bottom-0 max-w-[480px] mx-auto bg-brand-bg z-[210]
                    rounded-t-[24px] max-h-[88vh] overflow-y-auto
                    transition-transform duration-[400ms]
                    ${open ? 'translate-y-0' : 'translate-y-full'}`}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.2, 0.9, 0.3, 1)',
          paddingBottom: 'calc(20px + env(safe-area-inset-bottom))',
        }}
      >
        {/* Grab */}
        <div className="w-10 h-1 bg-brand-ink-mute opacity-50 rounded my-3 mx-auto mb-1.5" />

        {/* Head */}
        <div className="flex items-baseline justify-between px-6 pt-3.5 pb-2.5">
          <div className="font-display font-extrabold text-[20px] tracking-[-0.02em]">
            {tone === 'formal' ? '몇 명까지 받아보시겠어요?' : '몇 명까지 받아볼래?'}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="bg-transparent border-none text-[22px] text-brand-ink-mute"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
        <div className="px-6 pb-3 text-[13px] text-brand-ink-soft leading-[1.55]">
          {tone === 'formal'
            ? '결제 후 바로 블러가 풀리고, 나머지 카드도 7일 안에 전달돼요.'
            : '결제 후 바로 블러가 풀리고, 나머지 카드도 7일 안에 전달돼.'}
        </div>

        {/* Plans */}
        <div className="px-5 pt-3.5 flex flex-col gap-3.5">
          {plans.map((plan) => {
            const isSelected = selectedId === plan.id;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedId(plan.id)}
                aria-pressed={isSelected}
                className={`relative text-left bg-brand-cream border-2 rounded-2xl p-[18px] transition-all
                            ${
                              isSelected
                                ? 'border-brand-orange bg-[linear-gradient(180deg,#FFF3DC_0%,var(--cream)_100%)] shadow-[3px_4px_0_var(--line)]'
                                : plan.recommended
                                  ? 'border-brand-orange'
                                  : 'border-brand-line'
                            }`}
              >
                {plan.recommended && (
                  <div
                    className="absolute top-[-12px] left-1/2 -translate-x-1/2 bg-brand-orange text-white
                               font-hand text-[13px] px-3.5 py-[3px] rounded-[14px]
                               border-[1.5px] border-brand-line whitespace-nowrap"
                  >
                    ✨ 제일 많이 골라
                  </div>
                )}
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div className="font-display font-bold text-[16px] tracking-[-0.02em] pt-1.5 text-brand-ink">
                    {plan.name}
                  </div>
                  <div className="text-right leading-[1.1]">
                    <div>
                      <span className="inline-block bg-brand-urgent text-white font-display font-bold text-[11px] px-[7px] py-0.5 rounded-[10px] mr-1.5 align-middle">
                        -{plan.discountPercent}%
                      </span>
                      <span className="text-[12px] text-brand-ink-mute line-through">
                        {plan.originalPrice.toLocaleString()}원
                      </span>
                    </div>
                    <span className="block mt-1 font-display font-extrabold text-[22px] text-brand-orange-deep tracking-[-0.03em]">
                      {plan.discountedPrice.toLocaleString()}
                      <span className="text-[13px] font-semibold ml-[1px]">원</span>
                    </span>
                  </div>
                </div>
                <div className="text-[13px] text-brand-ink-soft leading-[1.55] mt-1 [&_b]:font-display [&_b]:text-brand-ink">
                  <SafeText>{planDesc(plan)}</SafeText>
                </div>
                <div className="font-hand text-[11.5px] text-brand-ink-mute mt-1.5">
                  1명당 약 {perPerson(plan)}원
                </div>
              </button>
            );
          })}
        </div>

        {/* Terms */}
        <div className="px-5 pt-6 text-[11px] text-brand-ink-mute text-center leading-[1.5]">
          결제 정보를 확인했고 <a className="text-brand-ink-soft underline">개인정보 처리방침</a>과{' '}
          <a className="text-brand-ink-soft underline">서비스 이용약관</a>에 동의합니다
        </div>

        {/* Pay */}
        <div className="px-5 pt-4">
          <button
            type="button"
            onClick={handlePay}
            disabled={paying}
            className={`w-full bg-brand-orange text-white border-[1.5px] border-brand-line
                       rounded-full py-4 font-display font-extrabold text-[17px]
                       tracking-[-0.02em] shadow-[3px_3px_0_var(--line)]
                       active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_var(--line)]
                       ${paying ? 'opacity-60 pointer-events-none' : ''}`}
          >
            {paying ? '결제 준비 중...' : '결제하고 엄선된 사람 소개 받기!'}
          </button>
        </div>
      </div>
    </>
  );
}
