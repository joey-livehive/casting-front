# someonetheone — 전체 앱 구조 & 디자인 핸드오프

> **목적**: `/start` 를 포함한 someonetheone 전체 앱의 라우트 / 플로우 / 디자인 시스템을 정리. 다른 AI 에 디자인 재설계를 위임하기 위한 입력 문서.
>
> **주의**:
> - 리포트 상세 페이지(`/report/[reportId]`)는 별도 문서 `REPORT_HANDOFF.md` 참조. 본 문서는 **리포트 외 전 영역**과 전체 맥락을 다룸.
> - 모바일 퍼스트 (max-width 480~md).

---

## 1. 앱 한 줄 요약

"AI 매칭 에이전트" 컨셉의 모바일 퍼스트 Next.js 15 (App Router) 웹앱.
**랜딩 → 짧은 설문 → 폰번호 → 심화 설문 → 사진 → 자유메시지 → (외부 매칭 대기) → 리포트 받기.**
결제/백엔드 일부만 연결, 상당수가 mock / 프로토타입 상태.

---

## 2. 라우트 맵 (app/)

| 경로 | 파일 | 역할 | 상태 |
|---|---|---|---|
| `/` | `app/page.tsx` | **랜딩** — Places 스크롤 · 커플 일러스트 · Promises 4개 · "이미 3283명 찾아줬어" 카운터 · Final CTA | 사용중 (프로덕션) |
| `/start` | `app/start/page.tsx` | **온보딩 설문** — phase 8단계 단일 파일 state machine | 사용중 (프로덕션) |
| `/report/[reportId]` | `app/report/[reportId]/page.tsx` | **리포트 상세** (F01/M01/F02/M02 4종 mockData) | 사용중 (프로덕션) — 별도 `REPORT_HANDOFF.md` |
| `/my-card` | `app/my-card/page.tsx` | 내 소개 카드 편집 (localStorage `sto_onboarding` 기반) | 레거시 — 현 `/start` 에서 미사용 |
| `/search-preview` | `app/search-preview/page.tsx` | 탐색 기준 확인/편집 | 레거시 |
| `/searching` | `app/searching/page.tsx` | 탐색 애니메이션 (7 스텝 progress + fake profile) | 레거시 |
| `/results` | `app/results/page.tsx` | 매칭 후보 4장 언락 프로토타입 | 레거시 |
| `/payments/success`, `/payments/fail` | `app/payments/*` | 결제 리턴 | 프로토타입 스텁 |
| `/noir/*` | `app/noir/` | **동일 플로우의 누아르 테마 대체 버전** (start/my-card/results/search-preview/searching/payments 각각 복제) | 실험 버전 |

> ⚠️ **레거시 주의**: `my-card / search-preview / searching / results` 는 초기 매칭 UI 프로토타입 (보라/민트 팔레트·`sto-*` 토큰 기반). 현재 실제 유저 플로우는 **`/` → `/start` → (백엔드 매칭 대기) → `/report/xxx`** 이며, 중간 페이지들은 활용되지 않음. 재설계 시 **레거시 폐기 여부부터 결정** 필요.

---

## 3. /start 상세 (단일 파일 state machine)

`app/start/page.tsx` 1개 파일 안에 8개 phase 조건부 렌더링.

```
intro(9문항) → picky(자유서술) → phone → bridge → detail(7문항) → photo → message → done
```

### 3.1 phase 별 내용

| phase | UI 유형 | 내용 | 백엔드 호출 |
|---|---|---|---|
| `intro` | 4지선다 카드 9장 | 이상형: 매력 포인트 / 나이 / 키 / 체형 / 연애중요가치 / 연락스타일 / 종교 / 데일브레이커 / 첫 만남 | `POST /theone/survey/start` → `guest_uid` 생성, `PATCH /{uid}/answer` 반복 |
| `picky` | textarea 500자 | "말하기 힘든 나만의 까다로운 기준" | `PATCH /{uid}/answer` |
| `phone` | tel input 자동 하이픈 | 10~11자리 검증 | `PATCH /{uid}/phone` |
| `bridge` | 다크 배경 + CTA만 | "고마워! 너에 대해서도 자세히 물어봐도 돼?" | — |
| `detail` | 4지선다 카드 7장 | 본인 정보: 나이대 / 성별 / 지역 / 주말루틴 / 음주 / 연애스타일 / 연애준비도 | `PATCH /{uid}/answer` 반복 |
| `photo` | file input + preview | 매칭용 내 사진 1장 (공개 안 함, 건너뛰기 가능) | `PATCH /{uid}/photo` (base64) |
| `message` | textarea 2000자 | "나한테 하고 싶은 말 있어?" (선택) | `PATCH /{uid}/answer` |
| `done` | 완료 화면 + 홈 링크 | "완벽해! 네 사람 찾는 대로 알려줄게" | `trackSubmitApplication()` |

### 3.2 네비게이션

- 공통 상단 bar: 이전 버튼(`handleBack` 으로 phase 역순 이동) + `someonetheone` 로고 + spacer
- `phase ∈ {bridge, photo, message, picky, done}` 은 **전용 레이아웃** (상단 bar 없는 중앙 정렬)

### 3.3 트래킹

`lib/tracking.ts` → `trackPageView / trackAnswer / trackPicky / trackPhone / trackPhoto / trackMessage / trackSubmitApplication` + Meta Pixel(`layout.tsx` 에 스니펫).

---

## 4. 디자인 시스템

**현재 3개 팔레트 공존**. 재설계 시 통합 여부 결정 필요.

### 4.1 랜딩 / Start 팔레트 (프로덕션)

```
bg     #FEFBF4  크림 배경
ink    #2C1D07  진한 초콜릿 텍스트
accent #E85D2F  오렌지
gold   #F7CA5D  머스타드 — CTA 기본
dark   #1C1208  어두운 배경
cardBg #3D2E1A  다크 카드
```

`app/page.tsx` 와 `app/start/page.tsx` 안에 `const C = {…}` 로 하드코딩.

### 4.2 리포트 팔레트 (`:root` CSS vars)

```
--bg / --bg-deep / --cream        #F5EFE4 / #EDE4D3 / #FFF8EC
--ink / --ink-soft / --ink-mute
--orange / --orange-deep / --orange-bright
--mustard / --mustard-deep / --urgent
--dark / --dark-deep / --dark-elev / --dark-line / --dark-text
```

tailwind 에 `brand-*`, `dark-*` 로 매핑.

### 4.3 레거시 sto-* 팔레트 (my-card / results 등)

```
sto-primary       #8B5CF6  보라
sto-accent        #06F5C0  민트
sto-pink          #F472B6
sto-bg/surface/card/border/text/muted  베이지 계열
```

tailwind `sto-*` 색상. **현재 주 플로우와 톤이 완전히 다름** — 재설계 시 제거 후보.

### 4.4 폰트

- `Hahmlet` (display/serif) — `--font-hahmlet`
- `Gowun Dodum` (body sans 한글) — `--font-gowun`
- `Gaegu` (손글씨 캡션) — `--font-gaegu`
- `A2Z` (local OTF, sans 등록) — 거의 미사용
- `PP Editorial Old` (local OTF) — **`someonetheone` 로고 워드마크 전용**

### 4.5 시각 모티프 (현재)

- **뉴모피즘 오프셋 섀도**: `boxShadow: '3px 3px 0 #2C1D07'` 또는 `'4px 4px 0'` (CTA) / `'5px 5px 0'` (메인 CTA)
- **2px 블랙 border** 일관 — pill/card/input 모두 동일
- **`rounded-2xl`** (카드/인풋) + **`rounded-full`** (버튼)
- **`hover:-translate-y-0.5`** 떠오르는 인터랙션
- 랜딩 카드: `CARD_ROTATIONS = [-3, 1.5, -1, 2.5]` 미세 기울임 + 반반 gold/accent 배경 교차
- 말풍선 (`FloatingTag`): `framer-motion` 위아래 8px 플로팅, tail rounded-corner 로 오른쪽/왼쪽 꼬리
- 리포트 전용: 스크리블 밑줄 · 형광펜 하이라이트 · 검정 chapter pill · 핸드라이팅 캡션

### 4.6 반응형

- 전 페이지 **모바일 퍼스트** (랜딩 `max-w-6xl`, 설문/결과 `max-w-md`)
- 데스크톱 타겟팅 거의 없음 — 랜딩의 `sm:` 브레이크포인트만 간헐적

---

## 5. 주요 컴포넌트 (components/)

```
components/
├── report/*            # 리포트 전용 — REPORT_HANDOFF.md 참조 (30+ 파일)
├── GlassCard.tsx       # 범용 글래스 카드 (거의 미사용)
├── chat/               # 채팅 UI (사용처 확인 필요)
└── result-v7/          # results 페이지 v7 버전 컴포넌트
```

---

## 6. 데이터 / 상태

- **`/start`**: 로컬 `useState` + 백엔드 `theone/survey/*` 엔드포인트. 결과 페이지 연결 없음 (완료 후 홈으로 이동).
- **`/my-card`, `/search-preview`**: `localStorage.sto_onboarding` — 레거시 온보딩의 산출물이 저장된다고 가정하지만, 현 `/start` 는 이 키를 쓰지 않음.
- **`/report`**: 100% `lib/report/mockData.ts` 하드코딩. `?mock=A|B|C` 쿼리로 개인화 변형.
- **결제**: 없음 (alert 스텁).

---

## 7. 기술 스택

```json
{
  "next": "^15.5.9",         // App Router
  "react": "^18.3.1",
  "typescript": "^5.7.3",
  "tailwindcss": "^3.4.17",
  "chart.js": "^4.5.1",      // 리포트 레이더
  "framer-motion": "^12.38.0",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.0.2"
}
```

- **Node**: 20.19.x / **npm**: 10.x
- **도메인**: `someonetheone.publicvoid.im`

---

## 8. 디자인 재설계 시 정리 권장 포인트

1. **3개 팔레트 통일** — 랜딩 · 리포트 · 레거시가 각각 다른 색체계. 하나로 합치고 CSS 변수로 주입 권장.
2. **레거시 라우트 처리** — `/my-card`, `/search-preview`, `/searching`, `/results` 가 실 사용자 플로우에 없음. 유지 / 제거 / 다른 용도로 리디자인 중 택일.
3. **`/noir` 대체 테마** — 동일 플로우의 누아르 버전 존재. 테마 토글 구조로 리팩터링할지, 하나 버릴지 결정.
4. **`/start` 단일 파일 (740줄)** — phase 별 컴포넌트로 쪼갤지, 현 방식 유지할지 (현재 방식이 context 불필요해 단순).
5. **CTA 시그니처 스타일** — "오프셋 섀도 + 2px 블랙 border + `rounded-full` + gold 배경" 이 브랜드 시그니처. 존속 여부가 전체 톤을 바꿈.
6. **폰트 3종 (Hahmlet / Gowun / Gaegu) 유지 여부** — 리포트는 강하게 의존, 랜딩은 기본 폰트만 사용.
7. **모바일 고정 vs 데스크톱 대응** — 현재 사실상 모바일 전용. 데스크톱 전용 레이아웃 필요 여부 결정.

---

## 9. 관련 문서

- `REPORT_HANDOFF.md` — 리포트 상세 페이지(`/report/[reportId]`)의 컴포넌트/데이터/톤 가이드. 본 문서와 상호 보완.
