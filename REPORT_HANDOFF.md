# someonetheone 리포트 상세 페이지 — 현재 상태 작업지시서

> **목적**: 존댓말 버전 리포트 (`STO-2604-F02`, `STO-2604-M02`)의 현재 구현 상태를 다른 AI에 전달해 **디자인 재설계**를 받기 위함.
>
> **주의**: 반말 버전(`F01`/`M01`)은 이미 발행된 버전. 이 문서는 **F02 / M02 (존댓말) 버전만** 다룸.

---

## 1. 접속 URL

개발 서버: `http://localhost:3007`

- **존댓말 여성 유저 리포트**: `/report/STO-2604-F02` → `지영님` 기준, 남자 후보 (서글서글한 강아지상, IT 스타트업 PM)
- **존댓말 남성 유저 리포트**: `/report/STO-2604-M02` → `준호님` 기준, 여자 후보 (단아한 고양이상, 브랜드 디자이너)

모바일 퍼스트 (max-width 480px).

---

## 2. 프로젝트 구조

```
someonetheone/
├── app/
│   ├── globals.css                          # 브랜드 토큰(--bg, --ink, --orange 등) + blur-text/reveal-base 유틸
│   ├── layout.tsx                            # Hahmlet/Gowun Dodum/Gaegu 폰트 로드 + Meta Pixel
│   └── report/
│       └── [reportId]/
│           ├── page.tsx                      # 리포트 루트 (server component, reportId → mockData)
│           └── loading.tsx
├── components/
│   └── report/
│       ├── ReportShell.tsx                   # ⚙️ 클라이언트 래퍼: SheetContext + ToneContext + 전역 오버레이 렌더
│       ├── toneContext.ts                    # 'casual' | 'formal' 제공
│       ├── sheetContext.ts                   # openSheet() 제공 (어디서든 바텀시트 열기)
│       ├── SectionFrame.tsx                  # 공통 Section / SectionLabel / SectionTitle / HL
│       ├── ChapterCard.tsx                   # CHAPTER 1/2/3 공통 래퍼 (검정 chapter pill + psy badge)
│       │
│       ├── TopNav.tsx                        # 로고 + 발행일
│       ├── Hero.tsx                          # eyebrow pill + h1 (스크리블 하이라이트)
│       ├── CredibilityStrip.tsx              # 배지 3개 (4,293쌍 / 583쌍 / 비밀계약)
│       ├── HuntBox.tsx                       # 찾아온 경로 stats + effort sticker
│       ├── TeaserCard.tsx                    # 맛보기 카드 (블러 사진 + 중앙 얼굴확인 CTA)
│       ├── ReadingCard.tsx                   # Barnum 메모 (💌 6문단)
│       ├── Chapter1.tsx                      # CHAPTER 2 — 유저 성향 분석 4 trait (심리학 배지)
│       ├── Chapter2.tsx                      # CHAPTER 1 — 후보 디테일 (인물 사진 wide + 취미/성격/스타일/배경 + Day Timeline)
│       ├── Chapter3.tsx                      # CHAPTER 3 — 매칭 분석 (Chart.js 레이더 + notes + 🎬 시뮬)
│       ├── RadarChart.tsx                    # 클라이언트 전용 Chart.js 레이더
│       ├── RemainingCandidates.tsx           # 남은 4명 2×2 블러 카드 그리드
│       ├── ScarcityBlock.tsx                 # 희소성 + ⏳ 유효기간 + 🛡️ 재캐스팅 보장
│       ├── Bridge.tsx                        # BridgeGradient (베이지→다크) + BridgeIntro (intermission h2) + BridgeBack
│       ├── DarkZone.tsx                      # 다크 영역 래퍼 (상단 라디얼 글로우)
│       ├── CastingProcess.tsx                # behind the scenes + 3 SCENE 카드
│       ├── DmMock.tsx                        # SCENE 01 — Instagram DM 목업
│       ├── BizCardMock.tsx                   # SCENE 02 — 명함 목업 (-2deg 회전)
│       ├── LinkedinMock.tsx                  # SCENE 03 — LinkedIn 메시지 목업
│       ├── PrivacyBox.tsx                    # 다크존 내 밝게 반전된 프라이버시 약속
│       ├── VsSection.tsx                     # 소개팅앱 vs 썸원더원 bad/good 카드
│       ├── PriceCompare.tsx                  # 결정사 / 앱 / 우리 3종 비교 + 1/20 캡션
│       ├── CoupleTestimonials.tsx            # 가로 스냅 캐루셀 3장
│       ├── FinalSignature.tsx                # 발품 팔아둘게 💌
│       ├── FixedBottomCta.tsx                # 하단 고정 바 (12:00 카운트다운 + CTA)
│       ├── PurchaseToast.tsx                 # 구매/매칭/만남 알림 pill 로테이션
│       └── PurchaseBottomSheet.tsx           # 슬라이드업 + 요금제 3종
├── hooks/
│   ├── useCountdown.ts                       # 하단 CTA 타이머 (12분)
│   ├── useScrollReveal.ts                    # IntersectionObserver 기반 (현재 미사용)
│   └── useToastRotation.ts                   # 3.5s 후 첫 노출 → 6~9s 간격 로테이션
├── lib/
│   └── report/
│       ├── types.ts                          # ReportData / Candidate / MatchAnalysis / PricingPlan + Tone
│       ├── mockData.ts                       # F01/M01/F02/M02 4종 하드코딩 (F02/M02는 존댓말 copy 포함)
│       ├── purchaseToastData.ts              # 10개 토스트 (6구매 / 2매칭 / 2만남)
│       └── blurMarkup.ts                     # <blur>X</blur> → <span class="blur-text">
├── public/images/teaser/
│   ├── f01-card1.png, f01-card2.png          # 여자 유저용 맛보기 + Chapter 2 사진 (F02도 공유)
│   ├── m01-card1.webp, m01-card2.webp        # 남자 유저용 (M02도 공유)
│   └── m01-extra1~4.webp                     # 남은 4명 미리보기 (M02만. F02는 그라디언트 placeholder)
├── tailwind.config.ts                        # brand-* / dark-* 토큰 + 폰트 + keyframes
├── tsconfig.json                             # @/* 별칭 설정됨
└── package.json
```

---

## 3. 기술 스택

```json
{
  "next": "^15.5.9",             // App Router
  "react": "^18.3.1",
  "typescript": "^5.7.3",
  "tailwindcss": "^3.4.17",
  "chart.js": "^4.5.1",          // 레이더 차트
  "framer-motion": "^12.38.0",   // (현재 리포트 페이지에는 미사용)
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.0.2"
}
```

- **폰트**: `Hahmlet` (display/serif), `Gowun Dodum` (body/sans), `Gaegu` (hand/cursive) — next/font/google
- **데이터**: 100% mockData, API 연동 없음
- **결제**: 현재 `alert()` 스텁. PG 미연동.

---

## 4. 컴포넌트 상태

전부 F02/M02 존댓말 분기까지 **완료** 상태. 디자인 재설계 대상.

| 컴포넌트 | 상태 | 비고 |
|---|---|---|
| TopNav | ✅ 완료 | |
| Hero | ✅ 완료 | eyebrow pill, h1 스크리블 하이라이트 |
| CredibilityStrip | ✅ 완료 | 배지 3개 |
| HuntBox | ✅ 완료 | 2×2 stats 그리드, effort sticker, 점선 summary |
| TeaserCard | ✅ 완료 | 블러 사진 + 중앙 `얼굴 확인하기` CTA, 하단 그라디언트 닉네임, 2×2 meta |
| ReadingCard | ✅ 완료 | Barnum 5문단 + closing. `💌 {userName}님께 쓰는 메모` 라벨 |
| Chapter1 (CHAPTER 2) | ✅ 완료 | 4 trait, 심리학 배지 |
| Chapter2 (CHAPTER 1) | ✅ 완료 | 인물 사진 wide + 취미/성격/스타일/배경 + Day Timeline |
| Chapter3 (CHAPTER 3) | ✅ 완료 | Chart.js 레이더 + notes + 🎬 시뮬 |
| RemainingCandidates | ✅ 완료 | 2×2 블러 카드 (Instagram / LinkedIn / 헬스장 / 와인바) |
| ScarcityBlock | ✅ 완료 | 피치/크림 그라디언트, ⏳ 빨간 유효기간, 🛡️ 검정 보증 |
| Bridge (gradient/intro/back) | ✅ 완료 | 70px 4-stop 웜톤 그라디언트 |
| DarkZone | ✅ 완료 | 상단 120px 라디얼 글로우 |
| CastingProcess | ✅ 완료 | SCENE 01/02/03 |
| DmMock / BizCardMock / LinkedinMock | ✅ 완료 | |
| PrivacyBox | ✅ 완료 | 다크존 내 밝게 반전 |
| VsSection | ✅ 완료 | bad 다크, good 피치 |
| PriceCompare | ✅ 완료 | 3종 비교 |
| CoupleTestimonials | ✅ 완료 | 가로 스냅 캐루셀 (**사진 없음 — placeholder 그라디언트**) |
| FinalSignature | ✅ 완료 | |
| FixedBottomCta | ✅ 완료 | 12:00 카운트다운, CTA pulse |
| PurchaseToast | ✅ 완료 | 10개 로테이션, 3s 노출 / 6~9s 간격 |
| PurchaseBottomSheet | ✅ 완료 | 요금제 3종, 약관, 결제 버튼 (이메일 필드 제거됨) |

---

## 5. v6 HTML 프로토타입 대비 달라진 점

### 5.1 카피 (유저 피드백 반영)
- `매칭 매니저` → **`매칭 매니저 전원`** (배지)
- `근데 맛보기로 딱 1명만 먼저 보여줄게` → **`맛보기로 딱 1명만 먼저 보여드릴게요`** ("근데" 제거)
- `🔒 얼굴 가려둠` 우상단 뱃지 **삭제** (TeaserCard)
- `🔒 얼굴은 결제 후 공개` 라벨 → **`얼굴 확인하기` 클릭 가능한 오렌지 버튼**으로 교체 (Chapter 2, 바텀시트 열림)
- TeaserCard 중앙 버튼 `🔓 엄선된 사람 소개 받기` → **`얼굴 확인하기`** (이모지 제거)
- Chapter 1/2 **순서 교체**: "이 사람 디테일" 먼저, "유저 성향" 나중에. 내부 라벨 "CHAPTER 1"/"CHAPTER 2"도 스왑.
- 바텀시트의 `📧 리포트를 받을 이메일` 섹션 **전체 삭제** (이메일 수집 X)
- Bridge h2 `"너만을"` → 존댓말에선 **`"오직 당신만을"`**

### 5.2 카피 전반의 톤
- **F02/M02는 모든 본문을 존댓말(요체)로 재작성.**
- 반말 버전 카피는 `lib/report/mockData.ts`에 casual 원문 유지 → **F02/M02는 formal 변형 별도 저장**
- 호칭은 현재 `{userName}님` (`지영님`, `준호님`) — mock 이름. 실제 서비스엔 이름 없음 → **호칭 정책 미정** (후보: `회원님`, `의뢰인님`, `주인공님`, `그대` 등 논의 중)

### 5.3 디자인
- Bridge 그라디언트 **2-stop 베이지→다크 → 4-stop 웜톤(`F5EFE4 → D6C3A2 → 8A6E52 → 2E2A23`)** (전환 탁함 개선)
- BridgeIntro(intermission)를 DarkZone **내부**로 이동 → 배경색 seam 제거
- **RemainingCandidates** 섹션 v6에 없던 신규 추가 (Chapter 3 ↔ ScarcityBlock 사이)
- 챕터 카드 간격 `mt-7 (28px)` → **`mt-12 (48px)`** (피로도 완화)
- PurchaseToast 이니셜 원 아바타 + 이모지 **제거** (텍스트만)
- 토스트 내용 **3타입 배리에이션**: 구매 6 / 매칭 2 / 만남 2 (v6엔 구매만)
- 토스트 주기 **12~16s → 6~9s** (활발해짐), 노출 시간 4s → 3s

### 5.4 기능
- **이미지 보호 4중 방어** (TeaserCard / Chapter2 / RemainingCandidates):
  `onContextMenu preventDefault` / `draggable=false` / `pointer-events: none` / `WebkitUserSelect/TouchCallout/UserDrag: none`
- 블러 강도: `blur(12px) scale(1.15)` (teaser), `blur(10px) scale(1.15)` (chapter2), `blur(8px) scale(1.1)` (remaining)

---

## 6. 데이터 흐름

### 6.1 리포트 데이터
- **소스**: `lib/report/mockData.ts` 하드코딩 (F01/M01/F02/M02 4종)
- **로직**: `getReport(reportId)` → `ReportData | null`
- **타입**: `lib/report/types.ts` (ReportData, Candidate, MatchAnalysis, PricingPlan, Tone)
- **API 연동**: **없음.** 모든 값이 빌드타임 상수.

### 6.2 유저 데이터 치환 방식 (현재)
- **없음.** `userName`, `publishedAt`, `huntStats` 등 모두 mockData에 고정값.
- `STO-2604-F02`의 `userName`은 `'지영'`으로 하드코딩 → 실제 유저 이름 아님.
- **프로덕션 전 필수**: 유저 식별 후 `userName`, `publishedAt`, 매칭 스코어 등 동적 치환 로직 필요.

### 6.3 Tone 주입
- `ReportData.tone: 'casual' | 'formal'` 필드 → `ReportShell`이 `ToneContext.Provider` 로 하위에 주입
- 각 컴포넌트 `const tone = useTone()` 으로 구독, 문장 끝 ternary 분기

### 6.4 바텀시트 상태
- `ReportShell`에서 `useState(false)` 로 open 제어
- `SheetContext.Provider` 로 `openSheet()` 함수 제공
- `TeaserCard`, `Chapter2`, `FixedBottomCta`, `RemainingCandidates` 네 곳에서 `useSheet()`로 같은 바텀시트 오픈

---

## 7. 분석 이벤트 박힌 위치

### 7.1 결제 클릭 (InitiateCheckout)
- **파일**: `components/report/PurchaseBottomSheet.tsx` (81~89줄)
- **이벤트**: Meta Pixel `fbq('track', 'InitiateCheckout', {...})`
- **페이로드**:
  ```ts
  {
    value: selected.discountedPrice,       // 39900 | 69900 | 99900
    currency: 'KRW',
    content_ids: ['someonetheone'],
    content_name: `report_${reportId}_${selected.id}`
  }
  ```
- **추가**: `console.log('[purchase_click]', { reportId, plan, amount })`
- **결제 실행**: 현재 `alert()` 스텁 (PG 미연동)

### 7.2 페이지뷰
- `app/layout.tsx` 상단에 Meta Pixel 스니펫 삽입됨 (`fbq('init', '573919161734831')` + `fbq('track', 'PageView')`) → 자동 집계

### 7.3 미구현
- CTA 클릭 / 바텀시트 오픈 / 스크롤 뷰 등 **세부 퍼널 이벤트 없음**. 결제 직전 단계까지 트래킹 공백.

---

## 8. 남은 작업 리스트

### 8.1 디자인 재설계 (이 작업지시서의 주 목적)
- 전반적 레이아웃/타이포/카드 톤 재정비
- 특히 아래 영역이 피드백 많았음:
  - **Bridge 그라디언트** (톤 매치 이슈 있었음)
  - **챕터 카드 간격**
  - **토스트 UI** (아바타 제거 후 심플)
  - **남은 4명 그리드** (신규 섹션, 배치 미확정)

### 8.2 에셋
- **F02 남은 4명 사진 4장** 미업로드 (현재 그라디언트 placeholder) — 경로 규칙: `public/images/teaser/f02-extra1~4.*`
- **CoupleTestimonials 커플 사진 3장** (뒷모습/손/그림자) 전부 미업로드
- **실제 명함 이미지** — 현재 CSS로 그린 가상 명함
- M02/F02는 F01/M01과 같은 사진 공유 중 → 필요 시 분리

### 8.3 호칭 정책 (⚠️ 미결정)
- 현재 `지영님/준호님` mock name 사용 중. 실제 서비스엔 이름 정보 없음.
- 후보: `회원님` / `의뢰인님` / `주인공님` / `그대` / `자기님` 등 논의 중
- 결정되면 mockData의 userName 필드 제거 + 각 컴포넌트에서 호칭 상수 주입 필요

### 8.4 API 연동
- 리포트 ID → 실제 유저/후보 데이터 조회 백엔드 엔드포인트 미설계
- 동적 `userName`, `publishedAt`, `huntStats`, `totalCandidates`, `teaserCandidate` 등 전부 서버 주입 필요

### 8.5 결제
- PG 연동 미구현 (토스페이먼츠 또는 포트원 예정)
- `PurchaseBottomSheet.tsx`의 `handlePay` 함수 교체만 하면 됨
- 이메일 미수집 상태 → 결제 후 리포트 전달 방식 논의 필요

### 8.6 퍼널 트래킹
- 바텀시트 오픈 / 플랜 선택 / 결제 성공 이벤트 추가 필요 (현재 InitiateCheckout만)
- GA / Amplitude 등 추가 어노테이션 검토

### 8.7 기타
- 리포트 SEO/OG 이미지 리포트별 동적 생성 여부 결정
- 링크 유효기간 / 만료 후 화면 설계 없음
- 실제 스크린샷 저장 방지는 OS 레벨이라 방어 불가 — DRM/워터마크 여부 결정 필요

---

## 9. 현재 시각적 톤 (디자인 재설계 시 참고)

**색상 팔레트 (유지 권장)**
- 밝은 영역: `#F5EFE4` (베이지 bg) / `#FFF8EC` (크림 카드) / `#EDE4D3` (bg-deep)
- 잉크: `#1C1A17` / `#4A443B` / `#8A8275`
- 포인트: `#EC6A3D` (orange) / `#D4542A` (orange-deep) / `#FF8B5E` (bright)
- 강조: `#F5B847` (mustard) / `#E0A030` (mustard-deep) / `#D93829` (urgent)
- 다크: `#2E2A23` (dark) / `#252117` (deep) / `#3A3529` (elev) / `#F0E8D7` (text)

**폰트**
- 헤드라인 / 브랜드로고 / 수치: **Hahmlet 700~800** (serif, letter-spacing -0.02~-0.04em)
- 본문: **Gowun Dodum** (sans, 한글 가독성 우선)
- 손글씨 악센트 (라벨/캡션/말풍선): **Gaegu** (cursive)

**스타일 모티프**
- 뉴모피즘/레트로 박스섀도 `4px 5px 0 var(--line)` (밝은 카드)
- `6px 7px 0 var(--line)` (맛보기 카드 & 희소성 블록 강조)
- 검정 border `1.5px` / `2px` 일관
- 형광펜 하이라이트 `bg-gradient 60% 머스타드` (section 타이틀 강조어)
- 스크리블 밑줄 (hero h1 `7일간`)

---

## 10. 재설계 시 유의사항

1. **반말(F01/M01) 버전과의 레이아웃 정합성 유지**: tone만 다를 뿐 컴포넌트/레이아웃은 동일해야 함. 디자인 변경 시 양쪽 다 체크.
2. **모바일 퍼스트 max-width 480px**: 데스크톱 레이아웃 미고려.
3. **컴포넌트 단위 교체 자유**: `ReportShell`이 `SheetContext` + `ToneContext` 를 제공하므로, 컴포넌트 내부만 바꿔도 동작.
4. **Chart.js 의존**: Chapter3 레이더는 클라이언트 전용. 다른 라이브러리로 교체 시 `'use client'` 유지 필요.
5. **서비스 포지셔닝**: "앱 아닌 에이전시" 컨셉 일관성 유지. 캐스팅 매니저 / 발품 / 포장 / 진지함 등 키워드는 유지 필요.
