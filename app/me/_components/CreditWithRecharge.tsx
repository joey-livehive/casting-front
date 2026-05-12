import Link from 'next/link';
import { C } from '../_lib/tokens';
import type { DashboardResponse } from '../_lib/types';

export function CreditWithRecharge({ credits }: { credits: DashboardResponse['credits'] }) {
  return (
    <div
      className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3"
      style={{ background: '#FFFFFF', border: `2px solid ${C.ink}`, boxShadow: `3px 3px 0 ${C.ink}` }}
    >
      <span className="text-sm font-bold" style={{ color: C.ink }}>
        남은 만남권 {credits.balance}장
      </span>
      <Link
        href="/payments"
        className="shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-transform hover:-translate-y-0.5"
        style={{ background: C.gold, color: C.ink, border: `2px solid ${C.ink}`, boxShadow: `2px 2px 0 ${C.ink}` }}
      >
        만남권 충전하기
      </Link>
    </div>
  );
}
