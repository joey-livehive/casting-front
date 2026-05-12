'use client';

import { useState } from 'react';
import Link from 'next/link';
import { C } from '../_lib/tokens';
import { formatDateShort, timeAgo } from '../_lib/format';
import {
  PROFILE_SOURCE_LABEL,
  daysUntilExpire,
  deriveStatusLabel,
  deriveTimeline,
  isEnded,
  isExternalSource,
  toneColor,
} from '../_lib/derive';
import type { Match } from '../_lib/types';
import { Timeline } from './Timeline';

export function MatchCard({ match }: { match: Match }) {
  const status = deriveStatusLabel(match);
  const tone = toneColor(status.tone);
  const ended = isEnded(match);
  const remaining = ended ? daysUntilExpire(match) : null;
  const channelLabel =
    isExternalSource(match.partner_source) && match.partner_source
      ? PROFILE_SOURCE_LABEL[match.partner_source] ?? null
      : null;
  const hidden = match.viewer_action === 'pass';
  const [open, setOpen] = useState(false);

  return (
    <article
      className="rounded-3xl overflow-hidden"
      style={{
        background: '#FFFFFF',
        border: `2px solid ${C.ink}`,
        boxShadow: `4px 4px 0 ${C.ink}`,
        opacity: hidden ? 0.7 : 1,
      }}
    >
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: C.muted }}>
            {formatDateShort(match.created_at)} 도착한 매칭
          </p>
          {channelLabel && (
            <span
              className="rounded-full px-2 py-[1px] text-[10px] font-bold"
              style={{ background: `${C.muted}1A`, color: C.muted, border: `1px solid ${C.muted}` }}
            >
              {channelLabel}
            </span>
          )}
        </div>

        {(match.partner_job || match.partner_age) && (
          <p className="mt-2 text-base font-bold" style={{ color: C.ink }}>
            {match.partner_job ?? '직업 미상'}
            {match.partner_age && (
              <span className="ml-1.5 font-normal" style={{ color: C.muted }}>
                | {match.partner_age}세
              </span>
            )}
          </p>
        )}

        {match.partner_tagline && (
          <p
            className="mt-1 text-[13px]"
            style={{ color: C.ink, fontStyle: 'italic', lineHeight: 1.5 }}
          >
            “{match.partner_tagline}”
          </p>
        )}

        <p
          className="mt-4 font-bold"
          style={{ color: tone, fontSize: 'clamp(16px, 4vw, 19px)', lineHeight: 1.3, letterSpacing: '-0.3px' }}
        >
          {status.label}
        </p>

        <div className="mt-1 flex items-center justify-between text-[11px]" style={{ color: C.muted }}>
          <span>{timeAgo(match.updated_at)} 업데이트</span>
          {ended && remaining !== null && (
            <span style={{ color: C.bad, fontWeight: 700 }}>
              {remaining === 0 ? '오늘 자동 삭제' : `${remaining}일 후 자동 삭제`}
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-5 py-3 border-t text-sm font-bold"
        style={{ background: '#FAF6EC', color: C.ink, borderColor: C.ink }}
      >
        <span>진행 상세 보기</span>
        <span
          aria-hidden="true"
          className="inline-block transition-transform"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          ▾
        </span>
      </button>
      {open && (
        <div className="px-5 py-4 border-t" style={{ background: '#FFFCF2', borderColor: `${C.ink}33` }}>
          <Timeline events={deriveTimeline(match)} />
        </div>
      )}

      {!hidden && match.report_url && (
        <Link
          href={match.report_url}
          className="block py-3 text-center text-sm font-bold border-t"
          style={{ background: C.gold, color: C.ink, borderColor: C.ink }}
        >
          매칭 리포트 보기
        </Link>
      )}
    </article>
  );
}
