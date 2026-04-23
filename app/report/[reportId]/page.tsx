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
import { TrackSection } from '@/components/report/TrackSection';

export function generateStaticParams() {
  return mockReportIds.map((reportId) => ({ reportId }));
}

export default async function ReportPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;
  const data = getReport(reportId);
  if (!data) notFound();

  return (
    <main className="max-w-[480px] mx-auto pb-[130px] relative bg-brand-bg min-h-screen font-body text-brand-ink">
      <ReportShell reportId={data.reportId} tone={data.tone}>
        <TopNav publishedAt={data.publishedAt} />
        <Hero userName={data.userName} />
        <CredibilityStrip />
        <HuntBox
          userName={data.userName}
          stats={data.huntStats}
          effort={data.effort}
          total={data.totalCandidates}
        />

        <TrackSection section="teaser_card" reportId={reportId}>
          <TeaserCard candidate={data.teaserCandidate} />
        </TrackSection>
        <ReadingCard userName={data.userName} />
        <TrackSection section="chapter1" reportId={reportId}>
          <Chapter2 userName={data.userName} candidate={data.teaserCandidate} />
        </TrackSection>
        <TrackSection section="chapter2" reportId={reportId}>
          <Chapter1 userName={data.userName} />
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
