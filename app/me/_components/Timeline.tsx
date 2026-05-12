import { C } from '../_lib/tokens';
import { formatDateShort, timeAgo } from '../_lib/format';
import type { TimelineEvent } from '../_lib/types';

const DOT_COLOR_BY_ACTOR: Record<TimelineEvent['by'], string> = {
  me: C.accent,
  partner: C.ok,
  operator: C.gold,
  system: `${C.ink}66`,
};

export function Timeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="text-xs text-center" style={{ color: C.muted }}>
        진행 내역이 없어요.
      </p>
    );
  }
  return (
    <ol className="flex flex-col gap-3">
      {events.map((e, idx) => (
        <li key={`${e.at}-${idx}`} className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="mt-1.5 block rounded-full shrink-0"
            style={{ width: 8, height: 8, background: DOT_COLOR_BY_ACTOR[e.by], border: `1.5px solid ${C.ink}` }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold" style={{ color: C.ink }}>
              {e.label}
            </p>
            <p className="text-[11px]" style={{ color: C.muted }}>
              {formatDateShort(e.at)} · {timeAgo(e.at)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
