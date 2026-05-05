import { notFound } from 'next/navigation';
import { ApplicationSummary } from '@/components/report/ApplicationSummary';
import { ChapterCard } from '@/components/report/ChapterCard';
import { Hero } from '@/components/report/Hero';
import { HuntBox } from '@/components/report/HuntBox';
import { RadarChart } from '@/components/report/RadarChart';
import { ReadingCard } from '@/components/report/ReadingCard';
import { SafeText } from '@/components/report/SafeText';
import { TopNav } from '@/components/report/TopNav';
import { getCastingMatchReport } from '@/lib/casting/matchReports';
import type { UserAnswers, PersonalizedContent } from '@/lib/personalization/types';
import { FormalTone } from './FormalTone';

export const dynamic = 'force-dynamic';

function MiniBar({ value }: { value: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-brand-bg-deep">
      <div className="h-full rounded-full bg-brand-orange" style={{ width: `${value}%` }} />
    </div>
  );
}

function SignalGrid({
  report,
}: {
  report: NonNullable<ReturnType<typeof getCastingMatchReport>>;
}) {
  return (
    <ChapterCard
      number="CHAPTER 1"
      title="상대 프로필에서 잡힌 신호"
      lead="사진 없이, 현재 DB에 들어온 설문 원문과 정규화 컬럼만으로 확인 가능한 신호를 먼저 모았어요."
    >
      <div className="grid grid-cols-2 gap-2.5">
        {report.candidateSignals.map((signal, index) => (
          <div
            key={signal}
            className={`${index === 0 ? 'col-span-2' : ''} bg-brand-bg-deep border-[1.5px] border-brand-line rounded-[14px] px-[14px] py-[15px]`}
          >
            <div className="font-hand text-[13px] text-brand-orange-deep mb-[7px]">
              signal {String(index + 1).padStart(2, '0')}
            </div>
            <div className="text-[14px] leading-[1.55] text-brand-ink">{signal}</div>
          </div>
        ))}
      </div>
      <div className="mt-5 p-[18px] bg-brand-bg-deep rounded-[14px] border-[1.5px] border-brand-line">
        <div className="font-hand text-[15px] text-brand-orange-deep mb-[14px]">
          의뢰인님 조건과 겹친 지점
        </div>
        {report.viewerIdeal.map((item, i) => (
          <div
            key={item}
            className={`flex gap-3 py-[9px] ${i > 0 ? 'border-t border-dashed border-brand-ink/15' : ''}`}
          >
            <div className="shrink-0 w-14 font-display font-bold text-[13px] text-brand-ink pt-[1px]">
              {String(i + 1).padStart(2, '0')}
            </div>
            <div className="flex-1 text-[13.5px] text-brand-ink-soft leading-[1.55]">
              {item}
            </div>
          </div>
        ))}
      </div>
    </ChapterCard>
  );
}

function MatchRadar({
  report,
}: {
  report: NonNullable<ReturnType<typeof getCastingMatchReport>>;
}) {
  const radarData = {
    labels: report.scoreBreakdown.map((item) => item.label),
    values: report.scoreBreakdown.map((item) => Number((item.score / 10).toFixed(1))),
  };

  return (
    <ChapterCard
      number="CHAPTER 2"
      title="점수로 겹쳐보면"
      lead={`의뢰인님과 이 후보의 6축 일치도를 같은 축에 올려봤어요. 현재 데이터 기준 <b>${report.score}% 일치</b>로 잡힙니다.`}
    >
      <div className="flex justify-center gap-5 mb-1.5 text-[13px]">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-[3px] bg-brand-orange" />
          일치도
        </span>
      </div>

      <RadarChart data={radarData} />

      <div className="mt-4 flex flex-col gap-2.5">
        {report.scoreBreakdown.map((item) => (
          <div
            key={item.label}
            className="bg-brand-bg-deep border-l-[3px] border-brand-orange px-3.5 py-[11px] rounded-lg text-[13.5px] text-brand-ink-soft leading-[1.6] [&_b]:font-display [&_b]:text-brand-ink"
          >
            <b>{item.label}</b> · {item.note}
            <div className="mt-2">
              <MiniBar value={item.score} />
            </div>
          </div>
        ))}
      </div>
    </ChapterCard>
  );
}

function buildUserAnswers(report: NonNullable<ReturnType<typeof getCastingMatchReport>>): UserAnswers {
  return {
    idealType: {
      attractionFactor: report.viewerIdeal[0],
      agePreference: report.viewerIdeal[1],
      heightPreference: '비슷하거나 조금 작은 키',
      bodyType: '마른 체형',
      relationshipPriority: report.viewerIdeal[3],
      contactStyle: '매일 연락 / 수시 연락',
      religionImportance: '상관 없음',
      dealBreaker: '흡연자는 부담스러움',
      firstMeeting: report.viewerIdeal[5],
    },
    selfInfo: {
      ageRange: '20대 초반',
      gender: '남성',
      location: '서울',
      drinking: '술을 거의 안 마심',
      relationshipStyle: '자주 연락하고 자주 보고 싶은 편',
      readiness: '바로 만날 준비가 됨',
    },
    freeResponse: {
      strictCriteria: report.cautions[0],
      messageToUs: '나와 생활 리듬이 잘 맞고, 연락을 부담스러워하지 않는 사람이 좋습니다.',
    },
  };
}

const personalized: PersonalizedContent = {
  chapter1Traits: {
    trait01Intro: '',
    trait02Intro: '',
    trait03Intro: '',
    trait04Intro: '',
  },
  readingCard: {
    paragraph1Opening:
      '“성격 좋은 사람”, “비슷한 나이”, “매일 연락”이라는 답변이 반복해서 같은 방향을 가리켜요.',
    paragraph2Opening:
      '이번 후보는 서울, 20대 초반, 낮은 음주 빈도, 가까운 연락 스타일이 겹쳐 현재 데이터에서 가장 강하게 올라왔어요.',
  },
};

export default async function CastingMatchReportPage({
  params,
}: {
  params: Promise<{ reportUid: string }>;
}) {
  const { reportUid } = await params;
  const report = getCastingMatchReport(reportUid);

  if (!report) notFound();

  return (
    <FormalTone>
      <main className="max-w-[480px] mx-auto pb-[90px] relative bg-brand-bg min-h-screen font-body text-brand-ink">
        <TopNav publishedAt={report.generatedAt} />
        <Hero userName="의뢰인" />

        <ApplicationSummary userAnswers={buildUserAnswers(report)} />
        <HuntBox stats={{ offlineGyms: 0, instagramProfiles: 0, linkedinProfiles: 0, communities: 411 }} />
        <ReadingCard userName="의뢰인" personalized={personalized.readingCard} />

        <SignalGrid report={report} />
        <MatchRadar report={report} />

        {report.sections.map((section, index) => (
          <ChapterCard
            key={section.title}
            number={`CHAPTER ${index + 1}`}
            title={section.title}
            lead={section.content}
          >
            {index === 2 ? (
              <div className="rounded-[14px] border-[1.5px] border-brand-mustard-deep bg-brand-mustard/25 p-4">
                <div className="font-hand text-[15px] text-brand-orange-deep mb-2">운영 확인 필요</div>
                <ul className="space-y-2">
                  {report.cautions.map((caution) => (
                    <li key={caution} className="text-[13px] leading-[1.65] text-brand-ink-soft">
                      <SafeText>{caution}</SafeText>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="rounded-[14px] bg-brand-bg-deep p-4 text-[13.5px] leading-[1.7] text-brand-ink-soft">
                <SafeText>{index === 0 ? '현재 데이터 기준 가장 강한 추천입니다.' : '매칭 액션 전에 운영자가 한 번 더 확인합니다.'}</SafeText>
              </div>
            )}
          </ChapterCard>
        ))}

        <div className="px-7 mt-8">
          <div className="bg-brand-ink text-brand-cream rounded-[20px] p-5 border-[1.5px] border-brand-line">
            <div className="font-display font-bold text-[20px] mb-4">다음 액션</div>
            <ol className="space-y-3">
              {report.nextSteps.map((step, index) => (
                <li key={step} className="flex gap-3 text-[13.5px] leading-[1.6] text-brand-cream/85">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-orange text-[12px] font-bold text-white">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button className="h-12 rounded-full bg-brand-orange font-display font-bold text-white">
                연결 요청
              </button>
              <button className="h-12 rounded-full border border-brand-cream/35 font-display font-bold text-brand-cream">
                패스
              </button>
            </div>
          </div>
        </div>
      </main>
    </FormalTone>
  );
}
