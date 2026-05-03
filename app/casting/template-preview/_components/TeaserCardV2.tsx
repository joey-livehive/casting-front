'use client';

import Image from 'next/image';
import { Candidate } from '@/lib/report/types';
import { Section, SectionLabel, SectionTitle, HL } from '@/components/report/SectionFrame';
import { useTone } from '@/components/report/toneContext';
import { SafeText } from '@/components/report/SafeText';

// TeaserCard v2 — 4행 메타 레이아웃
// Row 1: 외모상 (full)
// Row 2: 나이 / 키 / 직업 (3 cols)
// Row 3: 거주지역 / MBTI (2 cols)
// Row 4: 캐스터의 추천사 (full)
export function TeaserCardV2({ candidate }: { candidate: Candidate }) {
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
                [후보 사진 placeholder]
              </div>
            )}

            {/* 닉네임 + 거주지역 오버레이 (닉네임은 블러 처리) */}
            <div className="absolute left-0 right-0 bottom-0 z-[2] pt-10 px-[18px] pb-[18px] text-white bg-[linear-gradient(180deg,transparent_0%,rgba(28,26,23,0.88)_100%)]">
              <div className="font-display font-semibold text-[20px] tracking-[-0.02em]">
                &ldquo;
                <span className="inline-block bg-brand-cream text-brand-cream rounded px-2.5 mx-[2px] [filter:blur(5px)] select-none">
                  {candidate.nickname}
                </span>
                &rdquo; 님
              </div>
              {candidate.location && (
                <div className="mt-1 text-[14px] text-white/85 flex items-center gap-1">
                  <span>📍</span>
                  <span>{candidate.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* 메타 — 4행 레이아웃 */}
          <div className="px-[22px] pt-[22px] pb-6 space-y-5">
            {/* Row 1: 외모상 (full) */}
            <MetaItem label="외모상" value={candidate.faceType} />

            {/* Row 2: 나이 / 직업 (2 cols) — 키는 추천사로 뺐음 */}
            <div className="grid grid-cols-2 gap-4">
              <MetaItem label="나이" value={candidate.ageRange} />
              <MetaItem
                label="직업"
                value={
                  candidate.occupation && !candidate.occupation.includes('<red>')
                    ? candidate.occupation
                    : '-'
                }
              />
            </div>

            {/* Row 3: 키 / MBTI (2 cols) — 거주지역은 사진 오버레이로 이동 */}
            <div className="grid grid-cols-2 gap-4">
              <MetaItem label="키" value={candidate.height ?? '-'} />
              <MetaItem label="MBTI" value={candidate.mbti ?? '-'} />
            </div>

            {/* Row 4: 캐스터의 추천사 (full) */}
            {candidate.recommendation && (
              <MetaItem label="캐스터의 추천사" value={candidate.recommendation} />
            )}
          </div>
        </div>
      </div>
    </Section>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] text-brand-ink-mute mb-1 tracking-[0.02em]">{label}</div>
      <div className="font-display font-semibold text-[15px] text-brand-ink">
        <SafeText>{value}</SafeText>
      </div>
    </div>
  );
}
