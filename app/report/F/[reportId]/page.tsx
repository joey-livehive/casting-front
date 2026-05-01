import { notFound } from 'next/navigation';
import { getReport, mockReportIds, getDefaultReport } from '@/lib/report/mockData';
import { getMockPersonalized } from '@/lib/personalization/mock-personalized';
import { getMockUser, isMockUserKey } from '@/lib/personalization/mock-users';
import type { UserAnswers, PersonalizedContent } from '@/lib/personalization/types';
import { TopNav } from '@/components/report/TopNav';
import { Hero } from '@/components/report/Hero';
import { ApplicationSummary } from '@/components/report/ApplicationSummary';
import { HuntBox } from '@/components/report/HuntBox';
import { TeaserCard } from '@/components/report/TeaserCard';
import { ReadingCard } from '@/components/report/ReadingCard';
import { Chapter1 } from '@/components/report/Chapter1';
import { Chapter2 } from '@/components/report/Chapter2';
import { Chapter3 } from '@/components/report/Chapter3';
import { ScarcityBlock } from '@/components/report/ScarcityBlock';
import { RemainingCandidates } from '@/components/report/RemainingCandidates';
import { BridgeGradient, BridgeIntro, BridgeBack } from '@/components/report/Bridge';
import { DarkZone } from '@/components/report/DarkZone';
import { CastingProcess } from '@/components/report/CastingProcess';
import { PrivacyBox } from '@/components/report/PrivacyBox';
import { VsSection } from '@/components/report/VsSection';
import { PriceCompare } from '@/components/report/PriceCompare';
import { CoupleTestimonials } from '@/components/report/CoupleTestimonials';
import { FinalSignature } from '@/components/report/FinalSignature';
import { ReportShell } from '@/components/report/ReportShell';
import { TrackSection } from '@/components/report/TrackSection';

export const dynamic = 'force-dynamic';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.publicvoid.im';

const EMPTY_PERSONALIZED: PersonalizedContent = {
  chapter1Traits: { trait01Intro: '', trait02Intro: '', trait03Intro: '', trait04Intro: '' },
  readingCard: { paragraph1Opening: '', paragraph2Opening: '' },
};

async function fetchReport(reportId: string): Promise<{ userAnswers: UserAnswers; personalized: PersonalizedContent } | null> {
  try {
    const res = await fetch(`${API}/casting/preview/reports/${reportId}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return {
      userAnswers: json.user_answers || { idealType: {} },
      personalized: json.personalized || EMPTY_PERSONALIZED,
    };
  } catch {
    return null;
  }
}

export default async function ReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ reportId: string }>;
  searchParams: Promise<{ mock?: string }>;
}) {
  const { reportId } = await params;
  const { mock } = await searchParams;

  const data = { ...(getReport(reportId) || getDefaultReport(reportId, 'F')), tone: 'formal' as const };

  let userAnswers: UserAnswers;
  let personalized: PersonalizedContent;

  if (getReport(reportId) && mock) {
    const mockKey = isMockUserKey(mock) ? mock : 'A';
    userAnswers = getMockUser(mockKey);
    personalized = getMockPersonalized(mockKey);
  } else {
    const apiData = await fetchReport(reportId);
    if (apiData) {
      userAnswers = apiData.userAnswers;
      personalized = apiData.personalized;
    } else {
      userAnswers = getMockUser('A');
      personalized = EMPTY_PERSONALIZED;
    }
  }

  return (
    <main className="max-w-[480px] mx-auto pb-[130px] relative bg-brand-bg min-h-screen font-body text-brand-ink">
      <ReportShell reportId={reportId} tone={data.tone}>
        <TopNav publishedAt={data.publishedAt} />
        <Hero userName={data.userName} />
        <ApplicationSummary userAnswers={userAnswers} />
        <HuntBox stats={data.huntStats} />

        <TrackSection section="teaser_card" reportId={reportId}>
          <TeaserCard candidate={data.teaserCandidate} blurred />
        </TrackSection>
        <ReadingCard userName={data.userName} personalized={personalized.readingCard} />
        <TrackSection section="chapter1" reportId={reportId}>
          <Chapter2 userName={data.userName} candidate={data.teaserCandidate} />
        </TrackSection>
        <TrackSection section="chapter2" reportId={reportId}>
          <Chapter1 userName={data.userName} personalized={personalized.chapter1Traits} />
        </TrackSection>
        <TrackSection section="chapter3" reportId={reportId}>
          <Chapter3 userName={data.userName} match={data.match} />
        </TrackSection>
        <TrackSection section="remaining" reportId={reportId}>
          <RemainingCandidates photos={data.remainingPhotos} />
        </TrackSection>
        <ScarcityBlock userName={data.userName} total={data.totalCandidates} />

        <BridgeGradient />

        <TrackSection section="dark_zone" reportId={reportId}>
          <DarkZone>
            <BridgeIntro />
            <CastingProcess />
            <PrivacyBox userName={data.userName} />
            <VsSection />
          </DarkZone>
        </TrackSection>

        <BridgeBack />

        <TrackSection section="price_compare" reportId={reportId}>
          <PriceCompare />
        </TrackSection>
        <CoupleTestimonials />
        <FinalSignature />
      </ReportShell>
    </main>
  );
}
