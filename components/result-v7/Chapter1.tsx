import { ChapterCard } from './ChapterCard';
import { Section, SectionLabel, SectionTitle, HL, SectionSub } from './SectionFrame';
import { TRAITS } from '@/lib/personalization/static-content';
import type { PersonalizedContent } from '@/lib/personalization/types';

interface Chapter1Props {
  /** [LLM_GENERATED] Chapter 1 의 Trait 01~04 개인화 도입 문장 4개 */
  personalizedTraits?: PersonalizedContent['chapter1Traits'];
}

export function Chapter1({ personalizedTraits }: Chapter1Props = {}) {
  const introOrder: (keyof NonNullable<Chapter1Props['personalizedTraits']>)[] = [
    'trait01Intro',
    'trait02Intro',
    'trait03Intro',
    'trait04Intro',
  ];

  return (
    <>
      <Section>
        <SectionLabel>01. FIRST READING</SectionLabel>
        <SectionTitle>
          의뢰인님의
          <br />
          <HL>연애 성향</HL>.
        </SectionTitle>
        <SectionSub>
          선택지와 그 뒤의 패턴을
          <br />
          관계 심리학 프레임으로 분석했습니다.
        </SectionSub>
      </Section>

      <ChapterCard
        numberLabel="FOUR TRAITS"
        title="의뢰인님을 설명하는 4가지 축"
        sub="각 항목 아래의 NEED는 의뢰인님께 필요한 상대의 조건입니다."
      >
        {TRAITS.map((t, i) => {
          const intro = personalizedTraits?.[introOrder[i]];
          return (
            <div key={t.no} className="trait">
              <div className="trait-head">
                <span className="trait-no">{t.no}</span>
                <div className="trait-title">{t.title}</div>
              </div>

              {/* ========== [LLM_GENERATED] ========== */}
              {intro ? <p className="trait-personal-intro">{intro}</p> : null}
              {/* ========== [/LLM_GENERATED] ========== */}

              {/* ========== [FIXED] ========== */}
              <p className="trait-desc">{t.description}</p>
              <div className="trait-need">{t.need}</div>
              {/* ========== [/FIXED] ========== */}
            </div>
          );
        })}
      </ChapterCard>
    </>
  );
}
