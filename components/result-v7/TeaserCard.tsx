'use client';

import Image from 'next/image';
import { Candidate } from '@/lib/report/types';
import { Section, SectionLabel, SectionTitle, HL } from './SectionFrame';
import { useSheet } from './sheetContext';

interface TeaserCardProps {
  candidate: Candidate;
}

export function TeaserCard({ candidate }: TeaserCardProps) {
  const { openSheet } = useSheet();
  return (
    <>
      <Section>
        <SectionLabel>FIRST INTRODUCTION</SectionLabel>
        <SectionTitle>
          다섯 분 중,
          <br />
          <HL>한 분을</HL> 먼저 소개합니다.
        </SectionTitle>
      </Section>

      <div className="person-card">
        <div
          className="person-photo"
          onContextMenu={(e) => e.preventDefault()}
        >
          {candidate.teaserPhoto && (
            <Image
              src={candidate.teaserPhoto}
              alt=""
              fill
              priority
              sizes="(max-width: 480px) 100vw, 480px"
              draggable={false}
              className="person-photo-img"
              style={
                {
                  objectFit: 'cover',
                  filter: 'blur(32px) saturate(1.05)',
                  transform: 'scale(1.2)',
                  pointerEvents: 'none',
                  WebkitUserSelect: 'none',
                  WebkitTouchCallout: 'none',
                  WebkitUserDrag: 'none',
                  zIndex: 0,
                } as React.CSSProperties
              }
            />
          )}
          <div className="person-no">PORTRAIT · CONCEALED</div>
          <div className="person-count">01 / 05</div>
          <div className="person-overlay">
            <p className="person-overlay-text">프로필 사진은 소개 신청 후 공개됩니다.</p>
            <button type="button" className="cta-primary" onClick={openSheet}>
              <span>소개 받기</span>
              <svg viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path
                  d="M1 7H13M13 7L8 2M13 7L8 12"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="square"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="person-meta">
          <div className="person-meta-title">Profile Summary</div>
          <div className="meta-row">
            <span className="meta-k">Age</span>
            <span className="meta-v">
              {candidate.ageRange} <span className="v7-blur">{candidate.ageDetail}</span>
            </span>
          </div>
          <div className="meta-row">
            <span className="meta-k">Job</span>
            <span className="meta-v">
              {candidate.occupation} <span className="v7-blur">{candidate.occupationDetail}</span>
            </span>
          </div>
          <div className="meta-row">
            <span className="meta-k">Aura</span>
            <span className="meta-v">{candidate.personality}</span>
          </div>
          <div className="meta-row">
            <span className="meta-k">Face</span>
            <span className="meta-v">{candidate.faceType}</span>
          </div>
          <div className="meta-row">
            <span className="meta-k">Found</span>
            <span className="meta-v">
              {candidate.location} <span className="v7-blur">◯◯◯◯</span>, 오프라인
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
