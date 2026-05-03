# 캐스팅 매칭 카드 — 6축 점수 + matchRate 결정론 룰

LLM 호출 없이 코드로 산출. 코드 위치: `lib/casting/radar/`

## 메타 결정

- **점수 의미**: 자기 충족적 (PERSON 시점에 본인 답변만으로 결정, 페어 무관)
  - `userDesired[i]` = viewer 의 i 번 축 점수 (0~10)
  - `candidateActual[i]` = candidate 의 i 번 축 점수 (0~10)
  - 두 점수 모두 PERSON 시점에 1회 산출. 페어 무관 → 캐싱 OK.
- **점수 범위**: 0.0 ~ 10.0
- **매칭률 범위**: 0 ~ 100 (정수 %)
- **alignment 범위**: 1.0 / 0.7~0.8 / 0.4~0.5 / 0.2~0.3 (축마다 다름)

## 6축 정의

| # | id | 라벨 | 입력 (본인 답) | weight |
|---|---|---|---|---|
| 1 | `meeting_freq` | 만남 빈도 | Q2-1 `얼마나 자주 만나고 싶어?` | 1.0 |
| 2 | `contact_freq` | 연락 빈도 | Q2-2 `연락은 얼마나 자주가 좋아?` | 1.2 |
| 3 | `dating_style` | 연애 스타일 | Q2-4 `넌 지금 얼마나 진지해?` | 1.5 |
| 4 | `activity` | 활동성 | Q2-3 `어떤 데이트가 좋아?` + MBTI E/I | 0.8 |
| 5 | `lifestyle` | 라이프스타일 | Q3-4 `넌 담배 피워?` + Q3-5 `술은 자주 마셔?` | 1.2 |
| 6 | `planning` | 계획성 | MBTI 4번째 글자 (J/P) | 0.7 |

## 축별 SCORE 룰

### 1. 만남 빈도

| 답변 | 점수 |
|---|---|
| `daily_meet` | 10 |
| `weekly_3_4` | 8 |
| `weekly_1_2` | 5 |
| `flexible_meet` | 4 |
| (없음) | 5 (중간) |

### 2. 연락 빈도

| 답변 | 점수 |
|---|---|
| `contact_anytime` | 10 |
| `contact_2_3h` | 8 |
| `contact_1_2_day` | 5 |
| `contact_relaxed` | 3 |
| (없음) | 5 |

### 3. 연애 스타일

| 답변 | 점수 |
|---|---|
| `serious_dating` | 10 |
| `casual_chat` | 5 |
| `casual_meet` | 3 |
| (없음) | 5 |

### 4. 활동성

```
base = {
  nightlife: 10,
  outdoor:    8,
  culture:    5,
  home:       3,
  (없음):     5
}

mbti_boost = {
  'E*': +1,
  'I*': -1,
  unknown: 0
}

score = clamp(base + mbti_boost, 0, 10)
```

### 5. 라이프스타일

```
smoke = { no_smoke: 5, sometimes_smoke: 2, heavy_smoke: 0, (없음): 3 }
drink = { rarely_drink: 5, sometimes_drink: 3, often_drink: 1, (없음): 3 }

score = smoke + drink   // 0~10
```

### 6. 계획성

| MBTI 4번째 글자 | 점수 |
|---|---|
| `J` | 10 |
| `P` | 3 |
| (모름/unknown) | 5 |

## 축별 ALIGNMENT 룰

### 1. 만남 빈도

```
order = [flexible_meet, weekly_1_2, weekly_3_4, daily_meet]

같은 답                              → 1.0
flexible_meet 한쪽                   → 0.7  (유연이 다 받음)
인접 답 (order 거리 1)               → 0.7
두 단계 이상                          → 0.3
```

### 2. 연락 빈도

```
order = [contact_relaxed, contact_1_2_day, contact_2_3h, contact_anytime]

같은 답   → 1.0
거리 1    → 0.7
거리 2    → 0.4
거리 3 (양극: anytime ↔ relaxed) → 0.2
```

### 3. 연애 스타일

```
같은 답                                       → 1.0
casual_chat ↔ casual_meet (가벼운 끼리)       → 0.8
serious_dating ↔ casual_chat                 → 0.5
serious_dating ↔ casual_meet (양극)          → 0.2
```

### 4. 활동성 (데이트 스타일만 본다 — MBTI 보정은 score 에 이미 반영)

```
HIGH = {nightlife, outdoor}
LOW  = {culture, home}
order = [home, culture, outdoor, nightlife]

같은 답                                   → 1.0
같은 cluster (HIGH↔HIGH or LOW↔LOW)        → 0.8
cross cluster, 거리 2 (outdoor ↔ culture) → 0.5
양극 (nightlife ↔ home)                   → 0.2
```

### 5. 라이프스타일 (점수 차로 결정)

```
diff = |score(viewer) - score(candidate)|

diff ≤ 2  → 1.0
diff ≤ 4  → 0.7
diff ≤ 6  → 0.4
diff ≥ 7  → 0.2
```

### 6. 계획성

```
같은 글자 (J↔J or P↔P)        → 1.0
다른 글자 (J↔P)                → 0.5
unknown 한쪽                  → 0.7
unknown 둘 다                 → 0.5
```

## matchRate 산출

```
pairScore_i = min(userDesired_i, candidateActual_i) × alignment_i

matchRate = round(
  Σ(pairScore_i × weight_i) /
  Σ(weight_i × 10) × 100
)
```

**가중치 합** = 1.0 + 1.2 + 1.5 + 0.8 + 1.2 + 0.7 = **6.4**

**denominator** = 6.4 × 10 = **64**

## Top 4 axes (PAIR BUNDLE notes 입력)

`pairScore_i` 내림차순 정렬 후 상위 4 개 axis. 백엔드가 PAIR BUNDLE LLM 호출 시 `matchedAxes` 입력으로 그대로 전달.

## Dealbreaker 사전 필터 (6축 밖)

매칭 풀 진입 전 통과 검사. 한 항목이라도 실패 시 매칭 풀 자체에서 제외.

| 검사 | 조건 | 통과 룰 |
|---|---|---|
| 흡연 | viewer `pref_smoke_no` | candidate `no_smoke` 만 통과 |
| 흡연 | viewer `pref_smoke_meh` | candidate `heavy_smoke` 만 차단 |
| 음주 | viewer `pref_drink_no` | candidate `often_drink` 차단 |
| 종교 | viewer `pref_no_religion` | candidate `none` 만 통과 |
| 종교 | viewer `pref_same_religion` | viewer 본인 종교와 candidate 종교 일치 시만 통과 |
| 거리 | viewer `very_near` | viewer/candidate 시·도 같을 때만 |
| 거리 | viewer `same_city` | 같은 시·도일 때만 |
| 키 | viewer `pref_male_height_180_plus` | candidate ≥ 180cm |
| 키 | viewer `pref_male_height_172_plus` | candidate ≥ 172cm |
| 키 | viewer `pref_female_height_167_plus` | candidate ≥ 167cm |

매칭 카드에서는 통과한 dealbreaker 들을 ✅ 체크 카드로 별도 표시 (radar 와 정보 역할 분리).

## 코드 위치

```
lib/casting/radar/
├─ index.ts          ← public API: computePersonRadar / computePairRadar / checkDealbreakers
├─ rules.ts          ← 6축 SCORE + ALIGNMENT 룰 정의
└─ dealbreakers.ts   ← 사전 필터 검사 룰
```

## 검증 — template-preview 의 mock 페어 점수 시뮬

`MOCK_VIEWER_CASTING` (P1: ENFP 23 진주, flexible/relaxed/serious/culture/no_smoke·rarely_drink) +
`MOCK_CANDIDATE_CASTING` (ISFJ 28 서울, weekly_3_4/anytime/serious/culture/no_smoke·rarely_drink) 의 결정론 산출:

```
                viewer  candidate  alignment  pairScore  weight
만남 빈도        4       8          0.7        2.80       1.0
연락 빈도        3       10         0.2        0.60       1.2
연애 스타일      10      10         1.0        10.00      1.5
활동성          (5+1)6  (5-1)4     1.0        4.00       0.8
라이프스타일    10      10         1.0        10.00      1.2
계획성          3       10         0.5        1.50       0.7

matchRate = round((2.80×1.0 + 0.60×1.2 + 10.00×1.5 + 4.00×0.8 + 10.00×1.2 + 1.50×0.7) / 64 × 100)
          = round((2.80 + 0.72 + 15.00 + 3.20 + 12.00 + 1.05) / 64 × 100)
          = round(34.77 / 64 × 100)
          = 54%
```

(연락 빈도 양극 + 계획성 J/P 다름이 큰 페널티. 같은 데이트 스타일·라이프·진지함은 만점. 이 결과가 실시간으로 template-preview hexagon 에 반영됨.)

검증 방법:
```bash
npx tsx scripts/radar-smoke.ts
```
