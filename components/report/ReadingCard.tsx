'use client';

import { useTone } from './toneContext';
import { SafeText } from './SafeText';

export function ReadingCard({ userName }: { userName: string }) {
  const tone = useTone();

  const paragraphs: string[] =
    tone === 'formal'
      ? [
          `${userName}님, 고르신 선택지 하나하나 보니까 ${userName}님이라는 사람이 꽤 뚜렷하게 잡혀요.`,
          `${userName}님은 <b>말로 확인받는 것보다, 행동으로 느껴지는 사랑이 더 깊게 닿는</b> 타입이세요. 그래서 큰 이벤트보단 평범한 날의 작은 기억에 더 마음이 움직이시죠.`,
          `<b>혼자서도 나름 잘 지내시지만</b>, 같이 더 나아갈 수 있는 사람을 기다리고 계시잖아요. 남들은 모르지만 예민한 구석이 있어서 <b>사람 보는 기준이 까다로운 편</b>이에요. 아무나 만나고 싶지 않으시거든요.`,
          `가식적인 관계를 싫어하시고, 감각이 발달한 편이라 <b>상대가 진심인지 아닌지 빠르게 눈치채는 편</b>이에요. 진심이 느껴지는 사람한테만 마음을 여는 타입이시고요.`,
          `요즘엔 관계에서 에너지를 쏟는 게 조금 부담스러울 때도 있으셔서, 이 분의 <blur>◯◯◯◯</blur>한 <b>포근한 안정감</b>이 딱 필요하다고 판단했어요.`,
        ]
      : [
          `${userName}님, 고른 선택지 하나하나 보니까 너라는 사람이 꽤 뚜렷하게 잡혀.`,
          `너는 <b>말로 확인받는 것보다, 행동으로 느껴지는 사랑이 더 깊게 닿는</b> 타입이야. 그래서 큰 이벤트보단 평범한 날의 작은 기억에 더 마음이 움직여.`,
          `<b>혼자서도 나름 잘 지내지만</b>, 같이 더 나아갈 수 있는 사람을 기다리고 있잖아. 남들은 모르지만 예민한 구석이 있어서 <b>사람 보는 기준이 까다로운 편</b>이야. 아무나 만나고 싶지 않거든.`,
          `가식적인 관계를 싫어하고, 감각이 발달한 편이라 <b>상대가 진심인지 아닌지 빠르게 눈치채는 편</b>이야. 진심이 느껴지는 사람한테만 마음을 여는 타입이고.`,
          `요즘엔 관계에서 에너지를 쏟는 게 조금 부담스러울 때도 있어서, 이 분의 <blur>◯◯◯◯</blur>한 <b>포근한 안정감</b>이 딱 필요하다고 판단했어.`,
        ];

  const closing =
    tone === 'formal'
      ? `이런 분 만나시면 <b>행복할 확률이 89%</b>예요.`
      : `이런 분 만나면 <b>행복할 확률이 89%</b>야.`;

  return (
    <div className="px-7 mt-8">
      <div className="relative bg-brand-bg-deep border-[1.5px] border-brand-line rounded-[18px] pt-[26px] px-[22px] pb-[22px]">
        <div
          className="absolute top-[-13px] left-5 bg-brand-mustard text-brand-ink
                     font-hand text-[14px] px-[13px] py-1 rounded-[14px]
                     border-[1.5px] border-brand-line"
        >
          💌 {tone === 'formal' ? `${userName}님께 쓰는 메모` : '너에게 쓰는 메모'}
        </div>

        <div className="space-y-[14px]">
          {paragraphs.map((p, i) => (
            <p
              key={i}
              className="text-[14.5px] leading-[1.7] text-brand-ink-soft [&_b]:font-display [&_b]:font-bold [&_b]:text-brand-ink"
            >
              <SafeText>{p}</SafeText>
            </p>
          ))}
          <p className="text-[14.5px] leading-[1.7] text-brand-ink [&_b]:font-display [&_b]:font-bold [&_b]:text-brand-ink">
            <SafeText>{closing}</SafeText>
          </p>
        </div>

        <div className="mt-[18px] pt-[14px] border-t border-dashed border-brand-ink-mute font-hand text-[13px] text-brand-ink-mute flex items-center gap-1.5">
          📊 23,481쌍의 매칭 데이터 기반 분석
        </div>
      </div>
    </div>
  );
}
