'use client';

import Image from 'next/image';
import { Candidate } from '@/lib/report/types';
import { Section, SectionLabel, SectionTitle, HL } from './SectionFrame';
import { useTone } from './toneContext';
import { SafeText } from './SafeText';

interface TeaserCardProps {
  candidate: Candidate;
  /** true 면 사진을 블러 처리 (결제 전 무료 미리보기 화면에서 사용). 기본값 false. */
  blurred?: boolean;
}

export function TeaserCard({ candidate, blurred = false }: TeaserCardProps) {
  const tone = useTone();
  return (
    <Section>
      <SectionLabel>캐스팅 된 사람!</SectionLabel>
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
                  pointerEvents: 'none',
                  WebkitUserSelect: 'none',
                  WebkitTouchCallout: 'none',
                  WebkitUserDrag: 'none',
                  filter: blurred ? 'blur(18px)' : undefined,
                  transform: blurred ? 'scale(1.1)' : undefined,
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

            {/* 하단 그라디언트 */}
            <div className="absolute left-0 right-0 bottom-0 z-[2] pt-10 px-[18px] pb-[18px] text-white bg-[linear-gradient(180deg,transparent_0%,rgba(28,26,23,0.88)_100%)]">
              <div className="font-display font-semibold text-[20px] tracking-[-0.02em]">
                &ldquo;
                <span className="inline-block bg-brand-cream text-brand-cream rounded px-2.5 mx-[2px] [filter:blur(5px)] select-none">
                  {candidate.nickname}
                </span>
                &rdquo; 님
              </div>
            </div>
          </div>

          {/* 메타 */}
          <div className="grid grid-cols-2 gap-4 px-[22px] pt-[22px] pb-6">
            <MetaItem label="외모상" value={candidate.faceType} full />
            <MetaItem label="나이" value={candidate.ageRange} />
            <MetaItem label="거주지역" value={candidate.location} />
            {candidate.mbti && <MetaItem label="MBTI" value={candidate.mbti} />}
            {candidate.occupation && !candidate.occupation.includes('<red>') && (
              <MetaItem label="직업" value={candidate.occupation} />
            )}
            {candidate.recommendation && (
              <MetaItem label="캐스터의 추천사" value={candidate.recommendation} full />
            )}
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
