// Owner 시점 매칭 리포트 페이지.
//
// 라우트: /connection/casting/{uid}
// perspective: 'owner' — 의뢰인이 보는 매칭 리포트
//
// partner.source 분기:
//   - internal (게스트): Chapter3V2 (radar 6축, deterministic 매칭 점수)
//   - insta:             Chapter3InstaSpectrum (4축 양극 막대, LLM axisNotes)
//                        + 사진 무조건 성별별 default (실제 인스타 사진 노출 X)
//                        + HuntBox sourceLabel="인스타그램"
//                        + 추천 footnote (인스타 추정값 안내)

import { notFound } from 'next/navigation';

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
import {
  ConnectionReportFetchError,
  fetchOwnerConnectionReport,
} from '@/lib/casting/connection-report';
import type { Candidate } from '@/lib/report/types';
import {
  FIXED_USER_NAME,
  adaptBipolarAxes,
  adaptCandidate,
  adaptCasterNote,
  adaptChapter2Narratives,
  adaptHuntStats,
  adaptMatchAnalysis,
  adaptReadingCard,
  adaptSpectrumNotes,
  adaptUserAnswers,
} from '@/lib/casting/connection-adapter';

const INSTA_RECOMMENDATION_FOOTNOTE =
  '*인스타그램에서 찾아온 분이라 일부는 추정값이지만, 정확도는 약 73%에 달해요.';
const INSTA_CTA_STEP1_NOTE =
  '인스타그램에서 엄선해서 찾아온 분에요! 저희가 스토리 태그·DM 등 가능한 모든 경로로 연락 시도할 예정입니다! 최선을 다해 연락망 확보해서 꼭 연결해드릴게요.';

// partner.source=insta 시 실제 사진 노출 X — 성별별 default 강제.
const INSTA_DEFAULT_PHOTO_BY_GENDER = {
  male: '/images/casting/casting_man.webp',
  female: '/images/casting/casting_woman_1.webp',
} as const;

type PageProps = {
  params: Promise<{ uid: string }>;
};

export default async function OwnerCastingPage({ params }: PageProps) {
  const { uid } = await params;

  let report;
  try {
    report = await fetchOwnerConnectionReport(uid);
  } catch (err) {
    if (err instanceof ConnectionReportFetchError && err.status === 404) {
      notFound();
    }
    throw err;
  }

  const isInsta = report.partner.profile.source === 'insta';
  const candidate = adaptCandidate(report);
  // insta 케이스는 사진 무조건 default (실제 인스타 사진 노출 X)
  const finalCandidate: Candidate = isInsta
    ? {
        ...candidate,
        teaserPhoto: defaultPhotoFor(report.partner.profile.basics.gender),
        detailPhoto: defaultPhotoFor(report.partner.profile.basics.gender),
      }
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

        <ReadingCardV2
          userName={FIXED_USER_NAME}
          narratives={readingCard}
        />

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

        {/* 인스타 안내 카피는 HuntBox sourceLabel 아래로 이동 — CTA 에는 미노출 */}
        <MeetOrPassCta reportId={uid} />

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

function defaultPhotoFor(gender: 'male' | 'female' | null | undefined): string {
  return gender === 'female'
    ? INSTA_DEFAULT_PHOTO_BY_GENDER.female
    : INSTA_DEFAULT_PHOTO_BY_GENDER.male;
}

function formatPublishedAt(iso: string | null | undefined): string {
  if (!iso) return new Date().toISOString().slice(0, 10).replace(/-/g, '.');
  return iso.slice(0, 10).replace(/-/g, '.');
}
