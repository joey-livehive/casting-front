# 캐스팅 매칭 카드 — LLM 프롬프트 설계

## 데이터 차원 4종

| 차원 | 정의 | 캐싱 단위 | 호출 빈도 |
|---|---|---|---|
| **A. STATIC** | 하드코딩 카피 | — | 0 |
| **B. CANDIDATE-ONLY** | 후보 한 명만 보고 작성 | 후보 단위 | 후보 입수 시 1회 |
| **C. VIEWER-ONLY** | 의뢰인 답변만 보고 작성 | 의뢰인 단위 | 의뢰인당 1회 |
| **D. PAIR** | 의뢰인 × 후보 | 매칭 단위 | 매칭마다 1회 |

---

## 핵심 통찰

### 1. 사람 풀의 모든 사용자는 "잠재 의뢰인" + "잠재 후보"

A 라는 사용자가 들어오면 — A 가 의뢰인일 때 (viewer bundle) 와 후보로 매칭될 때 (candidate bundle) 둘 다 미래에 사용된다. **B + C 를 한 번에 같이 생성**해 두면 어떤 매칭이 일어나도 D 만 새로 호출하면 된다.

```
[유저 A 가입/설문 완료]
  → 1회 LLM 호출 (Prompt 1: PERSON BUNDLE)
  → A.candidateBundle 캐시
  → A.viewerBundle 캐시

[유저 A ↔ 유저 B 매칭]
  → 양쪽 캐시 합치기 (LLM 호출 X)
  → 1회 LLM 호출 (Prompt 2: PAIR BUNDLE)
```

### 2. 카피 톤의 핵심

- **의뢰인 인격 분석 (C)** 은 **범용적으로 잘 맞히는 인격 묘사**가 핵심. 사람들이 "오, 나 그런 사람 맞아" 하고 끄덕일 만한 카피.
- **설문의 작은 디테일을 인용** ("수시로 연락했으면", "맞춤법 잘 지키는 사람" 등) 해서 정밀한 분석 인상.
- **강조는 `<b>...</b>`** 로 한두 곳만.

---

## 영역별 매핑

### CANDIDATE BUNDLE (B) — 후보 입수 시 1회

| 슬롯 | 길이 | 주 입력 |
|---|---|---|
| `casterHeadline` | 한 줄 (15~25자) | 답변 전체 + 자유서술 + 사진 |
| `casterCharmBullets` (3개) | 각 한 줄 | 후보 매력 포인트 3가지 (강조 1곳) |
| `teaserFaceType` | 한 줄 (10~20자) | 사진 인상 |
| `personality` | 2~3문장 | MBTI + 직업 + 자유서술 + 사진 |
| `datingStyle` | 2~3문장 | 만남빈도 + 연락빈도 + MBTI |
| `weekendStyle` | 2~3문장 | "어떤 데이트 좋아?" + 라이프스타일 답변 |
| `readingCandidateMatch` | 2~3문장 | 후보 인물평 (viewer 참조 금지) |

**중요:** `casterHeadline` 은 TeaserCard 의 `recommendation` 자리와 CasterNote 의 `headline` 자리에 **같은 문자열로 재사용**. 별도 생성 X.

### VIEWER BUNDLE (C) — 의뢰인당 1회

| 슬롯 | 길이 | 주 입력 |
|---|---|---|
| `readingViewerInsight` | 2~3문장 | 의뢰인 답변 전체 + 자유서술 → "의뢰인님은 이런 분" 인격 분석 |

### PAIR BUNDLE (D) — 매칭마다 1회

| 슬롯 | 길이 | 주 입력 |
|---|---|---|
| `chapter3Notes` (4개) | 각 2문장 | viewer 답 × candidate 답에서 일치/통과 축 4개 골라 각 축 매칭 해설 |
| `chapter3Simulation` | 4~6문장 | 두 사람 첫 만남 시뮬 (장소 + 후보의 가상 첫 멘트 따옴표 + 분위기) |

### 결정론적 (LLM 불필요)

- `radarData.userDesired/candidateActual` — 6축 점수, **`docs/casting-template/04-radar-rules.md` 참조**
- `matchRate` — 6축 가중평균, 04-radar-rules.md 의 공식
- `topAxes` (top 4) — pairScore 내림차순, PAIR BUNDLE `matchedAxes` 입력
- HuntBox stats, ApplicationSummary — DB echo
- 정형 메타 (나이/키/직업/MBTI/거주지/사진) — 답변 echo

**6축**: 만남 빈도 / 연락 빈도 / 연애 스타일 / 활동성 / 라이프스타일 / 계획성
**dealbreaker 사전 필터** (흡연·음주·종교·거리·키): 6축 밖, 매칭 풀 진입 전 검사. 04-radar-rules.md 참조.

---

## Prompt 1: PERSON BUNDLE (B + C 통합 1회 호출)

한 사용자의 설문이 들어오면 candidateBundle 과 viewerBundle 을 **같은 호출에서** 둘 다 뽑는다.

### Input

```yaml
설문:
  본인 정보:
    gender, location, occupation, occupation_detail, age, height, mbti
    datingFrequency
  성격:
    jealousy, conflictStyle, selfDescription
  자유서술:
    strictCriteria        # 꼭 맞췄으면 하는 기준
    selfIntro             # 자기소개
    messageToOther        # 의뢰인이 적은 한마디 (의뢰인 모드에서만)
  이상형 (의뢰인 모드 입력):
    attractionFactor, agePreference, heightPreference, bodyType
    contactStyle, dealBreaker, religionImportance

사진:
  - 후보 사진 N장 (Vision 입력)
```

### Output JSON Schema

```json
{
  "candidateBundle": {
    "casterHeadline": "string (15~25자, 후보 한 줄 카피, 두 자리에서 재사용됨)",
    "casterCharmBullets": ["string (한 줄, <b>...</b> 강조 1곳)", "...", "..."],
    "teaserFaceType": "string (10~20자, 사진 인상)",
    "personality": "string (2~3문장)",
    "datingStyle": "string (2~3문장)",
    "weekendStyle": "string (2~3문장)",
    "readingCandidateMatch": "string (2~3문장, viewer 참조 금지)"
  },
  "viewerBundle": {
    "readingViewerInsight": "string (2~3문장, 답변 인용 + 인격 분석)"
  }
}
```

### 카피 톤 가이드

- **viewerInsight**: 의뢰인 답변에서 작은 표현 1~2개 인용 → "이런 표현 쓰신 걸 보면, ~한 분이세요" 패턴. **범용적 인격 분석** (사람들이 좋아할 만한 따뜻한 묘사).
- **candidateMatch**: 후보 인물평. **viewer 언급 금지** (캐싱을 위해). "이 사람은 ~한 분이에요. ~한 타입이라, ~한 사람이에요." 로 닫기.
- **narratives**: 묘사 위주, 답변/MBTI 근거 넣되 직설적이지 않게.
- **casterHeadline**: 후보의 가장 강한 매력 1개를 한 줄로. 강조 없음 (인용구로 노출됨).

### Few-shot 예시

(현재 mock 데이터를 그대로 톤 레퍼런스로 사용 → `01-template-structure.md` 참조)

---

## Prompt 2: PAIR BUNDLE (매칭마다 1회 호출)

### Input

```yaml
viewer:                       # 의뢰인 측
  설문 응답 전체
  자유서술
  (옵션) viewerBundle 캐시   # readingViewerInsight 등 참고

candidate:                    # 후보 측
  설문 응답 전체
  자유서술
  (옵션) candidateBundle 캐시

매칭 분석 (백엔드 룰 기반, 입력으로 제공):
  matchedAxes:               # 일치/통과한 축 4개 (백엔드가 골라줌)
    - axis: "연락 빈도"
      viewerAnswer: "수시로 연락했으면"
      candidateAnswer: "수시로 연락하는 편"
      type: "match" | "pass"   # 일치인지 절대조건 통과인지
    - axis: "관계 가치관"
      ...
```

### Output JSON Schema

```json
{
  "chapter3Notes": [
    {
      "axis": "string (축 이름)",
      "narrative": "string (2문장, <b>...</b> 강조 1곳)"
    }
    // 정확히 4개
  ],
  "chapter3Simulation": "string (4~6문장, 후보 가상 첫 멘트 따옴표 포함, <b>...</b> 강조 1~2곳)"
}
```

### 카피 톤 가이드

- **notes**: 단순 비교를 넘어 **왜 잘 맞는지의 해설**. "축에서 자연스럽게 맞물리는 사이", "관계가 깊어질수록 같은 방향으로 걸어갈 수 있는 사람" 같은 시간/관계 깊이 차원의 해설 권장.
- **simulation**: 첫 만남 장소 + 분위기 + **후보의 가상의 첫 멘트(따옴표)** 1줄 + 매칭 디테일 풀이.

### Few-shot 예시

(`01-template-structure.md` 의 Chapter3V2.notes / Chapter4Simulation 카피 참고)

---

## 캐싱·비용 구조

```
N명 풀 + M개 매칭 시:
  Prompt 1 호출수 = N         (사람당 1회)
  Prompt 2 호출수 = M         (매칭당 1회)

Prompt 1 미리 다 돌아 있으면:
  매칭 발생 시 즉시 Prompt 2 만 호출 → 응답 빠름
```

---

## 마이그레이션 노트 (현재 코드 → 통합 모델)

### 현재 코드 키 매핑

| 컴포넌트 prop | 차원 | 정식 키 |
|---|---|---|
| `ReadingCardV2.narratives.viewerInsight` | C | `viewerBundle.readingViewerInsight` |
| `ReadingCardV2.narratives.candidateMatch` | B | `candidateBundle.readingCandidateMatch` |
| `CandidateDetailSection.narratives.personality` | B | `candidateBundle.personality` |
| `CandidateDetailSection.narratives.datingStyle` | B | `candidateBundle.datingStyle` |
| `CandidateDetailSection.narratives.weekendStyle` 🆕 | B | `candidateBundle.weekendStyle` |
| `CasterNoteSection.headline` | B | `candidateBundle.casterHeadline` |
| `CasterNoteSection.charmBullets` | B | `candidateBundle.casterCharmBullets` |
| `TeaserCardV2.recommendation` | B | `candidateBundle.casterHeadline` ★재사용 |
| `TeaserCardV2.faceType` | B | `candidateBundle.teaserFaceType` |
| `Chapter3V2.match.notes` | D | `pairBundle.chapter3Notes` |
| `Chapter3V2.match.simulation` | D | `pairBundle.chapter3Simulation` |

### 정합성 정리할 것

1. v1 잔재 키 `paragraph1Opening` / `paragraph2Opening` → `viewerInsight` / `candidateMatch` 로 타입 정리
2. `CandidateDetailSection` 에 `weekendStyle` 필드 추가
3. `TeaserCardV2.recommendation` 은 별도 LLM 출력이 아닌 `casterHeadline` 재사용임을 코드 주석으로 명시
