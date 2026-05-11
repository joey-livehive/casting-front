// 인스타 발견 후보 매칭 카드 — 풀 레이아웃 렌더러.
// 데이터 소스 무관 (mock / LLM 출력 / DB) — InstaContent 만 받으면 동일하게 렌더.
//
// 사용처:
//   - /casting/insta-template-preview (mock InstaContent)
//   - /casting/insta-prompt-test (LLM 생성 InstaContent)
//   - 추후 /casting/reports/insta-recommendation/[uid] (DB InstaContent)

import type { UserAnswers } from '@/lib/personalization/types';
import type { Candidate, MatchAnalysis, ReportData } from '@/lib/report/types';
import type { InstaContent } from '@/lib/casting/insta/schema';
import { TopNav } from '@/components/report/TopNav';
import { ApplicationSummary } from '@/components/report/ApplicationSummary';
import { Chapter4Simulation } from '@/components/report/Chapter4Simulation';
import { ReportShell } from '@/components/report/ReportShell';
import { TrackSection } from '@/components/report/TrackSection';
import { MeetOrPassCta } from '@/components/report/MeetOrPassCta';
import { CasterNoteSection } from '../../template-preview/_components/CasterNoteSection';
import { HeroV2 } from '../../template-preview/_components/HeroV2';
import { HuntBoxV2 } from '../../template-preview/_components/HuntBoxV2';
import { TeaserCardV2 } from '../../template-preview/_components/TeaserCardV2';
import { CandidateDetailSection } from '../../template-preview/_components/CandidateDetailSection';
import { ReadingCardV2 } from '../../template-preview/_components/ReadingCardV2';
import { Chapter3InstaSpectrum, type BipolarAxis } from './Chapter3InstaSpectrum';

const DEFAULT_SCENE_IMAGE = '/images/simulation/c324be08-meeting.jpg';
const DEFAULT_CANDIDATE_PHOTO = '/images/casting/casting_man.webp';
const RECOMMENDATION_FOOTNOTE =
  '*인스타그램에서 찾아온 분이라 일부는 추정값이지만, 정확도는 약 73%에 달해요.';
const CTA_STEP1_NOTE =
  '인스타그램에서 엄선해서 찾아온 분에요! 저희가 스토리 태그·DM 등 가능한 모든 경로로 연락 시도할 예정입니다! 최선을 다해 연락망 확보해서 꼭 연결해드릴게요.';

interface InstaMatchReportProps {
  reportUid: string;
  publishedAt: string;
  viewerName: string;
  viewerAnswers: UserAnswers;
  huntStats: ReportData['huntStats'];
  content: InstaContent;
  /** 후보 사진 URL — TeaserCard teaser/detail 양쪽에 사용. 없으면 placeholder. */
  candidatePhoto?: string;
  /** 후보 거주지 — TeaserCard 사진 오버레이. 없으면 미표시. */
  candidateLocation?: string;
  /** Chapter4Simulation scene 이미지. */
  sceneImage?: string;
  /** initialCta — 디자인 검수용(`?cta=meet|pass`)으로만 사용. */
  initialCta?: string;
}

export function InstaMatchReport({
  reportUid,
  publishedAt,
  viewerName,
  viewerAnswers,
  huntStats,
  content,
  candidatePhoto = DEFAULT_CANDIDATE_PHOTO,
  candidateLocation,
  sceneImage = DEFAULT_SCENE_IMAGE,
  initialCta,
}: InstaMatchReportProps) {
  const candidate = buildCandidate(content, candidatePhoto, candidateLocation);
  const bipolarAxes = buildBipolarAxes(content);
  const simulationMatch: MatchAnalysis = {
    matchRate: 0,
    topPercent: 0,
    radarData: { labels: [], ownerValues: [], partnerValues: [] },
    simulation: content.simulation,
    notes: [],
  };

  return (
    <main className="max-w-[480px] mx-auto pb-[60px] relative bg-brand-bg min-h-screen font-body text-brand-ink">
      <ReportShell reportId={reportUid} tone="formal" variant="paid">
        <TopNav publishedAt={publishedAt} />
        <HeroV2 userName={viewerName} />

        <CasterNoteSection
          headline={content.casterHeadline}
          charmBullets={content.casterCharmBullets}
        />

        <HuntBoxV2
          stats={huntStats}
          sourceLabel="인스타그램"
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

        <TrackSection section="teaser_card" reportId={reportUid}>
          <TeaserCardV2
            candidate={candidate}
            recommendationFootnote={RECOMMENDATION_FOOTNOTE}
          />
        </TrackSection>

        <ReadingCardV2
          userName={viewerName}
          narratives={{
            viewerInsight: content.viewerInsight,
            matchOpening: content.matchOpening,
            candidateMatch: content.candidateMatch,
          }}
        />

        <TrackSection section="chapter1" reportId={reportUid}>
          <CandidateDetailSection
            userName={viewerName}
            candidate={candidate}
            narratives={{
              personality: content.personality,
              datingStyle: content.datingStyle,
              // 인스타 변형은 feedCharm 으로 주말 슬롯 교체 — weekendStyle 미사용
              weekendStyle: '',
            }}
            feedCharm={content.feedCharm}
          />
        </TrackSection>

        <TrackSection section="chapter3" reportId={reportUid}>
          <Chapter3InstaSpectrum
            axes={bipolarAxes}
            notes={content.spectrumNotes}
            number="CHAPTER 2"
          />
        </TrackSection>

        <Chapter4Simulation match={simulationMatch} number="CHAPTER 3" sceneImage={sceneImage} />

        <div className="px-7 mt-14 mb-3">
          <div className="border-t border-dashed border-brand-ink/30" />
        </div>

        <ApplicationSummary userAnswers={viewerAnswers} />
        <MeetOrPassCta reportId={reportUid} step1Note={CTA_STEP1_NOTE} initialCta={initialCta} />

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

// InstaContent + 정형 메타 → TeaserCardV2/CandidateDetailSection 가 원하는 Candidate 모양 어댑터.
function buildCandidate(content: InstaContent, photo: string, location?: string): Candidate {
  return {
    nickname: '○○○',
    faceType: content.faceType,
    ageRange: content.ageRangeEstimate,
    ageDetail: '',
    occupation: content.occupationEstimate,
    occupationDetail: '',
    personality: '',
    location: location ?? '',
    foundAt: '인스타그램',
    hobbies: { visible: [], hidden: 0 },
    daySchedule: [],
    background: '',
    secretAppeal: '',
    teaserPhoto: photo,
    detailPhoto: photo,
    mbti: content.mbtiEstimate,
    height: content.heightEstimate,
    recommendation: content.casterHeadline,
  };
}

// 4 양극 값(0~100) → 페이지 고정 라벨이 박힌 BipolarAxis[].
// 라벨은 product 결정이라 LLM 출력에 두지 않고 여기서 부여.
// 스키마 컨벤션: bipolarValues 의 각 값은 "우측 라벨 비율" (0=fully 좌측, 100=fully 우측).
//   ex) energy=45 → 외향 45%, 내향 55%. → leftPercent(내향) = 100 - 45 = 55.
function buildBipolarAxes(content: InstaContent): BipolarAxis[] {
  const v = content.bipolarValues;
  return [
    { axisName: '에너지', leftLabel: '내향적', rightLabel: '외향적', leftPercent: 100 - v.energy },
    { axisName: '판단', leftLabel: '감성적', rightLabel: '이성적', leftPercent: 100 - v.judgment },
    { axisName: '자기표현', leftLabel: '활발한', rightLabel: '차분한', leftPercent: 100 - v.selfExpression },
    { axisName: '행동', leftLabel: '안정 추구', rightLabel: '모험 추구', leftPercent: 100 - v.behavior },
  ];
}
