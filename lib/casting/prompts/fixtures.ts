// 캐스팅 프롬프트 테스트용 페르소나 fixture
// docs/casting-template/example-user-answers.md 와 sync 유지.
// 출처: casting.casting_guests.answers, KST 2026-05-02 14:00 이후 신규 form

export type CastingAnswers = Record<string, string>;

export interface PersonaFixture {
  id: string;
  label: string;
  oneLiner: string;
  answers: CastingAnswers;
}

export const PERSONA_FIXTURES: PersonaFixture[] = [
  {
    id: 'persona-enfp-jinju',
    label: 'P1: ENFP 23세 진주 (외향 + 진지)',
    oneLiner:
      '여 23세 ENFP 학생, 진주, "ISFP랑 잘 맞아" + 연상 선호 + 진지 연애. 자유서술 명확.',
    answers: {
      '반가워! 성별이 어떻게 돼?': 'female',
      '어떤 사람이 끌려?': 'competence',
      '상대 나이는 어느 정도?': 'older',
      '키는 어느 정도?': 'pref_male_height_180_plus',
      '체형은 어땠음 해?': 'pref_male_average',
      '얼마나 자주 만나고 싶어?': 'flexible_meet',
      '연락은 얼마나 자주가 좋아?': 'contact_relaxed',
      '넌 지금 얼마나 진지해?': 'serious_dating',
      '연인이 술 마시는 건 어때?': 'pref_drink_sometimes',
      '연인이 담배 피운다면?': 'pref_smoke_meh',
      '상대 종교는 중요해?': 'pref_any_religion',
      '넌 종교가 뭐야?': 'none',
      '상대와 거리는 어디까지?': 'long_distance',
      '넌 어디쯤 사는데?': 'other_region',
      '어디쯤 살아?': 'other_region:진주',
      '넌 나이가 어떻게 돼?': '23',
      '키가 어떻게 돼?': '163',
      '네 체형을 알려줘': 'self_average',
      '넌 담배 피워?': 'no_smoke',
      '술은 자주 마셔?': 'rarely_drink',
      'MBTI 뭐야?': 'ENFP',
      '넌 어떤 일 해?': 'student',
      '연소득은 얼마야?': 'under_30',
      '나한테 하고 싶은 말':
        '난 isfp 랑 잘 맞아!\n연상을 선호하지만 나이 차이가 많이 안났으면 좋겠어\n애같은 성격은 싫고 어른스러웠으면 좋겠어',
    },
  },
  {
    id: 'persona-intj-incheon',
    label: 'P2: INTJ 30세 인천 (내향 + 라이프 정렬형, 남)',
    oneLiner:
      '남 30세 INTJ 특송업, 인천, 키 185, 외형 무관 + 운동 취미인 상대 선호 + 진지 연애. 비흡연·거의 음주 X.',
    answers: {
      '반가워! 성별이 어떻게 돼?': 'male',
      '어떤 사람이 끌려?': 'vibe',
      '상대 나이는 어느 정도?': 'any_age',
      '키는 어느 정도?': 'any_height',
      '체형은 어땠음 해?': 'any_body',
      '얼마나 자주 만나고 싶어?': 'flexible_meet',
      '연락은 얼마나 자주가 좋아?': 'contact_anytime',
      '넌 지금 얼마나 진지해?': 'serious_dating',
      '연인이 술 마시는 건 어때?': 'pref_drink_sometimes',
      '연인이 담배 피운다면?': 'pref_smoke_no',
      '상대 종교는 중요해?': 'pref_no_religion',
      '상대와 거리는 어디까지?': 'same_city',
      '넌 어디쯤 사는데?': 'incheon',
      '넌 나이가 어떻게 돼?': '30',
      '키가 어떻게 돼?': '185',
      '네 체형을 알려줘': 'self_average',
      '넌 담배 피워?': 'no_smoke',
      '술은 자주 마셔?': 'rarely_drink',
      'MBTI 뭐야?': 'INTJ',
      '넌 어떤 일 해?': 'other_job',
      '직업이 정확히 뭐야?': '특송업',
      '연소득은 얼마야?': '30_50',
      '나한테 하고 싶은 말': '헬스나 러닝같은 운동이 취미인 사람이 좋을꺼같아',
    },
  },
  {
    id: 'persona-istp-seoul',
    label: 'P3: ISTP 21세 서울 (외형 디테일 강한 케이스)',
    oneLiner:
      '여 21세 ISTP 학생, 서울, 키 180+ 보통 체형 선호 + 가벼운 만남 지향. 자유서술에 외형 디테일 폭탄.',
    answers: {
      '반가워! 성별이 어떻게 돼?': 'female',
      '어떤 사람이 끌려?': 'appearance',
      '상대 나이는 어느 정도?': 'older',
      '키는 어느 정도?': 'pref_male_height_180_plus',
      '체형은 어땠음 해?': 'pref_male_average',
      '얼마나 자주 만나고 싶어?': 'weekly_1_2',
      '연락은 얼마나 자주가 좋아?': 'contact_anytime',
      '넌 지금 얼마나 진지해?': 'casual_chat',
      '연인이 술 마시는 건 어때?': 'pref_drink_any',
      '연인이 담배 피운다면?': 'pref_smoke_meh',
      '상대 종교는 중요해?': 'pref_any_religion',
      '넌 종교가 뭐야?': 'none',
      '상대와 거리는 어디까지?': 'same_city',
      '넌 어디쯤 사는데?': 'seoul',
      '넌 나이가 어떻게 돼?': '21',
      '키가 어떻게 돼?': '164',
      '네 체형을 알려줘': 'self_slim',
      '넌 담배 피워?': 'no_smoke',
      '술은 자주 마셔?': 'sometimes_drink',
      'MBTI 뭐야?': 'ISTP',
      '넌 어떤 일 해?': 'student',
      '연소득은 얼마야?': 'under_30',
      '나한테 하고 싶은 말':
        '강아지상에 눈매 둥글고 피부 깨끗하고 코 크지 않고 높고 덮머 비율 좋고 성숙한 사람이 좋아 옷도 깔끔하게 잘 입고 꾸밀 때는 꾸밀 줄 아는 사람 운동도 취미로 하면 좋을 거 같아',
    },
  },
];

export function getPersona(id: string): PersonaFixture | undefined {
  return PERSONA_FIXTURES.find((p) => p.id === id);
}
