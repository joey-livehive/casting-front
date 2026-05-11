// Owner 시점 매칭 리포트 페이지 (PR 2 commit 3b — 실제 렌더).
//
// 라우트: /connection/casting/{uid}
// perspective: 'owner'  (PROMPT_ARCHITECTURE.md v4 § 1 / § 3)
//
// 흐름:
//   1. server-side fetch — GET /casting/connection/casting/{uid}
//   2. ConnectionReport JSON → adapter 헬퍼로 기존 컴포넌트 props 변환
//   3. template-preview 와 동일 컴포넌트 마운트 (cross-route _components import)
//
// 매핑 안 되는 필드 (hobbies, daySchedule, secretAppeal 등) 는 빈 값으로 둠.
// 3c 에서 인스타 합본 분해 + 4축 라벨 통일 시 보강 예정.

import { notFound } from 'next/navigation';

import { ApplicationSummary } from '@/components/report/ApplicationSummary';
import { Chapter4Simulation } from '@/components/report/Chapter4Simulation';
import { MeetOrPassCta } from '@/components/report/MeetOrPassCta';
import { ReportShell } from '@/components/report/ReportShell';
import { TopNav } from '@/components/report/TopNav';
import { TrackSection } from '@/components/report/TrackSection';
import { CandidateDetailSection } from '@/app/casting/template-preview/_components/CandidateDetailSection';
import { CasterNoteSection } from '@/app/casting/template-preview/_components/CasterNoteSection';
import { Chapter3V2 } from '@/app/casting/template-preview/_components/Chapter3V2';
import { HeroV2 } from '@/app/casting/template-preview/_components/HeroV2';
import { HuntBoxV2 } from '@/app/casting/template-preview/_components/HuntBoxV2';
import { ReadingCardV2 } from '@/app/casting/template-preview/_components/ReadingCardV2';
import { TeaserCardV2 } from '@/app/casting/template-preview/_components/TeaserCardV2';
import {
  ConnectionReportFetchError,
  fetchOwnerConnectionReport,
} from '@/lib/casting/connection-report';
import {
  FIXED_USER_NAME,
  adaptCandidate,
  adaptCasterNote,
  adaptChapter2Narratives,
  adaptHuntStats,
  adaptMatchAnalysis,
  adaptReadingCard,
  adaptUserAnswers,
} from '@/lib/casting/connection-adapter';

type PageProps = {
  params: Promise<{ uid: string }>;
};

export default async function OwnerCastingPage({ params }: PageProps) {
  const { uid } = await params;

  let report;
  try {
    report = await fetchOwnerConnectionReport(uid);
  } catch (err) {
    if (err instanceof ConnectionReportFetchError && err.status === 404) {
      notFound();
    }
    throw err;
  }

  const candidate = adaptCandidate(report);
  const casterNote = adaptCasterNote(report);
  const huntStats = adaptHuntStats(report);
  const readingCard = adaptReadingCard(report);
  const chapter2Narratives = adaptChapter2Narratives(report);
  const match = adaptMatchAnalysis(report);
  const userAnswers = adaptUserAnswers(report);

  const publishedAt = formatPublishedAt(report.meta.generated_at);

  return (
    <main className="max-w-[480px] mx-auto pb-[60px] relative bg-brand-bg min-h-screen font-body text-brand-ink">
      <ReportShell reportId={uid} tone="formal" variant="paid">
        <TopNav publishedAt={publishedAt} />
        <HeroV2 userName={FIXED_USER_NAME} />

        <CasterNoteSection
          headline={casterNote.headline}
          charmBullets={casterNote.charmBullets}
        />

        <HuntBoxV2
          stats={huntStats}
          footer={
            <div
              className="relative w-full overflow-hidden rounded-[12px] mt-4"
              style={{ paddingTop: '33.125%' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/earth.webp"
                alt="찾아온 경로"
                className="absolute inset-x-0 top-0 w-full block"
              />
            </div>
          }
        />

        <TrackSection section="teaser_card" reportId={uid}>
          <TeaserCardV2 candidate={candidate} />
        </TrackSection>

        <ReadingCardV2
          userName={FIXED_USER_NAME}
          narratives={readingCard}
        />

        <TrackSection section="chapter1" reportId={uid}>
          <CandidateDetailSection
            userName={FIXED_USER_NAME}
            candidate={candidate}
            narratives={chapter2Narratives}
          />
        </TrackSection>

        <TrackSection section="chapter3" reportId={uid}>
          <Chapter3V2 match={match} number="CHAPTER 2" />
        </TrackSection>

        <Chapter4Simulation
          match={match}
          number="CHAPTER 3"
          sceneImage={report.meta.scene_image || '/images/simulation/c324be08-meeting.jpg'}
        />

        <div className="px-7 mt-14 mb-3">
          <div className="border-t border-dashed border-brand-ink/30" />
        </div>

        <ApplicationSummary userAnswers={userAnswers} />

        <MeetOrPassCta reportId={uid} />

        <div className="px-7 mt-10 mb-2 text-center text-[12px] text-brand-ink-mute">
          문의:{' '}
          <a href="mailto:hello@livehivecorp.com" className="underline">
            hello@livehivecorp.com
          </a>
        </div>
      </ReportShell>
    </main>
  );
}

function formatPublishedAt(iso: string | null | undefined): string {
  if (!iso) return new Date().toISOString().slice(0, 10).replace(/-/g, '.');
  return iso.slice(0, 10).replace(/-/g, '.');
}
