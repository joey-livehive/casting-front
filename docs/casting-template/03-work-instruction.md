# 작업 지시 — 캐스팅 매칭 카드 LLM 프롬프트 작성

이 문서는 다른 클로드/Cursor 세션에 붙여넣어 LLM 프롬프트를 작성하게 만드는 **작업 지시서**다.

---

## 사용법

1. 아래 프롬프트 블록 전체를 복사
2. `01-template-structure.md` 와 `02-prompt-design.md` 를 같이 첨부
3. 새 세션에 붙여넣고 작업 시작

---

## 작업 지시 프롬프트 (그대로 붙여넣기)

```
너는 캐스팅(데이팅 매칭 서비스)의 매칭 카드(리포트) LLM 프롬프트를 작성한다.

## 컨텍스트 (첨부 문서)

- 01-template-structure.md — 매칭 카드 페이지의 모든 섹션 구조와 슬롯, 현재 mock 카피 (톤 레퍼런스)
- 02-prompt-design.md — LLM 영역 분류 (B/C/D), 프롬프트 입출력 스키마, 카피 톤 가이드
- 04-radar-rules.md — 6축 점수·matchRate·dealbreaker 결정론 룰 (LLM 무관, 코드)
- example-user-answers.md — casting DB 실데이터 페르소나 3건 + 답변 코드 매핑
- (별도) survey-questions.md — 설문 문항 전체 (캐스팅 신규 form)

## 서비스 특성

- 의뢰인은 "캐스팅"을 의뢰한다. 캐스터(우리 서비스)가 의뢰인의 설문을 보고 어울리는 사람을 골라 카드 형태로 전달.
- 의뢰인 호칭은 "의뢰인" 으로 고정 ("의뢰인님" 으로 렌더). 실명 노출 없음.
- 매칭 카드는 의뢰인이 결제 후 받는 페이지. 톤은 formal.
- 사람 풀의 모든 사용자는 잠재 의뢰인 + 잠재 후보 둘 다임. 그래서 한 사람 입수 시 candidate bundle 과 viewer bundle 을 한 번에 생성한다.

## 작업

다음 두 개의 LLM 프롬프트를 작성해 줘.

### Prompt 1: PERSON BUNDLE (B + C 통합)

한 사용자의 설문/자유서술/사진을 받아, **그 사람이 후보로 매칭될 때 (candidateBundle)** 와
**의뢰인일 때 (viewerBundle)** 둘 다에서 사용할 카피를 한 번에 생성한다.

출력 슬롯과 JSON 스키마는 02-prompt-design.md 의 "Prompt 1: PERSON BUNDLE" 섹션 참조.

### Prompt 2: PAIR BUNDLE

의뢰인과 매칭 상대 양쪽 답변 + 백엔드가 미리 골라준 매칭 축 4개를 받아, 둘이 왜 잘 맞는지의 notes 4개와 첫 만남 시뮬을 생성한다.

출력 슬롯과 JSON 스키마는 02-prompt-design.md 의 "Prompt 2: PAIR BUNDLE" 섹션 참조.

## 핵심 요구사항

### 카피 톤
1. **의뢰인 인격 분석 (viewerInsight)** 은 "범용적으로 잘 맞히는" 인격 묘사가 핵심. 사람들이
   "오, 나 그런 사람 맞아" 하고 끄덕일 따뜻하고 정확한 묘사.
2. **설문의 작은 표현·체크 항목을 직접 인용** ("수시로 연락했으면", "맞춤법 잘 지키는 사람"
   등) 해서 정밀한 분석 인상.
3. **강조는 `<b>...</b>`** 한두 곳만. 너무 많이 쓰지 말 것.
4. **viewer 표현은 "의뢰인님"** 으로 호명.

### 캐싱 분리
1. **candidateBundle 카피는 viewer 를 절대 참조하지 말 것.** 후보 풀 캐시로 동작해야 하기 때문.
   → "이 사람은 ~한 분이에요. ~한 타입이라, ~한 사람이에요." 로 닫기. "의뢰인님이 ~" 같은 표현 금지.
2. **viewerBundle 카피는 후보를 절대 참조하지 말 것.** 의뢰인 캐시로 동작.
   → "의뢰인님은 ~한 분이세요." 로 닫기.
3. **PAIR BUNDLE 만 양쪽을 같이 언급**할 수 있다.

### 카피 재사용
- `casterHeadline` 한 줄은 TeaserCard.recommendation + CasterNote.headline 두 자리에서 같은
  텍스트로 노출됨. 두 자리 모두에서 어울리는 한 줄로 작성.

### Few-shot
- 01-template-structure.md 의 mock 카피들이 톤 레퍼런스. few-shot 예시 1셋을 그대로 활용.

## 산출물

각 프롬프트에 대해 아래를 모두 작성:

1. **System prompt** (모델 역할 / 톤 / 제약사항 / 출력 포맷 강제)
2. **User prompt template** (변수 슬롯 명시, Jinja-style `{{...}}` 권장)
3. **Output JSON schema** (Zod TypeScript 또는 JSON Schema)
4. **Few-shot example** 1쌍 (Input → Output)
5. **테스트 케이스 3개** (다양한 페르소나 — 외향/내향, 초혼/재혼 의향 등)

## 산출물 파일 위치

- `docs/casting-template/prompts/person-bundle.md`
- `docs/casting-template/prompts/pair-bundle.md`

각 파일에 위 5개 항목을 모두 담는다.

## 추가 고려

- **반드시 첨부된 두 MD 파일을 먼저 정독한 뒤** 작업 시작할 것.
- 모르는 필드/슬롯이 있으면 추측하지 말고 먼저 물어볼 것.
- LLM 비용 절감을 위해 Prompt 1 은 candidateBundle + viewerBundle 을 한 번의 호출로 묶는다.
  분리 호출 금지.
```

---

## 체크리스트 — 산출물 검토

작업이 끝나면 아래를 확인:

- [ ] candidateBundle 카피 어디에도 "의뢰인" 단어 없음
- [ ] viewerBundle 카피 어디에도 "이 사람" / 후보 참조 없음
- [ ] `casterHeadline` 한 줄이 TeaserCard recommendation 자리에 그대로 들어가도 어색하지 않음
- [ ] notes 4개가 "단순 비교"가 아닌 "왜 잘 맞는지 해설" 톤
- [ ] simulation 에 후보 가상 첫 멘트 따옴표 1줄 포함
- [ ] `<b>...</b>` 강조 한두 곳, 남용 없음
- [ ] 톤이 mock 카피와 일치 (formal, 따뜻함)
