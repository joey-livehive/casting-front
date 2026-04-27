'use client';

import { useEffect, useState } from 'react';
import { PricingPlan } from '@/lib/report/types';
import { track } from '@/lib/report/tracking';

interface Plan extends PricingPlan {
  desc: string;
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: '스타터',
    originalPrice: 24900,
    discountedPrice: 19900,
    discountPercent: 20,
    cardCount: 5,
    desc: '엄선된 5명 프로필 카드 전달',
  },
  {
    id: 'regular',
    name: '레귤러',
    originalPrice: 44900,
    discountedPrice: 34900,
    discountPercent: 22,
    cardCount: 10,
    recommended: true,
    desc: '엄선된 10명 프로필 카드 전달',
  },
  {
    id: 'premium',
    name: '프리미엄',
    originalPrice: 64900,
    discountedPrice: 49900,
    discountPercent: 23,
    cardCount: 20,
    desc: '엄선된 20명 프로필 카드 전달',
  },
];

function perPerson(plan: Plan) {
  return Math.round(plan.discountedPrice / plan.cardCount).toLocaleString();
}

interface Props {
  open: boolean;
  onClose: () => void;
  reportId: string;
}

export function PurchaseBottomSheet({ open, onClose, reportId }: Props) {
  const [selectedId, setSelectedId] = useState<Plan['id']>('regular');
  const selected = plans.find((p) => p.id === selectedId)!;
  const [paying, setPaying] = useState(false);

  const selectPlan = (id: Plan['id']) => {
    setSelectedId(id);
    track('plan_select', { reportId, plan: id, amount: plans.find((p) => p.id === id)?.discountedPrice, version: 'v7' });
  };

  useEffect(() => {
    if (open) track('sheet_open', { reportId, version: 'v7' });
  }, [open, reportId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  const handlePay = async () => {
    if (paying) return;
    setPaying(true);

    track('purchase_click', { reportId, plan: selected.id, amount: selected.discountedPrice, version: 'v7' }, {
      pixel: 'InitiateCheckout',
      pixelData: {
        value: selected.discountedPrice,
        currency: 'KRW',
        content_ids: ['someonetheone'],
        content_name: `report_${reportId}_${selected.id}`,
      },
    });

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
      alert('결제 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setPaying(false);
    }
  };

  return (
    <>
      <div
        className={`v7-sheet-backdrop${open ? ' open' : ''}`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <div
        className={`v7-sheet${open ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="플랜 선택"
      >
        <div className="sheet-grab" />
        <div className="sheet-head">
          <span className="sh-kicker">SELECT A PLAN</span>
          <button type="button" className="sh-close" onClick={onClose} aria-label="닫기">
            닫기
          </button>
        </div>
        <div className="sh-title">플랜을 선택해 주세요.</div>

        <div className="sheet-plans">
          {plans.map((p) => {
            const isSelected = selectedId === p.id;
            const cls = ['plan'];
            if (isSelected) cls.push('selected');
            if (p.recommended) cls.push('recommend');
            return (
              <div
                key={p.id}
                className={cls.join(' ')}
                onClick={() => selectPlan(p.id)}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedId(p.id);
                  }
                }}
              >
                <div className="plan-top">
                  <span className="plan-name">{p.name}</span>
                  <div className="price-stack">
                    <div>
                      <span className="price-badge">-{p.discountPercent}%</span>
                      <span className="price-original">{p.originalPrice.toLocaleString()}원</span>
                    </div>
                    <div className="price-current">
                      {p.discountedPrice.toLocaleString()}
                      <span className="won">원</span>
                    </div>
                  </div>
                </div>
                <p className="plan-desc">{p.desc}</p>
                <p className="plan-per">1인당 약 {perPerson(p)}원</p>
              </div>
            );
          })}
        </div>

        <div className="sheet-terms">
          결제 정보를 확인했으며{' '}
          <a href="#" onClick={(e) => e.preventDefault()}>
            개인정보 처리방침
          </a>
          과{' '}
          <a href="#" onClick={(e) => e.preventDefault()}>
            서비스 이용약관
          </a>
          에 동의합니다.
        </div>

        <div className="sheet-pay">
          <button type="button" onClick={handlePay} disabled={paying} style={paying ? { opacity: 0.6 } : undefined}>
            <span>{paying ? '결제 준비 중...' : '결제 진행'}</span>
            <svg viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M1 7H13M13 7L8 2M13 7L8 12"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="square"
              />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
