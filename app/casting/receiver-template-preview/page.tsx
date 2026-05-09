// like 받은 사람(B)용 매칭 페이지 — 디자인 검수 페이지.
// 라우트: /casting/receiver-template-preview
//
// 데이터: 정적 mock ReceiverContent. B 입장에서 발신자(A) 정보를 보여줌.
// 우리 서비스는 사용자 이름을 받지 않으므로 호칭은 모두 "당신" 톤.
// 추후 실제 라우트(/casting/reports/receiver-recommendation/[uid]) 에서 동일 렌더러 사용 예정.

import type { UserAnswers } from '@/lib/personalization/types';
import type { ReceiverContent } from '@/lib/casting/receiver/schema';
import { ReceiverMatchReport } from './_components/ReceiverMatchReport';

// receiver(B) 본인의 설문 답변. ApplicationSummary 에 표시.
const MOCK_USER_ANSWERS: UserAnswers = {
  idealType: {
    attractionFactor: '진중하고 따뜻한 사람',
    agePreference: '비슷한 나이',
    heightPreference: '상관없어',
    bodyType: '평균',
    contactStyle: '자주 연락하는 편',
    dealBreaker: '말이 거친 사람',
    religionImportance: '상관없어',
  },
  selfInfo: {
    gender: '여자',
    location: '서울',
    occupation: '회사원',
    age: '28',
    height: '163',
    datingFrequency: '주 1번 정도',
    mbti: 'INFJ',
  },
  freeResponse: {
    strictCriteria: '대화가 잘 통하는 사람, 자기 일에 진심인 사람',
  },
  personality: {
    jealousy: '거의 안 해',
    conflictStyle: '대화로 풀어',
    selfDescription: 'thoughtful,calm,sincere',
  },
};

const MOCK_RECEIVER_CONTENT: ReceiverContent = {
  // ── 발신자(A) 메타 ──
  senderFaceType: '단단한 인상, 정돈된 분위기',
  senderAgeRange: '20대 후반',
  senderOccupation: '엔지니어',
  senderMbti: 'INTJ',
  senderHeight: '178cm',

  // ── CasterNote: 캐스터가 발신자를 받는 이에게 소개 ──
  senderHeadline: '자기 일에 진심이고, 대화의 무게를 아는 사람',
  senderCharmBullets: [
    '<b>자기 분야에 깊게 몰입</b>하는 진중한 태도',
    '<b>한 번 대화하면</b> 끝까지 책임지는 결',
    '<b>차분하고 듬직</b>한 분위기',
  ],

  // ── ReadingCardV2 ──
  viewerInsight:
    '당신은 <b>"대화가 잘 통하는 사람"</b>과 <b>"자기 일에 진심인 사람"</b>을 찾고 계신데, 이 표현이 당신이 어떤 분인지를 잘 보여줘요. 일에서도 사람과의 관계에서도 깊이를 중요하게 여기시는 분이고, 단단한 자기 세계를 가진 상대를 알아보는 감각을 가지셨어요. 그래서 만났을 때 직관적으로 결이 맞는지를 판단하시는 분이에요.',
  senderProfile:
    '이 사람은 엔지니어답게 <b>자기 분야에 깊이 몰입</b>하는 분이고, 한 번 마음을 정하면 흔들리지 않는 단단함을 가진 분이에요. 큰 자리보단 신뢰가 쌓인 한 사람과의 깊은 대화를 더 편하게 여기는 결이라, 당신이 추구하시는 관계의 톤과 잘 맞아요. 처음엔 무뚝뚝해 보여도 시간이 갈수록 듬직함이 보이는 사람이에요.',

  // ── CHAPTER 1: A의 성향 ──
  personality:
    '엔지니어답게 <b>구조적이고 깊게 사고</b>하는 분이에요. 자기 분야에 진심으로 몰입하는 태도가 일상 곳곳에서 묻어나고, 한 번 정한 방향에 대해서는 흔들림 없이 끝까지 가는 단단함이 있어요. 큰 자리보단 <b>한두 명과의 깊은 대화</b>에서 더 편안함을 느끼는 분이에요.',
  datingStyle:
    '연애에서도 <b>꾸준하고 일관된 톤</b>으로 관계를 챙기는 스타일이에요. 큰 이벤트보다 매일의 작은 디테일 — 안부 한 마디, 함께한 시간에 대한 기억 — 로 관계가 채워지는 결이에요. 한 번 마음을 정하면 깊이 책임지는 타입이라, 연락도 비슷한 결로 흘러갈 거예요.',
  weekendStyle:
    '주말은 <b>혼자만의 정리 시간</b>과 <b>가까운 사람과의 깊은 대화</b>가 균형 잡힌 분이에요. 큰 모임보단 작은 카페나 산책길처럼 조용한 공간을 더 좋아하고, 책 한 권·전시 한 곳·새 프로젝트 한 가지처럼 <b>몰입할 수 있는 무언가</b>를 매주 챙기는 분이에요.',

  // ── CHAPTER 2: 4축 양극 ──
  bipolarValues: {
    energy: 35, // 외향 35% → 내향 65%
    judgment: 70, // 이성 70% → 감성 30%
    selfExpression: 75, // 차분 75% → 활발 25%
    behavior: 35, // 모험 35% → 안정 65%
  },
  spectrumNotes: [
    '<b>내향적인 결</b>이 짙어요. 사람 많은 자리보단 <b>한두 명과 깊이</b> 보내는 시간을 더 챙기는 분이에요.',
    '판단은 <b>이성적인 쪽</b>으로 기울어져 있어요. 감정에 휩쓸리지 않고 침착하게 상황을 정리하는 분이라, 당신이 안정감을 느끼실 거예요.',
    '안정 추구가 살짝 더 강해요. 익숙한 동네 카페·매주 가는 산책길처럼 <b>꾸준한 루틴</b>을 좋아하는 분이에요.',
  ],

  // ── CHAPTER 3: 첫 만남 시뮬레이션 ──
  simulation:
    '첫 만남은 <b>조용한 동네 카페</b>나 <b>책방 근처 산책</b>이 어울릴 거예요. 두 분 다 큰 자리보다 차분한 공간에서 호흡이 잘 풀리는 결이라, 자리만 잡으면 시간이 자연스럽게 흐를 거예요.\n\n이 분이 처음 건넬 말은 아마도 <b>"오늘 시간 내주셔서 감사해요. 어떻게 지내세요?"</b> 같은, 무게가 가볍지만 진심이 담긴 인사일 거예요. 당신이 좋아하실 결로 자연스럽게 시작될 거예요.',
};

// `?cta=meet` / `?cta=pass` 로 후속 단계 화면을 직접 진입할 수 있게 함 (디자인 검수용).
// mock 페이지라 실제 fetch 는 백엔드에서 404 떨어지므로 query 로만 stage 강제.
type SearchParams = Promise<{ cta?: string }>;

export default async function CastingReceiverTemplatePreviewPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  return (
    <ReceiverMatchReport
      reportUid="RECEIVER-TEMPLATE-PREVIEW"
      publishedAt="2026.05.09"
      viewerAnswers={MOCK_USER_ANSWERS}
      senderLocation="서울"
      content={MOCK_RECEIVER_CONTENT}
      initialCta={sp.cta}
    />
  );
}
