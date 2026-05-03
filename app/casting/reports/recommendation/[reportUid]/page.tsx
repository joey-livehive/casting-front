import { notFound } from 'next/navigation';
import { CASTING_API_BASE } from '@/lib/casting/api';
import { TopNav } from '@/components/report/TopNav';
import { ApplicationSummary } from '@/components/report/ApplicationSummary';
import { Chapter4Simulation } from '@/components/report/Chapter4Simulation';
import { ReportShell } from '@/components/report/ReportShell';
import { TrackSection } from '@/components/report/TrackSection';
import { MeetOrPassCta } from '@/components/report/MeetOrPassCta';
import { CasterNoteSection } from '../../../template-preview/_components/CasterNoteSection';
import { HeroV2 } from '../../../template-preview/_components/HeroV2';
import { HuntBoxV2 } from '../../../template-preview/_components/HuntBoxV2';
import { TeaserCardV2 } from '../../../template-preview/_components/TeaserCardV2';
import { Chapter2V2 } from '../../../template-preview/_components/Chapter2V2';
import { ReadingCardV2 } from '../../../template-preview/_components/ReadingCardV2';
import { Chapter3V2 } from '../../../template-preview/_components/Chapter3V2';

export const dynamic = 'force-dynamic';

async function fetchCastingReport(reportUid: string, token?: string) {
  try {
    const url = token
      ? `${CASTING_API_BASE}/casting/reports/${reportUid}/public?token=${encodeURIComponent(token)}`
      : `${CASTING_API_BASE}/casting/reports/${reportUid}/public`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function CastingRecommendationReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ reportUid: string }>;
  searchParams: Promise<{ t?: string; token?: string; cta?: string }>;
}) {
  const { reportUid } = await params;
  const { t, token: tokenParam, cta } = await searchParams;
  const dbReport = await fetchCastingReport(reportUid, t || tokenParam);
  const reportJson = dbReport?.report_json;

  if (!reportJson?.candidate_bundle || !reportJson?.viewer_bundle || !reportJson?.pair_bundle) {
    notFound();
  }

  const candidateBundle = reportJson.candidate_bundle;
  const viewerBundle = reportJson.viewer_bundle;
  const candidate = reportJson.candidate;
  const match = reportJson.match;
  const userAnswers = reportJson.user_answers ?? { idealType: {} };
  const userName = reportJson.user_name ?? '의뢰인';
  const huntStats = reportJson.hunt_stats ?? {
    offlineGyms: 0,
    instagramProfiles: 0,
    linkedinProfiles: 0,
    communities: 0,
  };

  return (
    <main className="max-w-[480px] mx-auto pb-[60px] relative bg-brand-bg min-h-screen font-body text-brand-ink">
      <ReportShell reportId={reportUid} tone="formal" variant="paid">
        <TopNav publishedAt={reportJson.published_at ?? dbReport.generated_at ?? 'LIVE'} />
        <HeroV2 userName={userName} />

        <CasterNoteSection
          headline={candidateBundle.casterHeadline}
          charmBullets={candidateBundle.casterCharmBullets}
        />

        <HuntBoxV2
          stats={huntStats}
          footer={
            <div className="relative w-full overflow-hidden rounded-[12px] mt-4" style={{ paddingTop: '33.125%' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/earth.webp" alt="찾아온 경로" className="absolute inset-x-0 top-0 w-full block" />
            </div>
          }
        />

        <TrackSection section="teaser_card" reportId={reportUid}>
          <TeaserCardV2 candidate={candidate} />
        </TrackSection>

        <ReadingCardV2
          userName={userName}
          narratives={{
            viewerInsight: viewerBundle.readingViewerInsight,
            matchOpening: candidateBundle.readingMatchOpening,
            candidateMatch: candidateBundle.readingCandidateMatch,
          }}
        />

        <TrackSection section="chapter1" reportId={reportUid}>
          <Chapter2V2
            userName={userName}
            candidate={candidate}
            narratives={{
              personality: candidateBundle.chapter2Personality,
              datingStyle: candidateBundle.chapter2DatingStyle,
              weekendStyle: candidateBundle.chapter2WeekendStyle,
            }}
          />
        </TrackSection>

        <TrackSection section="chapter3" reportId={reportUid}>
          <Chapter3V2 match={match} number="CHAPTER 2" />
        </TrackSection>

        <Chapter4Simulation match={match} number="CHAPTER 3" />

        <div className="px-7 mt-14 mb-3">
          <div className="border-t border-dashed border-brand-ink/30" />
        </div>

        <ApplicationSummary userAnswers={userAnswers} />
        <MeetOrPassCta reportId={reportUid} initialCta={cta} />
      </ReportShell>
    </main>
  );
}
