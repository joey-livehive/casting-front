'use client';

import { useState } from 'react';

import { ApplicationSummary } from '@/components/report/ApplicationSummary';
import { Chapter4Simulation } from '@/components/report/Chapter4Simulation';
import { MeetOrPassCta } from '@/components/report/MeetOrPassCta';
import { ReportShell } from '@/components/report/ReportShell';
import { TopNav } from '@/components/report/TopNav';
import { TrackSection } from '@/components/report/TrackSection';
import { CandidateDetailSection } from '@/app/casting/template-preview/_components/CandidateDetailSection';
import { CasterNoteSection } from '@/app/casting/template-preview/_components/CasterNoteSection';
import { Chapter3V2 } from '@/app/casting/template-preview/_components/Chapter3V2';
import { HeroV2 } from '@/app/casting/template-preview/_components/HeroV2';
import { HuntBoxV2 } from '@/app/casting/template-preview/_components/HuntBoxV2';
import { ReadingCardV2 } from '@/app/casting/template-preview/_components/ReadingCardV2';
import { TeaserCardV2 } from '@/app/casting/template-preview/_components/TeaserCardV2';
import { Chapter3InstaSpectrum } from '@/app/casting/insta-template-preview/_components/Chapter3InstaSpectrum';
import { ReceiverHero } from '@/app/casting/receiver-template-preview/_components/ReceiverHero';
import { MatchingPhoneGate } from '@/app/casting/report/_components/MatchingPhoneGate';
import {
  MatchingReport,
  MatchingReportFetchError,
  fetchMatchingReport,
} from '@/lib/casting/matching-report';
import type { Candidate } from '@/lib/report/types';
import {
  FIXED_USER_NAME,
  adaptBipolarAxes,
  adaptCandidate,
  adaptCasterNote,
  adaptChapter2Narratives,
  adaptHuntStats,
  adaptMatchAnalysis,
  adaptOwnerCandidate,
  adaptReadingCard,
  adaptSpectrumNotes,
  adaptUserAnswers,
  adaptViewerInsight,
  defaultPhotoFor,
} from '@/lib/casting/matching-adapter';

const INSTA_RECOMMENDATION_FOOTNOTE =
  '*인스타그램에서 찾아온 분이라 일부는 추정값이지만, 정확도는 약 73%에 달해요.';
const INSTA_CTA_STEP1_NOTE =
  '인스타그램에서 엄선해서 찾아온 분에요! 저희가 스토리 태그·DM 등 가능한 모든 경로로 연락 시도할 예정입니다! 최선을 다해 연락망 확보해서 꼭 연결해드릴게요.';

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
} as const;

export function AutoMatchingPageClient({ uid }: { uid: string }) {
  const [report, setReport] = useState<MatchingReport | null>(null);
  const [verifiedPhone, setVerifiedPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReport = async (phone: string) => {
    if (phone.replace(/\D/g, '').length < 9) {
      setError('전화번호를 정확히 입력해주세요.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setReport(await fetchMatchingReport(uid, phone));
      setVerifiedPhone(phone);
    } catch (err) {
      if (err instanceof MatchingReportFetchError && err.status === 403) {
        setError('전화번호가 일치하지 않아요.');
      } else if (err instanceof MatchingReportFetchError && err.status === 404) {
        setError('리포트를 찾을 수 없어요.');
      } else {
        setError('리포트를 불러오지 못했어요. 잠시 뒤 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!report) {
    return (
      <MatchingPhoneGate
        title="매칭 리포트 확인"
        error={error}
        loading={loading}
        onSubmit={loadReport}
      />
    );
  }

  if (report.perspective === 'partner') {
    return <PartnerReport uid={uid} report={report} verifiedPhone={verifiedPhone} />;
  }

  return <OwnerReport uid={uid} report={report} verifiedPhone={verifiedPhone} />;
}

function OwnerReport({
  uid,
  report,
  verifiedPhone,
}: {
  uid: string;
  report: MatchingReport;
  verifiedPhone: string;
}) {
  const isInsta = report.partner.profile.source === 'insta';
  const candidate = adaptCandidate(report);
  const finalCandidate: Candidate = isInsta
    ? (() => {
        const photo = defaultPhotoFor(report.partner.profile.basics.gender);
        return { ...candidate, teaserPhoto: photo, detailPhoto: photo };
      })()
    : candidate;
  const casterNote = adaptCasterNote(report);
  const huntStats = adaptHuntStats(report);
  const readingCard = adaptReadingCard(report);
  const chapter2Narratives = adaptChapter2Narratives(report);
  const match = adaptMatchAnalysis(report);
  const userAnswers = adaptUserAnswers(report);
  const bipolarAxes = adaptBipolarAxes(report);
  const spectrumNotes = adaptSpectrumNotes(report);

  const publishedAt = formatPublishedAt(report.meta.generated_at);

  return (
    <main className="max-w-[480px] mx-auto pb-[60px] relative bg-brand-bg min-h-screen font-body text-brand-ink">
      <ReportShell reportId={uid} tone="formal" variant="paid">
        <TopNav publishedAt={publishedAt} />
        <HeroV2 userName={FIXED_USER_NAME} />

        <CasterNoteSection
          headline={casterNote.headline}
          charmBullets={casterNote.charmBullets}
        />

        <HuntBoxV2
          stats={huntStats}
          sourceLabel={isInsta ? '인스타그램' : '캐스팅 내부 POOL'}
          sourceFootnote={
            isInsta ? (
              <p className="mt-2 font-hand text-[13px] leading-[1.65] text-brand-orange-deep">
                {INSTA_CTA_STEP1_NOTE}
              </p>
            ) : undefined
          }
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

        <TrackSection section="teaser_card" reportId={uid}>
          <TeaserCardV2
            candidate={finalCandidate}
            recommendationFootnote={isInsta ? INSTA_RECOMMENDATION_FOOTNOTE : undefined}
          />
        </TrackSection>

        <ReadingCardV2 userName={FIXED_USER_NAME} narratives={readingCard} />

        <TrackSection section="chapter1" reportId={uid}>
          <CandidateDetailSection
            userName={FIXED_USER_NAME}
            candidate={finalCandidate}
            narratives={chapter2Narratives}
          />
        </TrackSection>

        <TrackSection section="chapter3" reportId={uid}>
          {isInsta ? (
            <Chapter3InstaSpectrum
              axes={bipolarAxes}
              notes={spectrumNotes}
              number="CHAPTER 2"
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

        <ApplicationSummary userAnswers={userAnswers} />
        <MeetOrPassCta reportId={uid} phone={verifiedPhone} />
        <ContactFooter />
      </ReportShell>
    </main>
  );
}

function PartnerReport({
  uid,
  report,
  verifiedPhone,
}: {
  uid: string;
  report: MatchingReport;
  verifiedPhone: string;
}) {
  const ownerCandidateRaw = adaptOwnerCandidate(report);
  const ownerPhoto = defaultPhotoFor(report.owner.profile.basics.gender);
  const ownerCandidate = {
    ...ownerCandidateRaw,
    teaserPhoto: ownerPhoto,
    detailPhoto: ownerPhoto,
  };
  const ownerPersonContent = report.owner.person_content;
  const isInstaPartner = report.partner.profile.source === 'insta';
  const showApplicationSummary = !isInstaPartner;
  const partnerInsight = adaptViewerInsight(report, 'partner');
  const bipolarAxes = adaptBipolarAxes(report);
  const spectrumNotes = adaptSpectrumNotes(report);
  const match = adaptMatchAnalysis(report);
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
        <MeetOrPassCta reportId={uid} mode="receiver" phone={verifiedPhone} />
        <ContactFooter />
      </ReportShell>
    </main>
  );
}

function ContactFooter() {
  return (
    <div className="px-7 mt-10 mb-2 text-center text-[12px] text-brand-ink-mute">
      문의:{' '}
      <a href="mailto:hello@livehivecorp.com" className="underline">
        hello@livehivecorp.com
      </a>
    </div>
  );
}

function formatPublishedAt(iso: string | null | undefined): string {
  if (!iso) return new Date().toISOString().slice(0, 10).replace(/-/g, '.');
  return iso.slice(0, 10).replace(/-/g, '.');
}
