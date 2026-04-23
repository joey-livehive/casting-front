'use client';

import Image from 'next/image';
import { Candidate } from '@/lib/report/types';
import { Section, SectionLabel, SectionTitle, HL } from './SectionFrame';
import { useSheet } from './sheetContext';
import { useTone } from './toneContext';
import { SafeText } from './SafeText';

interface TeaserCardProps {
  candidate: Candidate;
}

export function TeaserCard({ candidate }: TeaserCardProps) {
  const { openSheet } = useSheet();
  const tone = useTone();
  return (
    <Section>
      <SectionLabel>맛보기 · 1 of 5</SectionLabel>
      <SectionTitle>
        이 사람, <HL>{tone === 'formal' ? '어떠세요?' : '어때?'}</HL>
      </SectionTitle>

      <div className="[perspective:1000px]">
        <div className="relative bg-brand-cream border-2 border-brand-line rounded-[22px] overflow-hidden shadow-[6px_7px_0_var(--line)]">
          {/* 사진 */}
          <div
            className="relative aspect-[4/5] overflow-hidden bg-[linear-gradient(135deg,#E8D5B7_0%,#D4B896_50%,#C9A574_100%)] select-none"
            onContextMenu={(e) => e.preventDefault()}
          >
            {candidate.teaserPhoto ? (
              <Image
                src={candidate.teaserPhoto}
                alt=""
                fill
                priority
                sizes="(max-width: 480px) 100vw, 480px"
                draggable={false}
                className="object-cover select-none"
                style={{
                  filter: 'blur(12px) saturate(1.05)',
                  transform: 'scale(1.15)',
                  pointerEvents: 'none',
                  WebkitUserSelect: 'none',
                  WebkitTouchCallout: 'none',
                  WebkitUserDrag: 'none',
                } as React.CSSProperties}
              />
            ) : (
              <div
                className="absolute inset-0 flex items-center justify-center font-hand text-[14px] text-black/40 text-center p-5"
                style={{
                  backgroundImage:
                    'radial-gradient(ellipse at 50% 35%, rgba(255,255,255,0.3) 0%, transparent 40%), linear-gradient(135deg, #E8D5B7, #C9A574)',
                }}
              >
                [하이퍼 AI 이미지
                <br />
                placeholder]
              </div>
            )}
            <div className="absolute inset-0 bg-brand-bg/15 pointer-events-none" />

            {/* 중앙 CTA */}
            <div
              className="absolute left-1/2 top-[48%] -translate-x-1/2 -translate-y-1/2 z-[4]
                         flex flex-col items-center gap-3.5 pointer-events-none w-[88%]"
            >
              <div className="font-hand text-[16px] text-white bg-brand-ink/75 px-4 py-[7px] rounded-[18px] backdrop-blur-[6px] text-center">
                {tone === 'formal' ? '이 사람 진짜 모습, 궁금하시죠?' : '이 사람 진짜 모습, 궁금하지?'}
              </div>
              <button
                type="button"
                onClick={openSheet}
                className="pointer-events-auto bg-brand-orange text-white rounded-full
                           px-7 py-4 font-display font-bold text-[16px] tracking-[-0.02em]
                           animate-cta-pulse active:scale-[0.97] transition-transform"
              >
                얼굴 확인하기
              </button>
            </div>

            {/* 하단 그라디언트 */}
            <div className="absolute left-0 right-0 bottom-0 z-[2] pt-10 px-[18px] pb-[18px] text-white bg-[linear-gradient(180deg,transparent_0%,rgba(28,26,23,0.88)_100%)]">
              <div className="font-display font-semibold text-[20px] tracking-[-0.02em]">
                &ldquo;
                <span className="inline-block bg-brand-cream text-brand-cream rounded px-2.5 mx-[2px] [filter:blur(5px)] select-none">
                  {candidate.nickname}
                </span>
                &rdquo; 님
              </div>
              <div className="text-[13px] opacity-85 mt-[5px]">
                📍 {candidate.location} · {candidate.foundAt.includes('헬스장') ? '오프라인 헬스장' : '오프라인 요가'}에서 찾음
              </div>
            </div>
          </div>

          {/* 메타 */}
          <div className="grid grid-cols-2 gap-4 px-[22px] pt-[22px] pb-6">
            <MetaItem label="얼굴상" value={candidate.faceType} />
            <MetaItem label="나이" value={`${candidate.ageRange} <blur>${candidate.ageDetail}</blur>`} />
            <MetaItem label="직업" value={`${candidate.occupation} <blur>${candidate.occupationDetail}</blur>`} />
            <MetaItem label="성격" value={candidate.personality} />
            <MetaItem label="찾은 곳" value={`${candidate.foundAt} (오프라인)`} full />
          </div>
        </div>
      </div>
    </Section>
  );
}

function MetaItem({ label, value, full = false }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={full ? 'col-span-2' : undefined}>
      <div className="text-[11px] text-brand-ink-mute mb-1 tracking-[0.02em]">{label}</div>
      <div className="font-display font-semibold text-[15px] text-brand-ink">
        <SafeText>{value}</SafeText>
      </div>
    </div>
  );
}
