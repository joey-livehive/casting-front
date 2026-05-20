'use client';

import { FormEvent, ReactNode, useState } from 'react';

type Props = {
  title: string;
  error?: string | null;
  loading?: boolean;
  onSubmit: (phone: string) => void;
  children?: ReactNode;
};

export function MatchingPhoneGate({
  title,
  error,
  loading = false,
  onSubmit,
  children,
}: Props) {
  const [phone, setPhone] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(phone);
  };

  return (
    <main className="max-w-[480px] mx-auto min-h-screen bg-brand-bg font-body text-brand-ink px-7 py-12 flex items-center">
      <form
        onSubmit={handleSubmit}
        className="w-full rounded-[20px] border-2 border-brand-line bg-brand-cream p-6 shadow-[6px_7px_0_var(--line)]"
      >
        <div className="font-display text-[24px] font-bold leading-[1.25]">{title}</div>
        <p className="mt-3 text-[14px] leading-[1.65] text-brand-ink/70">
          리포트를 받은 분의 전화번호를 입력하면 내용을 확인할 수 있어요.
        </p>
        <label className="mt-6 block text-[13px] font-bold text-brand-ink/75" htmlFor="phone">
          전화번호
        </label>
        <input
          id="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="010-0000-0000"
          className="mt-2 h-12 w-full rounded-xl border border-brand-line bg-white px-4 text-[16px] outline-none focus:border-brand-orange-deep"
        />
        {error && (
          <div className="mt-3 text-[12px] leading-[1.5] text-red-600" role="alert">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="mt-5 h-[52px] w-full rounded-2xl bg-brand-ink font-display text-[16px] font-bold text-brand-cream disabled:opacity-60"
        >
          {loading ? '확인 중...' : '리포트 확인하기'}
        </button>
        {children}
      </form>
    </main>
  );
}
