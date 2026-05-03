# Example User Answers — casting DB 실데이터

LLM 프롬프트 작성 시 입력 예시 / few-shot / 테스트 케이스로 사용.

## 출처

- **DB**: `casting.casting_guests`
- **컬럼**: `answers` (JSON dict, `{"질문": "answer_code"}`)
- **시간 컷**: `created_at > '2026-05-02 05:00:00 UTC'` (= KST 14:00, 신규 캐스팅 form 배포 직후)
- **신규 form 특징**:
  - 본인 흡연 답변 (`넌 담배 피워?`) **포함** ✅
  - 본인 음주 답변 (`술은 자주 마셔?`) **포함** ✅
  - 연인 흡연 선호 (`연인이 담배 피운다면?`) **포함** ✅
  - 연소득, 직업 디테일, 성격, 자유서술(`나한테 하고 싶은 말`) 등 풍부
  - 답변값은 코드 (예: `pref_smoke_no`, `serious_dating`) — 라벨 매핑은 별도 survey-questions 문서 참조
- **PII**: 이름 미수집. `guest_uid` 앞 12자만 노출 (마스킹).

## 답변 코드 핵심 매핑 (작업 시 참고)

| 질문 | 코드 | 의미 |
|---|---|---|
| 어떤 사람이 끌려? | `appearance` / `vibe` / `competence` / `personality` | 외모 / 분위기 / 능력 / 성격 |
| 상대 나이 | `older` / `younger` / `same_age` / `any_age` | — |
| 상대 키 | `pref_male_height_172_plus` / `pref_male_height_180_plus` / `any_height` | — |
| 상대 체형 | `pref_male_muscular` / `pref_male_average` / `pref_male_slim` | — |
| 만남 빈도 | `weekly_1_2` / `weekly_3_4` / `flexible_meet` / `everyday_meet` | — |
| 연락 빈도 | `contact_anytime` / `contact_2_3h` / `contact_relaxed` / `any_frequency` | 수시로 / 2~3h 한번 / 여유롭게 / 무관 |
| 진지함 | `serious_dating` / `casual_chat` / `if_right` | 진지 연애 / 가볍게 / 인연 따라 |
| 연인 음주 | `pref_drink_no` / `pref_drink_sometimes` / `pref_drink_any` | 안 마셨으면 / 가끔 / 무관 |
| 연인 흡연 | `pref_smoke_no` / `pref_smoke_meh` / `pref_smoke_ok` | NO / 별로 / 무관 |
| 본인 흡연 | `no_smoke` / `sometimes_smoke` / `heavy_smoke` | 비흡연 / 가끔 / 자주 |
| 본인 음주 | `rarely_drink` / `sometimes_drink` / `often_drink` | 거의 X / 가끔 / 자주 |
| 본인 체형 | `self_slim` / `self_average` / `self_chubby` / `self_muscular` | — |

---

## Persona 1: 외향형 / 진지 + 가치관 명확

**guest_uid**: `g_c22e52d4ae53...`
**작성일**: 2026-05-02 17:56 KST
**한줄 페르소나**: ENFP 23세 학생(여), 연상 선호 + "ISFP랑 잘 맞아"라며 본인 인사이트 명확. 진지 연애 지향, 거리 무관(other_region:진주).

**의뢰인 모드 활용 포인트** (viewerBundle.readingViewerInsight):
- 자유서술에서 자기 인지 풍부: *"난 isfp랑 잘 맞아!"*, *"애같은 성격은 싫고 어른스러웠으면 좋겠어"* → 직접 인용으로 인격 묘사
- ENFP + 진지 연애 + 연상 선호 → **외향적이지만 안정감 추구**하는 결
- 키 180 이상 + 보통 체형 + 진지 → 외형/관계 다 명확

```json
{
  "반가워! 성별이 어떻게 돼?": "female",
  "어떤 사람이 끌려?": "competence",
  "상대 나이는 어느 정도?": "older",
  "키는 어느 정도?": "pref_male_height_180_plus",
  "체형은 어땠음 해?": "pref_male_average",
  "얼마나 자주 만나고 싶어?": "flexible_meet",
  "연락은 얼마나 자주가 좋아?": "contact_relaxed",
  "넌 지금 얼마나 진지해?": "serious_dating",
  "연인이 술 마시는 건 어때?": "pref_drink_sometimes",
  "연인이 담배 피운다면?": "pref_smoke_meh",
  "상대 종교는 중요해?": "pref_any_religion",
  "넌 종교가 뭐야?": "none",
  "상대와 거리는 어디까지?": "long_distance",
  "넌 어디쯤 사는데?": "other_region",
  "어디쯤 살아?": "other_region:진주",
  "넌 나이가 어떻게 돼?": "23",
  "키가 어떻게 돼?": "163",
  "네 체형을 알려줘": "self_average",
  "넌 담배 피워?": "no_smoke",
  "술은 자주 마셔?": "rarely_drink",
  "MBTI 뭐야?": "ENFP",
  "넌 어떤 일 해?": "student",
  "연소득은 얼마야?": "under_30",
  "나한테 하고 싶은 말": "난 isfp 랑 잘 맞아!\n연상을 선호하지만 나이 차이가 많이 안났으면 좋겠어\n애같은 성격은 싫고 어른스러웠으면 좋겠어"
}
```

---

## Persona 2: 내향형 / 차분 + 라이프스타일 정렬형 (남)

**guest_uid**: `g_001100c845...`
**작성일**: 2026-05-02 19:58 KST
**한줄 페르소나**: INTJ 30세 남, 특송업, 인천. 키 185 + 비흡연·거의 음주X. 나이/키/체형 다 무관, 운동 취미인 상대를 원함. 진지 연애 지향.

**의뢰인 모드 활용 포인트** (viewerBundle.readingViewerInsight):
- 외형 조건 거의 다 `any_*` (무관) → **외형보다 분위기·취미 정렬** 중요시
- 자유서술: *"헬스나 러닝같은 운동이 취미인 사람이 좋을꺼같아"* → 라이프스타일 정렬 키워드
- INTJ + 진지 + `contact_anytime` 수시 연락 → 깊이 있는 관계 추구
- 본인도 비흡연·거의 음주X → 라이프 호환 축에서 매칭 자연스러움

```json
{
  "반가워! 성별이 어떻게 돼?": "male",
  "어떤 사람이 끌려?": "vibe",
  "상대 나이는 어느 정도?": "any_age",
  "키는 어느 정도?": "any_height",
  "체형은 어땠음 해?": "any_body",
  "얼마나 자주 만나고 싶어?": "flexible_meet",
  "연락은 얼마나 자주가 좋아?": "contact_anytime",
  "넌 지금 얼마나 진지해?": "serious_dating",
  "연인이 술 마시는 건 어때?": "pref_drink_sometimes",
  "연인이 담배 피운다면?": "pref_smoke_no",
  "상대 종교는 중요해?": "pref_no_religion",
  "상대와 거리는 어디까지?": "same_city",
  "넌 어디쯤 사는데?": "incheon",
  "넌 나이가 어떻게 돼?": "30",
  "키가 어떻게 돼?": "185",
  "네 체형을 알려줘": "self_average",
  "넌 담배 피워?": "no_smoke",
  "술은 자주 마셔?": "rarely_drink",
  "MBTI 뭐야?": "INTJ",
  "넌 어떤 일 해?": "other_job",
  "직업이 정확히 뭐야?": "특송업",
  "연소득은 얼마야?": "30_50",
  "나한테 하고 싶은 말": "헬스나 러닝같은 운동이 취미인 사람이 좋을꺼같아"
}
```

---

## Persona 3: 외형 조건 강한 케이스 / 디테일 명세형

**guest_uid**: `g_0ffbd7daf3...`
**작성일**: 2026-05-02 20:44 KST
**한줄 페르소나**: ISTP 21세 학생(여), 서울. 키 180+ 보통 체형 + 가벼운 만남(`casual_chat`) 지향. 자유서술에 외형·태도 디테일 매우 풍부.

**의뢰인 모드 활용 포인트** (viewerBundle.readingViewerInsight):
- **자유서술 인용 폭탄**: *"강아지상에 눈매 둥글고 피부 깨끗하고 코 크지 않고 높고 덮머 비율 좋고 성숙한 사람"*, *"옷도 깔끔하게 잘 입고 꾸밀 때는 꾸밀 줄 아는 사람"* → 외형 디테일 짚기
- ISTP + 가벼운 만남 + `contact_anytime` → **꾸미는 디테일 + 가볍게 자주 보고 연락** 결합
- 외모 강조 + 매우 specific 한 외형 묘사 → "디테일 챙기는 분"이라는 인격 분석 가능

```json
{
  "반가워! 성별이 어떻게 돼?": "female",
  "어떤 사람이 끌려?": "appearance",
  "상대 나이는 어느 정도?": "older",
  "키는 어느 정도?": "pref_male_height_180_plus",
  "체형은 어땠음 해?": "pref_male_average",
  "얼마나 자주 만나고 싶어?": "weekly_1_2",
  "연락은 얼마나 자주가 좋아?": "contact_anytime",
  "넌 지금 얼마나 진지해?": "casual_chat",
  "연인이 술 마시는 건 어때?": "pref_drink_any",
  "연인이 담배 피운다면?": "pref_smoke_meh",
  "상대 종교는 중요해?": "pref_any_religion",
  "넌 종교가 뭐야?": "none",
  "상대와 거리는 어디까지?": "same_city",
  "넌 어디쯤 사는데?": "seoul",
  "넌 나이가 어떻게 돼?": "21",
  "키가 어떻게 돼?": "164",
  "네 체형을 알려줘": "self_slim",
  "넌 담배 피워?": "no_smoke",
  "술은 자주 마셔?": "sometimes_drink",
  "MBTI 뭐야?": "ISTP",
  "넌 어떤 일 해?": "student",
  "연소득은 얼마야?": "under_30",
  "나한테 하고 싶은 말": "강아지상에 눈매 둥글고 피부 깨끗하고 코 크지 않고 높고 덮머 비율 좋고 성숙한 사람이 좋아 옷도 깔끔하게 잘 입고 꾸밀 때는 꾸밀 줄 아는 사람 운동도 취미로 하면 좋을 거 같아"
}
```

---

## 페어링 추천 (PAIR BUNDLE 테스트용)

Prompt 2 테스트 시 아래 페어링 활용. 신규 form 답변자끼리 매칭하면 흡연/음주/거리 6축이 모두 채워져 의미 있는 notes 4개 생성 가능.

| viewer | candidate | 의도 |
|---|---|---|
| Persona 1 (여 ENFP 진주) | Persona 2 (남 INTJ 인천) | 거리 멀지만 진지 연애 + 비흡연·라이프 정렬 일치 |
| Persona 2 (남 INTJ 인천) | Persona 1 (여 ENFP 진주) | 양쪽 모두 비흡연·진지 연애. 외향/내향 보완 |
| Persona 3 (여 ISTP 서울) | (별도 후보) | 외형 디테일 강한 의뢰인 → 외형 강한 후보 매칭 케이스 |

**중요**: 캐스팅 form은 의뢰인/후보 구분 없이 **같은 form** 으로 답변한다. 따라서 위 3건은 viewer 모드와 candidate 모드 양쪽에서 그대로 사용 가능.

---

## 활용 가이드

### Prompt 1 (PERSON BUNDLE) 입력으로 사용할 때
- **사진 없음**: 답변에는 텍스트만. 사진 슬롯은 mock 으로 채우거나 `teaserFaceType` 항목 비워둘 것.
- **호칭**: 캐스팅은 이름 미수집. 의뢰인 호칭 "의뢰인"으로 고정.
- **자유서술 활용**: `나한테 하고 싶은 말` 의 표현을 그대로 인용해서 **답변 인용 + 인격 분석** 카피 톤 검증.
- **본인 흡연/음주 활용**: candidateBundle 의 `chapter2DatingStyle` / `casterCharmBullets` 에 라이프 스타일 시그널로 사용.

### Prompt 2 (PAIR BUNDLE) 입력으로 사용할 때
- 백엔드가 미리 골라준 **matchedAxes 4개** 를 같이 입력해야 함. 신규 form 의 흡연/음주 축이 활용 가능 → 예: viewer `pref_smoke_no` + candidate `no_smoke` → "라이프 정렬 + dealbreaker 통과" 매칭 해설 작성 가능.
- 페어링 추천 표 참조해서 axis 일치/통과 case 다양하게 테스트.
