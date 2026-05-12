import Link from 'next/link';
import { C } from '../_lib/tokens';

export function RechargeCta({ balance }: { balance: number }) {
  const urgent = balance === 0;
  return (
    <div
      className="mt-10 rounded-3xl p-6 text-center"
      style={{ background: '#FFFFFF', border: `2px solid ${C.ink}`, boxShadow: `4px 4px 0 ${C.ink}` }}
    >
      <p className="font-bold text-base" style={{ color: C.ink }}>
        {urgent ? '만남권을 다 썼어요 🥺' : '더 많은 사람을 만나고 싶다면? 🌏'}
      </p>
      <Link
        href="/payments"
        className="mt-5 inline-flex items-center rounded-full px-5 py-2.5 text-sm font-bold transition-transform hover:-translate-y-0.5"
        style={{ background: C.gold, color: C.ink, border: `2px solid ${C.ink}`, boxShadow: `3px 3px 0 ${C.ink}` }}
      >
        만남권 충전하기
      </Link>
    </div>
  );
}
