'use client';

import Link from 'next/link';
import { C } from '../_lib/tokens';
import { CASES } from '../_lib/mock-cases';

export function CaseSwitcher({ current, usingMock }: { current: string; usingMock: boolean }) {
  return (
    <div className="mx-auto max-w-xl px-5 pt-3" aria-label="dev case switcher">
      <div
        className="rounded-2xl px-3 py-2 flex flex-wrap items-center gap-1.5 text-[11px]"
        style={{ background: '#FFFFFF', border: `2px dashed ${C.ink}`, color: C.muted }}
      >
        <span className="font-bold mr-1" style={{ color: C.ink }}>
          dev
        </span>
        <CaseChip href="/me" label="실 API" active={!usingMock} />
        {Object.entries(CASES).map(([key, c]) => (
          <CaseChip key={key} href={`/me?case=${key}`} label={c.label} active={current === key} />
        ))}
        <button
          type="button"
          onClick={() => {
            localStorage.removeItem('casting_user_token');
            localStorage.removeItem('casting_user_uid');
            window.location.href = '/me';
          }}
          className="ml-auto rounded-full px-2.5 py-1 font-bold"
          style={{ background: '#FFFFFF', color: C.bad, border: `1.5px solid ${C.bad}` }}
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}

function CaseChip({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className="rounded-full px-2.5 py-1 font-bold"
      style={{
        background: active ? C.ink : '#FFFFFF',
        color: active ? C.bg : C.ink,
        border: `1.5px solid ${C.ink}`,
      }}
    >
      {label}
    </Link>
  );
}
