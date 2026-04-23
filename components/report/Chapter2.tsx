'use client';

import Image from 'next/image';
import { Candidate } from '@/lib/report/types';
import { ChapterCard } from './ChapterCard';
import { SafeText } from './SafeText';
import { useSheet } from './sheetContext';
import { useTone } from './toneContext';

const LOCKED_SHAPES = ['◯◯◯', '◯◯◯◯', '◯◯'];

export function Chapter2({ userName, candidate }: { userName: string; candidate: Candidate }) {
  const { openSheet } = useSheet();
  const tone = useTone();
  const lead =
    tone === 'formal'
      ? `SNS 게시물 67개, 오프라인에서 본 모습, 지인 추천 코멘트 3건을 종합했어요. ${userName}님께 필요한 부분을 중심으로 정리했어요.`
      : `SNS 게시물 67개, 오프라인에서 본 모습, 지인 추천 코멘트 3건을 종합했어. ${userName}님한테 필요한 부분을 중심으로 정리했어.`;
  return (
    <ChapterCard number="CHAPTER 1" title="이 사람에 대해 더 자세히" lead={lead}>
      <div className="grid grid-cols-2 gap-2.5">
        {/* 인물 사진 (wide) */}
        <div
          className="col-span-2 p-0 overflow-hidden rounded-[14px] border-[1.5px] border-brand-line relative bg-[linear-gradient(135deg,#D4B896_0%,#8A7C60_100%)] select-none"
          onContextMenu={(e) => e.preventDefault()}
        >
          <div className="relative aspect-[16/9] w-full">
            {candidate.chapter2Photo ? (
              <Image
                src={candidate.chapter2Photo}
                alt=""
                fill
                sizes="(max-width: 480px) 100vw, 480px"
                draggable={false}
                className="object-cover select-none"
                style={{
                  objectPosition: '50% 25%',
                  filter: 'blur(10px) saturate(1.05)',
                  transform: 'scale(1.15)',
                  pointerEvents: 'none',
                  WebkitUserSelect: 'none',
                  WebkitTouchCallout: 'none',
                  WebkitUserDrag: 'none',
                } as React.CSSProperties}
              />
            ) : (
              <div
                className="absolute inset-0 flex items-center justify-center font-hand text-[13px] text-white/55 text-center"
                style={{
                  backgroundImage:
                    'radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.25) 0%, transparent 50%), linear-gradient(135deg, #D4B896 0%, #8A7C60 100%)',
                }}
              >
                [뒷모습/분위기 사진
                <br />
                placeholder]
              </div>
            )}
            <div className="absolute inset-0 bg-brand-line/15 pointer-events-none" />
            <button
              type="button"
              onClick={openSheet}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                         bg-brand-orange text-white rounded-full px-6 py-3
                         font-display font-bold text-[15px] tracking-[-0.02em]
                         shadow-[0_6px_16px_rgba(0,0,0,0.35)]
                         active:scale-[0.97] transition-transform"
            >
              얼굴 확인하기
            </button>
          </div>
        </div>

        {/* 취미 (wide) */}
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

        {/* 성격 */}
        <PCard label="🧭 성격">
          <div className="[&_b]:font-display [&_b]:font-bold">
            <b>사려 깊은 주도형.</b>
            <br />
            {tone === 'formal'
              ? '결정은 빠르지만 상대의 속도를 배려해요.'
              : '결정은 빠르지만 상대의 속도를 배려해.'}
          </div>
        </PCard>

        {/* 연애 스타일 */}
        <PCard label="💞 연애 스타일">
          <div className="[&_b]:font-display [&_b]:font-bold">
            <b>은은하게 꾸준한 타입.</b>
            <br />
            {tone === 'formal'
              ? '표현은 아끼지만 행동으로 보여줘요.'
              : '표현은 아끼지만 행동으로 보여줘.'}
          </div>
        </PCard>

        {/* 배경 (wide) */}
        <PCard wide label="📖 배경">
          <div className="[&_b]:font-display [&_b]:font-bold">
            <SafeText>{candidate.background}</SafeText>
          </div>
        </PCard>
      </div>

      {/* Day Timeline */}
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
      <div className="font-hand text-[13px] text-brand-orange-deep mb-[7px]">{label}</div>
      <div className="text-[14px] leading-[1.55] text-brand-ink">{children}</div>
    </div>
  );
}
