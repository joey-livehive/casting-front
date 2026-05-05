import { ReportData } from './types';

const femaleReport: ReportData = {
  reportId: 'STO-2604-F01',
  gender: 'F',
  tone: 'casual',
  userName: '의뢰인',
  publishedAt: '2026.04.22',
  huntStats: {
    offlineGyms: 3,
    instagramProfiles: 42,
    linkedinProfiles: 18,
    communities: 5,
  },
  effort: {
    castingHours: 23,
    verificationMeetings: 12,
  },
  totalCandidates: 5,
  teaserCandidate: {
    nickname: '○○○',
    faceType: '서글서글한 강아지상',
    ageRange: '21~24세',
    ageDetail: '',
    occupation: 'IT 스타트업',
    occupationDetail: 'PM',
    personality: '따뜻한 현실주의자',
    location: '강남구',
    foundAt: '강남 ◯◯◯◯ 헬스장',
    hobbies: {
      visible: ['헬스', '러닝', '독서'],
      hidden: 3,
    },
    daySchedule: [
      { time: '06:30', activity: '아침 러닝 5km. 루틴 지킨 지 <blur>◯◯개월</blur> 됐대.' },
      { time: '09:00', activity: '<blur>◯◯◯</blur> 출근. 회의가 많은 요일엔 일찍 시작해.' },
      { time: '19:30', activity: '헬스장에서 운동 1시간. 주 <blur>◯회</blur> 꾸준히 가는 편.' },
      { time: '22:00', activity: '저녁엔 책이나 <blur>◯◯◯◯</blur>. 조용히 마무리하는 타입.' },
    ],
    background: '서울에서 자랐고, <blur>◯◯대학교</blur>에서 <blur>◯◯공학</blur>을 전공. 첫 직장은 대기업이었지만 2년 만에 나와서 지금 스타트업으로 옮긴 케이스야. 변화를 두려워하지 않는 사람.',
    secretAppeal: '의뢰인님이 좋아할 만한 <blur>◯◯◯◯</blur>한 ◯◯ 한 가지',
    teaserPhoto: '/images/casting/casting_man.webp',
    detailPhoto: '/images/casting/casting_man.webp',
  },
  match: {
    matchRate: 93,
    topPercent: 2,
    radarData: {
      labels: ['정서적\n안정감', '자기\n몰입도', '커뮤니케이션', '유머 코드', '생활 템포', '가치관'],
      userDesired: [9, 8, 8.5, 7, 7.5, 8],
      candidateActual: [7.2, 6.5, 8, 7.5, 7, 8.2],
    },
    simulation: '첫 만남은 <b>조용한 <blur>◯◯◯</blur></b>가 어울릴 거야. 이 분은 시끄러운 곳보다 대화가 자연스럽게 흘러가는 공간을 선호해. 의뢰인님도 비슷한 걸 편안해하잖아. 한 잔 두고 <b><blur>◯~◯시간</blur> 얘기</b>하는 게 딱이야. 두 번째 만남쯤엔 이 분이 먼저 <b>작은 디테일</b>을 기억해서 꺼낼 거야. 그때 네가 "어, 그거 기억해?"라고 놀라는 표정 지으면, 이 분 속으로 웃을 거야. 그런 타입이거든.',
    notes: [
      '<b>정서적 안정감</b> 축에서 겹침. 네가 원하는 수준(9)을 이 사람이 거의 그대로 충족해(8.7).',
      '<b>자기 몰입도</b> 축도 높아. 커리어든 취미든 자기 세계가 있는 사람이라 서로 독립적으로 있을 시간이 생겨도 불안하지 않을 거야.',
      '<b>커뮤니케이션 스타일</b>도 맞아. 갈등을 회피하지 않고 대화로 풀어내는 타입이라서, 너랑 부딪혀도 건강하게 해결할 수 있어.',
    ],
  },
  remainingPhotos: [
    '/images/teaser/f01-extra1.webp',
    '/images/teaser/f01-extra2.webp',
    '/images/teaser/f01-extra3.webp',
    '/images/teaser/f01-extra4.webp',
  ],
};

const maleReport: ReportData = {
  reportId: 'STO-2604-M01',
  gender: 'M',
  tone: 'casual',
  userName: '의뢰인',
  publishedAt: '2026.04.22',
  huntStats: {
    offlineGyms: 2,
    instagramProfiles: 38,
    linkedinProfiles: 14,
    communities: 6,
  },
  effort: {
    castingHours: 21,
    verificationMeetings: 10,
  },
  totalCandidates: 5,
  teaserCandidate: {
    nickname: '○○○',
    faceType: '단아한 고양이상',
    ageRange: '21~24세',
    ageDetail: '',
    occupation: '브랜드 디자이너',
    occupationDetail: '시니어',
    personality: '호기심 많은 따뜻함',
    location: '마포구',
    foundAt: '연남 ◯◯◯◯ 요가 스튜디오',
    hobbies: {
      visible: ['요가', '필름 카메라', '도자기'],
      hidden: 3,
    },
    daySchedule: [
      { time: '07:30', activity: '아침 요가 1시간. 주 <blur>◯회</blur> 출석 중이래.' },
      { time: '10:00', activity: '<blur>◯◯◯◯</blur> 출근. 사무실보단 재택이 많은 편.' },
      { time: '19:00', activity: '퇴근 후 친구랑 저녁. 모임엔 <blur>◯◯◯◯</blur> 위주.' },
      { time: '22:30', activity: '집에서 필름 카메라 정리하거나 <blur>◯◯◯◯</blur>.' },
    ],
    background: '부산에서 자랐고, <blur>◯◯미대</blur> 졸업 후 서울에서 에이전시 3년 → 지금은 인하우스 브랜드팀. <blur>◯◯◯◯</blur> 브랜드에서 아이덴티티 작업을 맡고 있어. 감각이 뚜렷한 사람.',
    secretAppeal: '의뢰인님이 끌릴 만한 <blur>◯◯◯◯</blur>한 ◯◯ 한 가지',
    teaserPhoto: '/images/casting/casting_woman_1.webp',
    detailPhoto: '/images/casting/casting_woman_1.webp',
  },
  match: {
    matchRate: 91,
    topPercent: 3,
    radarData: {
      labels: ['감수성', '자기\n표현력', '커뮤니케이션', '유머 코드', '생활 템포', '가치관'],
      userDesired: [8.5, 8, 8.5, 8, 7, 8],
      candidateActual: [6.8, 6.2, 8, 7.5, 7.5, 8.2],
    },
    simulation: '첫 만남은 <b>작은 <blur>◯◯</blur></b>가 어울릴 거야. 이 분은 큰 데이트보다 일상 속 장소에서 서로의 반응을 보는 걸 더 좋아해. 의뢰인님도 조용한 공간에서 더 편해지잖아. 전시 한 바퀴 돌고, 근처 <b>작은 <blur>◯◯◯</blur>에서 한 잔</b>이 딱이야. 두 번째 만남엔 이 분이 자기 작업 얘기를 슬쩍 꺼낼 거야. 처음 만났을 땐 거의 안 해. 네가 <b>진지하게 듣는 태도</b>만 보여줘도, 이 분 속으로 엄청 긍정적으로 평가할 거야.',
    notes: [
      '<b>감수성</b> 축에서 겹침. 네가 원하는 수준(8.5)을 이 사람이 그대로 넘어(8.8).',
      '<b>자기 표현력</b>이 높아. 직업적으로 자기를 드러내는 훈련이 돼 있어서, 말로도 행동으로도 네게 잘 전달할 거야.',
      '<b>커뮤니케이션 스타일</b>도 맞아. 직선적이지만 무겁지 않게, 피드백을 일상 대화로 풀어내는 타입이야.',
    ],
  },
  remainingPhotos: [
    '/images/teaser/m01-extra1.webp',
    '/images/teaser/m01-extra2.webp',
    '/images/teaser/m01-extra3.webp',
    '/images/teaser/m01-extra4.webp',
  ],
};

const femaleReportFormal: ReportData = {
  ...femaleReport,
  reportId: 'STO-2604-F02',
  tone: 'formal',
  teaserCandidate: {
    ...femaleReport.teaserCandidate,
    daySchedule: [
      { time: '06:30', activity: '아침 러닝 5km. 루틴 지킨 지 <blur>◯◯개월</blur> 됐대요.' },
      { time: '09:00', activity: '<blur>◯◯◯</blur> 출근. 회의가 많은 요일엔 일찍 시작해요.' },
      { time: '19:30', activity: '헬스장에서 운동 1시간. 주 <blur>◯회</blur> 꾸준히 가는 편이에요.' },
      { time: '22:00', activity: '저녁엔 책이나 <blur>◯◯◯◯</blur>. 조용히 마무리하는 타입이에요.' },
    ],
    background:
      '서울에서 자랐고, <blur>◯◯대학교</blur>에서 <blur>◯◯공학</blur>을 전공하셨어요. 첫 직장은 대기업이었지만 2년 만에 나와서 지금 스타트업으로 옮긴 케이스예요. 변화를 두려워하지 않는 분이세요.',
  },
  match: {
    ...femaleReport.match,
    simulation:
      '첫 만남은 <b>조용한 <blur>◯◯◯</blur></b>가 어울릴 거예요. 이 분은 시끄러운 곳보다 대화가 자연스럽게 흘러가는 공간을 선호하세요. 의뢰인님도 비슷한 걸 편안해하시잖아요. 한 잔 두고 <b><blur>◯~◯시간</blur> 얘기</b>하는 게 딱이에요. 두 번째 만남쯤엔 이 분이 먼저 <b>작은 디테일</b>을 기억해서 꺼낼 거예요. 그때 "어, 그거 기억하세요?"라고 놀라는 표정 지으시면, 이 분 속으로 웃으실 거예요. 그런 타입이시거든요.',
    notes: [
      '<b>정서적 안정감</b> 축에서 겹쳐요. 의뢰인님이 원하시는 수준(9)을 이 사람이 거의 그대로 충족해요(8.7).',
      '<b>자기 몰입도</b> 축도 높아요. 커리어든 취미든 자기 세계가 있는 분이라 서로 독립적으로 있을 시간이 생겨도 불안하지 않으실 거예요.',
      '<b>커뮤니케이션 스타일</b>도 맞아요. 갈등을 회피하지 않고 대화로 풀어내는 타입이라서, 부딪히셔도 건강하게 해결하실 수 있어요.',
    ],
  },
};

const maleReportFormal: ReportData = {
  ...maleReport,
  reportId: 'STO-2604-M02',
  tone: 'formal',
  teaserCandidate: {
    ...maleReport.teaserCandidate,
    daySchedule: [
      { time: '07:30', activity: '아침 요가 1시간. 주 <blur>◯회</blur> 출석 중이시래요.' },
      { time: '10:00', activity: '<blur>◯◯◯◯</blur> 출근. 사무실보단 재택이 많은 편이에요.' },
      { time: '19:00', activity: '퇴근 후 친구분들이랑 저녁. 모임엔 <blur>◯◯◯◯</blur> 위주로 가세요.' },
      { time: '22:30', activity: '집에서 필름 카메라 정리하시거나 <blur>◯◯◯◯</blur> 하세요.' },
    ],
    background:
      '부산에서 자라셨고, <blur>◯◯미대</blur> 졸업 후 서울에서 에이전시 3년 → 지금은 인하우스 브랜드팀에 계세요. <blur>◯◯◯◯</blur> 브랜드에서 아이덴티티 작업을 맡고 계세요. 감각이 뚜렷한 분이세요.',
  },
  match: {
    ...maleReport.match,
    simulation:
      '첫 만남은 <b>작은 <blur>◯◯</blur></b>가 어울릴 거예요. 이 분은 큰 데이트보다 일상 속 장소에서 서로의 반응을 보는 걸 더 좋아하세요. 의뢰인님도 조용한 공간에서 더 편해지시잖아요. 전시 한 바퀴 돌고, 근처 <b>작은 <blur>◯◯◯</blur>에서 한 잔</b>이 딱이에요. 두 번째 만남엔 이 분이 자기 작업 얘기를 슬쩍 꺼내실 거예요. 처음 만나셨을 땐 거의 안 하시거든요. <b>진지하게 듣는 태도</b>만 보여주셔도, 이 분 속으로 엄청 긍정적으로 평가하실 거예요.',
    notes: [
      '<b>감수성</b> 축에서 겹쳐요. 의뢰인님이 원하시는 수준(8.5)을 이 사람이 그대로 넘어요(8.8).',
      '<b>자기 표현력</b>이 높으세요. 직업적으로 자기를 드러내는 훈련이 돼 있어서, 말로도 행동으로도 잘 전달하실 거예요.',
      '<b>커뮤니케이션 스타일</b>도 맞아요. 직선적이지만 무겁지 않게, 피드백을 일상 대화로 풀어내는 타입이세요.',
    ],
  },
};

const reports: Record<string, ReportData> = {
  [femaleReport.reportId]: femaleReport,
  [maleReport.reportId]: maleReport,
  [femaleReportFormal.reportId]: femaleReportFormal,
  [maleReportFormal.reportId]: maleReportFormal,
};

export function getReport(reportId: string): ReportData | null {
  return reports[reportId] ?? null;
}

export function getDefaultReport(reportId: string, gender: 'F' | 'M' = 'F'): ReportData {
  const base = gender === 'M' ? maleReportFormal : femaleReportFormal;
  return { ...base, reportId, tone: 'formal' };
}

export const mockReportIds = Object.keys(reports);
