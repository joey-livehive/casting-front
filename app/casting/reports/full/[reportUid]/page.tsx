import { notFound } from 'next/navigation';
import { getReport, getDefaultReport } from '@/lib/report/mockData';
import { getMockPersonalized } from '@/lib/personalization/mock-personalized';
import { getMockUser, isMockUserKey } from '@/lib/personalization/mock-users';
import type { UserAnswers, PersonalizedContent } from '@/lib/personalization/types';
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
import { ReportAuthGate } from '@/components/casting/ReportAuthGate';
import { getFixture } from '@/lib/casting/fixtures';
import { oppositeCandidateImageForViewerGender } from '@/lib/casting/reportImages';

const EMPTY_PERSONALIZED: PersonalizedContent = {
  chapter1Traits: { trait01Intro: '', trait02Intro: '', trait03Intro: '', trait04Intro: '' },
  readingCard: { paragraph1Opening: '', paragraph2Opening: '' },
};

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

export default async function CastingMatchReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ reportUid: string }>;
  searchParams: Promise<{ mock?: string; cta?: string; t?: string; token?: string }>;
}) {
  const { reportUid } = await params;
  const { mock, cta, t, token: tokenParam } = await searchParams;
  const token = t || tokenParam;

  // 1순위: casting backend 에서 실제 리포트를 가져온다 (token 옵셔널).
  const dbReport = await fetchCastingReport(reportUid, token);

  const fixture = getFixture(reportUid);
  const mockReport = getReport(reportUid);

  // fixture 도, DB 도, mock 도 없으면 404. 디자인 검수용 mock 진입은 ?mock=A 쿼리가 있을 때만 허용.
  if (!dbReport && !fixture && !(mockReport && mock)) {
    notFound();
  }

  const data = { ...(mockReport ?? getDefaultReport(reportUid, 'F')), tone: 'formal' as const };

  let userAnswers: UserAnswers;
  let personalized: PersonalizedContent;
  let sceneImage: string | undefined;

  if (dbReport && dbReport.report_json) {
    // 실제 DB 리포트 — report_json 안에 fixture 와 동일 shape 의 콘텐츠가 들어있어야 함.
    const rj = dbReport.report_json;
    userAnswers = rj.user_answers ?? ({ idealType: {} } as UserAnswers);
    personalized = rj.personalized ?? EMPTY_PERSONALIZED;
    sceneImage = rj.scene_image;
    if (rj.candidate) data.teaserCandidate = rj.candidate;
    if (rj.match) data.match = rj.match;
    if (rj.published_at) data.publishedAt = rj.published_at;
    if (rj.user_name) data.userName = rj.user_name;
    if (rj.hunt_stats) data.huntStats = rj.hunt_stats;
  } else if (fixture) {
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

  // Full report has no partner gender field, so use the opposite of the viewer gender.
  const candidateImage = oppositeCandidateImageForViewerGender(userAnswers.selfInfo?.gender, reportUid);
  if (candidateImage) {
    data.teaserCandidate = {
      ...data.teaserCandidate,
      teaserPhoto: candidateImage,
      detailPhoto: candidateImage,
    };
  }

  return (
    <ReportAuthGate>
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
          <CandidateDetail userName={data.userName} candidate={data.teaserCandidate} />
        </TrackSection>
        <TrackSection section="chapter3" reportId={reportUid}>
          <Chapter3 userName={data.userName} match={data.match} number="CHAPTER 2" />
        </TrackSection>
        <Chapter4Simulation match={data.match} number="CHAPTER 3" sceneImage={sceneImage} />

        <MeetOrPassCta reportId={reportUid} initialCta={cta} />

        <div className="px-7 mt-10 mb-2 text-center text-[12px] text-brand-ink-mute">
          문의: <a href="mailto:hello@livehivecorp.com" className="underline">hello@livehivecorp.com</a>
        </div>
      </ReportShell>
      </main>
    </ReportAuthGate>
  );
}
