// 인스타그램 발견 후보용 매칭 페이지 — 디자인 검수 페이지.
// 라우트: /casting/insta-template-preview
// 차이점 (vs template-preview):
//   - Chapter3V2(radar) → Chapter3InstaSpectrum(양극 막대 4축)
//   - 인스타 후보는 CastingAnswers 가 없으므로 6축 점수 산출 불가
//   - HuntBox 는 instagramProfiles 비중을 키워 출처 강조
//   - Chapter4Simulation 의 match 는 simulation 텍스트만 사용

import type { UserAnswers } from '@/lib/personalization/types';
import type { Candidate, MatchAnalysis } from '@/lib/report/types';
import { TopNav } from '@/components/report/TopNav';
import { ApplicationSummary } from '@/components/report/ApplicationSummary';
import { Chapter4Simulation } from '@/components/report/Chapter4Simulation';
import { ReportShell } from '@/components/report/ReportShell';
import { TrackSection } from '@/components/report/TrackSection';
import { MeetOrPassCta } from '@/components/report/MeetOrPassCta';
import { CasterNoteSection } from '../template-preview/_components/CasterNoteSection';
import { HeroV2 } from '../template-preview/_components/HeroV2';
import { HuntBoxV2 } from '../template-preview/_components/HuntBoxV2';
import { TeaserCardV2 } from '../template-preview/_components/TeaserCardV2';
import { CandidateDetailSection } from '../template-preview/_components/CandidateDetailSection';
import { ReadingCardV2 } from '../template-preview/_components/ReadingCardV2';
import { Chapter3InstaSpectrum, type BipolarAxis } from './_components/Chapter3InstaSpectrum';

// ── Mock data ─────────────────────────────────────────────────────────────

const MOCK_USER_NAME = '의뢰인';
const MOCK_PUBLISHED_AT = '2026.05.07';

// 인스타 출처 강조 — 발견 경로의 대부분이 인스타
const MOCK_HUNT_STATS = {
  offlineGyms: 0,
  instagramProfiles: 64,
  linkedinProfiles: 0,
  communities: 0,
};

const MOCK_USER_ANSWERS: UserAnswers = {
  idealType: {
    attractionFactor: "'분위기'가 좋은 사람",
    agePreference: '비슷한 나이',
    heightPreference: '큰 편이 좋아',
    bodyType: '슬림',
    contactStyle: '필요할 때만 연락',
    dealBreaker: '말이 거친 사람',
    religionImportance: '상관없어',
  },
  selfInfo: {
    gender: '여자',
    location: '서울',
    occupation: '프리랜서',
    age: '27',
    height: '165',
    datingFrequency: '주 1~2번 정도',
    mbti: 'INFP',
  },
  freeResponse: {
    strictCriteria: '취향이 비슷한 사람, 사진 감각 있는 사람',
  },
  personality: {
    jealousy: '거의 안 해',
    conflictStyle: '대화로 풀어',
    selfDescription: 'creative,quiet,sensitive',
  },
};

const CASTER_HEADLINE = '취향이 단단하고, 자기 세계가 있는 사람';

const MOCK_CANDIDATE: Candidate = {
  nickname: '○○○',
  faceType: '깊이 있는 분위기, 옷 잘 입는 타입',
  ageRange: '20대 후반',
  ageDetail: '',
  occupation: '디자이너',
  occupationDetail: '',
  personality: '',
  location: '서울',
  foundAt: '인스타그램',
  hobbies: { visible: [], hidden: 0 },
  daySchedule: [],
  background:
    '주로 <b>전시·필름 사진·작은 카페</b> 콘텐츠가 피드를 채우는 분이에요. 큰 군중보단 한두 명과 깊이 머무는 자리를 좋아하는 결이 사진에서 일관되게 보여요. 의뢰인님이 좋아하시는 <b>분위기 있는 사람</b>의 결에 맞을 거예요.',
  secretAppeal: '',
  teaserPhoto: '/images/casting/casting_man.webp',
  detailPhoto: '/images/casting/casting_man.webp',
  mbti: 'INFJ',
  height: '180cm',
  recommendation: CASTER_HEADLINE,
};

// 인스타 피드에서 보이는 매력 — Chapter 1 '✨ 이 사람의 매력' 슬롯 산문 (4~5문장)
const MOCK_FEED_CHARM =
  '인스타 피드 전체에서 결이 일관되게 흘러요. <b>차분하고 단정한 톤</b>이 흐트러지지 않고, 전시·필름 사진처럼 <b>취향이 또렷한</b> 콘텐츠로 큐레이션돼 있어요. 옷이나 소품 디테일에서도 미감이 자연스럽게 묻어나고, 캡션은 <b>짧고 절제</b>돼 있어서 자기 결이 분명한 인상을 줘요. 의뢰인님이 좋아하시는 <b>분위기 있는 사람</b>의 결이에요.';

// 추천사 아래 각주 — 인스타 추정값 안내
const RECOMMENDATION_FOOTNOTE =
  '*인스타그램에서 찾아온 분이라 일부는 추정값이지만, 정확도는 약 73%에 달해요.';

// CTA 1번 단계 보조 안내 — 인스타 후보 연락 방식
const CTA_STEP1_NOTE =
  '인스타그램에서 찾아온 분이라, 저희가 스토리 태그·DM 등 가능한 모든 경로로 연락 시도드릴게요. 최선을 다해 연락망 확보해서 꼭 연결해드릴게요!';

// 4축 양극 막대 — 인스타 프로필(사진/bio/포스트)에서 LLM 이 추정한 성향 위치.
const MOCK_BIPOLAR_AXES: BipolarAxis[] = [
  { axisName: '에너지', leftLabel: '내향적', rightLabel: '외향적', leftPercent: 55 },
  { axisName: '판단', leftLabel: '감성적', rightLabel: '이성적', leftPercent: 60 },
  { axisName: '자기표현', leftLabel: '활발한', rightLabel: '차분한', leftPercent: 35 },
  { axisName: '행동', leftLabel: '안정 추구', rightLabel: '모험 추구', leftPercent: 40 },
];

const MOCK_SPECTRUM_NOTES = [
  '<b>내향적인 결</b>이 살짝 짙어요. 사람 많은 자리보다 <b>한두 명과 깊이</b> 보내는 시간을 더 챙기는 사람일 거예요.',
  '자기표현은 <b>차분한 결</b>이 강해요. 피드 톤이 일관되고 잔잔해서, 의뢰인님이 좋아하시는 <b>분위기 있는 결</b>과 맞물려요.',
  '안정과 모험이 거의 균형이라, <b>익숙한 동네 카페</b>도, <b>새로운 전시</b>도 같이 찾아다닐 수 있는 분위기예요.',
];

// Chapter4Simulation 은 match.simulation 텍스트만 사용. 나머지 필드는 더미.
const MOCK_MATCH: MatchAnalysis = {
  matchRate: 0,
  topPercent: 0,
  radarData: { labels: [], values: [] },
  simulation:
    '첫 만남은 <b>한적한 동네 전시</b>나 <b>필름 사진관 근처 카페</b>가 어울릴 거예요. 두 분 다 큰 자리보다 조용한 공간에서 호흡이 잘 풀리는 결이라, 자리만 잡으면 시간이 자연스럽게 흐를 거예요.\n\n인스타 피드에서 보이는 결이 의뢰인님 취향과 결이 비슷해서, 처음부터 <b>"여기 분위기 좋네요"</b> 정도의 가벼운 코멘트로도 대화가 자연스럽게 시작될 거예요.',
  notes: [],
};

const MOCK_READING_CARD = {
  viewerInsight:
    '본인을 소개하실 때 <b>"분위기 좋은 사람"</b>과 <b>"취향이 비슷한 사람"</b>이라고 하셨는데, 이 표현이 의뢰인님이 어떤 분인지 잘 보여줘요. 큰 이벤트보다 <b>일상의 결</b>로 사람을 알아가는 분이고, 사진 한 장·말 한 줄에서 그 사람의 취향을 읽어내는 감각을 가지셨어요. 그래서 만났을 때 직관적으로 결이 맞는지를 판단하시는 분이에요.',
  matchOpening:
    '그래서 이 분이 잘 어울릴 것 같아요. <b>피드 전체에서 일관된 취향</b>이 보이고, 의뢰인님이 좋아하시는 분위기 있는 결을 가진 분이에요.',
  candidateMatch:
    '이 사람은 디자이너답게 <b>시각적 디테일</b>에 예민한 분이고, 사진·전시·작은 카페처럼 의뢰인님이 좋아하실 만한 공간을 자연스럽게 찾아다니는 분이에요. 인스타 피드에서 보이는 결이 흔들리지 않아서, 만났을 때도 동일한 분위기일 가능성이 높아요. 처음엔 말수가 적어 보여도 같이 시간을 보낼수록 깊이가 보이는 사람이에요.',
};

const MOCK_CASTER_NOTE = {
  headline: CASTER_HEADLINE,
  charmBullets: [
    '<b>피드 전체에서 일관된 취향</b> — 흔들리지 않는 분위기',
    '<b>전시·필름 사진</b>처럼 차분한 콘텐츠 결',
    '<b>옷 잘 입는</b> 단정한 분위기',
  ],
};

const MOCK_CHAPTER2_NARRATIVES = {
  personality:
    '디자이너답게 <b>시각적 디테일</b>에 예민하고, 자기 취향이 단단한 분이에요. 인스타 피드 전체에서 결이 일관되게 보여서, 만났을 때도 동일한 분위기가 이어질 가능성이 높아요. 큰 자리보단 <b>한두 명과의 깊은 대화</b>를 더 편하게 여기는 결이 사진에서 자연스럽게 묻어나요.',
  datingStyle:
    '연애에서도 <b>일상의 결</b>로 사람을 알아가는 스타일일 거예요. 큰 이벤트보다 매일의 작은 디테일 — 같이 본 전시 사진, 새로 발견한 카페 공유 같은 — 로 관계가 채워지는 결이에요. 인스타 활동 패턴을 보면 한 번에 몰아 올리지 않고 <b>꾸준히 결을 챙기는</b> 타입이라, 연락도 비슷한 결로 흘러갈 거예요.',
  weekendStyle:
    '주말엔 <b>전시·필름 사진관·작은 카페</b>를 자주 다니시는 결이에요. 자기 페이스대로 천천히 도는 걸 좋아하시는 분이라, 의뢰인님과 함께 <b>같은 동선을 천천히 도는 데이트</b>가 어울릴 거예요. 큰 약속보단 동네에서 시작해서 자연스럽게 이어지는 시간을 더 좋아하실 분이에요.',
};

// ── Page ──────────────────────────────────────────────────────────────────

export default function CastingInstaTemplatePreviewPage() {
  const reportUid = 'INSTA-TEMPLATE-PREVIEW';

  return (
    <main className="max-w-[480px] mx-auto pb-[60px] relative bg-brand-bg min-h-screen font-body text-brand-ink">
      <ReportShell reportId={reportUid} tone="formal" variant="paid">
        <TopNav publishedAt={MOCK_PUBLISHED_AT} />
        <HeroV2 userName={MOCK_USER_NAME} />

        <CasterNoteSection
          headline={MOCK_CASTER_NOTE.headline}
          charmBullets={MOCK_CASTER_NOTE.charmBullets}
        />

        <HuntBoxV2
          stats={MOCK_HUNT_STATS}
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
            candidate={MOCK_CANDIDATE}
            recommendationFootnote={RECOMMENDATION_FOOTNOTE}
          />
        </TrackSection>

        <ReadingCardV2
          userName={MOCK_USER_NAME}
          narratives={{
            viewerInsight: MOCK_READING_CARD.viewerInsight,
            matchOpening: MOCK_READING_CARD.matchOpening,
            candidateMatch: MOCK_READING_CARD.candidateMatch,
          }}
        />

        <TrackSection section="chapter1" reportId={reportUid}>
          <CandidateDetailSection
            userName={MOCK_USER_NAME}
            candidate={MOCK_CANDIDATE}
            narratives={MOCK_CHAPTER2_NARRATIVES}
            feedCharm={MOCK_FEED_CHARM}
          />
        </TrackSection>

        {/* radar 자리 → 양극 막대 4축 */}
        <TrackSection section="chapter3" reportId={reportUid}>
          <Chapter3InstaSpectrum
            axes={MOCK_BIPOLAR_AXES}
            notes={MOCK_SPECTRUM_NOTES}
            number="CHAPTER 2"
          />
        </TrackSection>

        <Chapter4Simulation
          match={MOCK_MATCH}
          number="CHAPTER 3"
          sceneImage="/images/simulation/c324be08-meeting.jpg"
        />

        <div className="px-7 mt-14 mb-3">
          <div className="border-t border-dashed border-brand-ink/30" />
        </div>

        <ApplicationSummary userAnswers={MOCK_USER_ANSWERS} />
        <MeetOrPassCta reportId={reportUid} step1Note={CTA_STEP1_NOTE} />

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
