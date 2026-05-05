'use client';

import Image from 'next/image';
import { Candidate } from '@/lib/report/types';
import { ChapterCard } from './ChapterCard';
import { Section, SectionLabel, SectionTitle, HL, SectionSub } from './SectionFrame';

const LOCKED_SHAPES = ['◯◯◯', '◯◯◯◯', '◯◯'];

/** v7 주간 루틴 — mockData 가 해요체라 합쇼체 고정 텍스트로 대체. */
const routine: { time: string; body: React.ReactNode }[] = [
  {
    time: '06:30',
    body: (
      <>
        5km 러닝. 유지 기간 <span className="v7-blur-light">◯◯개월</span>.
      </>
    ),
  },
  {
    time: '09:00',
    body: (
      <>
        <span className="v7-blur-light">◯◯◯</span> 출근. 회의 많은 요일은 조기 시작.
      </>
    ),
  },
  {
    time: '19:30',
    body: (
      <>
        헬스 1시간. 주 <span className="v7-blur-light">◯회</span>.
      </>
    ),
  },
  {
    time: '22:00',
    body: (
      <>
        독서 또는 <span className="v7-blur-light">◯◯◯◯</span>. 조용히 마무리.
      </>
    ),
  },
];

export function CandidateDetail({ candidate }: { userName: string; candidate: Candidate }) {
  return (
    <>
      <Section>
        <SectionLabel>01. THE PERSON</SectionLabel>
        <SectionTitle>
          엄선된 상대에 대한
          <br />
          <HL>상세한 기록</HL>.
        </SectionTitle>
        <SectionSub>
          SNS 게시물 67건, 오프라인 관찰, 지인 추천 3건을
          <br />
          교차 검증했습니다.
        </SectionSub>
      </Section>

      <ChapterCard
        numberLabel="PERSON FILE"
        title="Profile Details"
        sub="의뢰인님의 기준과 교차되는 지점을 중심으로 정리했습니다."
      >
        <div className="person-grid">
          <div className="p-card photo wide">
            {candidate.detailPhoto && (
              <Image
                src={candidate.detailPhoto}
                alt=""
                fill
                sizes="(max-width: 480px) 100vw, 480px"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                className="detail-photo-img"
                style={
                  {
                    objectFit: 'cover',
                    objectPosition: '50% 25%',
                    filter: 'blur(9px) saturate(1.15) brightness(1)',
                    transform: 'scale(1.08)',
                    pointerEvents: 'none',
                    WebkitUserSelect: 'none',
                    WebkitTouchCallout: 'none',
                    WebkitUserDrag: 'none',
                    zIndex: 0,
                  } as React.CSSProperties
                }
              />
            )}
            <div className="photo-badge">PORTRAIT · CONCEALED</div>
          </div>

          <div className="p-card wide">
            <div className="p-label">Interests</div>
            <div className="hobby-row">
              {candidate.hobbies.visible.map((h) => (
                <span key={h} className="hobby-tag">
                  {h}
                </span>
              ))}
              {Array.from({ length: candidate.hobbies.hidden }).map((_, i) => (
                <span key={`lock-${i}`} className="hobby-tag locked">
                  {LOCKED_SHAPES[i % LOCKED_SHAPES.length]}
                </span>
              ))}
            </div>
          </div>

          <div className="p-card">
            <div className="p-label">Character</div>
            <div className="p-body">
              <b>사려 깊은 주도형.</b>
              <br />
              빠른 결정, 세심한 배려.
            </div>
          </div>

          <div className="p-card">
            <div className="p-label">Style</div>
            <div className="p-body">
              <b>은은하고 꾸준한 유형.</b>
              <br />
              행동으로 애정을 표현.
            </div>
          </div>

          <div className="p-card wide">
            <div className="p-label">Background</div>
            <div className="p-body">
              <span className="v7-blur-light">◯◯◯◯</span> 전공,{' '}
              <span className="v7-blur-light">◯◯◯</span> 재직. 최근{' '}
              <span className="v7-blur-light">◯◯◯◯◯</span>에 몰입 중.
            </div>
          </div>
        </div>

        <div className="timeline">
          <div className="timeline-head">Weekday Routine</div>
          {routine.map((item) => (
            <div key={item.time} className="tl-item">
              <span className="tl-time">{item.time}</span>
              <span className="tl-body">{item.body}</span>
            </div>
          ))}
        </div>
      </ChapterCard>
    </>
  );
}
