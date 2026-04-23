export function TopNav({ publishedAt }: { publishedAt: string }) {
  return (
    <div className="flex items-center justify-between px-6 pt-5 pb-3.5">
      <div className="font-display font-extrabold text-[17px] tracking-tight text-brand-ink">
        someonetheone
      </div>
      <div className="text-[11.5px] text-brand-ink-mute tracking-[0.01em]">
        {publishedAt} 발행 · 맞춤 리포트
      </div>
    </div>
  );
}
