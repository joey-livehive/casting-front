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
import { ConnectionPhoneGate } from '@/app/connection/_components/ConnectionPhoneGate';
import {
  ConnectionReport,
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
  defaultPhotoFor,
} from '@/lib/casting/connection-adapter';

const INSTA_RECOMMENDATION_FOOTNOTE =
  '*인스타그램에서 찾아온 분이라 일부는 추정값이지만, 정확도는 약 73%에 달해요.';
const INSTA_CTA_STEP1_NOTE =
  '인스타그램에서 엄선해서 찾아온 분에요! 저희가 스토리 태그·DM 등 가능한 모든 경로로 연락 시도할 예정입니다! 최선을 다해 연락망 확보해서 꼭 연결해드릴게요.';

export function OwnerConnectionPageClient({ uid }: { uid: string }) {
  const [report, setReport] = useState<ConnectionReport | null>(null);
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
      setReport(await fetchOwnerConnectionReport(uid, phone));
    } catch (err) {
      if (err instanceof ConnectionReportFetchError && err.status === 403) {
        setError('전화번호가 일치하지 않아요.');
      } else if (err instanceof ConnectionReportFetchError && err.status === 404) {
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
      <ConnectionPhoneGate
        title="매칭 리포트 확인"
        error={error}
        loading={loading}
        onSubmit={loadReport}
      />
    );
  }

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

function formatPublishedAt(iso: string | null | undefined): string {
  if (!iso) return new Date().toISOString().slice(0, 10).replace(/-/g, '.');
  return iso.slice(0, 10).replace(/-/g, '.');
}
