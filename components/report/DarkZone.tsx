import { ReactNode } from 'react';

export function DarkZone({ children }: { children: ReactNode }) {
  return (
    <div className="bg-dark text-dark-text relative pt-5 pb-[30px]">
      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 h-[120px] pointer-events-none
                   bg-[radial-gradient(ellipse_at_20%_0%,rgba(236,106,61,0.08)_0%,transparent_60%),radial-gradient(ellipse_at_80%_20%,rgba(245,184,71,0.06)_0%,transparent_60%)]"
      />
      {children}
    </div>
  );
}
