'use client';

import { useTone } from './toneContext';
import { Section, SectionLabel, SectionTitle, HLDark } from './SectionFrame';

const badPoints: string[] = [
  '앱 안에 있는 사람이 전부',
  '진지한 사람이 드물고 검증이 없어',
  '매칭돼도 대화가 이어지지 않아',
  '"가벼운 만남" 프레임에서 못 벗어나',
];

const goodPointsCasual: string[] = [
  '앱 밖에서도 찾아와 (오프라인·SNS·커리어)',
  '캐스팅 매니저가 먼저 검증한 사람만 연결',
  '네 성향을 먼저 깊게 이해한 뒤 움직여',
  '진지한 관계만 지향하는 사람들만 풀에 올라가',
];

const goodPointsFormal: string[] = [
  '앱 밖에서도 찾아와요 (오프라인·SNS·커리어)',
  '캐스팅 매니저가 먼저 검증한 사람만 연결해요',
  '성향을 먼저 깊게 이해한 뒤 움직여요',
  '진지한 관계만 지향하는 분들만 풀에 올라가요',
];

const badHeadlineCasual = (
  <>
    사진 보고 스와이프.
    <br />
    대화는 3일을 못 넘겨.
  </>
);
const badHeadlineFormal = (
  <>
    사진 보고 스와이프.
    <br />
    대화는 3일을 못 넘겨요.
  </>
);

export function VsSection() {
  const tone = useTone();
  const goodPoints = tone === 'formal' ? goodPointsFormal : goodPointsCasual;
  const badHeadline = tone === 'formal' ? badHeadlineFormal : badHeadlineCasual;

  return (
    <Section>
      <SectionLabel variant="dark">왜 우리인가</SectionLabel>
      <SectionTitle variant="dark">
        소개팅앱에 <HLDark>지친 사람들에게</HLDark>
      </SectionTitle>

      <div className="flex flex-col gap-3.5">
        <div className="bg-dark-deep border-[1.5px] border-dark-line rounded-[18px] p-[22px] opacity-90">
          <span className="inline-block font-hand text-[13px] bg-dark-line text-dark-mute px-3 py-0.5 rounded-xl mb-2.5">
            기존 소개팅앱
          </span>
          <h4 className="font-display font-bold text-[17px] tracking-[-0.02em] leading-[1.4] text-dark-mute mb-2.5">
            {badHeadline}
          </h4>
          <ul className="flex flex-col gap-[7px] list-none">
            {badPoints.map((p, i) => (
              <li
                key={i}
                className="text-[13.5px] leading-[1.55] text-dark-mute flex items-start gap-2"
              >
                <span aria-hidden className="text-dark-line font-bold">
                  ×
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div
          className="bg-[linear-gradient(135deg,#FFD4BD_0%,#FFE8D6_100%)] border-2 border-brand-orange
                     rounded-[18px] p-[22px] shadow-[0_12px_28px_rgba(0,0,0,0.3)]"
        >
          <span className="inline-block font-hand text-[13px] bg-brand-orange text-white px-3 py-0.5 rounded-xl mb-2.5">
            someonetheone
          </span>
          <h4 className="font-display font-extrabold text-[17px] tracking-[-0.02em] leading-[1.4] text-brand-ink mb-2.5">
            앱이 아니라{' '}
            <b className="text-brand-orange-deep underline decoration-brand-orange/30 decoration-2 underline-offset-[3px]">
              에이전시
            </b>
            .
            <br />
            {tone === 'formal' ? '사람을 "찾아드려요".' : '사람을 "찾아줘".'}
          </h4>
          <ul className="flex flex-col gap-[7px] list-none">
            {goodPoints.map((p, i) => (
              <li
                key={i}
                className="text-[13.5px] leading-[1.55] text-brand-ink font-medium flex items-start gap-2"
              >
                <span aria-hidden className="text-brand-orange-deep font-extrabold">
                  ◎
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
