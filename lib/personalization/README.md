# Personalization Layer

이 폴더는 리포트의 "개인화 영역" 을 관리합니다.

## 현재 단계 (UI Mock)

- `types.ts` — `UserAnswers`, `PersonalizedContent` 타입
- `static-content.ts` — 모든 유저에게 공통으로 보이는 고정 해석 텍스트 (`TRAITS`, `READING_CARD_CONTENT`, `FALLBACK_INTROS`)
- `mock-users.ts` — 유저 답변 Mock 3종 (A/B/C)
- `mock-personalized.ts` — LLM 출력 Mock 3종 (수동 작성)

리포트 페이지는 URL 파라미터 `?mock=A|B|C` 로 유저를 선택해서 렌더링합니다. 파라미터 없으면 `A` 가 기본값.

```
/result-v7/STO-2604-F02?mock=A   # 답변 중간 수준
/result-v7/STO-2604-F02?mock=B   # 답변 많음 + 자유응답
/result-v7/STO-2604-F02?mock=C   # 답변 적음 (폴백 테스트)
```

## 향후 작업 (LLM 연동, Addendum 02)

1. `mock-personalized.ts` 를 `fallback-personalized.ts` 로 이름 변경 (LLM 실패 시 폴백)
2. 실제 API 호출 구현:

   ```
   POST /api/reports/personalize
   Body: UserAnswers
   Response: PersonalizedContent
   ```

3. 백엔드에서 Gemini 호출 (프롬프트는 Addendum 02 참조)
4. Production DB (MySQL) 에서 `UserAnswers` 조회

## 마커 규칙

코드 내 `[LLM_GENERATED]` 주석이 있는 영역이 LLM 으로 교체될 자리입니다. grep 으로 검색하면 교체 지점을 찾을 수 있습니다:

```
grep -rn "LLM_GENERATED" lib/personalization/ components/result-v7/
```

현재 기준 6개 이상 결과가 나와야 정상 (Trait 4 + Reading 2 = 최소 6개).
