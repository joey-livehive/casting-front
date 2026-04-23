export function LinkedinMock() {
  return (
    <div className="mt-[14px] bg-white border-[1.5px] border-brand-line rounded-[12px] p-[14px] shadow-[0_6px_16px_rgba(0,0,0,0.25)]">
      <div className="flex items-center gap-2.5 mb-2.5">
        <div className="w-7 h-7 bg-[#0A66C2] text-white rounded-md font-display font-extrabold text-[14px] flex items-center justify-center">
          in
        </div>
        <div className="font-display font-bold text-[13px] text-brand-ink">
          1:1 메시지 · someonetheone
        </div>
      </div>
      <div className="bg-brand-bg-deep rounded-[10px] px-3 py-[11px] text-[13px] leading-[1.6] text-brand-ink-soft [&_b]:font-display [&_b]:font-bold [&_b]:text-brand-ink">
        안녕하세요. 저희는 <b>진지한 관계를 찾는 분들을</b> 매칭하는 서비스예요.{' '}
        프로필과 커리어 패스를 보고 연락드렸어요. 혹시 이런 종류의 연결에 관심 있으실까요?
      </div>
      <div className="mt-3 font-hand text-[13px] text-brand-orange-deep flex items-center gap-1.5">
        ✓ 응답한 사람만 풀에 추가 · 응답률 약 23%
      </div>
    </div>
  );
}
