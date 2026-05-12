import { C } from '../_lib/tokens';
import { formatDate, formatWon } from '../_lib/format';
import type { DashboardOrder } from '../_lib/types';

export function OrderRow({ order }: { order: DashboardOrder }) {
  return (
    <article
      className="rounded-2xl px-4 py-3"
      style={{ background: '#FFFFFF', border: `2px solid ${C.ink}`, boxShadow: `3px 3px 0 ${C.ink}` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold" style={{ color: C.ink }}>
            {order.product_name}
          </p>
          <p className="mt-0.5 text-[11px]" style={{ color: C.muted }}>
            {order.order_id}
          </p>
        </div>
        <p className="text-sm font-extrabold" style={{ color: C.ink }}>
          {formatWon(order.amount)}
        </p>
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px]" style={{ color: C.muted }}>
        <span>만남권 {order.credits}장</span>
        <span>{formatDate(order.paid_at || order.created_at)}</span>
      </div>
    </article>
  );
}
