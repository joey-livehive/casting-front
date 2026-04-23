# Personalization Layer

리포트 페이지의 **개인화 영역**을 관리하는 레이어.

## 현재 단계 (UI Mock)

- `types.ts` — `UserAnswers`, `PersonalizedContent` 타입
- `static-content.ts` — 모든 유저에게 동일하게 보이는 고정 해석 (TRAITS, READING_CARD_CONTENT, FALLBACK)
- `mock-users.ts` — 유저 답변 Mock 3종 (A/B/C)
- `mock-personalized.ts` — LLM 출력 Mock 3종 (수동 작성)

리포트 페이지는 URL 파라미터 `?mock=A|B|C`로 케이스 선택.

| 케이스 | 설명 |
|---|---|
| A | 답변 중간 수준, 자유응답 없음 (기본값) |
| B | 답변 많음 + 자유응답 있음 |
| C | 본인 정보만, 자유응답 없음 |

## 향후 작업 (LLM 연동 — Addendum 02)

1. `mock-personalized.ts` → `fallback-personalized.ts`로 rename (LLM 실패 시 폴백용)
2. 실제 API 엔드포인트 구현:
   ```
   POST /api/reports/personalize
   Body: UserAnswers
   Response: PersonalizedContent
   ```
3. 백엔드에서 Gemini 호출 (프롬프트 초안은 brief §10 참조)
4. Production DB(MySQL)에서 `UserAnswers` 조회

## 마커 규칙

개인화 텍스트가 들어갈 자리는 코드 내에 `[LLM_GENERATED]` 주석으로 표시됨.
나중에 실제 API 호출로 교체할 때 grep으로 찾음:

```bash
grep -rn "LLM_GENERATED" components/ lib/
```

현재 총 **6개 스팟** (Chapter 1 Trait 4개 + ReadingCard 문단 2개).

## 제약 조건

| 필드 | 분량 | 규칙 |
|---|---|---|
| `trait0X_intro` | 1~2문장, 40자 이내 권장 | 유저 답변 큰따옴표 직접 인용, 합쇼체, 의역 금지 |
| `paragraph1_opening` | 1~2문장 | 이상형 답변 1~2개 통합 |
| `paragraph2_opening` | 1~2문장 | 자유응답 있으면 인용 / 없으면 본인정보 / 없으면 폴백 |

**폴백**: `lib/personalization/static-content.ts`의 `FALLBACK_INTROS`.

## 주의 사항

- **유저 답변은 원본 그대로 보관**. 띄어쓰기·구두점 수정 금지.
- 빈 문자열/`null` 개인화 문장은 DOM에 렌더링되지 않음 (v7 원본 구조로 fallback).
- 이 레이어는 디자인 토큰/Tailwind 설정/기본 해석 텍스트(`static-content.ts`)와 무관하게 독립 교체 가능해야 함.
