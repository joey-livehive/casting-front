// 인스타그램 발견 후보용 매칭 페이지 — 디자인 검수 페이지.
// 라우트: /casting/insta-template-preview
//
// 데이터: 정적 mock InstaContent. 실제 LLM 통한 동적 페이지는 /casting/insta-prompt-test.
// 두 페이지 모두 같은 <InstaMatchReport> 렌더러 사용 → 데이터 소스만 다름.

import type { UserAnswers } from '@/lib/personalization/types';
import type { InstaContent } from '@/lib/casting/insta/schema';
import { InstaMatchReport } from './_components/InstaMatchReport';

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

const MOCK_INSTA_CONTENT: InstaContent = {
  faceType: '깊이 있는 분위기, 옷 잘 입는 타입',
  ageRangeEstimate: '20대 후반',
  occupationEstimate: '디자이너',
  mbtiEstimate: 'INFJ',
  heightEstimate: '180cm',

  casterHeadline: '취향이 단단하고, 자기 세계가 있는 사람',
  casterCharmBullets: [
    '<b>피드 전체에서 일관된 취향</b> — 흔들리지 않는 분위기',
    '<b>전시·필름 사진</b>처럼 차분한 콘텐츠 결',
    '<b>옷 잘 입는</b> 단정한 분위기',
  ],

  viewerInsight:
    '본인을 소개하실 때 <b>"분위기 좋은 사람"</b>과 <b>"취향이 비슷한 사람"</b>이라고 하셨는데, 이 표현이 의뢰인님이 어떤 분인지 잘 보여줘요. 큰 이벤트보다 <b>일상의 결</b>로 사람을 알아가는 분이고, 사진 한 장·말 한 줄에서 그 사람의 취향을 읽어내는 감각을 가지셨어요. 그래서 만났을 때 직관적으로 결이 맞는지를 판단하시는 분이에요.',
  matchOpening:
    '그래서 이 분이 잘 어울릴 것 같아요. <b>피드 전체에서 일관된 취향</b>이 보이고, 의뢰인님이 좋아하시는 분위기 있는 결을 가진 분이에요.',
  candidateMatch:
    '이 사람은 디자이너답게 <b>시각적 디테일</b>에 예민한 분이고, 사진·전시·작은 카페처럼 의뢰인님이 좋아하실 만한 공간을 자연스럽게 찾아다니는 분이에요. 인스타 피드에서 보이는 결이 흔들리지 않아서, 만났을 때도 동일한 분위기일 가능성이 높아요. 처음엔 말수가 적어 보여도 같이 시간을 보낼수록 깊이가 보이는 사람이에요.',

  personality:
    '디자이너답게 <b>시각적 디테일</b>에 예민하고, 자기 취향이 단단한 분이에요. 인스타 피드 전체에서 결이 일관되게 보여서, 만났을 때도 동일한 분위기가 이어질 가능성이 높아요. 큰 자리보단 <b>한두 명과의 깊은 대화</b>를 더 편하게 여기는 결이 사진에서 자연스럽게 묻어나요.',
  datingStyle:
    '연애에서도 <b>일상의 결</b>로 사람을 알아가는 스타일일 거예요. 큰 이벤트보다 매일의 작은 디테일 — 같이 본 전시 사진, 새로 발견한 카페 공유 같은 — 로 관계가 채워지는 결이에요. 인스타 활동 패턴을 보면 한 번에 몰아 올리지 않고 <b>꾸준히 결을 챙기는</b> 타입이라, 연락도 비슷한 결로 흘러갈 거예요.',
  feedCharm:
    '인스타 피드 전체에서 결이 일관되게 흘러요. <b>차분하고 단정한 톤</b>이 흐트러지지 않고, 전시·필름 사진처럼 <b>취향이 또렷한</b> 콘텐츠로 큐레이션돼 있어요. 옷이나 소품 디테일에서도 미감이 자연스럽게 묻어나고, 캡션은 <b>짧고 절제</b>돼 있어서 자기 결이 분명한 인상을 줘요. 의뢰인님이 좋아하시는 <b>분위기 있는 사람</b>의 결이에요.',

  // bipolarValues: 0=좌측 라벨 fully, 100=우측 라벨 fully. 우측 비율과 동치.
  bipolarValues: {
    energy: 45,         // 외향 45% → 내향 55%
    judgment: 40,       // 이성 40% → 감성 60%
    selfExpression: 65, // 차분 65% → 활발 35%
    behavior: 60,       // 모험 60% → 안정 40%
  },
  spectrumNotes: [
    '<b>내향적인 결</b>이 살짝 짙어요. 사람 많은 자리보다 <b>한두 명과 깊이</b> 보내는 시간을 더 챙기는 사람일 거예요.',
    '자기표현은 <b>차분한 결</b>이 강해요. 피드 톤이 일관되고 잔잔해서, 의뢰인님이 좋아하시는 <b>분위기 있는 결</b>과 맞물려요.',
    '안정과 모험이 거의 균형이라, <b>익숙한 동네 카페</b>도, <b>새로운 전시</b>도 같이 찾아다닐 수 있는 분위기예요.',
  ],

  simulation:
    '첫 만남은 <b>한적한 동네 전시</b>나 <b>필름 사진관 근처 카페</b>가 어울릴 거예요. 두 분 다 큰 자리보다 조용한 공간에서 호흡이 잘 풀리는 결이라, 자리만 잡으면 시간이 자연스럽게 흐를 거예요.\n\n인스타 피드에서 보이는 결이 의뢰인님 취향과 결이 비슷해서, 처음부터 <b>"여기 분위기 좋네요"</b> 정도의 가벼운 코멘트로도 대화가 자연스럽게 시작될 거예요.',
};

export default function CastingInstaTemplatePreviewPage() {
  return (
    <InstaMatchReport
      reportUid="INSTA-TEMPLATE-PREVIEW"
      publishedAt="2026.05.07"
      viewerName="의뢰인"
      viewerAnswers={MOCK_USER_ANSWERS}
      huntStats={MOCK_HUNT_STATS}
      content={MOCK_INSTA_CONTENT}
      candidateLocation="서울"
    />
  );
}
