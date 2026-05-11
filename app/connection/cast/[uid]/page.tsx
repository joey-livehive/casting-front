// Partner 시점 소개받은 사람 리포트 (PR #17 의 ReceiverMatchReport 패턴 반영).
//
// 라우트: /connection/cast/{uid}
// perspective: 'partner' — "당신을 마음에 들어한 분이 있어요" 안내 톤
//
// owner(의뢰인) 정보를 partner 에게 소개. 화면 흐름:
//   - ReceiverHero (partner 가 받는 안내 톤 hero)
//   - CasterNoteSection (owner 매력 3 bullet)
//   - HuntBox 없음 (의뢰인이 직접 캐스팅한 흐름 → 찾아온 경로 부적절)
//   - TeaserCard (owner 사진 + 메타) — owner 사진 있으면 blur, 없으면 성별별 default
//   - ReadingCard (receiver 톤 fixed copy)
//   - CandidateDetailSection (owner narrative)
//   - Chapter3InstaSpectrum (4축 양극 막대) — perspective 무관 4축 사용
//   - Chapter4Simulation (첫 만남 시뮬레이션)
//   - ApplicationSummary (partner 본인 답변, receiver 톤 override)
//   - MeetOrPassCta mode="receiver"

import { notFound } from 'next/navigation';

import { ApplicationSummary } from '@/components/report/ApplicationSummary';
import { Chapter4Simulation } from '@/components/report/Chapter4Simulation';
import { MeetOrPassCta } from '@/components/report/MeetOrPassCta';
import { ReportShell } from '@/components/report/ReportShell';
import { TopNav } from '@/components/report/TopNav';
import { TrackSection } from '@/components/report/TrackSection';
import { CandidateDetailSection } from '@/app/casting/template-preview/_components/CandidateDetailSection';
import { CasterNoteSection } from '@/app/casting/template-preview/_components/CasterNoteSection';
import { ReadingCardV2 } from '@/app/casting/template-preview/_components/ReadingCardV2';
import { TeaserCardV2 } from '@/app/casting/template-preview/_components/TeaserCardV2';
import { Chapter3V2 } from '@/app/casting/template-preview/_components/Chapter3V2';
import { Chapter3InstaSpectrum } from '@/app/casting/insta-template-preview/_components/Chapter3InstaSpectrum';
import { ReceiverHero } from '@/app/casting/receiver-template-preview/_components/ReceiverHero';
import {
  ConnectionReportFetchError,
  fetchPartnerConnectionReport,
} from '@/lib/casting/connection-report';
import type { Candidate } from '@/lib/report/types';
import type { ConnectionReport } from '@/lib/casting/connection-report';
import {
  adaptBipolarAxes,
  adaptMatchAnalysis,
  adaptSpectrumNotes,
  adaptUserAnswers,
} from '@/lib/casting/connection-adapter';

// partner 페이지 한정 fixed 카피 — receiver 톤 (PR #17 의 ReceiverMatchReport 기반)
const RECEIVER_COPY = {
  casterNoteBulletsHeading: '✨ 이 사람을 놓치면 안 되는 3가지 이유',
  teaserSectionLabel: '당신을 원한 분, 소개할게요!',
  teaserSectionTitle: { plain: '이 사람,\n', highlight: '가볍게 대화해볼까요?' },
  readingStampLabel: '캐스터의 메모',
  readingLead:
    '이 분이 당신과 이어지고 싶어한 데에는 이유가 있어요. 두 분의 결이 어떻게 맞물리는지, 그리고 이 분이 어떠한 사람인지 천천히 풀어드릴게요.',
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

const DEFAULT_PHOTO_BY_GENDER = {
  male: '/images/casting/casting_man.webp',
  female: '/images/casting/casting_woman_1.webp',
} as const;

const OCCUPATION_LABEL: Record<string, string> = {
  student: '학생',
  office: '회사원',
  professional: '전문직',
  public: '공직',
  freelance: '사업/프리랜서',
  other_job: '기타',
};

type PageProps = {
  params: Promise<{ uid: string }>;
};

export default async function PartnerCastPage({ params }: PageProps) {
  const { uid } = await params;

  let report;
  try {
    report = await fetchPartnerConnectionReport(uid);
  } catch (err) {
    if (err instanceof ConnectionReportFetchError && err.status === 404) {
      notFound();
    }
    throw err;
  }

  // partner page 의 'candidate' = owner (의뢰인) — 소개받는 사람에게 보여줄 대상.
  const ownerCandidate = buildOwnerCandidate(report);
  const ownerPersonContent = report.owner.person_content;
  // partner.source=insta 면 partner(이 페이지를 받는 사람)는 설문 답변한 적이 없음 — ApplicationSummary 생략.
  const showApplicationSummary = report.partner.profile.source !== 'insta';
  // chapter 2 분기: internal partner 면 radar 6축 차트(Chapter3V2), insta 면 4축 양극 막대.
  const isInstaPartner = report.partner.profile.source === 'insta';
  // viewerInsight (partner 본인 분석) — 첫 단락에 "당신은 이런 분이에요" 톤 명시.
  // PERSON LLM 출력이 3인칭 호칭 없는 분석이라 prefix 로 "당신" 시점 강제.
  const partnerInsight = isInstaPartner
    ? `AI가 인스타그램에서 분석한 모습으로는, 당신은 이렇게 비춰져요.\n\n${report.partner.person_content.personality}`
    : `당신이 남겨주신 답변을 보면, 당신은 이런 분으로 분석돼요.\n\n${report.partner.person_content.personality}`;
  const bipolarAxes = adaptBipolarAxes(report);
  const spectrumNotes = adaptSpectrumNotes(report);
  const match = adaptMatchAnalysis(report);
  // ApplicationSummary 는 owner 의 답변을 의뢰인 톤으로 보여준다 (case 1 과 동일).
  // partner+insta 면 ApplicationSummary 자체 생략.
  const ownerAnswers = adaptUserAnswers(report);

  const publishedAt = formatPublishedAt(report.meta.generated_at);

  return (
    <main className="max-w-[480px] mx-auto pb-[60px] relative bg-brand-bg min-h-screen font-body text-brand-ink">
      <ReportShell reportId={uid} tone="formal" variant="paid">
        <TopNav publishedAt={publishedAt} />
        <ReceiverHero />

        <CasterNoteSection
          headline={ownerPersonContent.casterHeadline}
          charmBullets={ownerPersonContent.casterCharmBullets.map((b) => b.text)}
          bulletsHeading={RECEIVER_COPY.casterNoteBulletsHeading}
        />

        {/* HuntBox 자리는 receiver 페이지에선 의미 없어 생략. */}

        <TrackSection section="teaser_card" reportId={uid}>
          <TeaserCardV2
            candidate={ownerCandidate}
            sectionLabel={RECEIVER_COPY.teaserSectionLabel}
            sectionTitle={RECEIVER_COPY.teaserSectionTitle}
          />
        </TrackSection>

        <ReadingCardV2
          userName=""
          lead={RECEIVER_COPY.readingLead}
          outro={RECEIVER_COPY.readingOutro}
          stampLabel={RECEIVER_COPY.readingStampLabel}
          narratives={{
            viewerInsight: partnerInsight,
            matchOpening: RECEIVER_COPY.readingMatchOpening,
            // candidateMatch 슬롯에 owner 매칭점 카피 (CONNECTION_FOR_PARTNER 의 opening)
            // — "이 분이 당신의 ~에 끌리셨다고 해요" 류 매칭점 narrative.
            candidateMatch: report.content.opening,
          }}
        />

        <TrackSection section="chapter1" reportId={uid}>
          <CandidateDetailSection
            userName=""
            candidate={ownerCandidate}
            lead={RECEIVER_COPY.chapter1Lead}
            narratives={{
              personality: ownerPersonContent.personality,
              datingStyle: ownerPersonContent.datingStyle,
              weekendStyle: ownerPersonContent.lifeStyle,
            }}
          />
        </TrackSection>

        <TrackSection section="chapter3" reportId={uid}>
          {isInstaPartner ? (
            <Chapter3InstaSpectrum
              axes={bipolarAxes}
              notes={spectrumNotes}
              number="CHAPTER 2"
              lead={RECEIVER_COPY.chapter2Lead}
            />
          ) : (
            <Chapter3V2 match={match} number="CHAPTER 2" />
          )}
        </TrackSection>

        <Chapter4Simulation
          match={match}
          number="CHAPTER 3"
          sceneImage={report.meta.scene_image || '/images/simulation/c324be08-meeting.jpg'}
        />

        <div className="px-7 mt-14 mb-3">
          <div className="border-t border-dashed border-brand-ink/30" />
        </div>

        {showApplicationSummary && <ApplicationSummary userAnswers={ownerAnswers} />}
        <MeetOrPassCta reportId={uid} mode="receiver" />

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

function buildOwnerCandidate(report: ConnectionReport): Candidate {
  const ownerProfile = report.owner.profile;
  const ownerPC = report.owner.person_content;
  const basics = ownerProfile.basics;

  const realPhoto = ownerProfile.photos?.[0]?.url;
  const fallback =
    basics.gender === 'female'
      ? DEFAULT_PHOTO_BY_GENDER.female
      : DEFAULT_PHOTO_BY_GENDER.male;
  const photoUrl = realPhoto ?? fallback;

  return {
    nickname: '○○○',
    faceType: ownerPC.faceType,
    ageRange: basics.age_band || (basics.age ? `${basics.age}세` : ''),
    ageDetail: '',
    occupation:
      basics.job_detail ||
      (basics.occupation ? OCCUPATION_LABEL[basics.occupation] ?? basics.occupation : '') ||
      basics.occupation_band ||
      '',
    occupationDetail: basics.job_detail || '',
    personality: '',
    location: basics.region_code || '',
    foundAt: '내부 POOL',
    hobbies: { visible: [], hidden: 0 },
    daySchedule: [],
    background: ownerPC.personality,
    secretAppeal: '',
    teaserPhoto: photoUrl,
    detailPhoto: photoUrl,
    mbti: basics.mbti || undefined,
    height: basics.height_cm
      ? `${basics.height_cm}cm`
      : basics.height_band || undefined,
    recommendation: ownerPC.casterHeadline,
  };
}

function formatPublishedAt(iso: string | null | undefined): string {
  if (!iso) return new Date().toISOString().slice(0, 10).replace(/-/g, '.');
  return iso.slice(0, 10).replace(/-/g, '.');
}
