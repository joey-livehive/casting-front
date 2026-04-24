'use client';

import { Section } from './SectionFrame';
import { useTone } from './toneContext';
import { SafeText } from './SafeText';

export function ScarcityBlock({ userName, total }: { userName: string; total: number }) {
  const tone = useTone();
  const items: string[] =
    tone === 'formal'
      ? [
          `이 ${total}명은 <b>다른 유저와 절대 중복되지 않아요.</b> ${userName}님만의 카드예요.`,
          `캐스팅 매니저가 <b>직접 접촉·검증한 사람들</b>만 풀에 올라가요.`,
          `결제 즉시 블러가 풀리고, 나머지 ${total - 1}명은 <b>7일 안에</b> 순차 전달돼요.`,
        ]
      : [
          `이 ${total}명은 <b>다른 유저와 절대 중복되지 않아.</b> ${userName}님만의 카드야.`,
          `캐스팅 매니저가 <b>직접 접촉·검증한 사람들</b>만 풀에 올라가.`,
          `결제 즉시 블러가 풀리고, 나머지 ${total - 1}명은 <b>7일 안에</b> 순차 전달돼.`,
        ];

  const labelText = `${userName}님을 위한 단독 캐스팅`;
  const titleSuffix = tone === 'formal' ? '위해 찾아온 풀이에요' : '위해 찾아온 풀이야';
  const expiryText =
    tone === 'formal' ? (
      <>
        유효기간 <b className="font-display text-brand-urgent font-bold">7일</b> — 이후엔 캐스팅 풀에서 해제되고
        <br />
        다른 분께 재매칭이 시작돼요
      </>
    ) : (
      <>
        유효기간 <b className="font-display text-brand-urgent font-bold">7일</b> — 이후엔 캐스팅 풀에서 해제되고
        <br />
        다른 유저한테 재매칭 시작돼
      </>
    );
  const guaranteeText =
    tone === 'formal' ? (
      <>
        <b className="font-display text-brand-mustard font-bold">1명 재캐스팅 무료 보장</b> — {total}명 전부 맘에 안 드시면
        <br />
        새로운 1명, 무료로 다시 캐스팅해드릴게요
      </>
    ) : (
      <>
        <b className="font-display text-brand-mustard font-bold">1명 재캐스팅 무료 보장</b> — {total}명 전부 맘에 안 들면
        <br />
        새로운 1명, 무료로 다시 캐스팅해줄게
      </>
    );

  return (
    <Section>
      <div
        className="relative overflow-hidden
                   bg-[linear-gradient(135deg,#FFE8D6_0%,var(--cream)_50%,#FFF3DC_100%)]
                   text-brand-ink border-2 border-brand-line rounded-[20px]
                   px-6 py-[30px] shadow-[6px_7px_0_var(--line)]"
      >
        <div
          aria-hidden
          className="absolute top-[-50px] right-[-50px] w-[180px] h-[180px]
                     bg-[radial-gradient(circle,rgba(236,106,61,0.2)_0%,transparent_70%)]"
        />
        <div
          aria-hidden
          className="absolute top-5 right-[26px] text-[28px] text-brand-orange opacity-40"
        >
          ✦
        </div>

        <div className="relative">
          <div className="font-hand text-[14px] text-brand-orange-deep mb-2">{labelText}</div>
          <div className="font-display font-extrabold text-[22px] leading-[1.35] tracking-[-0.025em] mb-[18px] text-brand-ink">
            이 {total}명은{' '}
            <span className="bg-gradient-to-b from-transparent from-[60%] to-brand-mustard to-[60%] px-1">
              {userName}님만
            </span>{' '}
            {titleSuffix}
          </div>

          <div className="flex flex-col gap-3">
            {items.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 text-[14px] leading-[1.6] text-brand-ink-soft
                           [&_b]:font-display [&_b]:font-bold [&_b]:text-brand-ink"
              >
                <span
                  aria-hidden
                  className="shrink-0 w-1.5 h-1.5 rounded-full bg-brand-orange mt-2.5"
                />
                <span>
                  <SafeText>{item}</SafeText>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mt-5 bg-white border-[1.5px] border-brand-urgent rounded-xl px-3.5 py-[13px] flex items-center gap-[11px]">
          <span className="text-xl shrink-0" aria-hidden>
            ⏳
          </span>
          <div className="font-hand text-[14px] text-brand-ink leading-[1.45]">{expiryText}</div>
        </div>

        <div className="relative mt-2.5 bg-brand-ink rounded-xl px-3.5 py-[13px] flex items-center gap-[11px]">
          <span className="text-[22px] shrink-0" aria-hidden>
            🛡️
          </span>
          <div className="font-hand text-[14px] text-brand-cream leading-[1.45]">
            {guaranteeText}
          </div>
        </div>
      </div>
    </Section>
  );
}
