'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { track } from '@/lib/report/tracking';
import { API_BASE } from '../../api';

type Status = 'confirming' | 'done' | 'error';

function SuccessInner() {
  const params = useSearchParams();
  const [status, setStatus] = useState<Status>('confirming');
  const confirmedRef = useRef(false);

  useEffect(() => {
    // StrictMode / params 재귀 대비: confirm 은 1회만
    if (confirmedRef.current) return;

    const orderId = params.get('orderId');
    const paymentKey = params.get('paymentKey');
    const amount = params.get('amount');

    if (!orderId || !paymentKey || !amount) {
      setStatus('error');
      return;
    }

    confirmedRef.current = true;

    fetch(`${API_BASE}/theone/payments/toss/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payment_key: paymentKey,
        order_id: orderId,
        amount: Number(amount),
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('confirm failed');
        return res.json();
      })
      .then((data) => {
        if (data.status !== 'success') {
          setStatus('error');
          return;
        }
        setStatus('done');
        track('purchase_complete', { orderId, amount: Number(amount) }, {
          pixel: 'Purchase',
          pixelData: {
            value: Number(amount),
            currency: 'KRW',
            content_ids: ['someonetheone'],
            content_name: orderId,
          },
        });
      })
      .catch(() => setStatus('error'));
  }, [params]);

  return (
    <main className="app">
      <div className="phase screen-fade" style={{ textAlign: 'center' }}>
        <div className="phase__header">
          {status === 'confirming' && (
            <p className="phase__sub">결제를 확인하고 있습니다...</p>
          )}
          {status === 'done' && (
            <>
              <h2 className="phase__title">
                <em>결제</em>가 완료되었습니다.
              </h2>
              <p className="phase__sub">
                엄선된 카드를 준비하고 있습니다.
                <br />
                마쳐지는 즉시 알려드리겠습니다.
              </p>
            </>
          )}
          {status === 'error' && (
            <>
              <h2 className="phase__title">결제 확인에 실패했습니다.</h2>
              <p className="phase__sub">
                결제가 완료됐다면 자동으로 처리됩니다.
                <br />
                문제가 계속되면 문의해 주세요.
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="app">
          <div className="phase screen-fade" style={{ textAlign: 'center' }}>
            <p className="phase__sub">결제를 확인하고 있습니다...</p>
          </div>
        </main>
      }
    >
      <SuccessInner />
    </Suspense>
  );
}
