'use client';

import Image from 'next/image';
import { Fragment, type ReactNode } from 'react';
import { Candidate } from '@/lib/report/types';
import { Section, SectionLabel, SectionTitle, HL } from '@/components/report/SectionFrame';
import { useTone } from '@/components/report/toneContext';
import { SafeText } from '@/components/report/SafeText';

// "이 사람,\n가볍게..." 같은 문자열의 '\n' 을 <br /> 로 변환.
// flatMap 으로 줄 사이에만 <br /> 끼워 넣어 빈 노드 없이 깔끔하게.
function withLineBreaks(text: string): ReactNode[] {
  return text
    .split('\n')
    .flatMap((part, i) =>
      i === 0
        ? [<Fragment key={`p-${i}`}>{part}</Fragment>]
        : [<br key={`br-${i}`} />, <Fragment key={`p-${i}`}>{part}</Fragment>],
    );
}

interface TeaserCardV2Props {
  candidate: Candidate;
  /** 인스타 변형: 캐스터의 추천사 아래 작은 각주 (예: 인스타 추정 안내) */
  recommendationFootnote?: string;
  /** 상단 SectionLabel 카피 override. 미지정 시 "캐스팅 된 사람!" (caster 기본). */
  sectionLabel?: string;
  /** 상단 SectionTitle 카피 override. <HL> 강조 부분만 highlight 로 받음. */
  sectionTitle?: { plain: string; highlight: string };
}

// TeaserCard v2 — 4행 메타 레이아웃
// Row 1: 외모상 (full)
// Row 2: 나이 / 키 / 직업 (3 cols)
// Row 3: 거주지역 / MBTI (2 cols)
// Row 4: 캐스터의 추천사 (full)
//
// 인스타 변형 (recommendationFootnote 전달 시): 추천사 아래 작은 각주 추가
// receiver 변형 (sectionLabel/sectionTitle 전달 시): 상단 헤더 카피 override
export function TeaserCardV2({
  candidate,
  recommendationFootnote,
  sectionLabel,
  sectionTitle,
}: TeaserCardV2Props) {
  const tone = useTone();
  const labelText = sectionLabel ?? '캐스팅 된 사람!';
  const titlePlain = sectionTitle?.plain ?? '이 사람, ';
  const titleHighlight = sectionTitle?.highlight ?? (tone === 'formal' ? '어떠세요?' : '어때?');
  return (
    <Section>
      <SectionLabel>{labelText}</SectionLabel>
      <SectionTitle>
        {withLineBreaks(titlePlain)}
        <HL>{titleHighlight}</HL>
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
              <div>
                <MetaItem label="캐스터의 추천사" value={candidate.recommendation} />
                {recommendationFootnote && (
                  <p className="mt-2 text-[11.5px] text-brand-ink-mute leading-[1.55] italic">
                    <SafeText>{recommendationFootnote}</SafeText>
                  </p>
                )}
              </div>
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
