# 캐스팅 매칭 카드 — 템플릿 구조 (콘텐츠 dump)

이 문서는 `/casting/template-preview` 페이지의 매칭 카드 디폴트 템플릿이다.
모든 섹션의 카피·슬롯·하드코딩 텍스트를 한 곳에 모아 LLM 작업자가 페이지 전체 그림을 한 번에 파악할 수 있게 한다.

- 페이지 코드: `app/casting/template-preview/page.tsx`
- 컴포넌트: `app/casting/template-preview/_components/`
- 의뢰인 호칭: 항상 **"의뢰인"** (실명 없음, "의뢰인님" 으로 렌더)
- 톤: `formal` (기본). 캐주얼 톤은 코드에는 있으나 캐스팅 서비스에서는 formal 고정.

---

## 페이지 섹션 순서

| # | 컴포넌트 | 라벨 |
|---|---|---|
| 1 | `TopNav` | 게시일 |
| 2 | `HeroV2` | 의뢰인 호명 + 캐스팅 선언 |
| 3 | `CasterNoteSection` | 🌏 캐스터의 한마디 |
| 4 | `HuntBoxV2` | 📍 찾아온 경로 |
| 5 | `TeaserCardV2` | 캐스팅된 사람 카드 |
| 6 | `ReadingCardV2` | 💌 의뢰인에게 쓰는 메모 |
| 7 | `Chapter2V2` | CHAPTER 1: 이 사람에 대해 더 자세히 |
| 8 | `Chapter3V2` | CHAPTER 2: 매칭도 (radar + notes) |
| 9 | `Chapter4Simulation` | CHAPTER 3: 만약 두 사람이 만난다면 |
| 10 | `ApplicationSummary` | 의뢰서 복기 |
| 11 | `MeetOrPassCta` | 만남 신청/패스 CTA |

---

## 1. HeroV2

**고정 카피:**
- 핸드라이팅 배지: `찾았어요, 꼭 맞는 사람`
- 메인 타이틀: `{userName}님을 위해 캐스팅 했어요` ("캐스팅" 만 오렌지)

**슬롯:** `userName` (의뢰인 이름, 캐스팅에서는 항상 `"의뢰인"`)

**LLM 필요?** ❌ 입력값 그대로 echo.

---

## 2. CasterNoteSection 🌏 캐스터의 한마디

**고정 카피:**
- 라벨: `🌏 캐스터의 한마디`

**슬롯:**
- `headline` — 후보 한 줄 인용구 (큰 글씨, 가운데 정렬, 따옴표로 감쌈)
- `charmBullets` — 매력 포인트 3개 (강조 부분은 `<b>...</b>` 굵게)

**현재 mock:**
```
headline: "술·담배 안 하고, 매일 챙겨줄 다정한 사람"

charmBullets:
  · <b>매일 꾸준히 연락</b>하고 곁에 있어주는 다정한 타입
  · <b>비흡연·저음주</b> 라이프, 차분하게 자기 리듬 챙기는 사람
  · <b>옷핏 좋은 체형</b>에 단정하고 깔끔한 분위기
```

**LLM 필요?** ✅ B (candidate-only). 후보 풀 입수 시 1회.

**중요:** `headline` 은 TeaserCardV2 의 `recommendation` 자리와 **같은 카피로 재사용**된다 (`CASTER_HEADLINE` 변수).

---

## 3. HuntBoxV2 📍 찾아온 경로

**고정 카피:**
- 라벨: `📍 찾아온 경로`
- 큰 텍스트: `🎯 캐스팅 내부 POOL`
- 구분선 위 라벨: `찾은 장소`
- 구분선 아래 라벨: `그 외 찾아본 경로`

**슬롯:** `stats`
- `offlineGyms` (n곳, 오프라인 헬스장)
- `instagramProfiles` (n명, Instagram 프로필)
- `linkedinProfiles` (n명, LinkedIn 프로필)
- `communities` (n곳, 동호회 · 모임)

**Footer:** `earth.webp` (지구 이미지, 상단 33% 비율)

**현재 mock:** `{ offlineGyms: 5, instagramProfiles: 42, linkedinProfiles: 18, communities: 5 }`

**LLM 필요?** ❌ 정적 카피 + 백엔드 stats echo.

---

## 4. TeaserCardV2 — 캐스팅된 사람 카드

**고정 카피:**
- 라벨: `캐스팅 된 사람!`
- 타이틀: `이 사람, 어떠세요?` (`어떠세요` 강조)

**슬롯 (사진 영역):**
- `teaserPhoto` — 후보 사진
- `nickname` — 닉네임 (블러 처리됨, 시각적 장치)
- `location` — 거주지역 (사진 위 오버레이)

**슬롯 (메타 4행):**
| 행 | 라벨 | 슬롯 |
|---|---|---|
| 1 | 외모상 | `faceType` (사진 인상) |
| 2-1 | 나이 | `ageRange` |
| 2-2 | 직업 | `occupation` |
| 3-1 | 키 | `height` |
| 3-2 | MBTI | `mbti` |
| 4 | 캐스터의 추천사 | `recommendation` |

**현재 mock:**
```
faceType: "단정하고 깔끔한 분위기"
ageRange: "20대 후반"
occupation: "회사원"
height: "178cm"
mbti: "ISFJ"
location: "서울"
recommendation: "술·담배 안 하고, 매일 챙겨줄 다정한 사람"   ← CasterNote.headline 과 같은 텍스트
```

**LLM 필요 슬롯:**
- `faceType` ✅ B (사진 인상, 한 줄)
- `recommendation` ✅ B — **CASTER_HEADLINE 재사용**, 별도 생성 X

**LLM 불필요:** ageRange/occupation/height/mbti/location/teaserPhoto — 답변 echo.

---

## 5. ReadingCardV2 💌 의뢰인에게 쓰는 메모

**고정 카피:**
- 라벨: `💌 {userName}님께 쓰는 메모`
- 푸터: `📊 23,481쌍의 매칭 데이터 기반 분석`

**5블록 구조:**

| # | 종류 | 카피 |
|---|---|---|
| 1 | 고정 (lead) | `{userName}님이 적어주신 답변과 고른 선택지를 하나하나 천천히 읽어봤어요. 사소한 표현 하나에서도 {userName}님이 어떤 분인지 보이더라고요.` |
| 2 | LLM #1 (viewerInsight) | 의뢰인 분석 — 답변 인용 + 인격 묘사 |
| 3 | 고정 (bridge) | `그래서 이 사람이 잘 어울릴 것 같아요!` |
| 4 | LLM #2 (candidateMatch) | 후보 묘사 (viewer 참조 X, 인물평으로 닫음) |
| 5 | 고정 (outro) | `이 사람을 어떻게 골랐는지 — 어떤 면에서 {userName}님과 잘 맞을지 차근차근 알려드릴게요.` |

**현재 mock:**
```
viewerInsight:
  "수시로 연락했으면"과 "맞춤법 잘 지키는 사람"이라고 답하신 걸 보면, 의뢰인님은 작은
  표현과 행동에서 진심을 발견하시는 분이에요. 그래서 큰 이벤트보다는 <b>매일의 안부와
  단정한 언어 톤</b>으로 마음을 보여주는 사람과 잘 어울리세요.

candidateMatch:
  이 사람은 <b>매일 꾸준히 연락하고, 차분하고 단정한 언어 톤</b>을 가진 분이에요. ISFJ
  특유의 조용한 책임감으로 큰 이벤트 없이도 곁자리를 따뜻하게 채우는 타입이라, 작은
  디테일을 놓치지 않고 챙기는 사람이에요.
```

**LLM 필요?**
- `viewerInsight` ✅ **C (viewer-only)** — 의뢰인 답변·자유서술만으로 인격 분석
- `candidateMatch` ✅ **B (candidate-only)** — 후보 인물평, viewer 참조 금지

---

## 6. Chapter2V2 — CHAPTER 1: 이 사람에 대해 더 자세히

**고정 카피:** ChapterCard 헤더 (number/title/lead)

**슬롯 (narratives):**
- `personality` — 성격 (2~3문장)
- `datingStyle` — 연애 스타일 (2~3문장)
- `weekendStyle` 🆕 — 주말 모습 (2~3문장) *컴포넌트 추가 필요*

**현재 mock:**
```
personality:
  ISFJ 특유의 조용한 책임감에 회사원의 일상적 안정감이 더해진 타입이에요. 자유서술에서
  차분하고 정돈된 어휘를 쓰고, 사진에서도 단정한 분위기가 일관되게 나타나는 사람이라,
  말보다 <b>행동으로 곁을 지키는</b> 사람이에요.

datingStyle:
  거의 매일 만나는 걸 좋아하고 수시로 연락 주고받는 페이스가 편한 타입이에요. ISFJ는
  표현보단 행동으로 챙기는 사람이라, 큰 이벤트보다 <b>매일 작은 안부 메시지</b>로 옆자리에
  머무는 스타일이에요.

weekendStyle: (신설 예정)
```

**LLM 필요?** ✅ 세 필드 모두 **B (candidate-only)**. 후보 답변·MBTI·자유서술·사진만으로 작성.

---

## 7. Chapter3V2 — CHAPTER 2: 매칭도

**고정 카피:** ChapterCard 헤더

**슬롯:**
- `radarData.labels` — 6축 이름 (정적)
- `radarData.userDesired` — 의뢰인 이상 6점수
- `radarData.candidateActual` — 후보 실제 6점수
- `matchRate` — 매칭률 %
- `notes` — 매칭 해설 4개

**6축 정의** (백엔드 룰 기반 결정론 점수화):
1. 생활 템포 ← 만남빈도 + 연락빈도
2. 관계 가치관 ← 종교 선호 + 결혼관 + 진지함
3. 연락 성향 ← 연락 빈도 호환
4. 외형 매칭 ← 이상형 키/체형 ↔ 후보 본인 키/체형
5. 성향 코드 ← MBTI 4지표 호환성
6. 거리·지역 ← 시·도 + 거리 선호

**현재 mock:**
```
matchRate: 87
labels: [생활 템포, 관계 가치관, 연락 성향, 외형 매칭, 성향 코드, 거리·지역]
userDesired:     [9, 8.5, 9, 7, 7.5, 9]
candidateActual: [9, 8,   9, 8, 8,   9]

notes:
  [0] 의뢰인님이 <b>"수시로 연락했으면"</b>이라고 답하셨는데, 이 분도 같은 답을 골랐어요.
      가장 갈등이 잦은 <b>만남·연락 빈도</b> 축에서 자연스럽게 맞물리는 사이예요.
  [1] 두 분 다 <b>"진지한 연애"</b>를 원하고, 종교도 양쪽 모두 무관해요. 가치관 큰 축에서
      정렬돼 있어서, 관계가 깊어질수록 같은 방향으로 걸어갈 수 있는 사람이에요.
  [2] 의뢰인님은 <b>흡연자 비호감</b>이라고 답하셨고, 이 분은 비흡연에 음주도 거의 안 하는
      차분한 라이프예요. 절대 조건 통과는 물론이고 일상 리듬까지 맞아서 호흡이 잘 맞을 거예요.
  [3] 두 분 모두 <b>서울</b>에 거주하고 계세요. 동선이 자연스러워 거리 부담이 없고, 갑자기
      약속을 잡거나 평일 저녁에 잠깐 보는 일도 어렵지 않은 사이예요.
```

**LLM 필요?**
- `radarData`, `matchRate` ❌ 백엔드 룰 기반 계산
- `notes` ✅ **D (pair)** — viewer × candidate, 매칭마다 1회

---

## 8. Chapter4Simulation — CHAPTER 3: 만약 두 사람이 만난다면

**고정 카피:** `🎬 만약 두 사람이 만난다면` (ChapterCard 타이틀)

**슬롯:**
- `simulation` — 첫 만남 시뮬 (3~5문장, 후보의 가상 첫 멘트 따옴표 포함)
- `sceneImage` — 만남 장면 이미지 (선택)

**현재 mock:**
```
첫 만남은 <b>조용한 카페</b>가 어울릴 거예요. 두 분 다 카페에서 천천히 시작하는 걸 좋아하셔서,
자리만 잡으시면 시간 가는 줄 모르실 거예요. ISFJ 특유의 차분한 응대 덕분에 의뢰인님이 편하게
말을 꺼낼 수 있게 만들어 주실 분이에요.

이 분의 <b>답변과 자기소개를 기반으로 보면, 처음 만났을 때 이렇게 말할 것 같아요</b>.
"오늘 오시는 길 안 막혔어요? 저는 좀 일찍 와서 자리 잡고 있었어요. 음료는 뭐 드시고 싶으세요?"
큰 이벤트 없이도 작은 디테일을 챙기는 분이라, 첫 대화부터 편안한 거리감이 만들어질 거예요.
```

**LLM 필요?** ✅ **D (pair)**. Chapter3V2.notes 와 같은 PAIR BUNDLE 에 묶임.

---

## 9. ApplicationSummary — 의뢰서 복기

**고정 카피:** "네 의뢰서, 이렇게 적어주셨네요" 류

**슬롯:** `userAnswers` — 의뢰인이 작성한 설문 답변 전체

**LLM 필요?** ❌ 답변 echo (보강용 한 줄도 LLM 안 씀).

---

## 10. MeetOrPassCta

CTA 버튼 (만남 신청 / 패스). LLM 무관.

---

## 정형 데이터 카탈로그 (의뢰인 / 후보 공통 설문)

LLM 입력으로 사용되는 설문 필드:

### 이상형 (의뢰인이 캐스팅 의뢰 시 작성)
- `attractionFactor` (외모 강조 정도)
- `agePreference` (나이 선호)
- `heightPreference` (키 선호)
- `bodyType` (체형 선호)
- `contactStyle` (연락 빈도 선호)
- `dealBreaker` (절대 안 되는 조건)
- `religionImportance` (종교 선호)

### 본인 정보
- `gender`, `location`, `occupation`, `age`, `height`, `mbti`
- `datingFrequency` (만남 빈도)

### 자유서술
- `strictCriteria` (꼭 맞췄으면 하는 기준 — 자유 입력)
- 자기소개 (있다면)
- "나한테 하고 싶은 말" 류

### 성격 (선택)
- `jealousy`, `conflictStyle`, `selfDescription`

### 사진
- 후보 사진 (외모 묘사용)
