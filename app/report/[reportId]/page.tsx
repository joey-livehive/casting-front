import { notFound } from 'next/navigation';
import { getReport, mockReportIds } from '@/lib/report/mockData';
import { TopNav } from '@/components/report/TopNav';
import { Hero } from '@/components/report/Hero';
import { CredibilityStrip } from '@/components/report/CredibilityStrip';
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
import { getMockPersonalized } from '@/lib/personalization/mock-personalized';
import { getMockUser, isMockUserKey } from '@/lib/personalization/mock-users';
import { ApplicationSummary } from '@/components/report/ApplicationSummary';

export function generateStaticParams() {
  return mockReportIds.map((reportId) => ({ reportId }));
}

export default async function ReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ reportId: string }>;
  searchParams: Promise<{ mock?: string }>;
}) {
  const { reportId } = await params;
  const data = getReport(reportId);
  if (!data) notFound();

  // ?mock=A|B|C → 개인화 Mock 선택. 없거나 잘못되면 A (기본값).
  // [LLM_GENERATED] 추후 실제 유저 답변 → LLM 호출 결과로 교체.
  const { mock } = await searchParams;
  const mockKey = isMockUserKey(mock) ? mock : 'A';
  const personalized = getMockPersonalized(mockKey);
  const userAnswers = getMockUser(mockKey);

  return (
    <main className="max-w-[480px] mx-auto pb-[130px] relative bg-brand-bg min-h-screen font-body text-brand-ink">
      <ReportShell reportId={data.reportId} tone={data.tone}>
        <TopNav publishedAt={data.publishedAt} />
        <CredibilityStrip />
        <Hero userName={data.userName} />
        <ApplicationSummary userAnswers={userAnswers} />
        <HuntBox
          userName={data.userName}
          stats={data.huntStats}
          effort={data.effort}
          total={data.totalCandidates}
        />

        <TeaserCard candidate={data.teaserCandidate} />
        <ReadingCard userName={data.userName} personalized={personalized.readingCard} />
        <Chapter2 userName={data.userName} candidate={data.teaserCandidate} />
        <Chapter1 userName={data.userName} personalized={personalized.chapter1Traits} />
        <Chapter3 userName={data.userName} match={data.match} />
        <RemainingCandidates photos={data.remainingPhotos} />
        <ScarcityBlock userName={data.userName} total={data.totalCandidates} />

        <BridgeGradient />

        <DarkZone>
          <BridgeIntro />
          <CastingProcess />
          <PrivacyBox userName={data.userName} />
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
