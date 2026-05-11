# Casting Prompt Architecture

> 캐스팅 매칭 리포트 LLM 프롬프트 / 데이터 모델의 단일 source-of-truth 청사진.
> 코드 변경의 순서·범위·명명 규약을 박아두는 문서. 실제 코드는 이 문서를 따른다.

---

## 0. 용어 (Glossary)

| 어휘 | 의미 | 비고 |
|---|---|---|
| **owner** | connection 의 주체 = 결제자 = 의뢰인 | 항상 동일 사람, source=internal 고정 |
| **partner** | connection 의 상대 = 매칭인 | 항상 동일 사람, source = internal/insta/(미래 linkedin 등) |
| **connection** | owner ↔ partner 매칭 관계 단위 | 백엔드의 핵심 도메인 |
| **perspective** | 리포트가 누구 시점인가 (`'owner' \| 'partner'`) | 리포트마다 다름 |
| **source** | 한 사람의 데이터가 어디서 왔는가 (`'internal' \| 'insta' \| ...`) | Profile.source |
| **ready** | 이 사람이 매칭 후보로 노출 가능한 상태인지 게이트 | source 별 트리거 다름 (§ 2.1) |
| **lazy** | 필요한 시점에 생성 (cache hit 안 되면 그제야 LLM 호출) | LLM 비용/UX 트레이드오프 |
| **eager** | 트리거 시점에 미리 생성 (페이지 호출 시 cold start 없음) | 비용 미리 부담, UX ↑ |

---

## 1. 우리가 만드는 리포트 3종 + 페이지 라우트

| 리포트 | perspective | partner.source | 운영 라우트 |
|---|---|---|---|
| 게스트 매칭 리포트 | `owner` | `internal` | `/connection/casting/{uid}` |
| 인스타 매칭 리포트 | `owner` | `insta` | `/connection/casting/{uid}` (partner.source 분기) |
| 소개받은 사람 리포트 | `partner` | (둘 다) | `/connection/cast/{uid}` |

라우트 어휘 결정 (캐스팅 brand + 영문법 정확):
- `casting` = 캐스팅 행위 (owner 가 매칭인을 발탁하는 시점의 페이지)
- `cast` = 영화 산업의 *the cast* (배역을 받은 사람) → partner 가 캐스팅 받았다는 시점의 페이지
- 경로는 `/connection/{intent}/{uid}` 패턴 (v3 의 `/connection/{uid}/{intent}` 에서 정정 — uid 가 항상 마지막에 와야 일관). v4 합의.

핵심 통찰:
- `perspective` 와 `partner.source` 는 **직교**.
- 게스트/인스타 매칭은 perspective 동일, partner.source 만 다름 → 같은 페이지 컴포넌트 + 같은 CONNECTION 프롬프트.
- 소개받은 사람은 perspective 가 뒤집힘 → 다른 CONNECTION 프롬프트 필요.

---

## 2. 4-Layer 파이프라인

### 2.1 `ready` 라이프사이클 (매칭 자격 게이트)

```
[guest 라이프사이클]
설문 완료 → 전화번호 들어옴 → ready=true → internal_adapter (코드, deterministic) → Profile 채움 → 후보 노출 가능

[insta 라이프사이클]
풀링 (raw 수집) → FILTER_INSTA (★ 매칭 가능 후보 추리기) → 통과 → ready=true → PROFILE_INSTA (정규화) → Profile 채움 → 후보 노출 가능
```

→ **`ready` 는 모든 사람의 매칭 자격 게이트**, source 무관 공통 개념.
→ source 추가 (linkedin 등) 시 `FILTER_<SOURCE>` + `PROFILE_<SOURCE>` 한 쌍 추가하면 끝.

### 2.2 전체 파이프라인 그림

```
[Source]               [Layer 0: Ready Gate]            [Layer 1: Profile]             [Layer 2: Person]            [Layer 3: Connection]              [Layer 4: Report]
─────────              ────────────────────             ──────────────────             ────────────────             ─────────────────────              ──────────────────
internal 설문   ──►   전화번호 들어옴 → ready                                                                       ┌─ CONNECTION_FOR_OWNER ─►        ConnectionReport
                                                       internal_adapter                                            │  (perspective='owner')           perspective='owner'
                                                       (코드, deterministic)                                       │                                  ← /connection/casting/{uid}
                                                          ↓                                                        │
                                                       Profile  ─►  PERSON 프롬프트  ─►  PersonContent  ──┐         │
                                                       (공통)       (source-agnostic)   (공통)            ├──►     │
                                                          ↑                                              │         │
인스타 raw      ──►   FILTER_INSTA (LLM)   ──ready──►                                                     │         └─ CONNECTION_FOR_PARTNER ─►      ConnectionReport
                     (★ 매칭 가능 후보)                                                                    │            (perspective='partner')         perspective='partner'
                                                       PROFILE_INSTA (LLM, vision)                       │            (+ INSTA_AXIS_NOTES, v5)      ← /connection/cast/{uid}
```

### 2.3 핵심 결정: trait_axes 정량값은 Profile 단계 확정

`trait_axes` (4축, 0~100 정수) 는 LLM 단계가 아니라 **Profile 단계에서 확정**. PERSON 은 받아서 카피에 활용만.
이유: 정량값은 deterministic 이어야 함. LLM 호출마다 흔들리면 카드끼리 비교 불가.

---

## 3. Source × Perspective 매트릭스

| perspective | partner.source | 리포트 | owner Profile 출처 | partner Profile 출처 | CONNECTION 프롬프트 | 라우트 |
|---|---|---|---|---|---|---|
| `owner` | internal | 게스트 매칭 | internal_adapter | internal_adapter | CONNECTION_FOR_OWNER | `/connection/casting/{uid}` |
| `owner` | insta | 인스타 매칭 | internal_adapter | FILTER_INSTA → PROFILE_INSTA | CONNECTION_FOR_OWNER + INSTA_AXIS_NOTES | `/connection/casting/{uid}` |
| `partner` | internal | 소개받은 사람 (내부) | internal_adapter | internal_adapter | CONNECTION_FOR_PARTNER | `/connection/cast/{uid}` |
| `partner` | insta | 소개받은 사람 (외부) | internal_adapter | FILTER_INSTA → PROFILE_INSTA | CONNECTION_FOR_PARTNER + INSTA_AXIS_NOTES | `/connection/cast/{uid}` |

**핵심 관찰**:
- owner Profile 은 항상 `internal_adapter` (의뢰인은 우리 결제자).
- partner Profile 은 source 에 따라 `internal_adapter` 또는 `FILTER_INSTA → PROFILE_INSTA` 체인.
- CONNECTION 프롬프트는 perspective 로 분기. partner.source 는 CONNECTION 가 모름 (PersonContent 만 봄).
- partner.source=insta 일 때만 INSTA_AXIS_NOTES 추가 호출 (v5).

---

## 4. 프롬프트 6종 (LLM 호출 정확히 6개 종류, v5)

| # | 이름 | 입력 | 출력 | 트리거 (Lazy/Eager) | 위치 |
|---|---|---|---|---|---|
| 1 | **FILTER_INSTA** | 인스타 raw (handle/bio/포스트/사진) | `{ready: bool, reason?: string}` | 풀링 직후 1회/사람 (배치) | `darakbang-backend/.../prompts/filter_insta.py` |
| 2 | **PROFILE_INSTA** | ready=true 인스타 raw | `Profile` | FILTER_INSTA 통과 직후 **eager** | `darakbang-backend/.../prompts/profile_insta.py` |
| 3 | **PERSON** | `Profile` (source 무관) | `PersonContent` | 매칭 페이지 첫 호출 시 **lazy** + DB 캐시 | `darakbang-backend/.../prompts/person.py` |
| 4 | **CONNECTION_FOR_OWNER** | owner/partner `PersonContent` × 2 + radar | `ConnectionContent` (owner 시점, opening+simulation) | `/connection/casting/{uid}` 첫 호출 시 **lazy** + DB 캐시 | `darakbang-backend/.../prompts/connection_for_owner.py` |
| 5 | **CONNECTION_FOR_PARTNER** | owner/partner `PersonContent` × 2 + radar | `ConnectionContent` (partner 시점, opening+simulation) | `/connection/cast/{uid}` 첫 호출 시 **lazy** + DB 캐시 | `darakbang-backend/.../prompts/connection_for_partner.py` |
| 6 | **INSTA_AXIS_NOTES** (v5 신규) | owner/partner `PersonContent` + partner `Profile.trait_axes` (4축) | `AxisNote[]` (4개, energy/judgment/sociability/action) | partner.source=insta 시점에 ConnectionReport 와 함께 **lazy** + DB 캐시 | `darakbang-backend/.../prompts/insta_axis_notes.py` |

**internal source 의 `trait_axes` 산출은 LLM 이 아닌 deterministic 코드** (`internal_adapter`). internal partner 의 6축 radar 도 deterministic. 즉 LLM 프롬프트는 정확히 6개.

**v5 분리 배경**: 옛 `PAIR_*` 가 narrative + 4축 axisNotes 를 한 출력에 묶었으나, internal partner 는 deterministic 6축 radar 로 시각화하고 insta partner 만 4축 narrative 가 필요해, narrative(CONNECTION_FOR_*) 와 4축(INSTA_AXIS_NOTES) 을 별도 프롬프트로 분리.

**미래 source 확장**: `FILTER_<SOURCE>` + `PROFILE_<SOURCE>` 한 쌍 추가하면 됨 (linkedin, gym, community 등).

---

## 5. Lazy / Eager 정책

| 데이터 | 비용 | 트리거 | 캐시 |
|---|---|---|---|
| owner Profile (internal) | 0 (deterministic 코드) | 설문 + 전화번호 → ready=true 시점 **eager** | DB 영속 |
| partner Profile (internal) | 0 (deterministic 코드) | 설문 + 전화번호 → ready=true 시점 **eager** | DB 영속 |
| **FILTER_INSTA 결과 (ready)** | LLM 호출 1회 | 인스타 풀링 직후 **eager (배치)** | DB 영속 |
| **partner Profile (insta)** | LLM + vision (큰 비용) | ready=true 직후 **eager** | DB 영속 |
| owner PersonContent | LLM 1회 | `/connection/casting/{uid}` 첫 호출 시 **lazy** | DB 캐시 (Profile.uid 기준) |
| partner PersonContent | LLM 1회 | 〃 | 〃 |
| ConnectionContent (owner 시점) | LLM 1회 | `/connection/casting/{uid}` 첫 호출 시 **lazy** | DB 캐시 (connection_uid 기준) |
| ConnectionContent (partner 시점) | LLM 1회 | `/connection/cast/{uid}` 첫 호출 시 **lazy** (owner 가 "받기" 누른 후 partner 가 페이지 받음) | DB 캐시 (connection_uid 기준) |
| AxisNotes (4개, v5 신규) | LLM 1회 | partner.source=insta 일 때만, ConnectionReport 생성 시 **lazy** | DB 캐시 (connection_uid 기준) |

**핵심 원칙**: *"key 값이 비었으면 그때 생성, 한 번 만들면 캐시"*.

**Why eager for PROFILE_INSTA**:
- PROFILE_INSTA 를 lazy 로 두면 매칭 페이지 호출 시 cold start (LLM + vision = 수십 초). UX 나쁨.
- ready 통과한 사람은 어차피 후보로 노출이 목적 → 미리 만들어둬도 거의 헛돈 안 됨.

---

## 6. trait_axes 4축 — 표준 라벨 통일

### 6.1 채택 표준

| 축 | 좌(0) | 우(100) | 의미 |
|---|---|---|---|
| `energy` | 내향적 | 외향적 | 사회적 에너지 방향 |
| `judgment` | 감성적 | 이성적 | 의사결정 무게중심 |
| `sociability` | 좁고 깊게 | 넓고 폭넓게 | 인간관계 폭 |
| `action` | 안정 추구 | 모험 추구 | 행동 성향 |

→ 인스타 합본 출력의 `selfExpression / behavior` 라벨은 **deprecated**. PR 2 에서 컴포넌트 통일.

### 6.2 산출 방식

| source | 산출 | 신뢰도 |
|---|---|---|
| internal | `internal_adapter.py` deterministic 가중평균 (§ 6.3 표) | overall=1.0, trait_axes 0.5~0.7 |
| insta | `PROFILE_INSTA` LLM 추정 (게시물 5장 신호) | 0.4~0.8 |

### 6.3 internal 가중치 표 — 사용자 합의 박힘 (PR 1 `internal_adapter.py`)

| 축 | 항목 | 가중치 | 답 → 점수 |
|---|---|---|---|
| `energy` | meeting_frequency | 0.35 | daily=80, weekly_3_4=60, weekly_1_2=35, flexible=50 |
| | date_style | 0.25 | nightlife=75, outdoor=60, culture=45, home=30 |
| | drinking_style | 0.20 | often=65, sometimes=55, rarely=40, never=35 |
| | contact_style | 0.20 | anytime=70, 2_3h=60, 1_2_day=50, relaxed=35 |
| `judgment` | mbti (T/F 글자) | 0.50 | T=70, F=30 |
| | attraction_factor | 0.30 | competence=65, appearance=50, personality=45, vibe=30 |
| | date_style | 0.20 | outdoor=55, home=50, nightlife=50, culture=35 |
| `sociability` | contact_style | 0.40 | anytime=75, 2_3h=60, 1_2_day=50, relaxed=30 |
| | meeting_frequency | 0.30 | daily=70, weekly_3_4=55, weekly_1_2=35, flexible=50 |
| | date_style | 0.30 | nightlife=70, outdoor=55, culture=45, home=30 |
| `action` | date_style | 0.40 | outdoor=75, nightlife=60, culture=45, home=30 |
| | distance_preference | 0.25 | long=70, same_city=50, very_near=35 |
| | occupation | 0.20 | freelance=65, student/other=55, professional=50, office=45, public=35 |
| | relationship_intent | 0.15 | casual_meet=65, casual_chat=50, serious_dating=40 |

각 축 가중치 합 = 1.0. 답 누락 항목은 가중치 0 처리 후 정규화.

---

## 7. 데이터 모델

### 7.1 `Profile` (Layer 1, 모든 source 공통)

```ts
type Profile = {
  source: 'internal' | 'insta'
  // v4: Profile.ready 필드 제거됨. 매칭 자격 게이트는 DB row 의 status 컬럼이 담당.
  //   - guest:    casting_guests.status='ready'
  //   - external: casting_external_profiles.status='ready'
  //   - pool:     casting_profiles.status='active'   (이 row 가 존재한다는 것 자체 + status='active' 가 등판 의미)
  basics: {
    age?: number; age_band?: AgeBand
    gender: 'male' | 'female'
    region_code?: string
    occupation?: OccupationCode; occupation_band?: OccupationBand
    height_cm?: number; height_band?: HeightBand
    body_type?: BodyType
    mbti?: string
    drinking_style?: DrinkingStyle
    smoking_status?: SmokingStatus
    income_band?: IncomeBand            // internal 만
    religion?: Religion                  // internal 만
  }
  traits: {
    trait_axes: {
      energy:      { value: number; evidence?: string }
      judgment:    { value: number; evidence?: string }
      sociability: { value: number; evidence?: string }
      action:      { value: number; evidence?: string }
    }
    atmosphere_tags?: string[]            // insta 위주, internal 비움
  }
  self_text: string                       // 자기소개. internal message 빈 사용자는 빈 문자열
  message?: string                        // 운영진 메시지 (internal 만)
  photos?: { url: string; source: 'profile' | 'insta_post' }[]
  posts_meta?: PostMeta[]                 // insta 만
  reviewer_summary?: string
  confidence: {
    overall: number                       // internal=1.0
    age?: number; body_type?: number; height?: number
    drinking?: number; occupation?: number; trait_axes?: number
  }
  raw?: { internal?: SurveyAnswers; insta?: InstaRaw }
}
```

### 7.2 `IdealCriteria` / `PersonContent` / `ConnectionContent` / `AxisNote`
(PR 1 + PR 2 v5 `casting/profile/schema.py` 의 Pydantic 정의 그대로. 본 문서 v2 의 § 6.2~6.4 참조)

- `ConnectionContent` = narrative-only: `{ opening, simulation }`. axisNotes 는 `ConnectionReport` top-level 로 이동 (v5).
- `AxisNote` = `{ axis: AxisName, narrative: string }`. 4축(energy/judgment/sociability/action) 1개씩.

### 7.3 `ConnectionReport` (Layer 4, 단일 모델)

```ts
type ConnectionReport = {
  connection_uid: string
  perspective: 'owner' | 'partner'
  owner:   { profile: Profile; person_content: PersonContent; ideal: IdealCriteria }
  partner: { profile: Profile; person_content: PersonContent; ideal?: IdealCriteria }
  content: ConnectionContent             // v5: opening + simulation
  radar:     RadarResult | null          // v5: partner.source=internal 일 때만 채움
  axisNotes: AxisNote[]   | null         // v5: partner.source=insta 일 때만 채움
  meta: {
    partner_source: 'internal' | 'insta'
    hunt_stats?: HuntStats
    scene_image?: string
    generated_at: string
  }
}
```

3종 리포트가 모두 단일 ConnectionReport 모델. perspective + meta.partner_source 로 분기.

**v5 alternate**: `radar` 와 `axisNotes` 는 서로 보완. internal partner 는 설문 6축이 있어
deterministic radar 채우고 axisNotes=null. insta partner 는 6축 답이 없어 axisNotes 4개를
LLM 으로 생성하고 radar=null. 화면 시각화는 둘 중 채워진 쪽으로 분기.

---

## 8. PR 분할

### 8.1 PR 1 (push 완료, OPEN) — 청사진 + 박제

- 백엔드 `casting/prompts/` (5종 중 4종 + shared_tone, FILTER_INSTA 는 PR 2 신규)
- 백엔드 `casting/profile/` (schema + internal_adapter)
- 옛 `prompt_system_prompts.py` DEPRECATED 헤더
- 옵시디언 PROFILE_INSTA → 백엔드 박제
- 프론트/docs dump 헤더 정렬
- 본 ARCHITECTURE 문서 (v3)

→ 코드 동작 변경 0.

### 8.2 PR 2 — 운영 라우트 + 호출 통합 + dogfooding (한 큰 PR, commit 단계별)

**Step 0. 정책 박기 (commit 1)**
- Profile 에서 `ready` 필드 제거 (DB row 의 status 컬럼이 게이트)
- `FILTER_INSTA` 프롬프트 신규 작성 (`prompts/filter_insta.py`)
- `casting/profile/insta_runner.py` 신규 (FILTER_INSTA + PROFILE_INSTA 호출 + Profile 변환)
- 캐싱 정책 (DB 테이블 또는 캐시 어댑터) 결정 + 박기

**Step 1. 운영 라우트 정리 (commit 2)**
- 백엔드: `/connection/casting/{uid}`, `/connection/cast/{uid}` 라우트 신설
- 프론트: 새 라우트 페이지 컴포넌트 (기존 미리보기 재활용)
- 기존 미리보기 라우트 (`/casting/template-preview`, `/casting/prompt-test` 등) 의 처리 방침 명시 (PR 3 에서 dead 삭제 예정 표시)

**Step 2. owner 매칭 페이지 (commit 3)**
- `ConnectionReport(perspective='owner')` 생성 백엔드 로직
- partner.source=internal vs insta 분기 처리
- lazy 체크 + cache hit/miss + PERSON × 2 + CONNECTION_FOR_OWNER 호출 흐름
- 인스타 합본 (`someonetheone/lib/casting/insta/system-prompt.ts`) 의 PERSON 부분 흡수 → 백엔드 PERSON 호출로
- 4축 라벨 통일 (`selfExpression/behavior` → `sociability/action`) 시각화 컴포넌트 갱신
- `ConnectionContent.opening` 단일 필드명 적용 (v5)

**Step 3. partner receiver 페이지 (commit 4)**
- `ConnectionReport(perspective='partner')` 생성 백엔드 로직
- `CONNECTION_FOR_PARTNER` v0 → v1 (실제 데이터 1쌍 LLM 호출해 톤 다듬기)
- partner.IdealCriteria 활용 카피 (옵션)

**Step 4. 4-Case Dogfooding (commit 5)**
4 케이스 실제 호출 + 결과값 검증:
| # | perspective | partner.source | 라우트 | 검증 |
|---|---|---|---|---|
| 1 | owner | internal | `/connection/casting/{uid}` | PERSON × 2 + CONNECTION_FOR_OWNER + deterministic radar |
| 2 | owner | insta | `/connection/casting/{uid}` | FILTER_INSTA + PROFILE_INSTA + 위 + INSTA_AXIS_NOTES |
| 3 | partner | internal | `/connection/cast/{uid}` | PERSON × 2 + CONNECTION_FOR_PARTNER + deterministic radar |
| 4 | partner | insta | `/connection/cast/{uid}` | 위 + INSTA_AXIS_NOTES |

각 케이스 페이지 렌더 + 4축/spectrumNotes/simulation 어색한 카피 발견 시 프롬프트 다듬기.

**Step 5. 파일 위치 정리 (commit 6)**
- 백엔드 `casting/` 디렉토리 구조 최종 정리
- 프론트 `lib/casting/` 정리 (인스타 합본 폐기 표시, dump 스크립트 백엔드 source 기준으로 갱신)
- 문서 (`docs/casting-template/*`) 정리

→ **PR 2 = commit 1~6 한 PR**. 팀원이 commit 단위로 review.

### 8.3 PR 3 — dead 라우트/파일 일괄 삭제

PR 2 머지 후 며칠 검토 시간 두고 *"진짜 안 쓰이는지"* 확인 후 일괄 삭제:
- `darakbang-backend/.../prompt_system_prompts.py` (DEPRECATED)
- `someonetheone/lib/casting/insta/system-prompt.ts` (PR 2 에서 분해됨)
- `someonetheone/lib/casting/prompts/system-prompts.ts` (textarea default, 호출 안 닿음)
- `someonetheone/scripts/dump-system-prompts.ts` (백엔드 dump 스크립트로 대체)
- 미리보기 라우트 (`/casting/template-preview`, `/casting/prompt-test`, `/casting/insta-template-preview`, `/casting/insta-prompt-test`) 의 처리 — 유지 (개발용) vs 삭제 (PR 2 시점에 결정)

dead 삭제는 정확성이 생명 → PR 분리로 안전 핀.

---

## 8.5 status 컬럼명 + enum 통일 (v4 신설)

PR 2 commit 1 에서 박힌 결정. 매칭 풀 쿼리 / 리포트 발간 / FILTER 게이트의 어휘를 갈라서 혼동을 끊는다.

### 8.5.1 컬럼명 통일 (rename matrix)

| 테이블 | v3 컬럼명 | v4 컬럼명 | enum | 매칭 풀/리포트 등판 값 |
|---|---|---|---|---|
| `casting_guests` | `profile_status` | **`status`** | `GuestStatus` | `ready` |
| `casting_external_profiles` | `filter_status` | **`status`** | `ExternalProfileStatus` | `ready` |
| `casting_profiles` | `profile_status` | **`status`** | `PoolStatus` | **`active`** (옛 `ready` 값 마이그) |
| `casting_match_reports` | `status` (그대로) | `status` | `MatchReportStatus` | **`published`** (옛 `ready` 값 마이그) |
| `casting_preview_reports` | `status` (그대로) | `status` | `MatchReportStatus` 공유 | **`published`** (옛 `ready` 값 마이그) |

### 8.5.2 enum 분리

- 폐기: `ProfileStatus` (한 enum 이 guests + profiles 양쪽에 쓰여 의미 혼선)
- 신설: `GuestStatus { draft, ready, excluded, removed }` — raw 게이트
- 신설: `PoolStatus { draft, active, excluded, merged, removed }` — 매칭 풀 등판
- 이름 정리: `ExternalFilterStatus` → **`ExternalProfileStatus`** (값은 동일: unreviewed/ready/rejected/needs_review)
- 값 변경: `MatchReportStatus.ready` → **`published`** (본문 발간 어휘 통일)

### 8.5.3 어휘 분기 (왜 분리했나)

| 어휘 | 의미 | 쓰이는 곳 |
|---|---|---|
| `ready` | raw 단계 게이트 통과 | guests / external |
| `active` | 매칭 풀 등판 가능 | profiles (SSOT) |
| `published` | 리포트 본문 발간 완료 | match_reports / preview_reports |

같은 영문 단어가 라이프사이클 단계마다 다른 의미로 쓰여 코드 리뷰 / 운영 디버깅이 혼선됐던 게 v3 의 문제. v4 에서 단계별 어휘로 분리.

### 8.5.4 casting_profiles = source-agnostic SSOT

- internal 과 insta 의 Profile 모두 `casting_profiles` 단일 테이블에 row 로 박힌다 (`source` 컬럼으로 구분).
- `casting_external_profiles` 는 insta-specific raw + filter 결과만 보관. PROFILE_INSTA 결과는 `casting_profiles` 신규 row 로 영속 (`entity_uid = ext_<external_uid>`).
- 신규 컬럼: `casting_profiles.profile_json LONGTEXT` — Profile (Pydantic) 전체 캐시. trait_axes, atmosphere_tags 등 평면 컬럼에 없는 추가 데이터 담는 곳.
- 매칭 풀 쿼리 + dealbreaker 필터 = `casting_profiles` 단일 쿼리 (`WHERE status = 'active'`).

### 8.5.5 데이터 마이그레이션 (production 적용)

`darakbang-backend/migrations/casting_pr2_status_unification.sql` 이 다음을 수행:
1. `casting_guests.status` 신규 컬럼 추가 + `profile_status` 에서 backfill
2. `casting_external_profiles.status` 신규 컬럼 추가 + `filter_status` 에서 backfill
3. `casting_profiles.status` 신규 컬럼 추가 + `profile_status='ready'` 는 신규 `status='active'` 로 backfill
4. `casting_profiles.profile_json LONGTEXT NULL` 신규 컬럼 추가
5. backend 배포 직전 재실행해 old code 가 그 사이 쓴 legacy 컬럼 값을 신규 `status` 컬럼에 다시 동기화

Phase 1 에서는 DB 를 먼저 올려도 기존 배포본이 깨지지 않도록 `profile_status` / `filter_status` 를 rename/drop 하지 않는다. production RDS 는 현재 backend 계정으로 trigger 생성이 불가능하므로, dual-write trigger 대신 배포 직전 SQL 재실행으로 drift 를 닫는다. `casting_match_reports.status='ready'` 와 `casting_preview_reports.status='ready'` 값도 즉시 바꾸지 않고, 새 코드가 `ready` / `published` 를 둘 다 읽을 수 있게 한 뒤 별도 contract 단계에서 `published` 로 정리한다.

SQL 은 idempotent (information_schema 가드 + 조건부 UPDATE). 한 번 더 실행해도 안전.

---

## 9. 결정된 사항 (PR 1 합의 박힘)

- ✅ **(a)** internal `self_text` 빈 사용자 → 빈 문자열.
- ✅ **(b)** internal `atmosphere_tags` → 비워둠 (insta 만 활용).
- ✅ **(c)** trait_axes 가중치 표 → § 6.3 박힘, `internal_adapter.py` 구현.
- ✅ **(d)** CONNECTION_FOR_PARTNER `simulation` 시점 → 카페 첫 만남 기본 + 산책로/서점/갤러리 등 옵션 명시.
- ✅ 4축 표준 라벨 = `energy / judgment / sociability / action`.
- ✅ 모델 단일화 = `ConnectionReport` (perspective 분기).
- ✅ 어휘 = `owner / partner / connection / perspective / ready / source`.
- ✅ **라우트 = `/connection/casting/{uid}` + `/connection/cast/{uid}`** (캐스팅 brand + 영문법 정확).
- ✅ FILTER_INSTA 신규 프롬프트 (`FILTER_<SOURCE>` 패턴 — 미래 확장 대비).
- ✅ Lazy 정책: PROFILE_INSTA eager / PERSON·CONNECTION·INSTA_AXIS_NOTES lazy + DB 캐시.
- ✅ `ConnectionContent.opening` 단일 필드명 채택 (owner/partner 시점 모두 `opening`, `matchOpening`/`introOpening` 분리 안 함). (jk @ 7e0ac46)
- ✅ **(v5)** narrative(ConnectionContent) 와 4축(AxisNote[]) 분리. internal=radar, insta=axisNotes alternate.

---

## 10. Open Questions (PR 2/3 에서 결정)

- [ ] FILTER_INSTA 의 입출력 스키마 + 비용 특성 (vision 사용 여부, 풀당 호출 비용)
- [ ] PROFILE_INSTA 캐싱 키 (handle + posts_hash?) / TTL
- [ ] DB 캐시 vs 메모리 캐시 vs 어댑터 패턴 — PR 2 Step 0 에서 결정
- [ ] 미래 설문 v2 에서 4축 직접 측정 항목 추가 — 별 PR
- [ ] 미리보기 라우트 처리 (개발용 유지 vs PR 3 dead 삭제)

---

## 11. 팀원 인계 산출물

> 팀원이 요청한 형식 그대로. 이 섹션을 그대로 복사해 전달 가능.

### 11.1 각 페이지 주소

| 리포트 | 라우트 |
|---|---|
| 게스트 매칭 | `/connection/casting/{uid}` (partner.source=internal) |
| 인스타 매칭 | `/connection/casting/{uid}` (partner.source=insta) |
| 소개받은 사람 | `/connection/cast/{uid}` |

(PR 2 에서 실제 구현)

### 11.2 각 페이지 모델

**모든 리포트가 단일 `ConnectionReport`** (perspective + meta.partner_source 분기).

- 정의: `darakbang-backend/darakbang/casting/profile/schema.py` (Pydantic, PR 1)
- 명세: § 7

### 11.3 각 페이지 생성 프롬프트

| 리포트 | 사용 프롬프트 | LLM 호출 (캐시 미고려) |
|---|---|---|
| 게스트 매칭 | PERSON × 2 + CONNECTION_FOR_OWNER | 3회 |
| 인스타 매칭 | FILTER_INSTA + PROFILE_INSTA + PERSON × 2 + CONNECTION_FOR_OWNER + INSTA_AXIS_NOTES | 6회 (FILTER/PROFILE 은 ready 시점에 미리) |
| 소개받은 사람 (내부) | PERSON × 2 + CONNECTION_FOR_PARTNER | 3회 |
| 소개받은 사람 (인스타) | FILTER_INSTA + PROFILE_INSTA + PERSON × 2 + CONNECTION_FOR_PARTNER + INSTA_AXIS_NOTES | 6회 |

프롬프트 위치: `darakbang-backend/darakbang/casting/prompts/`
- `filter_insta.py` (PR 2 신규)
- `profile_insta.py`, `person.py`, `pair_for_owner.py`, `pair_for_partner.py` (PR 1)

PERSON 결과는 DB 캐시 — 같은 사람이 여러 connection 에 들어와도 1회만 실제 호출.

---

## 12. 변경 이력

- **2026-05-10 v1**: 최초 작성 (viewer/candidate/Buyer 어휘).
- **2026-05-10 v2**: 어휘 통일 (owner/partner/connection/perspective). MatchReport/IntroReport → 단일 ConnectionReport. PAIR_BUYER/CANDIDATE → PAIR_FOR_OWNER/PARTNER. § 5.3 가중치 표, § 11 팀원 인계 산출물 추가.
- **2026-05-11 v3**: `ready` 라이프사이클 + `FILTER_INSTA` 5번째 프롬프트 추가 (`FILTER_<SOURCE>` 패턴). 라우트 1차 결정 (`/connection/{uid}/casting` + `/connection/{uid}/cast`). Lazy/Eager 정책 (§ 5) 명시. PR 2 작업 계획 (§ 8.2) + commit 6단계 박음. PR 3 dead 일괄 삭제 분리.
- **2026-05-11 v4 (PR 2 commit 1)**: 라우트 정정 (`/connection/casting/{uid}` + `/connection/cast/{uid}` — uid 가 항상 마지막). `Profile.ready` Pydantic 필드 제거 (DB row 의 status 컬럼이 게이트 담당). § 8.5 신설: status 컬럼명 통일 (`profile_status`/`filter_status` → `status`), enum 분리 (`GuestStatus` / `PoolStatus` / `ExternalProfileStatus` 신설, `ProfileStatus` 폐기), `MatchReportStatus.ready` → `published`. `casting_profiles` source-agnostic SSOT 확정 + `profile_json` 신규 컬럼. DB-first 가능한 expand 마이그레이션 SQL 작성.
- **2026-05-11 v5 (PR 2 commit 3c/4/5)**: 어휘·schema 위계 정합 — `PairContent` → `ConnectionContent` (narrative-only: opening + simulation), `PAIR_FOR_OWNER/PARTNER` → `CONNECTION_FOR_OWNER/PARTNER`. AxisNotes 를 ConnectionContent 에서 분리해 `ConnectionReport` top-level (`axisNotes: AxisNote[] | null`) 로 이동. **6번째 프롬프트 `INSTA_AXIS_NOTES` 신설** (insta partner 시점 4축 narrative). `radar` / `axisNotes` alternate (internal=radar, insta=axisNotes). PROFILE_INSTA SDK 호환 fix (Pydantic nested model 의 `additionalProperties:false` 거부 이슈 → `response_schema` 미전달, response_mime_type=json + raw Pydantic 검증). PersonContent 의 Bullet string→객체 자동 coercion + 길이 초과 truncate validator (LLM 출력 정합). CONNECTION_FOR_OWNER/PARTNER + INSTA_AXIS_NOTES 톤 v1 (해요체 강제, 호칭 회피, 클리셰 금지). 4-Case dogfooding 검증 통과.
