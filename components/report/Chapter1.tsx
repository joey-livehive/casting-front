'use client';

import { ChapterCard } from './ChapterCard';
import { useTone } from './toneContext';
import { SafeText } from './SafeText';
import type { PersonalizedContent } from '@/lib/personalization/types';

interface Trait {
  title: string;
  desc: string;
  need: string;
}

const traitsCasual: Trait[] = [
  {
    title: '정서적 안정감이 1순위야',
    desc: '감정 기복이 큰 상대는 너를 금방 지치게 해. 말보단 꾸준함으로 증명받고 싶어하고, 예측 가능한 관계를 편안하게 느껴.',
    need: '<b>일관된 리듬으로 연락하는</b> 사람이 필요해',
  },
  {
    title: '자기 일에 진심인 사람에게 끌려',
    desc: '커리어든 취미든, 자기 세계가 뚜렷한 사람한테 매력을 느껴. 나태함이나 방향성 없는 태도는 빠르게 호감을 떨어뜨려.',
    need: '<b>몰입할 대상이 있는</b> 사람이 필요해',
  },
  {
    title: '디테일한 관심에서 사랑을 느껴',
    desc: '과한 표현이나 이벤트보다, 사소한 걸 기억해주는 사람한테 훨씬 강한 애정을 느껴. "지난주에 말했던 그거"를 기억하는 사람.',
    need: '<b>기억력 좋고 관찰력 있는</b> 사람이 필요해',
  },
  {
    title: '갈등을 회피하지 않아야 해',
    desc: '무관심이 너한텐 가장 큰 상처야. 부딪혀도 대화로 푸는 사람을 원하고, 그런 사람한테만 진짜 마음을 열어.',
    need: '<b>감정을 언어로 풀어내는</b> 사람이 필요해',
  },
];

const traitsFormal: Trait[] = [
  {
    title: '정서적 안정감이 1순위예요',
    desc: '감정 기복이 큰 상대는 금방 지치게 만들어요. 말보단 꾸준함으로 증명받고 싶어하시고, 예측 가능한 관계를 편안하게 느끼세요.',
    need: '<b>일관된 리듬으로 연락하는</b> 사람이 필요해요',
  },
  {
    title: '자기 일에 진심인 사람에게 끌리세요',
    desc: '커리어든 취미든, 자기 세계가 뚜렷한 사람한테 매력을 느끼세요. 나태함이나 방향성 없는 태도는 빠르게 호감을 떨어뜨려요.',
    need: '<b>몰입할 대상이 있는</b> 사람이 필요해요',
  },
  {
    title: '디테일한 관심에서 사랑을 느끼세요',
    desc: '과한 표현이나 이벤트보다, 사소한 걸 기억해주는 사람한테 훨씬 강한 애정을 느끼세요. "지난주에 말했던 그거"를 기억하는 사람이요.',
    need: '<b>기억력 좋고 관찰력 있는</b> 사람이 필요해요',
  },
  {
    title: '갈등을 회피하지 않아야 해요',
    desc: '무관심이 가장 큰 상처예요. 부딪혀도 대화로 푸는 사람을 원하시고, 그런 사람한테만 진짜 마음을 여시고요.',
    need: '<b>감정을 언어로 풀어내는</b> 사람이 필요해요',
  },
];

interface Chapter1Props {
  userName: string;
  /** [LLM_GENERATED] 개인화 도입 문장 (trait01Intro~trait04Intro). 없으면 스팟 렌더 X. */
  personalized?: PersonalizedContent['chapter1Traits'];
}

export function Chapter1({ userName, personalized }: Chapter1Props) {
  const tone = useTone();
  const traits = tone === 'formal' ? traitsFormal : traitsCasual;

  const title =
    tone === 'formal' ? `${userName}님은 이런 분이세요` : `${userName}님은 이런 사람이야`;
  const lead =
    tone === 'formal'
      ? `${userName}님이 고르신 <b>선택지 하나하나</b>, 그리고 그 밑에 숨어있는 <b>진짜 연애 성향</b>까지 뜯어봤어요. 관계 심리학 프레임으로 정리해드릴게요.`
      : `${userName}님이 고른 <b>선택지 하나하나</b>, 그리고 그 밑에 숨어있는 <b>진짜 연애 성향</b>까지 뜯어봤어. 관계 심리학 프레임으로 정리해볼게.`;

  const intros = [
    personalized?.trait01Intro,
    personalized?.trait02Intro,
    personalized?.trait03Intro,
    personalized?.trait04Intro,
  ];

  return (
    <ChapterCard
      number="CHAPTER 2"
      psyBadge="애착 이론 · 관계 심리학 기반 분석"
      title={title}
      lead={lead}
    >
      <div>
        {traits.map((t, i) => {
          const personalIntro = intros[i];
          return (
            <div
              key={t.title}
              className={`py-4 ${i < traits.length - 1 ? 'border-b border-dashed border-brand-ink/20' : ''} ${
                i === 0 ? 'pt-1' : ''
              } ${i === traits.length - 1 ? 'pb-0.5' : ''}`}
            >
              <div className="flex items-start gap-2.5 mb-2">
                <span
                  className="shrink-0 w-[22px] h-[22px] rounded-full bg-brand-orange text-white
                             font-hand text-[14px] flex items-center justify-center mt-[1px]"
                  aria-hidden
                >
                  ✓
                </span>
                <div className="font-display font-bold text-[16px] tracking-[-0.02em] leading-[1.4] text-brand-ink">
                  {t.title}
                </div>
              </div>

              {/* ========== [LLM_GENERATED] 개인화 도입 (있을 때만) ========== */}
              {personalIntro && <p className="trait-personal-intro">{personalIntro}</p>}
              {/* ========== [/LLM_GENERATED] ========== */}

              <div className="ml-8 text-[13.5px] text-brand-ink-soft leading-[1.65]">{t.desc}</div>
              <div className="ml-8 mt-2.5 bg-brand-mustard/25 border-l-[3px] border-brand-mustard-deep px-[13px] py-[9px] rounded-md font-hand text-[14px] text-brand-ink [&_b]:font-bold [&_b]:text-brand-orange-deep">
                → <SafeText>{t.need}</SafeText>
              </div>
            </div>
          );
        })}
      </div>
    </ChapterCard>
  );
}
