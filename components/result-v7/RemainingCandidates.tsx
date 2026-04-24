'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useSheet } from './sheetContext';
import { Section, SectionLabel, SectionTitle, HL } from './SectionFrame';

interface RemainingHint {
  source: string;
  location: string;
}

const hints: RemainingHint[] = [
  { source: 'Instagram', location: '28세' },
  { source: 'LinkedIn', location: '31세' },
  { source: '프리미엄 헬스장', location: '29세' },
  { source: '와인바·북카페', location: '27세' },
];

export function RemainingCandidates({ photos }: { photos?: string[] }) {
  const { openSheet } = useSheet();
  const [secs, setSecs] = useState(50 * 60 + 45);
  useEffect(() => {
    const id = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);
  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');

  return (
    <>
      <Section>
        <SectionLabel>OTHER CANDIDATES</SectionLabel>
        <SectionTitle>
          이 외에도 <HL>4명</HL>이 더
          <br />
          사람이 어울리실 것 같습니다.
        </SectionTitle>
        <div style={{ textAlign: 'center', marginTop: 12, fontVariantNumeric: 'tabular-nums' }}>
          <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--v7-accent, #C9A961)' }}>
            {mm}:{ss}
          </span>
          <span style={{ fontSize: 12, color: 'var(--v7-mute, #A8A090)', marginLeft: 6 }}>남음</span>
        </div>
      </Section>

      <div
        className="remaining-grid"
        onContextMenu={(e) => e.preventDefault()}
      >
        {hints.map((h, i) => {
          const photo = photos?.[i];
          return (
            <button
              key={h.source}
              type="button"
              onClick={() => openSheet('remaining_candidates')}
              aria-label={`${h.source}에서 찾은 후보 · 소개 신청 후 공개`}
              className="rc-card"
            >
              {photo ? (
                <Image
                  src={photo}
                  alt=""
                  fill
                  sizes="(max-width: 480px) 50vw, 240px"
                  draggable={false}
                  className="rc-img"
                  style={
                    {
                      objectFit: 'cover',
                      filter: 'blur(10px) saturate(1.1) brightness(0.95)',
                      transform: 'scale(1.1)',
                      pointerEvents: 'none',
                      WebkitUserSelect: 'none',
                      WebkitTouchCallout: 'none',
                      WebkitUserDrag: 'none',
                    } as React.CSSProperties
                  }
                />
              ) : null}

              <div className="rc-no">0{i + 2} / 05</div>

              <div className="rc-foot">
                <div className="rc-source">{h.source}</div>
                <div className="rc-loc">{h.location}</div>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}
