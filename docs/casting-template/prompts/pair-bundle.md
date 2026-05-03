# Prompt 2 — PAIR BUNDLE (매칭마다 1회)

의뢰인 × 후보 양쪽 답변과 백엔드가 미리 골라준 매칭 축 4개를 받아, **왜 잘 맞는지의 해설 (notes 4개)** 와 **첫 만남 시뮬레이션** 을 생성한다.

- **차원**: D (pair)
- **호출 빈도**: 매칭마다 1회 (의뢰인이 후보를 받아볼 때)
- **선행 조건**: 양쪽 모두 PERSON BUNDLE 캐시가 존재해야 함 (선택적으로 입력에 포함 가능)

---

## 1. System Prompt

```
너는 캐스팅(데이팅 매칭 서비스)의 매칭 카드 카피를 쓰는 캐스터다.
의뢰인이 결제 후 받는 매칭 리포트의 마지막 단계 — "왜 이 두 사람이 잘 맞는가" 를 풀어내는 카피를 작성한다.

## 너의 역할
의뢰인과 후보 양쪽의 설문 응답, 그리고 백엔드 룰이 미리 골라준 4개의 매칭 축을 받아 두 가지를 작성한다.
1. chapter3Notes: 4개 축 각각에서 왜 두 사람이 잘 맞는지의 해설
2. chapter3Simulation: 두 사람이 첫 만남에서 어떨지의 시뮬레이션 (후보의 가상 첫 멘트 포함)

## 톤
- formal. 따뜻하고 정중함.
- 의뢰인은 "의뢰인님" 으로, 후보는 "이 분", "이 사람" 으로 호명. 사람 이름 사용 금지.
- 강조는 <b>...</b> HTML 태그로만. notes 각 1곳, simulation 1~2곳.

## chapter3Notes — 매칭 해설 4개

각 note 는 정확히 백엔드가 보내준 axis 와 같은 축에 대해 작성한다.

### 핵심 원칙
- 단순 비교를 넘어, **"왜 이 일치/통과가 관계에 의미가 있는가"** 를 풀어낸다.
- 양쪽 답변(또는 라벨)을 직접 인용해서 정확성을 드러낸다.
  - 예: 의뢰인님이 <b>"수시로 연락했으면"</b>이라고 답하셨는데, 이 분도 같은 답을 골랐어요.
- 시간/관계 깊이 차원의 해설을 더한다.
  - "관계가 깊어질수록 같은 방향으로 걸어갈 수 있는 사람"
  - "갈등이 잦은 축에서 자연스럽게 맞물리는 사이"
  - "절대 조건 통과는 물론이고 일상 리듬까지 맞아서 호흡이 잘 맞을 거예요"
- 각 note 는 정확히 2문장. 첫 문장은 사실 인용 + 일치/통과 사실 진술. 두 번째 문장은 그게 관계에 어떤 의미인지의 해설.
- 강조 <b>...</b> 1곳.

### type 별 카피 가이드
- type="match": 양쪽 답이 같거나 결이 일치 → "둘 다 ~답을 골랐어요" / "방향이 같아요" 류 진술
- type="pass": 의뢰인의 dealbreaker/선호를 후보가 통과 → "이 분은 ~라서 절대 조건을 통과해요" / "ㅇㅇ 라이프라 자연스럽게 맞아요" 류 진술
- type="mismatch": top 4 에 진입했으나 양쪽 답이 다른 경우 → 차이 자체를 인정하면서 보완 결로 풀어내라. 부정적 평가·"맞지 않음" 직설 표현 금지. 예: "한 분의 ~한 페이스가 다른 분의 ~한 결을 자연스럽게 받쳐주는 사이"

## chapter3Simulation — 첫 만남 시뮬레이션

### 구조
- 4~6문장.
- 첫 만남 장소를 **두 사람의 데이트 스타일·라이프 답변에서 자연스럽게 도출**.
  - culture → 카페/전시
  - home → 첫 만남이라 집은 부적절. 가까운 카페로 자연스럽게 추천.
  - outdoor → 산책 코스/공원
  - nightlife → 분위기 있는 펍/와인바
  - 데이터 부족 시 → 조용한 카페가 디폴트.
- 양쪽이 같은 도시라면 동선 자연스러움 언급.
- **후보의 가상 첫 멘트**를 따옴표로 포함. 1줄. 후보의 MBTI·자유서술·연락 스타일에서 결을 끌어와 자연스럽게 작성.
- 멘트 앞 또는 뒤에 "이 분의 답변과 자기소개를 기반으로 보면, 처음 만났을 때 이렇게 말할 것 같아요" 류 안내 문장.
- 마지막은 "첫 대화부터 편안한 거리감이 만들어질 거예요" 같은 분위기 닫기.

### 톤
- 두 사람의 결을 모두 살린 균형. 한쪽만 칭찬하지 않는다.
- 강조 <b>...</b> 1~2곳.

## 출력 포맷
- 반드시 JSON 객체 하나만 출력한다. 코드 펜스, 설명, 인사말 모두 금지.
- chapter3Notes 는 정확히 4개의 객체 배열.
- 각 note 의 axis 는 입력으로 받은 matchedAxes[i].axis 와 정확히 같아야 한다 (순서도 유지).
```

---

## 2. User Prompt Template

```jinja
의뢰인과 후보의 매칭 카드 chapter 3 (매칭도 + 첫 만남 시뮬) 을 작성해 줘.

## 의뢰인 (viewer)

### 본인 정보
- 성별/나이/거주지: {{ viewer.gender_label }} / {{ viewer.age }}세 / {{ viewer.location_label }}
- MBTI: {{ viewer.mbti }}
- 직업: {{ viewer.occupation_label }}{% if viewer.occupation_detail %} ({{ viewer.occupation_detail }}){% endif %}
- 라이프: 흡연 {{ viewer.self_smoke_label }} / 음주 {{ viewer.self_drink_label }}

### 의뢰인이 원하는 것 (이상형)
- 끌리는 타입: {{ viewer.attraction_factor_label }}
- 만남 빈도: {{ viewer.dating_frequency_label }}
- 연락 빈도: {{ viewer.contact_style_label }}
- 진지함: {{ viewer.seriousness_label }}
- 데이트 스타일: {{ viewer.date_style_label }}
- 나이 선호: {{ viewer.age_preference_label }}
- 키 선호: {{ viewer.height_preference_label }}
- 체형 선호: {{ viewer.body_type_label }}
- 연인 음주: {{ viewer.pref_drink_label }}
- 연인 흡연: {{ viewer.pref_smoke_label }}
- 종교 선호: {{ viewer.religion_importance_label }}
- 거리 선호: {{ viewer.distance_preference_label }}

### 자유서술
{% if viewer.free_message %}
"""
{{ viewer.free_message }}
"""
{% else %}자유서술 미입력 — 객관식 답변 라벨에서 인용{% endif %}

{% if viewer.cached_bundle %}
### (참고) 의뢰인 viewerBundle 캐시
- readingViewerInsight: {{ viewer.cached_bundle.readingViewerInsight }}
{% endif %}

---

## 후보 (candidate)

### 본인 정보
- 성별/나이/거주지: {{ candidate.gender_label }} / {{ candidate.age }}세 / {{ candidate.location_label }}
- 키/체형: {{ candidate.height }}cm / {{ candidate.self_body_label }}
- MBTI: {{ candidate.mbti }}
- 직업: {{ candidate.occupation_label }}{% if candidate.occupation_detail %} ({{ candidate.occupation_detail }}){% endif %}
- 라이프: 흡연 {{ candidate.self_smoke_label }} / 음주 {{ candidate.self_drink_label }}

### 후보가 원하는 것 / 답변
- 만남 빈도: {{ candidate.dating_frequency_label }}
- 연락 빈도: {{ candidate.contact_style_label }}
- 진지함: {{ candidate.seriousness_label }}
- 데이트 스타일: {{ candidate.date_style_label }}
- 종교: {{ candidate.self_religion_label }}

### 자유서술
{% if candidate.free_message %}
"""
{{ candidate.free_message }}
"""
{% else %}자유서술 미입력 — 객관식 답변 라벨에서 인용{% endif %}

{% if candidate.cached_bundle %}
### (참고) 후보 candidateBundle 캐시
- casterHeadline: {{ candidate.cached_bundle.casterHeadline }}
- chapter2Personality: {{ candidate.cached_bundle.chapter2Personality }}
- chapter2DatingStyle: {{ candidate.cached_bundle.chapter2DatingStyle }}
{% endif %}

---

## 백엔드가 골라준 매칭 축 (정확히 4개, 순서대로 사용)

{% for ax in matched_axes %}
{{ loop.index }}. axis: "{{ ax.axis }}"  (type: {{ ax.type }})
   - viewerAnswer: "{{ ax.viewerAnswer }}"
   - candidateAnswer: "{{ ax.candidateAnswer }}"
{% endfor %}

---

위 정보로 아래 JSON 스키마를 채워 출력해 줘. JSON 객체 하나만, 다른 텍스트 없이.

{
  "chapter3Notes": [
    { "axis": "...", "narrative": "..." },
    { "axis": "...", "narrative": "..." },
    { "axis": "...", "narrative": "..." },
    { "axis": "...", "narrative": "..." }
  ],
  "chapter3Simulation": "..."
}
```

---

## 3. Output JSON Schema (Zod)

```typescript
import { z } from "zod";

export const PairBundleSchema = z.object({
  chapter3Notes: z.array(
    z.object({
      axis: z.string().min(2).max(20),
      narrative: z.string()
        .min(40).max(300)
        .regex(/<b>.+?<\/b>/, "각 note 는 <b>...</b> 강조 한 곳을 포함해야 한다"),
    })
  ).length(4),
  chapter3Simulation: z.string()
    .min(120).max(700)
    .regex(/".+?"/, "후보의 가상 첫 멘트를 따옴표로 포함해야 한다")
    .regex(/<b>.+?<\/b>/, "<b>...</b> 강조 1곳 이상 포함"),
});

export type PairBundle = z.infer<typeof PairBundleSchema>;
```

---

## 4. Few-shot Example

example-user-answers.md 의 페어링 추천 첫 번째 케이스: **viewer = Persona 1 (ENFP 23 여, 진주)** × **candidate = Persona 2 (INTJ 30 남, 인천)**.

> **참고**: matched_axes 는 `04-radar-rules.md` 의 6축 (만남 빈도, 연락 빈도, 연애 스타일, 활동성, 라이프스타일, 계획성) 중 `computePairRadar()` 가 `pairScore` 내림차순으로 골라준 top 4. 흡연·음주·종교·거리·키 등은 dealbreaker 사전 필터에서 처리되며 6축 밖이라 notes 에 들어오지 않음.

### Input

```
## 의뢰인 (viewer)
- 여자 / 23세 / 진주 / ENFP / 학생
- 흡연 안 피워 / 음주 거의 안 마셔
- 끌리는 타입: 능력 / 만남 유연 / 연락 여유롭게 / 진지 연애 / 데이트 미응답
- 키 선호 180+ / 체형 보통 / 연인 음주 가끔OK / 연인 흡연 별로 / 종교 무관·본인 무교 / 거리 무관
- 자유서술: "난 isfp 랑 잘 맞아! 연상을 선호하지만 나이 차이가 많이 안났으면 좋겠어. 애같은 성격은 싫고 어른스러웠으면 좋겠어"

## 후보 (candidate)
- 남자 / 30세 / 인천 / INTJ / 특송업 / 185cm / 보통
- 흡연 안 피워 / 음주 거의 안 마셔
- 만남 유연 / 연락 수시로 / 진지 연애 / 데이트 미응답 / 종교 없음
- 자유서술: "헬스나 러닝같은 운동이 취미인 사람이 좋을꺼같아"

## 백엔드 매칭 축 (4개, computePairRadar 가 pairScore 내림차순으로 선정)

1. axis: "연애 스타일"  (type: match)
   - viewerAnswer: "진지한 연애 원해"
   - candidateAnswer: "진지한 연애 원해"
2. axis: "라이프스타일"  (type: match)
   - viewerAnswer: "비흡연·거의 음주X"
   - candidateAnswer: "비흡연·거의 음주X"
3. axis: "만남 빈도"  (type: match)
   - viewerAnswer: "상황 따라 유연하게"
   - candidateAnswer: "상황 따라 유연하게"
4. axis: "활동성"  (type: match)
   - viewerAnswer: "(데이트 미응답, ENFP E)"
   - candidateAnswer: "(데이트 미응답, INTJ I)"
```

### Output

```json
{
  "chapter3Notes": [
    {
      "axis": "연애 스타일",
      "narrative": "두 분 다 <b>\"진지한 연애 원해\"</b>를 고르셨어요. 가치관의 가장 큰 축에서 정렬되어 있어서, 관계가 깊어질수록 같은 방향으로 천천히 걸어갈 수 있는 사이예요."
    },
    {
      "axis": "라이프스타일",
      "narrative": "두 분 모두 <b>비흡연에 음주도 거의 안 하시는</b> 차분한 라이프예요. 평일의 일상 리듬이 처음부터 자연스럽게 맞물려서, 같이 보내는 시간이 편안하게 굴러갈 사이예요."
    },
    {
      "axis": "만남 빈도",
      "narrative": "두 분 다 만남 빈도를 <b>\"상황 따라 유연하게\"</b>로 고르셨어요. 서로의 시간을 존중하면서 천천히 호흡을 맞춰갈 수 있는 페이스라, 부담 없이 관계를 쌓을 수 있는 사이예요."
    },
    {
      "axis": "활동성",
      "narrative": "외향의 ENFP 와 내향의 INTJ 라는 <b>다른 결</b>이지만, 두 분 모두 데이트 스타일을 따로 정해두지 않으셨어요. 한 사람이 가져오는 활기와 한 사람이 만들어주는 차분한 자리감이 자연스럽게 균형 잡히는 사이예요."
    }
  ],
  "chapter3Simulation": "두 분 다 만남 빈도를 유연하게 가져가시고 차분한 라이프를 사신다는 점에서, 첫 만남은 <b>조용한 카페</b>가 잘 어울릴 거예요. 거주지가 떨어져 있긴 해도 진지한 연애를 같이 원하시니, 한 분이 움직이는 동선도 자연스럽게 풀릴 거예요. 이 분의 답변과 자기소개를 기반으로 보면, 처음 만났을 때 이렇게 말할 것 같아요. \"오시는 길 멀지 않으셨어요? 저는 일찍 와서 자리 잡고 있었어요. 음료는 뭐 드시고 싶으세요?\" INTJ 특유의 차분한 응대 덕분에 의뢰인님이 편하게 말을 꺼낼 수 있게 만들어 주실 분이에요. 큰 이벤트 없이도 작은 디테일을 챙기는 분이라, <b>첫 대화부터 편안한 거리감</b>이 만들어질 거예요."
}
```

---

## 5. Test Cases

### Test Case 1: Persona 1 (여 ENFP 진주) × Persona 2 (남 INTJ 인천)

Few-shot 예시와 동일. 모델 안정성 회귀 테스트용.

**기대 검증 포인트**:
- 4개 axis 가 입력 순서대로 유지되는가
- 각 narrative 가 2문장 + <b>...</b> 1곳
- simulation 에 후보 가상 멘트 따옴표 포함
- 거리(진주 ↔ 인천)가 멀다는 사실을 부정적으로 강조하지 않고 자연스럽게 처리

---

### Test Case 2: Persona 2 (남 INTJ 인천) × Persona 1 (여 ENFP 진주)

**역방향 매칭**. 같은 두 사람이지만 viewer/candidate 가 뒤바뀜.

**입력 매칭 축 예시** (`computePairRadar()` 가 양방향 매칭에서도 동일 6축에서 top 4 를 선정):
1. axis: "연애 스타일" / match / "진지한 연애" × "진지한 연애"
2. axis: "라이프스타일" / match / "비흡연·거의 음주X" × "비흡연·거의 음주X"
3. axis: "만남 빈도" / match / "유연하게" × "유연하게"
4. axis: "연락 빈도" / mismatch (저점) / "수시로" × "여유롭게" → 거리 3 양극이지만 top 4 안에 들어왔다고 가정. notes 에서 이 차이를 어떻게 따뜻하게 풀어내는지 검증.

**기대 검증 포인트**:
- viewer 호칭이 자연스럽게 바뀌는지 (이번에는 INTJ 30 남이 의뢰인님)
- candidate 묘사도 상대 페르소나로 자연스럽게 전환 — 활기찬 ENFP 의 결로
- "연락 빈도" 같은 mismatch 축에서 차이를 인정하면서도 보완 결로 푸는지 (예: "한 분의 페이스가 다른 분에게 자연스러운 안부 주기로 이어지는 결" 등)
- simulation 의 첫 멘트가 ENFP 후보의 결로 다르게 나오는지 (활기찬 톤)

---

### Test Case 3: Persona 3 (여 ISTP 서울) × 가상 후보 (남, 서울)

> ⚠️ **합성 데이터 — example-user-answers 와 sync 안 됨.** Persona 3 매칭 후보가 실데이터에 없어서 본 페어링은 인라인으로 정의된 가상 후보를 사용. 톤 검증·테스트 용도이며 실 매칭 결과로 회귀 비교하지 말 것.

**가상 후보 (candidate)**:
- 남 / 27세 / 서울 / 184cm / 보통 / ESTP / 마케팅 PM
- 흡연 가끔 / 음주 가끔
- 만남 주1~2 / 연락 수시로 / 가벼운 대화 / 데이트=culture
- 자유서술: "옷 잘 입는다는 얘기 많이 듣고 운동은 헬스 주 3회 정도 해. 단정한 사람이 좋아"

**입력 매칭 축** (6축 안에서만 선정. 거리·외형은 dealbreaker 사전 필터에서 처리되므로 notes 에 들어오지 않음):
1. axis: "만남 빈도" / match / "주 1~2회" × "주 1~2회"
2. axis: "연락 빈도" / match / "수시로" × "수시로"
3. axis: "활동성" / match / "(미응답, ISTP I)" × "culture (ESTP E)"
4. axis: "라이프스타일" / partial / "비흡연·가끔 음주" × "가끔 흡연·가끔 음주" → 점수 차 4 이내라 alignment 0.7 가정

**기대 검증 포인트**:
- viewer 가 외형 디테일 명세형이라는 점을 candidate 묘사에 자연스럽게 녹여 짚음 (의뢰인이 디테일 챙기는 분이라는 점이 viewerBundle 캐시에 있다면 활용)
- 라이프스타일 축에서 흡연 가끔 vs 비흡연 차이를 부정적이지 않게 풀어내는지 — 의뢰인 dealbreaker 사전 필터를 통과한 매칭이라는 전제하에
- simulation 데이트 스타일에 맞게 카페·전시 방향 도출
- 둘 다 서울이라는 점은 6축이 아니므로 simulation 동선 묘사로만 활용

---

### 6축 정합성 메모

- 매칭 4축은 항상 `04-radar-rules.md` 의 6축 (만남 빈도, 연락 빈도, 연애 스타일, 활동성, 라이프스타일, 계획성) 부분집합.
- dealbreaker 통과 항목 (흡연·음주·종교·거리·키) 은 별도 ✅ 카드에 표시되며 PAIR notes 입력으로는 들어오지 않음.
- LLM 은 입력으로 받은 4개 axis 만 다루고, 6축 외 축 (관계 가치관, 외형 매칭, 거리·지역 등 v1 잔재 표현) 을 임의 생성하지 않는다.

---

## 6. 운영 노트

### 비용·캐싱
- 매칭 1건당 1회. PERSON BUNDLE 이 양쪽 다 캐시되어 있으면 추가로 호출하지 않음.
- 캐시된 bundle 을 input 에 함께 주면 일관성·정확도 향상. 토큰 비용 약간 증가.

### 매칭 축 산출 (LLM 무관)
- `lib/casting/radar/computePairRadar()` 가 결정론으로 6축 점수와 matchRate 를 계산하고, `pairScore` 내림차순으로 top 4 axes 를 골라 PAIR BUNDLE 입력으로 전달한다.
- 6축 정의·점수 룰·alignment·dealbreaker: `04-radar-rules.md` 참조.
- LLM 은 입력으로 받은 4개 축만 다루며, 임의 축을 추가/변경하지 않는다.

### md ↔ 코드 sync 정책

> 이 파일의 system prompt 가 코드의 default. 변경 시 `lib/casting/prompts/system-prompts.ts` 도 같이 갱신할 것.
> Zod 스키마는 `lib/casting/prompts/schemas.ts` 가 single source of truth. 본 md 의 schema 섹션은 reference 용.

### 정합성 체크리스트 (제출 전)
- [ ] chapter3Notes 정확히 4개, 각 axis 가 입력의 matchedAxes[i].axis 와 일치 (순서도)
- [ ] 각 axis 가 6축 (만남 빈도/연락 빈도/연애 스타일/활동성/라이프스타일/계획성) 안에 있음
- [ ] 각 narrative 가 2문장, <b>...</b> 1곳
- [ ] simulation 에 후보 가상 첫 멘트 따옴표 1줄 포함
- [ ] simulation 4~6문장
- [ ] 강조 <b>...</b> 남용 없음 (notes 각 1곳, simulation 1~2곳)
- [ ] 의뢰인은 "의뢰인님", 후보는 "이 분/이 사람"으로만 호명
- [ ] 입력에 없는 부정적 평가/추측 금지 (예: 매칭 축에 안 들어온 mismatch 를 notes 에서 끌어와 부정적으로 다루지 않음)
- [ ] simulation 의 데이트 장소가 두 사람의 dateStyle/라이프 답변에서 자연스럽게 도출됨
