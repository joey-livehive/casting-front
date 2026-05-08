# 인스타 변형 — LLM 프롬프트 설계

단일 호출로 의뢰인 매칭 카드 한 장에 들어갈 모든 카피·메타·축 값을 생성한다.

- **소스**: `lib/casting/insta/system-prompt.ts` 의 `DEFAULT_INSTA_SYSTEM_PROMPT`
- **검증**: `lib/casting/insta/schema.ts` 의 `InstaContentSchema` (Zod)
- **테스트**: `/casting/insta-prompt-test`

## 입력

```ts
interface InstaContentInput {
  viewer: { answers: CastingAnswers };       // 의뢰인 설문 응답 (정형)
  candidate: {
    handle?: string;
    bio?: string;
    samplePosts: string[];                   // 캡션 샘플 5~15개
    photoUrls: string[];                     // 첫 URL 만 vision 입력으로 사용
    hints?: { likelyAgeRange?: string;
              likelyOccupation?: string;
              location?: string };
  };
}
```

User prompt 는 위 데이터를 한국어 라벨링된 markdown 으로 직렬화 (`route.ts.buildUserPrompt`).
사진은 `photoUrls[0]` 만 vision input 으로 별도 첨부, 추가 URL 은 텍스트로만.

## 출력 (InstaContent)

```ts
{
  // teaser meta (인스타 추정)
  faceType: string;                  // 8~24자, 분위기 묘사
  ageRangeEstimate: string;          // ex "20대 후반"
  occupationEstimate: string;        // ex "디자이너"
  mbtiEstimate?: string;             // 옵션, 4글자
  heightEstimate?: string;           // 옵션

  // caster note
  casterHeadline: string;            // 15~40자, 평문(<b>·!·따옴표 금지)
  casterCharmBullets: [string,string,string]; // 각 8~80자, <b> 1곳

  // reading card
  viewerInsight: string;             // 4~5문장, <b> 1곳, 후보 언급 금지
  matchOpening: string;              // 2~3문장, <b> 1곳
  candidateMatch: string;            // 4~5문장, <b> 1곳

  // chapter 1
  personality: string;               // 4~5문장
  datingStyle: string;               // 4~5문장
  feedCharm: string;                 // 4~5문장, 피드에서 보이는 매력

  // chapter 2 — 4축 양극 (좌측 비율 0~100 정수)
  bipolarValues: {
    energy: number;          // 0=내향, 100=외향
    judgment: number;        // 0=감성, 100=이성
    selfExpression: number;  // 0=활발, 100=차분
    behavior: number;        // 0=안정, 100=모험
  };
  spectrumNotes: string[];   // 2~4개, 각 40~220자, <b> 1곳

  // chapter 3
  simulation: string;        // 6~8문장, 따옴표(가상 첫 멘트) 1회, <b> 1곳
}
```

## 4축 정의 — 인스타 시그널 → 좌/우 매핑

| 축 | 좌 | 우 | 인스타 시그널 |
|---|---|---|---|
| **energy** | 내향적 | 외향적 | 사람·그룹 사진 빈도, 모임/이벤트 노출 |
| **judgment** | 감성적 | 이성적 | 캡션 톤 — 무드/감정 vs 정보/관찰 |
| **selfExpression** | 활발한 | 차분한 | 표현 강도·다이내믹 vs 일관·잔잔 |
| **behavior** | 안정 추구 | 모험 추구 | 익숙한 동선·일상 vs 새 장소·여행 |

값이 50 부근이면 "균형" 으로 풀고, 극단값(15 미만/85 초과)은 강한 시그널이 있을 때만 부여한다.

스키마 컨벤션: `bipolarValues[axis]` 는 *우측 라벨 비율*. 화면 렌더 시 `leftPercent = 100 - 값` 으로 좌측 막대 채움.

## 검증 게이트 (Zod)

`schema.ts` 가 강제하는 룰:

- `casterHeadline`: 직업 카테고리 단어, MBTI 영문 4글자, `<b>`, `!`, 따옴표 금지
- 모든 narrative 필드: 금지어(`곁자리/곁을 지키/결자리/자유서술`), "OO한 결" 추상 명사, "ENFP 특유의" 클리셰 차단
- 본문 전반: 길이 제약(예: 4~5문장 → 120~600자), `<b>` 강조 1곳 이상
- `simulation`: 가상 첫 멘트 따옴표 1회 필수

검증 실패 시 422 응답, 문제 필드 issues + 원본 raw 함께 반환 → 프롬프트 수정 후 재호출.

## 시스템 프롬프트 전문

→ `lib/casting/insta/system-prompt.ts` 의 `DEFAULT_INSTA_SYSTEM_PROMPT` 가 source of truth.
이 md 와 TS 가 어긋나면 TS 가 정답 (앱이 그 값을 쓰므로). md 는 동기화 검토 책임.

## 운영 가이드

1. **LLM 키**: `.env.local` 에 `GOOGLE_API_KEY` 또는 `ANTHROPIC_API_KEY` 설정 필요. 없으면 503.
2. **운영 환경 보호**: `/casting/insta-prompt-test` 페이지와 `/api/casting/insta-prompt-test` 라우트 둘 다 `NODE_ENV=production` + `ENABLE_PROMPT_TEST=1` 가드. 외부 노출 시 LLM 비용 위험.
3. **모델 기본값**: `llm-client.ts` 의 기본 — Gemini `gemini-3-flash-preview`, Anthropic fallback `claude-sonnet-4-6`. 페이지에서 모델 override 미지원 (요청 body 에 `model` 필드로 전달 가능).
