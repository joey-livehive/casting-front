'use client';

import { Candidate } from '@/lib/report/types';
import { ChapterCard } from '@/components/report/ChapterCard';
import { SafeText } from '@/components/report/SafeText';
import { useTone } from '@/components/report/toneContext';

const LOCKED_SHAPES = ['◯◯◯', '◯◯◯◯', '◯◯'];

export interface CandidateDetailNarratives {
  /** 이 사람의 성격 (4~5문장) — MBTI + 직업 + 자기소개 + 사진 인상 */
  personality: string;
  /** 연애 스타일 (4~5문장) — 만남 빈도 + 연락 빈도 + MBTI */
  datingStyle: string;
  /** 주말 모습 (4~5문장) — 데이트 스타일 + 라이프 + 자기소개 */
  weekendStyle: string;
}

interface CandidateDetailSectionProps {
  userName: string;
  candidate: Candidate;
  narratives: CandidateDetailNarratives;
  /** 인스타 변형: 전달 시 '📅 이 사람의 주말' 슬롯이 '✨ 이 사람의 매력' 산문으로 교체됨 (4~5문장) */
  feedCharm?: string;
}

export function CandidateDetailSection({
  userName,
  candidate,
  narratives,
  feedCharm,
}: CandidateDetailSectionProps) {
  const tone = useTone();
  const lead =
    tone === 'formal'
      ? `자, 그럼 왜 이 분이 선정됐는지 더 자세히 알아볼까요? ${userName}님께 필요한 부분을 중심으로 정리했어요.`
      : `자, 그럼 왜 이 분이 선정됐는지 더 자세히 알아볼까? ${userName}한테 필요한 부분을 중심으로 정리했어.`;

  const hasRealHobby = candidate.hobbies.visible.some((h) => !h.includes('<red>'));
  const showHobby = hasRealHobby || candidate.hobbies.hidden > 0;

  return (
    <ChapterCard number="CHAPTER 1" title="이 사람에 대해 더 자세히" lead={lead}>
      <div className="grid grid-cols-2 gap-2.5">
        {/* 🎨 취미 (선택) */}
        {showHobby && (
          <PCard wide label="🎨 취미">
            <div className="flex flex-wrap gap-1.5 mt-2">
              {candidate.hobbies.visible.map((h) => (
                <span
                  key={h}
                  className="bg-white border border-brand-line px-2.5 py-1 rounded-xl text-[12.5px] text-brand-ink-soft"
                >
                  {h}
                </span>
              ))}
              {Array.from({ length: candidate.hobbies.hidden }).map((_, i) => (
                <span
                  key={`lock-${i}`}
                  className="bg-brand-blur-bg text-brand-blur-bg px-2.5 py-1 rounded-xl text-[12.5px] [filter:blur(3px)] select-none"
                >
                  {LOCKED_SHAPES[i % LOCKED_SHAPES.length]}
                </span>
              ))}
            </div>
          </PCard>
        )}

        {/* 🧭 이 사람의 성격 — LLM Inputs: MBTI + 직업 + 자유서술 + 사진 */}
        <PCard wide label="🧭 이 사람의 성격">
          <div className="[&_b]:font-display [&_b]:font-bold leading-[1.6]">
            <SafeText>{narratives.personality}</SafeText>
          </div>
        </PCard>

        {/* 💞 연애 스타일 — LLM Inputs: 만남 빈도 + 연락 빈도 + MBTI 장점 */}
        <PCard wide label="💞 연애 스타일">
          <div className="[&_b]:font-display [&_b]:font-bold leading-[1.6]">
            <SafeText>{narratives.datingStyle}</SafeText>
          </div>
        </PCard>

        {/* 📅 이 사람의 주말 — LLM Inputs: 데이트 스타일 + 라이프 + 자기소개
            인스타 변형: feedCharm 전달 시 '✨ 이 사람의 매력' 산문으로 교체 */}
        {feedCharm ? (
          <PCard wide label="✨ 이 사람의 매력">
            <div className="[&_b]:font-display [&_b]:font-bold leading-[1.6]">
              <SafeText>{feedCharm}</SafeText>
            </div>
          </PCard>
        ) : (
          <PCard wide label="📅 이 사람의 주말">
            <div className="[&_b]:font-display [&_b]:font-bold leading-[1.6]">
              <SafeText>{narratives.weekendStyle}</SafeText>
            </div>
          </PCard>
        )}
      </div>

      {/* ⏰ 평일 하루 타임라인 (선택) */}
      {candidate.daySchedule.some((it) => !it.activity.includes('<red>') && it.time !== '—') && (
        <div className="mt-5 p-[18px] bg-brand-bg-deep rounded-[14px] border-[1.5px] border-brand-line">
          <div className="font-hand text-[15px] text-brand-orange-deep mb-[14px]">
            ⏰ 이 사람의 평일 하루
          </div>
          {candidate.daySchedule.map((item, i) => (
            <div
              key={item.time}
              className={`flex gap-3 py-[9px] ${i > 0 ? 'border-t border-dashed border-brand-ink/15' : ''}`}
            >
              <div className="shrink-0 w-14 font-display font-bold text-[13px] text-brand-ink pt-[1px]">
                {item.time}
              </div>
              <div className="flex-1 text-[13.5px] text-brand-ink-soft leading-[1.55]">
                <SafeText>{item.activity}</SafeText>
              </div>
            </div>
          ))}
        </div>
      )}
    </ChapterCard>
  );
}

interface PCardProps {
  label: string;
  wide?: boolean;
  children: React.ReactNode;
}

function PCard({ label, wide, children }: PCardProps) {
  return (
    <div
      className={`${wide ? 'col-span-2' : ''} bg-brand-bg-deep border-[1.5px] border-brand-line rounded-[14px] px-[14px] py-[15px] relative`}
    >
      <div className="font-hand text-[14.5px] text-brand-orange-deep mb-[8px]">{label}</div>
      <div className="text-[14.5px] leading-[1.6] text-brand-ink">{children}</div>
    </div>
  );
}
