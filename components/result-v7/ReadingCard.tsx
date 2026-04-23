import { READING_CARD_CONTENT } from '@/lib/personalization/static-content';
import type { PersonalizedContent } from '@/lib/personalization/types';

interface ReadingCardProps {
  userName: string;
  /** [LLM_GENERATED] Reading Card 의 문단 1, 2 개인화 도입 */
  personalizedOpenings?: PersonalizedContent['readingCard'];
}

export function ReadingCard({ userName, personalizedOpenings }: ReadingCardProps) {
  const p1Opening = personalizedOpenings?.paragraph1Opening;
  const p2Opening = personalizedOpenings?.paragraph2Opening;

  return (
    <div className="letter">
      <div className="letter-head">
        <span className="letter-tag">A Note to {userName}</span>
        <span className="letter-from">{READING_CARD_CONTENT.fromLabel}</span>
      </div>
      <h2>
        선택지에서 읽어낸
        <br />
        의뢰인님의 여섯 가지 성향.
      </h2>

      {/* ========== 문단 1 ========== */}
      {/* ========== [LLM_GENERATED] ========== */}
      {p1Opening ? <p className="letter-personal-opening">{p1Opening}</p> : null}
      {/* ========== [/LLM_GENERATED] ========== */}
      {/* ========== [FIXED] ========== */}
      <p>
        의뢰인님은 <em>말보다 행동으로 확인받을 때 안정감을 느끼는</em> 분입니다. 큰 이벤트보다
        일상의 작은 기억이 오래 남는 유형입니다.
      </p>
      {/* ========== [/FIXED] ========== */}

      {/* ========== 문단 2 ========== */}
      {/* ========== [LLM_GENERATED] ========== */}
      {p2Opening ? <p className="letter-personal-opening">{p2Opening}</p> : null}
      {/* ========== [/LLM_GENERATED] ========== */}
      {/* ========== [FIXED] ========== */}
      <p>
        혼자서도 충분하지만, 함께 더 나아갈 수 있는 사람을 기다리고 있습니다. 기준이 명확한 분이라
        가식은 빠르게 읽히며, <em>진정성이 확인된 관계</em>에서만 마음을 엽니다.
      </p>
      {/* ========== [/FIXED] ========== */}

      {/* ========== 문단 3 (완전 고정, 개인화 없음) ========== */}
      <p>
        관계에 에너지 쏟기가 버거운 시점입니다. 이 분의 <span className="v7-blur-light">◯◯◯◯</span>
        한 안정감이 의뢰인님께 잘 맞는 선택으로 판단했습니다.
      </p>

      <div className="letter-foot">
        <div className="letter-probability">
          <span className="letter-probability-label">
            {READING_CARD_CONTENT.probabilityLabel}
          </span>
          <span className="letter-probability-val">
            {READING_CARD_CONTENT.probabilityValue}
            <sup>%</sup>
          </span>
        </div>
        <span className="letter-cases">{READING_CARD_CONTENT.cases}</span>
      </div>
    </div>
  );
}
