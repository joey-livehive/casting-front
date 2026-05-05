import { notFound } from 'next/navigation';
import { CASTING_API_BASE } from '@/lib/casting/api';
import { TopNav } from '@/components/report/TopNav';
import { Hero } from '@/components/report/Hero';
import { ApplicationSummary } from '@/components/report/ApplicationSummary';
import { HuntBox } from '@/components/report/HuntBox';
import { TeaserCard } from '@/components/report/TeaserCard';
import { ReadingCard } from '@/components/report/ReadingCard';
import { CandidateDetail } from '@/components/report/CandidateDetail';
import { Chapter3 } from '@/components/report/Chapter3';
import { Chapter4Simulation } from '@/components/report/Chapter4Simulation';
import { ReportShell } from '@/components/report/ReportShell';
import { TrackSection } from '@/components/report/TrackSection';
import { MeetOrPassCta } from '@/components/report/MeetOrPassCta';
import { CasterNoteSection } from '../../../template-preview/_components/CasterNoteSection';
import { candidateImageForGender } from '@/lib/casting/reportImages';

export const dynamic = 'force-dynamic';

const DEFAULT_CAFE_SCENE_IMAGE = '/images/simulation/c324be08-meeting.jpg';

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

  if (!reportJson?.ownerPersonContent || !reportJson?.partnerPersonContent || !reportJson?.pairContent) {
    notFound();
  }

  const ownerPersonContent = reportJson.ownerPersonContent;
  const partnerPersonContent = reportJson.partnerPersonContent;
  const pairContent = reportJson.pairContent;
  const candidateGenderImage = candidateImageForGender(reportJson.partner?.self?.gender, reportUid);
  const candidate = {
    ...reportJson.candidate,
    ...(candidateGenderImage
      ? {
          teaserPhoto: candidateGenderImage,
          detailPhoto: candidateGenderImage,
        }
      : {}),
  };
  const match = reportJson.match;
  const sceneImage = reportJson.scene_image ?? DEFAULT_CAFE_SCENE_IMAGE;
  const userAnswers = reportJson.user_answers ?? { idealType: {} };
  const userName = reportJson.user_name ?? '의뢰인';
  const personalized = {
    chapter1Traits: { trait01Intro: '', trait02Intro: '', trait03Intro: '', trait04Intro: '' },
    readingCard: {
      paragraph1Opening: ownerPersonContent.summary,
      paragraph2Opening: pairContent.matchOpening,
      candidateMatch: partnerPersonContent.summary,
    },
  };
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
        <Hero userName={userName} />

        <CasterNoteSection
          headline={partnerPersonContent.casterHeadline}
          charmBullets={partnerPersonContent.casterCharmBullets}
        />

        <ApplicationSummary userAnswers={userAnswers} />
        <HuntBox stats={huntStats} />

        <TrackSection section="teaser_card" reportId={reportUid}>
          <TeaserCard candidate={candidate} />
        </TrackSection>

        <ReadingCard userName={userName} personalized={personalized.readingCard} />

        <TrackSection section="chapter1" reportId={reportUid}>
          <CandidateDetail userName={userName} candidate={candidate} />
        </TrackSection>

        <TrackSection section="chapter3" reportId={reportUid}>
          <Chapter3 userName={userName} match={match} number="CHAPTER 2" />
        </TrackSection>

        <Chapter4Simulation match={match} number="CHAPTER 3" sceneImage={sceneImage} />
        <MeetOrPassCta reportId={reportUid} initialCta={cta} />
      </ReportShell>
    </main>
  );
}
