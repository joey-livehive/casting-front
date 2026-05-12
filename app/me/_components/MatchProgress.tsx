'use client';

import { useState } from 'react';
import { C } from '../_lib/tokens';
import type { Match } from '../_lib/types';
import { MatchCard } from './MatchCard';
import { EmptyMatchesState } from './EmptyMatchesState';

type ProgressTab = 'active' | 'ended';

export function MatchProgress({
  active,
  ended,
  phoneVerified,
}: {
  active: Match[];
  ended: Match[];
  phoneVerified: boolean;
}) {
  const [tab, setTab] = useState<ProgressTab>('active');
  const list = tab === 'active' ? active : ended;
  const total = active.length + ended.length;

  return (
    <section className="mb-8">
      <h2 className="mb-3 font-bold" style={{ color: C.ink, fontSize: 'clamp(18px, 4vw, 22px)' }}>
        진행 현황
      </h2>

      <div className="mb-4 flex items-center gap-2">
        <TabButton active={tab === 'active'} onClick={() => setTab('active')}>
          진행 중 <span className="opacity-60">({active.length})</span>
        </TabButton>
        <TabButton active={tab === 'ended'} onClick={() => setTab('ended')}>
          마무리됨 <span className="opacity-60">({ended.length})</span>
        </TabButton>
      </div>

      {tab === 'ended' && ended.length > 0 && (
        <p className="mb-3 text-[11px]" style={{ color: C.muted }}>
          개인정보 보호를 위해 종료 후 3일 안에 사라져요.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {total === 0 ? (
          <EmptyMatchesState phoneVerified={phoneVerified} />
        ) : list.length === 0 ? (
          <EmptyTab tab={tab} />
        ) : (
          list.map((m) => <MatchCard key={m.report_uid} match={m} />)
        )}
      </div>
    </section>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="rounded-full px-3.5 py-1.5 text-xs font-bold transition-transform"
      style={{
        background: active ? C.ink : '#FFFFFF',
        color: active ? C.bg : C.ink,
        border: `2px solid ${C.ink}`,
        boxShadow: active ? 'none' : `2px 2px 0 ${C.ink}`,
      }}
    >
      {children}
    </button>
  );
}

function EmptyTab({ tab }: { tab: ProgressTab }) {
  return (
    <div
      className="rounded-2xl p-5 text-center text-sm"
      style={{ border: `2px dashed ${C.ink}33`, color: C.muted }}
    >
      {tab === 'active' ? '진행 중인 매칭이 없어요.' : '마무리된 매칭이 없어요.'}
    </div>
  );
}
