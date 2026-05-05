// 매칭 페이지 v2 — 디자인 검증 + LLM 프롬프트 작성 기준 페이지.
// fixture/DB 무관. 모든 섹션의 데이터를 이 파일에 인라인으로 두어 디자인 작업에만 집중하도록 함.
// 라우트: /casting/template-preview
// 매칭 카드 디폴트 템플릿 — _components 컴포넌트들의 단일 마운트 지점.

import type { UserAnswers } from '@/lib/personalization/types';
import type { Candidate, MatchAnalysis } from '@/lib/report/types';
import type { CastingAnswers } from '@/lib/casting/prompts/types';
import { computePairRadar } from '@/lib/casting/radar';
import { TopNav } from '@/components/report/TopNav';
import { ApplicationSummary } from '@/components/report/ApplicationSummary';
import { Chapter3V2 } from './_components/Chapter3V2';
import { Chapter4Simulation } from '@/components/report/Chapter4Simulation';
import { ReportShell } from '@/components/report/ReportShell';
import { TrackSection } from '@/components/report/TrackSection';
import { MeetOrPassCta } from '@/components/report/MeetOrPassCta';
import { CasterNoteSection } from './_components/CasterNoteSection';
import { HeroV2 } from './_components/HeroV2';
import { HuntBoxV2 } from './_components/HuntBoxV2';
import { TeaserCardV2 } from './_components/TeaserCardV2';
import { CandidateDetailSection } from './_components/CandidateDetailSection';
import { ReadingCardV2 } from './_components/ReadingCardV2';

// ── Mock data ─────────────────────────────────────────────────────────────

// 캐스팅은 이름을 받지 않음. 모든 호출은 '의뢰인'으로 고정 → "의뢰인님" 으로 렌더됨.
const MOCK_USER_NAME = '의뢰인';
const MOCK_PUBLISHED_AT = '2026.04.30';

const MOCK_HUNT_STATS = {
  offlineGyms: 5,
  instagramProfiles: 42,
  linkedinProfiles: 18,
  communities: 5,
};

const MOCK_USER_ANSWERS: UserAnswers = {
  idealType: {
    attractionFactor: "'외모'가 수려한 사람",
    agePreference: '나보다 많은 사람',
    heightPreference: '큰 편이 좋아',
    bodyType: '근육질',
    contactStyle: '수시로 연락했으면',
    dealBreaker: '흡연하는 사람',
    religionImportance: '종교 없는 사람이 좋아',
  },
  selfInfo: {
    gender: '여자',
    location: '서울',
    occupation: '회사원',
    age: '28',
    height: '162',
    datingFrequency: '주 2~3번 정도',
    mbti: 'INFJ',
  },
  freeResponse: {
    strictCriteria: '맞춤법 잘 지키는 사람이랑 말 예쁘게 하는 사람',
  },
  personality: {
    jealousy: '상황 따라 달라',
    conflictStyle: '시간 갖고 정리해',
    selfDescription: 'serious,comfortable,lively',
  },
};

// 캐스터의 한 줄 — TeaserCardV2.recommendation + CasterNoteSection.headline 두 자리에 같은 카피로 재사용.
// LLM 출력 1개로 양쪽을 채운다.
const CASTER_HEADLINE = '술·담배 안 하고, 매일 챙겨줄 다정한 사람';

const MOCK_CANDIDATE: Candidate = {
  nickname: '○○○',
  faceType: '단정하고 깔끔한 분위기',
  ageRange: '20대 후반',
  ageDetail: '',
  occupation: '회사원',
  occupationDetail: '',
  personality: '',
  location: '서울',
  foundAt: '',
  hobbies: { visible: [], hidden: 0 },
  daySchedule: [{ time: '—', activity: '<red>내용 없음</red>' }],
  background:
    '시끌시끌한 자리보단 조용한 카페나 산책으로 한 주를 비우는 차분한 타입이에요. 주말이면 <b>집에서 영화 한 편이나 동네 산책</b>으로 자기만의 리듬을 챙기는 사람이라, 의뢰인님처럼 집에서 충전하시는 분과 자연스럽게 호흡이 맞을 거예요.',
  secretAppeal: '',
  teaserPhoto: '/images/casting/casting_man.webp',
  detailPhoto: '/images/casting/casting_man.webp',
  mbti: 'ISFJ',
  height: '178cm',
  recommendation: CASTER_HEADLINE,
};

// 6축 — docs/casting-template/04-radar-rules.md 기준.
// 각 축 점수는 양쪽 캐스팅 설문 답변에서 결정론으로 산출됨 (LLM 호출 없음).
//   1. 만남 빈도        Q2-1
//   2. 연락 빈도        Q2-2
//   3. 연애 스타일       Q2-4 (진지함)
//   4. 활동성           Q2-3 데이트 + MBTI E/I
//   5. 라이프스타일      Q3-4 흡연 + Q3-5 음주
//   6. 계획성           MBTI J/P

// template-preview 용 mock CastingAnswers — radar 점수 계산 입력.
// 의뢰인: P1 페르소나 (ENFP 23 진주, 진지) — viewer
const MOCK_VIEWER_CASTING: CastingAnswers = {
  '반가워! 성별이 어떻게 돼?': 'female',
  '얼마나 자주 만나고 싶어?': 'flexible_meet',
  '연락은 얼마나 자주가 좋아?': 'contact_relaxed',
  '어떤 데이트가 좋아?': 'culture',
  '넌 지금 얼마나 진지해?': 'serious_dating',
  '연인이 술 마시는 건 어때?': 'pref_drink_sometimes',
  '연인이 담배 피운다면?': 'pref_smoke_meh',
  '상대 종교는 중요해?': 'pref_any_religion',
  '넌 종교가 뭐야?': 'none',
  '상대와 거리는 어디까지?': 'long_distance',
  '넌 어디쯤 사는데?': 'other_region',
  '넌 나이가 어떻게 돼?': '23',
  '키가 어떻게 돼?': '163',
  '네 체형을 알려줘': 'self_average',
  '넌 담배 피워?': 'no_smoke',
  '술은 자주 마셔?': 'rarely_drink',
  'MBTI 뭐야?': 'ENFP',
};

// 후보: ISFJ 비흡연·차분 매칭 ("매일 챙겨줄 다정한 사람" 카피와 일치)
const MOCK_CANDIDATE_CASTING: CastingAnswers = {
  '반가워! 성별이 어떻게 돼?': 'male',
  '얼마나 자주 만나고 싶어?': 'weekly_3_4',
  '연락은 얼마나 자주가 좋아?': 'contact_anytime',
  '어떤 데이트가 좋아?': 'culture',
  '넌 지금 얼마나 진지해?': 'serious_dating',
  '연인이 술 마시는 건 어때?': 'pref_drink_sometimes',
  '연인이 담배 피운다면?': 'pref_smoke_no',
  '상대 종교는 중요해?': 'pref_any_religion',
  '넌 종교가 뭐야?': 'none',
  '상대와 거리는 어디까지?': 'same_city',
  '넌 어디쯤 사는데?': 'seoul',
  '넌 나이가 어떻게 돼?': '28',
  '키가 어떻게 돼?': '178',
  '네 체형을 알려줘': 'self_average',
  '넌 담배 피워?': 'no_smoke',
  '술은 자주 마셔?': 'rarely_drink',
  'MBTI 뭐야?': 'ISFJ',
};

// 결정론 radar 산출 — module-level 상수로 1회 계산 (입력이 정적이므로)
const RADAR = computePairRadar(MOCK_VIEWER_CASTING, MOCK_CANDIDATE_CASTING);

const MOCK_MATCH: MatchAnalysis = {
  matchRate: RADAR.matchRate,
  topPercent: RADAR.topPercent,
  radarData: {
    labels: RADAR.labels,
    userDesired: RADAR.userDesired,
    candidateActual: RADAR.candidateActual,
  },
  simulation:
    '첫 만남은 <b>조용한 카페</b>가 어울릴 거예요. 두 분 다 카페에서 천천히 시작하는 걸 좋아하셔서, 자리만 잡으시면 시간 가는 줄 모르실 거예요. ISFJ 특유의 차분한 응대 덕분에 의뢰인님이 편하게 말을 꺼낼 수 있게 만들어 주실 분이에요.\n\n이 분의 <b>답변과 자기소개를 기반으로 보면, 처음 만났을 때 이렇게 말할 것 같아요</b>.\n"오늘 오시는 길 안 막혔어요? 저는 좀 일찍 와서 자리 잡고 있었어요. 음료는 뭐 드시고 싶으세요?"\n큰 이벤트 없이도 작은 디테일을 챙기는 분이라, 첫 대화부터 편안한 거리감이 만들어질 거예요.',
  notes: [
    '의뢰인님이 <b>"진지한 연애"</b>를 원하셨는데, 이 분도 같은 답을 골랐어요. 가장 갈등이 잦은 <b>연애 진지함</b> 축에서 자연스럽게 맞물리는 사이예요.',
    '의뢰인님은 <b>흡연자 비호감</b>이라고 답하셨고, 이 분은 비흡연에 음주도 거의 안 하는 차분한 라이프예요. 라이프스타일 호환에서 일상 리듬까지 맞아서 호흡이 잘 맞을 거예요.',
    '두 분 모두 <b>카페·문화 데이트</b>를 좋아하세요. 활동 결이 비슷해서 처음 만남부터 어색하지 않을 거예요.',
    '두 분 다 종교는 무관, 의뢰인님 거리도 무관이라 동선 부담 없이 자연스럽게 만나기 시작할 수 있는 사이예요.',
  ],
};

// ReadingCardV2 narratives — 5블록 구조 (lead/viewerInsight/matchOpening/candidateMatch/outro).
// viewerInsight: viewerBundle.readingViewerInsight (LLM C, viewer-only, 4~5문장)
// matchOpening:  candidateBundle.readingMatchOpening (LLM B, candidate-only, 2~3문장)
// candidateMatch: candidateBundle.readingCandidateMatch (LLM B, candidate-only, 4~5문장)
const MOCK_READING_CARD = {
  viewerInsight:
    '본인을 소개하실 때 <b>"수시로 연락했으면"</b>과 <b>"맞춤법 잘 지키는 사람"</b>이라고 하셨는데, 이 두 표현이 의뢰인님이 어떤 분인지 잘 보여줘요. 사소한 표현 하나, 매일의 안부 한 줄 같은 디테일에서 진심을 발견하는 분이에요. 그래서 큰 이벤트로 한 번에 마음을 표현하는 사람보다는, 매일의 안부와 단정한 말투로 천천히 마음을 보여주는 사람과 호흡이 잘 맞으세요. 의뢰인님 자신도 그런 식으로 사람을 챙기실 분이라, 오래갈수록 따뜻함이 쌓이는 관계를 만드실 거예요.',
  matchOpening:
    '그래서 이 분이 잘 어울릴 것 같아요. 이 사람은 <b>비흡연에 차분한 라이프</b>에 ISFJ 특유의 조용한 책임감을 가진 분이라, 의뢰인님이 중요하게 보시는 일상의 디테일을 자연스럽게 챙길 수 있는 분이에요.',
  candidateMatch:
    '이 사람은 <b>매일 꾸준히 연락</b>하는 걸 편하게 여기고, 단정하고 정돈된 말투를 가진 분이에요. ISFJ답게 표현보다 행동으로 챙기는 타입이라, 큰 이벤트 없이도 일상의 작은 순간들로 옆자리를 따뜻하게 채우는 사람이에요. 회사원으로서의 안정감이 더해진 분이라, 약속한 건 꼭 지키고 사소한 메시지도 놓치지 않는 신뢰감 있는 분이에요. 처음에는 조용해 보여도 같이 시간을 보낼수록 깊이가 보이는 사람이라, 의뢰인님이 시간을 두고 알아가실수록 더 좋아하실 분이에요.',
};

// 1. 캐스터의 한마디 — Inputs: candidate-only (후보 등록 시 1회 생성, 영구 캐싱 가능)
// headline은 CASTER_HEADLINE 재사용 — TeaserCard.recommendation 과 같은 카피.
const MOCK_CASTER_NOTE = {
  headline: CASTER_HEADLINE,
  charmBullets: [
    '<b>매일 꾸준히 연락</b>하고 곁에 있어주는 다정한 타입',
    '<b>비흡연·저음주</b> 라이프, 차분하게 자기 리듬 챙기는 사람',
    '<b>옷핏 좋은 체형</b>에 단정하고 깔끔한 분위기',
  ],
};

// 4. CandidateDetailSection narratives — 후보 설문 답변 + 자기소개 + 사진 기반 LLM 생성. 각 4~5문장.
const MOCK_CHAPTER2_NARRATIVES = {
  personality:
    '조용히 자기 일에 몰입하는 ISFJ답게, 회사원으로서 매일을 안정감 있게 굴려가는 분이에요. 본인을 소개하실 때 차분하고 정돈된 말투를 쓰고, 사진에서도 같은 결의 단정한 분위기가 일관되게 보여서 인상이 흔들리지 않아요. 한번 마음을 정한 사람한테는 <b>말보다 행동으로 챙기는</b> 타입이라, 약속한 건 빠뜨리지 않고 사소한 디테일도 놓치지 않아요. 처음엔 말수가 적어 보여도, 같이 시간을 보낼수록 자기 사람을 위한 다정함이 자연스럽게 드러나는 분이에요.',
  datingStyle:
    '거의 매일 만나고 싶어하고, 수시로 연락 주고받는 페이스를 편하게 여기는 분이에요. 큰 이벤트로 한 번에 마음을 표현하기보다는 출근길 안부, 점심 메뉴 사진, 퇴근하고 어땠는지 묻는 메시지 같은 일상의 작은 순간들로 관계를 채우는 스타일이에요. ISFJ답게 표현보다 행동으로 챙기는 사람이라, 약속한 거 잊지 않고 사소한 기념일도 잘 기억해요. 만난 지 오래되어도 <b>매일이 새로운 느낌</b>이 드는 사람이라, 같이 있으면 따뜻함이 일상에 자연스럽게 스며들어요.',
  weekendStyle:
    '주말에는 카페나 영화처럼 차분한 문화 데이트를 좋아하는 분이에요. 비흡연에 음주도 거의 안 하시는 라이프라, 주말에 술자리보다는 햇볕 좋은 카페에 앉아 책 읽거나, 새로 나온 전시 한 번 같이 가는 시간을 더 좋아할 거예요. 평일에 회사원으로 바쁘게 지내다 보니 주말에는 무리하지 않고 자기 페이스대로 쉬는 걸 챙기는 분이라, 같이 보내는 시간도 부담 없이 편안하게 흘러요. <b>큰 약속보다는 동네 산책 한 시간</b> 같은 일상이 더 어울리는 분이에요.',
};

// ── Page ──────────────────────────────────────────────────────────────────

export default function CastingTemplatePreviewPage() {
  const reportUid = 'TEMPLATE-PREVIEW';

  return (
    <main className="max-w-[480px] mx-auto pb-[60px] relative bg-brand-bg min-h-screen font-body text-brand-ink">
      <ReportShell reportId={reportUid} tone="formal" variant="paid">
        <TopNav publishedAt={MOCK_PUBLISHED_AT} />
        <HeroV2 userName={MOCK_USER_NAME} />

        {/* 1. 캐스터의 한마디 */}
        <CasterNoteSection
          headline={MOCK_CASTER_NOTE.headline}
          charmBullets={MOCK_CASTER_NOTE.charmBullets}
        />

        {/* 2. 찾아온 경로 */}
        <HuntBoxV2
          stats={MOCK_HUNT_STATS}
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

        {/* 3. 상대 카드 */}
        <TrackSection section="teaser_card" reportId={reportUid}>
          <TeaserCardV2 candidate={MOCK_CANDIDATE} />
        </TrackSection>

        {/* TeaserCard 뒤 ReadingCardV2 (의뢰인에게 쓰는 메모) — 5블록 구조: lead/viewerInsight/matchOpening/candidateMatch/outro */}
        <ReadingCardV2
          userName={MOCK_USER_NAME}
          narratives={{
            viewerInsight: MOCK_READING_CARD.viewerInsight,
            matchOpening: MOCK_READING_CARD.matchOpening,
            candidateMatch: MOCK_READING_CARD.candidateMatch,
          }}
        />

        {/* 4. 상대 설명 챕터 */}
        <TrackSection section="chapter1" reportId={reportUid}>
          <CandidateDetailSection
            userName={MOCK_USER_NAME}
            candidate={MOCK_CANDIDATE}
            narratives={MOCK_CHAPTER2_NARRATIVES}
          />
        </TrackSection>

        {/* 4.5 매칭도 레이더 V2 */}
        <TrackSection section="chapter3" reportId={reportUid}>
          <Chapter3V2 match={MOCK_MATCH} number="CHAPTER 2" />
        </TrackSection>

        {/* 4.6 만약 두 사람이 만난다면 — 시뮬레이션 (mock scene image) */}
        <Chapter4Simulation
          match={MOCK_MATCH}
          number="CHAPTER 3"
          sceneImage="/images/simulation/c324be08-meeting.jpg"
        />

        {/* 절취선 — 위 섹션과 의뢰서 복기 분리 */}
        <div className="px-7 mt-14 mb-3">
          <div className="border-t border-dashed border-brand-ink/30" />
        </div>

        {/* 5. 네 의뢰서 카드 복기 */}
        <ApplicationSummary userAnswers={MOCK_USER_ANSWERS} />

        <MeetOrPassCta reportId={reportUid} />

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
