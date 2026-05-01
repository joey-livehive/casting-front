import { notFound } from 'next/navigation';
import { getReport, getDefaultReport } from '@/lib/report/mockData';
import { getMockPersonalized } from '@/lib/personalization/mock-personalized';
import { getMockUser, isMockUserKey } from '@/lib/personalization/mock-users';
import type { UserAnswers, PersonalizedContent } from '@/lib/personalization/types';
import { TopNav } from '@/components/report/TopNav';
import { Hero } from '@/components/report/Hero';
import { ApplicationSummary } from '@/components/report/ApplicationSummary';
import { HuntBox } from '@/components/report/HuntBox';
import { TeaserCard } from '@/components/report/TeaserCard';
import { ReadingCard } from '@/components/report/ReadingCard';
import { Chapter2 } from '@/components/report/Chapter2';
import { Chapter3 } from '@/components/report/Chapter3';
import { Chapter4Simulation } from '@/components/report/Chapter4Simulation';
import { ReportShell } from '@/components/report/ReportShell';
import { TrackSection } from '@/components/report/TrackSection';
import { MeetOrPassCta } from '@/components/report/MeetOrPassCta';
import { getFixture } from '@/lib/casting/fixtures';

const EMPTY_PERSONALIZED: PersonalizedContent = {
  chapter1Traits: { trait01Intro: '', trait02Intro: '', trait03Intro: '', trait04Intro: '' },
  readingCard: { paragraph1Opening: '', paragraph2Opening: '' },
};

export default async function CastingMatchReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ reportUid: string }>;
  searchParams: Promise<{ mock?: string; cta?: string }>;
}) {
  const { reportUid } = await params;
  const { mock, cta } = await searchParams;

  const fixture = getFixture(reportUid);
  const mockReport = getReport(reportUid);

  // fixture 도 mock 리포트도 없으면 404. 디자인 검수용 mock 진입은 ?mock=A 쿼리가 있을 때만 허용.
  if (!fixture && !(mockReport && mock)) {
    notFound();
  }

  const data = { ...(mockReport ?? getDefaultReport(reportUid, 'F')), tone: 'formal' as const };

  let userAnswers: UserAnswers;
  let personalized: PersonalizedContent;
  let sceneImage: string | undefined;

  if (fixture) {
    userAnswers = fixture.user_answers ?? ({ idealType: {} } as UserAnswers);
    personalized = fixture.personalized ?? EMPTY_PERSONALIZED;
    sceneImage = fixture.scene_image;
    // 이 의뢰인 전용 후보·궁합 데이터가 fixture 에 있으면 mock 을 덮어씀
    if (fixture.candidate) data.teaserCandidate = fixture.candidate;
    if (fixture.match) data.match = fixture.match;
    if (fixture.published_at) data.publishedAt = fixture.published_at;
  } else {
    const mockKey = isMockUserKey(mock) ? mock : 'A';
    userAnswers = getMockUser(mockKey);
    personalized = getMockPersonalized(mockKey);
  }

  return (
    <main className="max-w-[480px] mx-auto pb-[60px] relative bg-brand-bg min-h-screen font-body text-brand-ink">
      <ReportShell reportId={reportUid} tone={data.tone} variant="paid">
        <TopNav publishedAt={data.publishedAt} />
        <Hero userName={data.userName} />
        <ApplicationSummary userAnswers={userAnswers} />
        <HuntBox stats={data.huntStats} />

        <TrackSection section="teaser_card" reportId={reportUid}>
          <TeaserCard candidate={data.teaserCandidate} />
        </TrackSection>
        <ReadingCard userName={data.userName} personalized={personalized.readingCard} />
        <TrackSection section="chapter1" reportId={reportUid}>
          <Chapter2 userName={data.userName} candidate={data.teaserCandidate} />
        </TrackSection>
        <TrackSection section="chapter3" reportId={reportUid}>
          <Chapter3 userName={data.userName} match={data.match} number="CHAPTER 2" />
        </TrackSection>
        <Chapter4Simulation match={data.match} number="CHAPTER 3" sceneImage={sceneImage} />

        <MeetOrPassCta initialCta={cta} />
      </ReportShell>
    </main>
  );
}
