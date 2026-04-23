'use client';

import { useTone } from './toneContext';
import { Section } from './SectionFrame';
import { SafeText } from './SafeText';

const promisesCasual: string[] = [
  '본명, 직장, 연락처는 <b>상대가 아닌 네가 OK할 때</b>에만 공개돼',
  '캐스팅 매니저는 "너에 대한 포장된 설명"만 전달해',
  '상대 정보도 똑같이 보호돼 — 서로의 속도로 열려',
  '매칭 실패해도 네 정보는 어디에도 남지 않아',
];

const promisesFormal: string[] = [
  '본명, 직장, 연락처는 <b>상대가 아닌 본인이 OK하실 때</b>에만 공개돼요',
  '캐스팅 매니저는 "회원님에 대한 포장된 설명"만 전달해요',
  '상대 정보도 똑같이 보호돼요 — 서로의 속도로 열려요',
  '매칭 실패해도 회원님 정보는 어디에도 남지 않아요',
];

export function PrivacyBox({ userName }: { userName: string }) {
  const tone = useTone();
  const promises = tone === 'formal' ? promisesFormal : promisesCasual;
  const titleLine1 = tone === 'formal' ? '회원님 정보는' : '네 정보는';
  const titleLine2 = tone === 'formal' ? '절대, 먼저 공개하지 않아요' : '절대, 먼저 공개하지 않아';

  return (
    <Section>
      <div
        className="relative overflow-hidden
                   bg-[linear-gradient(135deg,var(--cream)_0%,#FFE8D6_100%)] text-brand-ink
                   border-2 border-brand-line rounded-[20px] px-6 py-[30px]
                   shadow-[0_12px_30px_rgba(0,0,0,0.25)]"
      >
        <div
          aria-hidden
          className="absolute top-[-10px] right-[-10px] text-[100px] opacity-[0.08] text-brand-ink"
        >
          🔐
        </div>
        <div className="relative font-hand text-[14px] text-brand-orange-deep mb-2">
          {userName}님의 프라이버시 약속
        </div>
        <div className="relative font-display font-extrabold text-[22px] leading-[1.35] tracking-[-0.025em] mb-5 text-brand-ink">
          {titleLine1}
          <br />
          {titleLine2}
        </div>
        <ul className="relative flex flex-col gap-3 list-none">
          {promises.map((text, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 text-[14px] leading-[1.6] text-brand-ink-soft
                         [&_b]:font-display [&_b]:font-bold [&_b]:text-brand-ink"
            >
              <span
                aria-hidden
                className="shrink-0 w-[22px] h-[22px] rounded-full bg-brand-orange text-white
                           flex items-center justify-center text-[13px] font-bold mt-[1px]"
              >
                ✓
              </span>
              <span>
                <SafeText>{text}</SafeText>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
