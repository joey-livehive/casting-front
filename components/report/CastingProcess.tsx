'use client';

import { ReactNode } from 'react';
import { DmMock } from './DmMock';
import { BizCardMock } from './BizCardMock';
import { LinkedinMock } from './LinkedinMock';
import { useTone } from './toneContext';
import { Section, SectionLabel, SectionTitle, HLDark } from './SectionFrame';
import { SafeText } from './SafeText';

interface Scene {
  num: 'SCENE 01' | 'SCENE 02' | 'SCENE 03';
  emoji: string;
  title: string;
  desc: string;
  mock: ReactNode;
}

const scenesCasual: Scene[] = [
  {
    num: 'SCENE 01',
    emoji: '📱',
    title: 'Instagram에선 직접 DM까지 보내',
    desc: '너한테 맞을 것 같은 프로필을 하루 평균 <b>6~8개</b> 큐레이션해. 캐스팅 매니저가 직접 DM을 보내고, 상대방과 사전 대화까지 마친 뒤 데려와.',
    mock: <DmMock />,
  },
  {
    num: 'SCENE 02',
    emoji: '🏋️',
    title: '오프라인에선 명함으로 접근해',
    desc: '강남권 프리미엄 헬스장·와인바·북카페 제휴를 통해 캐스팅 매니저가 직접 <b>눈으로 검증한 사람</b>한테만 명함을 건네. 사진으로 못 보는 말투·표정·매너까지 확인된 사람들이야.',
    mock: <BizCardMock />,
  },
  {
    num: 'SCENE 03',
    emoji: '💼',
    title: 'LinkedIn에선 진지함으로 필터링해',
    desc: '커리어 중심으로 접근하기 때문에 가벼운 만남 찾는 사람이 자연스럽게 걸러져. "진지한 관계"라는 의도를 먼저 드러내서 <b>응답한 사람만</b> 추려.',
    mock: <LinkedinMock />,
  },
];

const scenesFormal: Scene[] = [
  {
    num: 'SCENE 01',
    emoji: '📱',
    title: 'Instagram에선 직접 DM까지 보내요',
    desc: '맞으실 것 같은 프로필을 하루 평균 <b>6~8개</b> 큐레이션해요. 캐스팅 매니저가 직접 DM을 보내고, 상대방과 사전 대화까지 마친 뒤 데려와요.',
    mock: <DmMock />,
  },
  {
    num: 'SCENE 02',
    emoji: '🏋️',
    title: '오프라인에선 명함으로 접근해요',
    desc: '강남권 프리미엄 헬스장·와인바·북카페 제휴를 통해 캐스팅 매니저가 직접 <b>눈으로 검증한 사람</b>한테만 명함을 건네요. 사진으로 못 보는 말투·표정·매너까지 확인된 분들이에요.',
    mock: <BizCardMock />,
  },
  {
    num: 'SCENE 03',
    emoji: '💼',
    title: 'LinkedIn에선 진지함으로 필터링해요',
    desc: '커리어 중심으로 접근하기 때문에 가벼운 만남 찾는 분이 자연스럽게 걸러져요. "진지한 관계"라는 의도를 먼저 드러내서 <b>응답한 사람만</b> 추려요.',
    mock: <LinkedinMock />,
  },
];

export function CastingProcess() {
  const tone = useTone();
  const scenes = tone === 'formal' ? scenesFormal : scenesCasual;
  const sub =
    tone === 'formal'
      ? '소개팅앱처럼 앱 안에서만 빙빙 도는 게 아니에요. 캐스팅 매니저가 실제로 발품을 팔아요. 네 정보는 절대 먼저 공개하지 않고, 매력적으로 "포장만" 해서 접근해요.'
      : '소개팅앱처럼 앱 안에서만 빙빙 도는 게 아니야. 캐스팅 매니저가 실제로 발품을 팔아. 네 정보는 절대 먼저 공개하지 않고, 매력적으로 "포장만" 해서 접근해.';
  const titleSuffix = tone === 'formal' ? '이렇게 찾아와요' : '이렇게 찾아와';
  return (
    <Section>
      <SectionLabel variant="dark">behind the scenes</SectionLabel>
      <SectionTitle variant="dark" className="!mb-3">
        우린 <HLDark>{titleSuffix}</HLDark>
      </SectionTitle>
      <p className="text-[14px] text-dark-mute leading-[1.65] mb-6">{sub}</p>

      {scenes.map((s) => (
        <div
          key={s.num}
          className="relative bg-dark-elev border-[1.5px] border-dark-line rounded-[18px]
                     pt-[26px] px-[22px] pb-[22px] mb-[18px] shadow-[4px_4px_0_rgba(0,0,0,0.25)]"
        >
          <div
            className="absolute top-[-11px] left-[22px] bg-dark-elev border-[1.5px] border-dark-line
                       rounded-[10px] px-2.5 py-[3px] font-display font-extrabold text-[12px]
                       text-brand-mustard tracking-[0.04em]"
          >
            {s.num}
          </div>

          <div className="flex items-center gap-3 my-1 mb-3.5">
            <div className="w-11 h-11 rounded-xl bg-brand-mustard border-[1.5px] border-brand-line flex items-center justify-center text-[22px] shrink-0">
              {s.emoji}
            </div>
            <div className="font-display font-bold text-[17px] tracking-[-0.02em] leading-[1.4] text-dark-text">
              {s.title}
            </div>
          </div>
          <div className="text-[13.5px] leading-[1.7] text-dark-scene-desc [&_b]:font-display [&_b]:font-bold [&_b]:text-dark-text">
            <SafeText>{s.desc}</SafeText>
          </div>
          {s.mock}
        </div>
      ))}
    </Section>
  );
}
