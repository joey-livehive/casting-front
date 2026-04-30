import { getReport, getDefaultReport } from '@/lib/report/mockData';
import { getMockPersonalized } from '@/lib/personalization/mock-personalized';
import { getMockUser, isMockUserKey } from '@/lib/personalization/mock-users';
import type { UserAnswers, PersonalizedContent } from '@/lib/personalization/types';
import type { Candidate, MatchAnalysis } from '@/lib/report/types';
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
import stoD2666570 from '@/lib/casting/fixtures/sto-d2666570.json';
import stoC324BE08 from '@/lib/casting/fixtures/sto-c324be08.json';
import stoB778960B from '@/lib/casting/fixtures/sto-b778960b.json';

const EMPTY_PERSONALIZED: PersonalizedContent = {
  chapter1Traits: { trait01Intro: '', trait02Intro: '', trait03Intro: '', trait04Intro: '' },
  readingCard: { paragraph1Opening: '', paragraph2Opening: '' },
};

type Fixture = {
  user_answers?: UserAnswers;
  personalized?: PersonalizedContent;
  candidate?: Candidate;
  match?: MatchAnalysis;
  published_at?: string;
};

const FIXTURES: Record<string, Fixture> = {
  'CASTING-LOCAL-002': stoD2666570 as Fixture,
  'STO-D2666570': stoD2666570 as Fixture,
  'CASTING-LOCAL-003': stoC324BE08 as Fixture,
  'STO-C324BE08': stoC324BE08 as Fixture,
  'CASTING-LOCAL-004': stoB778960B as Fixture,
  'STO-B778960B': stoB778960B as Fixture,
};

function loadFixture(uid: string): {
  userAnswers: UserAnswers;
  personalized: PersonalizedContent;
  candidate?: Candidate;
  match?: MatchAnalysis;
  publishedAt?: string;
} | null {
  const f = FIXTURES[uid];
  if (!f) return null;
  return {
    userAnswers: f.user_answers || ({ idealType: {} } as UserAnswers),
    personalized: f.personalized || EMPTY_PERSONALIZED,
    candidate: f.candidate,
    match: f.match,
    publishedAt: f.published_at,
  };
}

export default async function CastingMatchReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ reportUid: string }>;
  searchParams: Promise<{ mock?: string; cta?: string }>;
}) {
  const { reportUid } = await params;
  const { mock, cta } = await searchParams;

  const data = { ...(getReport(reportUid) || getDefaultReport(reportUid, 'F')), tone: 'formal' as const };

  let userAnswers: UserAnswers;
  let personalized: PersonalizedContent;

  if (getReport(reportUid) && mock) {
    const mockKey = isMockUserKey(mock) ? mock : 'A';
    userAnswers = getMockUser(mockKey);
    personalized = getMockPersonalized(mockKey);
  } else {
    const fixture = loadFixture(reportUid);
    if (fixture) {
      userAnswers = fixture.userAnswers;
      personalized = fixture.personalized;
      // 이 의뢰인 전용 후보·궁합 데이터가 fixture 에 있으면 mock 을 덮어씀
      if (fixture.candidate) data.teaserCandidate = fixture.candidate;
      if (fixture.match) data.match = fixture.match;
      if (fixture.publishedAt) data.publishedAt = fixture.publishedAt;
    } else {
      userAnswers = getMockUser('A');
      personalized = EMPTY_PERSONALIZED;
    }
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
          <Chapter2 userName={data.userName} candidate={data.teaserCandidate} match={data.match} />
        </TrackSection>
        <TrackSection section="chapter3" reportId={reportUid}>
          <Chapter3 userName={data.userName} match={data.match} number="CHAPTER 2" />
        </TrackSection>
        <Chapter4Simulation
          match={data.match}
          number="CHAPTER 3"
          sceneImage={
            reportUid === 'STO-C324BE08' ||
            reportUid === 'CASTING-LOCAL-003' ||
            reportUid === 'STO-B778960B' ||
            reportUid === 'CASTING-LOCAL-004'
              ? '/images/simulation/c324be08-meeting.jpg'
              : undefined
          }
        />

        <MeetOrPassCta initialCta={cta} />
      </ReportShell>
    </main>
  );
}
