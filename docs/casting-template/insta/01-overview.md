# 인스타 발견 후보 매칭 — 개요

캐스팅 내부 풀이 아닌 **인스타그램에서 발견한 후보**를 의뢰인에게 매칭 카드로 보여주기 위한 변형.

## 왜 별도 변형인가

내부 풀 매칭은 양쪽(viewer + candidate) 모두 캐스팅 설문 응답(`CastingAnswers`)이 있다는 가정 위에 동작한다.

| 영역 | 내부 풀 | 인스타 |
|---|---|---|
| 후보 입력 | `CastingAnswers` (정형 답변) | bio·캡션 샘플·사진 (반정형 raw) |
| 매칭 6축(radar) | 양쪽 답변에서 결정론 산출 | **불가** (한쪽만 정형) |
| 메타(직업/MBTI/키) | DB echo | **추정** (정확도 ~73%) |
| 연락 방식 | DB의 연락 정보 | 스토리 태그·DM 등 후행 |

→ radar 자리는 **양극 막대 4축**, 후보 메타는 추정값 + 73% 신뢰도 표기, 연결 CTA에는 인스타 연락 안내.

## 데이터 차원 4종 (PR #14 와 동일 모델)

| 차원 | 정의 | 인스타 변형 |
|---|---|---|
| A. STATIC | 하드코딩 | 4축 라벨, 73% 안내 카피 |
| B. CANDIDATE-ONLY | 후보만 보고 작성 | 인스타 raw 데이터 → faceType, charm, feedCharm 등 |
| C. VIEWER-ONLY | 의뢰인 답변만 | viewerInsight (재사용 가능) |
| D. PAIR | 의뢰인 × 후보 | matchOpening, candidateMatch, simulation, spectrum notes |

내부 풀과 달리 **B/C/D 를 한 번의 LLM 호출로 통합**한다 (단일 `InstaContent` 출력). 인스타 후보는 매칭마다 1:1 으로 발견되므로 PERSON-only 캐싱 이득이 작음.

## 출력 = 화면 매핑

| 화면 슬롯 | InstaContent 필드 | 비고 |
|---|---|---|
| HuntBox 헤더 | (정적) "인스타그램" | sourceLabel prop |
| 캐스터의 한마디 헤드라인 | `casterHeadline` | TeaserCard.recommendation 과 같은 문자열 |
| 캐스터의 한마디 매력 3 bullets | `casterCharmBullets` | |
| TeaserCard.faceType | `faceType` | 사진 첫인상 |
| TeaserCard.ageRange | `ageRangeEstimate` | 추정 |
| TeaserCard.occupation | `occupationEstimate` | 추정 |
| TeaserCard.mbti / height | `mbtiEstimate / heightEstimate` | 옵션 — 시그널 강할 때만 |
| TeaserCard 추천사 각주 | (정적) "*인스타에서 찾아온 분이라…73%" | recommendationFootnote prop |
| ReadingCard viewerInsight | `viewerInsight` | viewer-only |
| ReadingCard matchOpening | `matchOpening` | pair |
| ReadingCard candidateMatch | `candidateMatch` | candidate(viewer-aware) |
| Chapter 1 personality | `personality` | |
| Chapter 1 datingStyle | `datingStyle` | |
| Chapter 1 feedCharm (✨ 매력) | `feedCharm` | weekendStyle 자리 대체 |
| Chapter 2 4축 막대 | `bipolarValues` × 4 | 좌측 비율 0~100 정수 |
| Chapter 2 매칭 노트 | `spectrumNotes[]` | 2~4개 |
| Chapter 3 시뮬레이션 | `simulation` | |
| CTA 1번 단계 안내 | (정적) "스토리 태그/DM…" | step1Note prop |

## 흐름

```
[운영자가 인스타에서 후보 발굴]
  → bio·캡션 샘플·사진 URL 수집
  → /casting/insta-prompt-test 에서 시스템 프롬프트 + 의뢰인 fixture 로 검증
  → 1회 LLM 호출 (vision 포함)
  → InstaContent (Zod 검증)
  → InstaMatchReport 라이브 렌더 → 운영자 검수
  → DB 저장 + 의뢰인에게 발송 (이후 단계, 본 PR 범위 밖)
```

## 검수 페이지 2종

- `/casting/insta-template-preview` — 정적 mock 으로 디자인 검수
- `/casting/insta-prompt-test` — 실제 LLM 호출, 프롬프트·후보 입력 변경 가능

둘 다 같은 `<InstaMatchReport>` 렌더러를 쓴다 (데이터 소스만 다름).
