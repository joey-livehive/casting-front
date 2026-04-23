import { ReactNode } from 'react';

type Variant = 'light' | 'dark';

export function Section({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`pt-11 px-7 pb-6 relative ${className}`}>{children}</section>;
}

export function SectionLabel({
  children,
  variant = 'light',
}: {
  children: ReactNode;
  variant?: Variant;
}) {
  const color = variant === 'dark' ? 'text-brand-mustard' : 'text-brand-orange';
  const bar = variant === 'dark' ? 'bg-brand-mustard' : 'bg-brand-orange';
  return (
    <div className={`font-hand text-[15px] ${color} mb-2.5 flex items-center gap-2`}>
      <span aria-hidden className={`inline-block w-6 h-[2px] ${bar}`} />
      {children}
    </div>
  );
}

export function SectionTitle({
  children,
  variant = 'light',
  className = '',
}: {
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  const color = variant === 'dark' ? 'text-dark-text' : 'text-brand-ink';
  return (
    <div
      className={`font-display font-extrabold text-[24px] leading-[1.3] tracking-[-0.03em] mb-6 ${color} ${className}`}
    >
      {children}
    </div>
  );
}

/** 섹션 타이틀 내부의 머스타드 형광펜 하이라이트 (밝은 섹션용) */
export function HL({ children }: { children: ReactNode }) {
  return (
    <span className="bg-gradient-to-b from-transparent from-[60%] to-brand-mustard to-[60%] px-[3px]">
      {children}
    </span>
  );
}

/** 다크존 전용 하이라이트 (오렌지 + 흰 글자) */
export function HLDark({ children }: { children: ReactNode }) {
  return (
    <span className="bg-gradient-to-b from-transparent from-[60%] to-brand-orange to-[60%] px-[3px] text-white">
      {children}
    </span>
  );
}
