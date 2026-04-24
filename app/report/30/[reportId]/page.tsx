import '../v7.css';
import { getReport, getDefaultReport } from '@/lib/report/mockData';
import { getMockPersonalized } from '@/lib/personalization/mock-personalized';
import { isMockUserKey, getMockUser } from '@/lib/personalization/mock-users';
import type { UserAnswers, PersonalizedContent } from '@/lib/personalization/types';
import { TopNav } from '@/components/result-v7/TopNav';
import { Hero } from '@/components/result-v7/Hero';
import { HuntBox } from '@/components/result-v7/HuntBox';
import { ApplicationSummary } from '@/components/result-v7/ApplicationSummary';
import { TeaserCard } from '@/components/result-v7/TeaserCard';
import { ReadingCard } from '@/components/result-v7/ReadingCard';
import { Chapter1 } from '@/components/result-v7/Chapter1';
import { Chapter2 } from '@/components/result-v7/Chapter2';
import { Chapter3 } from '@/components/result-v7/Chapter3';
import { ScarcityBlock } from '@/components/result-v7/ScarcityBlock';
import { RemainingCandidates } from '@/components/result-v7/RemainingCandidates';
import { BridgeGradient, BridgeIntro, BridgeBack } from '@/components/result-v7/Bridge';
import { DarkZone } from '@/components/result-v7/DarkZone';
import { CastingProcess } from '@/components/result-v7/CastingProcess';
import { PrivacyBox } from '@/components/result-v7/PrivacyBox';
import { VsSection } from '@/components/result-v7/VsSection';
import { PriceCompare } from '@/components/result-v7/PriceCompare';
import { CoupleTestimonials } from '@/components/result-v7/CoupleTestimonials';
import { FinalSignature } from '@/components/result-v7/FinalSignature';
import { ReportShell } from '@/components/result-v7/ReportShell';

export const dynamic = 'force-dynamic';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.publicvoid.im';

const EMPTY_PERSONALIZED: PersonalizedContent = {
  chapter1Traits: { trait01Intro: '', trait02Intro: '', trait03Intro: '', trait04Intro: '' },
  readingCard: { paragraph1Opening: '', paragraph2Opening: '' },
};

async function fetchReport(reportId: string): Promise<{ userAnswers: UserAnswers; personalized: PersonalizedContent } | null> {
  try {
    const res = await fetch(`${API}/theone/reports/${reportId}`, { cache: 'no-store' });
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

  const data = getReport(reportId) || getDefaultReport(reportId);

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
    <main className="v7-root">
      <ReportShell reportId={reportId} tone={data.tone}>
        <TopNav publishedAt={data.publishedAt} />
        <Hero userName={data.userName} />
        <ApplicationSummary userAnswers={userAnswers} />
        <HuntBox
          userName={data.userName}
          stats={data.huntStats}
          effort={data.effort}
          total={data.totalCandidates}
        />

        <TeaserCard
          candidate={data.teaserCandidate}
          userLocation={userAnswers.selfInfo?.location}
        />
        <ReadingCard
          userName={data.userName}
          personalizedOpenings={personalized.readingCard}
        />
        <Chapter2 userName={data.userName} candidate={data.teaserCandidate} />
        <Chapter1 personalizedTraits={personalized.chapter1Traits} />
        <Chapter3 userName={data.userName} match={data.match} />
        <RemainingCandidates photos={data.remainingPhotos} />
        <ScarcityBlock total={data.totalCandidates} />

        <BridgeGradient />

        <DarkZone>
          <BridgeIntro />
          <CastingProcess />
          <PrivacyBox />
          <VsSection />
        </DarkZone>

        <BridgeBack />

        <PriceCompare />
        <CoupleTestimonials />
        <FinalSignature />
      </ReportShell>
    </main>
  );
}
