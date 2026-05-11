// Receiver 매칭 카드 — like 받은 사람(B)이 보는 풀 레이아웃 렌더러.
// 데이터 소스 무관 (mock / LLM 출력 / DB) — ReceiverContent 만 받으면 동일하게 렌더.
//
// 사용처:
//   - /casting/receiver-template-preview (mock ReceiverContent)
//   - 추후 /casting/reports/receiver-recommendation/[uid] (DB ReceiverContent)

import type { UserAnswers } from '@/lib/personalization/types';
import type { Candidate, MatchAnalysis } from '@/lib/report/types';
import type { ReceiverContent } from '@/lib/casting/receiver/schema';
import { TopNav } from '@/components/report/TopNav';
import { ApplicationSummary } from '@/components/report/ApplicationSummary';
import { Chapter4Simulation } from '@/components/report/Chapter4Simulation';
import { ReportShell } from '@/components/report/ReportShell';
import { TrackSection } from '@/components/report/TrackSection';
import { MeetOrPassCta } from '@/components/report/MeetOrPassCta';
import { CasterNoteSection } from '../../template-preview/_components/CasterNoteSection';
import { TeaserCardV2 } from '../../template-preview/_components/TeaserCardV2';
import { CandidateDetailSection } from '../../template-preview/_components/CandidateDetailSection';
import { ReadingCardV2 } from '../../template-preview/_components/ReadingCardV2';
import {
  Chapter3InstaSpectrum,
  type BipolarAxis,
} from '../../insta-template-preview/_components/Chapter3InstaSpectrum';
import { ReceiverHero } from './ReceiverHero';

const DEFAULT_SCENE_IMAGE = '/images/simulation/c324be08-meeting.jpg';
const DEFAULT_SENDER_PHOTO = '/images/casting/casting_man.webp';

// receiver 페이지 한정 fixed 카피. atoms 의 caster 전제 카피를 receiver 톤으로 override.
// 우리 서비스는 사용자 이름(receiver/sender 모두)을 받지 않으므로 호칭 없이 "당신" 톤.
// 데이터 슬롯(LLM 생성)은 schema 그대로, 컴포넌트 안 fixed 문구만 여기서 묶어서 주입.
const RECEIVER_COPY = {
  casterNoteBulletsHeading: '✨ 이 사람을 놓치면 안 되는 3가지 이유',
  teaserSectionLabel: '당신을 원한 분, 소개할게요!',
  teaserSectionTitle: { plain: '이 사람,\n', highlight: '가볍게 대화해볼까요?' },
  readingStampLabel: '캐스터의 메모',
  readingLead:
    '이 분이 당신과 이어지고 싶어한 데에는 이유가 있어요. 두 분의 결이 어떻게 맞물리는지, 그리고 이 분이 어떠한 사람인지 천천히 풀어드릴게요.',
  // matchOpening 슬롯에 들어갈 fixed 다리 카피 — viewerInsight ↔ senderProfile 사이.
  readingMatchOpening: '그래서 이 분이 잘 어울릴 것 같아요!',
  readingOutro:
    '지금 당장 결정하지 마세요. 이 분이 어떤 사람인지 좀 더 풀어드릴 테니, 천천히 읽어보고 마음을 정하셔도 괜찮아요.',
  chapter1Lead:
    '그럼 이 분이 어떤 사람인지 더 자세히 볼까요? 만나신다면 어떤 분일지 미리 알려드릴게요.',
  chapter2Lead: '이 분의 4가지 성향 축을 정리해봤어요.',
  summaryHeaderLabel: '📋 답변 정리',
  summaryHeading: '당신의 취향',
  summarySubheading: '당신이 남겨 주신 그대로 담아왔어요.',
} as const;

interface ReceiverMatchReportProps {
  reportUid: string;
  publishedAt: string;
  /** B(받는 사람) 본인의 설문 답변. ApplicationSummary 에 표시. */
  viewerAnswers: UserAnswers;
  /** 발신자(A) 사진. 미지정 시 placeholder. */
  senderPhoto?: string;
  /** 발신자 거주지 — TeaserCard 사진 오버레이. 없으면 미표시. */
  senderLocation?: string;
  /** 발신자에 대한 산문·4축·시뮬레이션. */
  content: ReceiverContent;
  /** Chapter4Simulation scene 이미지. */
  sceneImage?: string;
  /** initialCta — 디자인 검수용(`?cta=meet|pass`)으로만 사용. */
  initialCta?: string;
}

export function ReceiverMatchReport({
  reportUid,
  publishedAt,
  viewerAnswers,
  senderPhoto = DEFAULT_SENDER_PHOTO,
  senderLocation,
  content,
  sceneImage = DEFAULT_SCENE_IMAGE,
  initialCta,
}: ReceiverMatchReportProps) {
  const sender = buildSenderCandidate(content, senderPhoto, senderLocation);
  const bipolarAxes = buildBipolarAxes(content);
  const copy = RECEIVER_COPY;
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
        <ReceiverHero />

        <CasterNoteSection
          headline={content.senderHeadline}
          charmBullets={content.senderCharmBullets}
          bulletsHeading={copy.casterNoteBulletsHeading}
        />

        {/* HuntBox 자리는 receiver 페이지에선 의미 없어 생략 — 발신자가 직접 캐스팅 신청한 흐름이라 '찾아온 경로'가 부적절. */}

        <TrackSection section="teaser_card" reportId={reportUid}>
          <TeaserCardV2
            candidate={sender}
            sectionLabel={copy.teaserSectionLabel}
            sectionTitle={copy.teaserSectionTitle}
          />
        </TrackSection>

        <ReadingCardV2
          // userName 은 lead/outro/stampLabel 모두 override 되어 노출 안 됨.
          userName=""
          lead={copy.readingLead}
          outro={copy.readingOutro}
          stampLabel={copy.readingStampLabel}
          narratives={{
            viewerInsight: content.viewerInsight,
            // matchOpening 자리에 fixed 다리 카피 — receiver schema 에서 슬롯 제거됨.
            matchOpening: copy.readingMatchOpening,
            // candidateMatch 슬롯에 발신자 소개 산문 — receiver 입장에선 '이 사람(=발신자) 소개'.
            candidateMatch: content.senderProfile,
          }}
        />

        <TrackSection section="chapter1" reportId={reportUid}>
          <CandidateDetailSection
            // userName 은 lead override 로 노출 안 됨.
            userName=""
            candidate={sender}
            lead={copy.chapter1Lead}
            narratives={{
              personality: content.personality,
              datingStyle: content.datingStyle,
              weekendStyle: content.weekendStyle,
            }}
          />
        </TrackSection>

        <TrackSection section="chapter3" reportId={reportUid}>
          <Chapter3InstaSpectrum
            axes={bipolarAxes}
            notes={content.spectrumNotes}
            number="CHAPTER 2"
            lead={copy.chapter2Lead}
          />
        </TrackSection>

        <Chapter4Simulation match={simulationMatch} number="CHAPTER 3" sceneImage={sceneImage} />

        <div className="px-7 mt-14 mb-3">
          <div className="border-t border-dashed border-brand-ink/30" />
        </div>

        <ApplicationSummary
          userAnswers={viewerAnswers}
          headerLabel={copy.summaryHeaderLabel}
          heading={copy.summaryHeading}
          subheading={copy.summarySubheading}
        />
        <MeetOrPassCta reportId={reportUid} mode="receiver" initialCta={initialCta} />

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

// ReceiverContent → TeaserCardV2/CandidateDetailSection 가 원하는 Candidate 모양 어댑터.
function buildSenderCandidate(
  content: ReceiverContent,
  photo: string,
  location?: string,
): Candidate {
  return {
    nickname: '○○○',
    faceType: content.senderFaceType,
    ageRange: content.senderAgeRange,
    ageDetail: '',
    occupation: content.senderOccupation,
    occupationDetail: '',
    personality: '',
    location: location ?? '',
    foundAt: '내부 POOL',
    hobbies: { visible: [], hidden: 0 },
    daySchedule: [],
    background: '',
    secretAppeal: '',
    teaserPhoto: photo,
    detailPhoto: photo,
    mbti: content.senderMbti,
    height: content.senderHeight,
    recommendation: content.senderHeadline,
  };
}

// 4 양극 값(0~100) → 페이지 고정 라벨이 박힌 BipolarAxis[].
// 라벨은 product 결정이라 LLM 출력에 두지 않고 여기서 부여.
// 스키마 컨벤션: bipolarValues 의 각 값은 "우측 라벨 비율" (0=fully 좌측, 100=fully 우측).
function buildBipolarAxes(content: ReceiverContent): BipolarAxis[] {
  const v = content.bipolarValues;
  return [
    { axisName: '에너지', leftLabel: '내향적', rightLabel: '외향적', leftPercent: 100 - v.energy },
    { axisName: '판단', leftLabel: '감성적', rightLabel: '이성적', leftPercent: 100 - v.judgment },
    {
      axisName: '자기표현',
      leftLabel: '활발한',
      rightLabel: '차분한',
      leftPercent: 100 - v.selfExpression,
    },
    {
      axisName: '행동',
      leftLabel: '안정 추구',
      rightLabel: '모험 추구',
      leftPercent: 100 - v.behavior,
    },
  ];
}
