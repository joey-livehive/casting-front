const badges: { icon: string; label: string; value: string }[] = [
  { icon: '💞', label: '누적 매칭', value: '4,293쌍' },
  { icon: '💍', label: '결혼까지 이어진', value: '583쌍' },
  { icon: '🔒', label: '매칭 매니저 전원', value: '비밀계약 체결' },
];

export function CredibilityStrip() {
  return (
    <div className="px-7 mt-2 flex gap-2 flex-wrap">
      {badges.map((b) => (
        <div
          key={b.label}
          className="font-hand text-[12.5px] bg-brand-cream text-brand-ink-soft
                     px-[13px] py-[7px] rounded-[18px] border-[1.5px] border-brand-line
                     flex items-center gap-1.5 leading-[1.1] whitespace-nowrap"
        >
          <span>{b.icon}</span>
          <span>{b.label}</span>
          <b className="font-display font-bold text-brand-orange-deep">{b.value}</b>
        </div>
      ))}
    </div>
  );
}
