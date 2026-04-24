export function BizCardMock() {
  return (
    <div className="mt-[14px] flex justify-center">
      <div
        className="w-[220px] aspect-[1.7/1] bg-brand-cream border-[1.5px] border-brand-line
                   rounded-lg p-3.5 relative shadow-[3px_4px_0_var(--line)] -rotate-2 text-[10px]"
      >
        <div className="font-display font-extrabold text-[11px] tracking-[-0.04em] text-brand-ink">
          someonetheone
        </div>
        <div className="font-hand text-[9px] text-brand-orange mt-[1px]">casting manager</div>
        <div className="absolute top-3 right-3.5 text-[14px]" aria-hidden>
          💌
        </div>
        <div className="absolute bottom-[22px] left-3.5 font-display font-bold text-[14px] text-brand-ink">
          이OO
        </div>
        <div className="absolute bottom-2.5 left-3.5 text-[9px] text-brand-ink-soft">
          Senior Casting Manager
        </div>
      </div>
    </div>
  );
}
