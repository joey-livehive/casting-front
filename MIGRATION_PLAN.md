# Casting 시스템 마이그레이션 계획

## 0. 목적

`casting`은 **someonetheone의 업그레이드 버전**. 같은 서비스의 새 이름이며, 매칭/외부풀/리포트 시스템이 추가된 형태. 따라서 본 문서는 별개 서비스 도입이 아니라 **기존 데이터를 새 스키마로 전환(transition)**하는 절차다.

전환의 본질:
- 기존 `theone_*` 테이블 데이터 → `casting_*` 테이블로 1:1 매핑
- 추가된 기능(매칭, 외부 풀, 활성도 등)은 신규 컬럼/테이블로 흡수
- 기존 사용자는 그대로 casting의 사용자 — 별도 가입 X
- 기존 결제 이력은 그대로 보존 (단 매칭 크레딧 자동 부여는 별도 결정)
- personalize 리포트(`theone_reports`)는 deliver 책임 끝까지 유지하되, 신규 가입자는 casting 흐름으로

연관 문서:
- 설계: `someonetheone/MATCHING_DESIGN.md`
- 스키마 SQL: `darakbang-backend/migrations/casting_schema.sql`
- 모델: `darakbang-backend/darakbang/casting/models.py`

---

## 1. 현황 점검

### 1-1. 기존 운영 DB (`theone`)

| 테이블 | 용도 | 운영 상태 |
|---|---|---|
| `theone_guests` | 설문 입력자 (~400명 추정) | 활성 사용 |
| `theone_orders` | 개인화 리포트 결제 | 활성 사용 |
| `theone_reports` | personalize_json (mock 캐릭터 분석) | 활성 사용 |
| `theone_chatrooms` / `theone_chat_messages` | 챗 기반 personalize | 활성 사용 |
| `theone_events` | 광범위 이벤트 | **테이블만 존재, 미사용** (Supabase 대체) |

기존 결제 흐름:
```
설문 → theone_orders 결제 → webhook → theone_reports.personalize_json 생성 → /report/{id} 노출
```

이 흐름은 그대로 유지. casting과 무관.

### 1-2. casting DB (신규)

- local은 `casting_local` 생성 완료. sandbox/prod는 신규 생성 필요.
- `casting_*` 12개 테이블 (자세한 정의는 `casting_schema.sql` 및 `MATCHING_DESIGN.md`)
- 백엔드 코드: `darakbang/casting/` 모듈 신규 구현됨

---

## 2. 영향 범위 — 점진 전환 원칙

같은 서비스의 업그레이드라 결국엔 casting이 메인이 되지만, 전환 기간엔 두 시스템이 공존한다. **전환 기간의 핵심 안전장치는 "기존 사용자 진행 중인 흐름은 그대로 끝까지 deliver"**.

| 대상 | 전환 기간 | 전환 후 |
|---|---|---|
| `theone` DB 스키마 | **변경 없음** | (장기) deprecate, read-only |
| `theone` 데이터 | **변경 없음** (read-only) | 보존 + casting과 1:1 매핑 |
| someonetheone 백엔드 (`darakbang/someonetheone/`) | **변경 없음** (기존 사용자 deliver 책임) | (장기) 신규 가입 차단, deliver만 |
| someonetheone 프론트 (`/report/*`) | **변경 없음** | (장기) deprecate |
| `theone_orders` webhook | **변경 없음** (기존 personalize 리포트 그대로 발급) | deprecate |
| 공통 인프라 (`config/config.py`, `darakbang/database.py`) | **추가 only** (CASTING_DB_*, casting_engine) | 그대로 |
| `casting` DB | **신규 생성** | 메인 |
| `darakbang/casting/` 모듈 | **신규 추가** | 메인 |
| frontend 도메인 | 새 라우트 또는 `casting.publicvoid.im` | 메인 |

전환 원칙:
- theone DB는 **read-only**. ALTER / DELETE / UPDATE 없음
- 기존 사용자가 진행 중인 결제·리포트 흐름은 끝까지 책임
- casting은 새 진입자 + 기존 사용자 모두 흡수하는 단일 메인이 되는 게 목표
- 점진 전환 후 theone 시스템은 deprecate (별도 일정)

---

## 3. 데이터 전환 매핑

같은 서비스의 업그레이드이므로 1:1 매핑이 핵심. 정합성·idempotency·신규 컬럼 derive에 집중한다.

### 3-1. 테이블 매핑

| theone 원본 | casting 대상 | 처리 |
|---|---|---|
| `theone_guests` | `casting_guests` | 1:1 INSERT, guest_uid 그대로 유지, 신규 컬럼은 derive 또는 NULL |
| `theone_orders` | `casting_orders` | 1:1 INSERT, order_id 그대로, credits는 정책에 따라 부여 |
| `theone_reports` | (전환 안 함) | personalize 도메인. theone에 그대로 두고 deliver 책임 유지 |
| `theone_chatrooms` / `chat_messages` | (전환 안 함) | personalize 도메인 |
| `theone_events` | (전환 안 함) | 미사용 |

### 3-2. `casting_guests` 컬럼 매핑

```
theone_guests              casting_guests              비고
─────────────────────────────────────────────────────────
guest_uid                → guest_uid                   그대로 (1:1, prefix 안 바꿈)
email                    → email                       그대로
phone                    → phone                       그대로
device_info              → device_info                 그대로
ip_address               → ip_address                  그대로
answers (JSON)           → answers (JSON)              그대로
photo_url                → photo_url                   그대로
metadata                 → metadata + 추가 키          $.migrated_from='theone'
created_at               → created_at                  그대로
updated_at               → updated_at                  그대로

(없음)                   → last_active_at              theone_orders MAX(updated_at) 또는 created_at
(없음)                   → last_purchased_at           theone_orders WHERE status='paid' MAX(paid_at)
(없음)                   → came_from_external_uid      NULL (기존 사용자는 외부 출신 X)
(없음)                   → profile_status              'draft' (명시 동의/추가 안내 후 ready)
(없음)                   → user_uid                    NULL (User 도입 전)
(없음)                   → access_token                RANDOM_BYTES(32) 기반 생성
```

`guest_uid`는 prefix를 변경하지 않는다. 같은 사람이라는 사실이 중요.

### 3-3. `casting_orders` 컬럼 매핑

```
theone_orders            casting_orders               비고
─────────────────────────────────────────────────────────
order_id                → order_id                    그대로 (UNIQUE 보장)
guest_uid               → guest_uid                   그대로
email                   → email                       그대로
product_id              → product_id                  그대로 (starter/regular/premium)
product_name            → product_name                그대로
amount                  → amount                      그대로
status                  → status                      그대로
payment_key             → payment_key                 그대로
paid_at                 → paid_at                     그대로
metadata                → metadata + legacy 키        $.migrated_from='theone', $.legacy_personalize=true
created_at              → created_at                  그대로
updated_at              → updated_at                  그대로

(없음)                  → credits                     정책 결정 필요 (아래 3-4 참조)
(없음)                  → provider                    NULL (기존 metadata에 있다면 derive)
(없음)                  → provider_payment_id         payment_key를 그대로 사용 또는 metadata derive
(없음)                  → idempotency_key             NULL
(없음)                  → raw_webhook_json            NULL
```

### 3-4. 결제 → 매칭 크레딧 정책 (결정 필요)

같은 서비스 업그레이드라는 관점에서 가장 사용자 친화적인 처리:

| 옵션 | 의미 | 의의 |
|---|---|---|
| **A1** 매칭 크레딧으로 인정 | 기존 5/10/20 결제 → casting credits 5/10/20 충전 | 업그레이드 톤 일치, 사용자 보상 |
| **A2** history만 이관, credits=0 | 기존 결제는 표시만, 새 결제 필요 | 정합성, 매출 손실 X |
| **A3** 부분 인정 (할인) | N% 할인 코드 발급 | 절충 |

**같은 서비스 업그레이드라는 관점에서 A1이 자연스러움.** 단:
- 기존 결제로 받은 personalize 리포트는 이미 deliver됨
- 이미 받은 가치가 있으므로 무료 매칭 N건은 추가 보상
- 사용자 입장: "서비스가 업그레이드돼서 매칭까지 받게 됐다" — 만족도↑

→ **A1 추천**, 운영자 결정 사항. A2면 마케팅 캠페인으로 보상 별도.

### 3-5. 신규 컬럼 derive 규칙

기존 답변에서 derive 가능한 하드 필터 컬럼:

```
casting_profiles.gender       ← answers.detail['성별이 어떻게 돼?']
casting_profiles.age_band     ← answers.detail['나이대가 어떻게 돼?']
casting_profiles.region_code        ← answers.detail['어디쯤 살아?']
casting_profiles.preferred_age_min  ← answers.intro['나이는 어느 정도?']
casting_profiles.preferred_age_max  ← answers.intro['나이는 어느 정도?']
casting_profiles.dealbreakers_json  ← answers.intro['이건 좀 아닌 것 같아']
```

부족한 신규 컬럼 (재설문 또는 운영자 보강):
- `preferred_gender` (현재 설문에 없음)
- `self_smokes`, `self_height_cm`, `self_body` (현재 설문에 없음)
- `relationship_goal`, `drinking_style` 등

**처리:** 신규 컬럼은 NULL로 두되, 매칭 알고리즘이 NULL을 무관(no constraint)으로 해석. 사용자에게는 첫 진입 시 "추가 정보를 입력하면 매칭이 더 정확해져요" 카피로 보강 유도 (강제 X).

### 3-6. 임베딩 백필

전환 후 `casting_profiles.self_embedding` / `ideal_embedding` 일괄 생성. 약 400명 × $0.0001 ≈ $0.04, 5분 안.

### 3-7. 동의 처리

같은 서비스 업그레이드이지만, 매칭 후보로 본인이 다른 사용자에게 노출되는 것은 기존 개인화 리포트와 성격이 다르다. 기본 이관은 `draft`로 두고, 첫 진입 시 안내 + 명시 동의 후 `ready`로 전환하는 방식이 가장 방어 가능하다.

```
이관 시점: profile_status = 'draft' (매칭 풀 미노출)
사용자 다음 진입 시 노출: 
  "서비스가 업그레이드되었습니다. 이상형에 맞는 분을 찾아드려요.
   당신도 다른 분의 매칭 후보로 노출될 수 있어요. [참여하기] [나중에]"
[참여하기] → profile_status = 'ready'
[나중에] → profile_status = 'draft'
```

운영 판단으로 더 공격적으로 갈 수는 있지만, 기본 런북은 옵트인으로 둔다. 옵트아웃 모델을 선택할 경우 법무/CS 고지 문구와 제외 endpoint를 먼저 준비해야 한다.

→ **운영자 결정 필요**: 옵트인 유지 (권장) vs 옵트아웃 전환

---

## 3.5. 데이터 전환 SQL

같은 RDS instance에 theone / casting 두 DB 존재 가정. 별도 instance면 dump→load.

`theone` 테이블은 **read-only**. 어떤 phase에서도 SELECT만 한다.

운영 실행은 `START TRANSACTION` / 검증 / `COMMIT` 단위로 진행한다. A1 원장 SQL은 MySQL 8 window function 기준이다.

### 사용자 전환

```sql
-- guest_uid를 그대로 유지 (같은 사람)
INSERT INTO casting.casting_guests (
    guest_uid, access_token, email, phone, device_info, ip_address,
    answers, photo_url, metadata,
    last_active_at, last_purchased_at,
    profile_status,
    created_at, updated_at
)
SELECT
    g.guest_uid,
    LOWER(CONCAT(HEX(RANDOM_BYTES(16)), HEX(RANDOM_BYTES(16)))) AS access_token,
    g.email,
    g.phone,
    g.device_info,
    g.ip_address,
    g.answers,
    g.photo_url,
    JSON_SET(
        COALESCE(g.metadata, JSON_OBJECT()),
        '$.migrated_from', 'theone',
        '$.migrated_at', DATE_FORMAT(UTC_TIMESTAMP(), '%Y-%m-%dT%H:%i:%sZ')
    ) AS metadata,
    -- last_active_at: 결제 또는 답변 갱신 중 더 최근
    GREATEST(
        COALESCE((SELECT MAX(o.updated_at)
                  FROM theone.theone_orders o
                  WHERE o.guest_uid = g.guest_uid), '1970-01-01'),
        COALESCE(g.updated_at, g.created_at)
    ) AS last_active_at,
    -- last_purchased_at
    (SELECT MAX(o.paid_at)
     FROM theone.theone_orders o
     WHERE o.guest_uid = g.guest_uid AND o.status = 'paid') AS last_purchased_at,
    -- profile_status: 명시 동의 전까지 매칭 풀 미노출
    'draft',
    g.created_at,
    g.updated_at
FROM theone.theone_guests g
LEFT JOIN casting.casting_guests c ON c.guest_uid = g.guest_uid
WHERE
    -- 답변 있는 사용자만 (빈 row 제외)
    g.answers IS NOT NULL
    AND JSON_LENGTH(g.answers) >= 1
    -- 중복 방지 (재실행 안전)
    AND c.guest_uid IS NULL;
```

### 결제 전환

```sql
-- credits 정책 결정 후 실행 (A1=원래 intro_count, A2=0)
-- 아래 예시는 A1 (자연스러운 업그레이드 톤)
INSERT INTO casting.casting_orders (
    order_id, guest_uid, email,
    product_id, product_name,
    credits, amount, status,
    payment_key, paid_at,
    metadata,
    created_at, updated_at
)
SELECT
    o.order_id,
    o.guest_uid,
    o.email,
    o.product_id,
    o.product_name,
    -- A1: 기존 product의 intro_count로 credits 부여 (5/10/20)
    CASE o.product_id
        WHEN 'starter' THEN 5
        WHEN 'regular' THEN 10
        WHEN 'premium' THEN 20
        ELSE 0
    END AS credits,
    o.amount,
    o.status,
    o.payment_key,
    o.paid_at,
    JSON_SET(
        COALESCE(o.metadata, JSON_OBJECT()),
        '$.migrated_from', 'theone',
        '$.migrated_at', DATE_FORMAT(UTC_TIMESTAMP(), '%Y-%m-%dT%H:%i:%sZ'),
        '$.legacy_personalize', true
    ) AS metadata,
    o.created_at,
    o.updated_at
FROM theone.theone_orders o
INNER JOIN casting.casting_guests g ON g.guest_uid = o.guest_uid
LEFT JOIN casting.casting_orders c ON c.order_id = o.order_id
WHERE
    c.order_id IS NULL;
```

### 크레딧 잔액 충전 (A1 옵션)

```sql
-- 결제완료 건의 credits 합계만큼 잔액 충전
INSERT INTO casting.casting_user_credits (
    guest_uid, balance, total_purchased, total_used, last_purchased_at, updated_at
)
SELECT
    o.guest_uid,
    SUM(o.credits) AS balance,
    SUM(o.credits) AS total_purchased,
    0 AS total_used,
    MAX(o.paid_at) AS last_purchased_at,
    NOW()
FROM casting.casting_orders o
LEFT JOIN casting.casting_user_credits c ON c.guest_uid = o.guest_uid
WHERE
    o.status = 'paid'
    AND JSON_UNQUOTE(JSON_EXTRACT(o.metadata, '$.legacy_personalize')) = 'true'
    AND c.guest_uid IS NULL
GROUP BY o.guest_uid;

-- 거래 원장에 history 기록
INSERT INTO casting.casting_credit_transactions (
    guest_uid, delta, balance_after, transaction_type,
    order_id, note, created_by, created_at
)
SELECT
    ordered.guest_uid,
    ordered.credits AS delta,
    ordered.balance_after,
    'purchase' AS transaction_type,
    ordered.order_id,
    'Migrated from theone (legacy_personalize)' AS note,
    'migration' AS created_by,
    ordered.paid_at
FROM (
    SELECT
        o.guest_uid,
        o.order_id,
        o.credits,
        o.paid_at,
        SUM(o.credits) OVER (
            PARTITION BY o.guest_uid
            ORDER BY COALESCE(o.paid_at, o.created_at), o.order_id
        ) AS balance_after
    FROM casting.casting_orders o
    WHERE
        o.status = 'paid'
        AND JSON_UNQUOTE(JSON_EXTRACT(o.metadata, '$.legacy_personalize')) = 'true'
) ordered
LEFT JOIN casting.casting_credit_transactions tx ON tx.order_id = ordered.order_id
WHERE tx.order_id IS NULL;
```

A2 옵션이면 위 두 SQL 블록은 실행하지 않고 결제 row만 history로 보관.

### 검증 쿼리

```sql
-- 0) 기존 상품 분포와 credits=0 예정 row 확인
SELECT product_id, product_name, amount, status, COUNT(*) AS cnt
FROM theone.theone_orders
GROUP BY product_id, product_name, amount, status
ORDER BY cnt DESC;

SELECT COUNT(*) AS zero_credit_paid_orders
FROM theone.theone_orders
WHERE status = 'paid'
  AND product_id NOT IN ('starter', 'regular', 'premium');

-- 1) 사용자 1:1 매핑 확인
SELECT
    (SELECT COUNT(*) FROM theone.theone_guests
     WHERE answers IS NOT NULL AND JSON_LENGTH(answers) >= 1) AS theone_guests_with_answers,
    (SELECT COUNT(*) FROM casting.casting_guests
     WHERE JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.migrated_from')) = 'theone') AS casting_migrated;
-- 두 값이 일치해야 함

-- 2) 결제 1:1 매핑
SELECT
    (SELECT COUNT(*) FROM theone.theone_orders) AS theone_orders,
    (SELECT COUNT(*) FROM casting.casting_orders
     WHERE JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.legacy_personalize')) = 'true') AS casting_migrated;

-- 3) 누락된 사용자
SELECT g.guest_uid
FROM theone.theone_guests g
LEFT JOIN casting.casting_guests c ON c.guest_uid = g.guest_uid
WHERE g.answers IS NOT NULL AND JSON_LENGTH(g.answers) >= 1 AND c.guest_uid IS NULL;

-- 4) profile_status 분포
SELECT profile_status, COUNT(*) FROM casting.casting_guests GROUP BY profile_status;

-- 5) 크레딧 잔액 정합성 (A1 옵션 시)
SELECT
    SUM(credits) AS expected_total,
    (SELECT SUM(balance) FROM casting.casting_user_credits) AS actual_balance
FROM casting.casting_orders
WHERE status = 'paid' AND JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.legacy_personalize')) = 'true';

-- 6) 원장 정합성 (A1 옵션 시)
SELECT
    (SELECT SUM(delta) FROM casting.casting_credit_transactions
     WHERE created_by = 'migration' AND transaction_type = 'purchase') AS ledger_total,
    (SELECT SUM(total_purchased) FROM casting.casting_user_credits) AS purchased_total;
```

### 임베딩 백필 + casting_profiles 생성

```python
# darakbang/casting/jobs/backfill_profiles.py (구현 후)
from darakbang.casting import models
from darakbang.casting.profile_builder import build_guest_profile
from darakbang.database import casting_engine
from sqlmodel import Session, select

def backfill_existing_guests():
    """전환된 사용자 전원에 대해 casting_profiles + 임베딩 생성."""
    with Session(casting_engine) as db:
        guests = db.exec(
            select(models.CastingGuest)
            .where(models.CastingGuest.profile_status == 'ready')
        ).all()
        for g in guests:
            if not g.answers_json:
                continue
            build_guest_profile(db, g.guest_uid)  # casting_profiles INSERT + 임베딩 호출
        db.commit()
```

400명 × $0.0001 ≈ $0.04, 5분 안. 기본 런북에서는 동의 후 `ready`가 된 사용자부터 백필한다. 운영자가 옵트아웃 모델을 선택하면 이관 직후 전체 백필로 변경 가능.

### 동의/옵트아웃 처리

기본 이관 상태는 `draft`다. 사용자가 첫 진입 안내에서 참여를 명시적으로 선택하면 `ready`로 올린다.

```sql
-- 사용자가 "참여하기" 클릭 시
UPDATE casting.casting_guests
SET profile_status = 'ready'
WHERE guest_uid = :uid;
```

이미 `ready`인 사용자가 이후 참여 중단을 선택하면 `excluded`로 내린다.

```sql
-- 사용자가 "참여 안 함" 클릭 시
UPDATE casting.casting_guests
SET profile_status = 'excluded'
WHERE guest_uid = :uid;
```

안내 UI는 첫 진입 시 1회 노출, 이후 설정 페이지에서 토글.

### 롤백 시나리오

전환 후 문제 발견 시:
```sql
-- 전환된 데이터만 삭제 (theone 원본은 read-only로 보존)
DELETE FROM casting.casting_credit_transactions
WHERE created_by = 'migration';

DELETE FROM casting.casting_user_credits
WHERE guest_uid IN (
    SELECT guest_uid FROM casting.casting_guests
    WHERE JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.migrated_from')) = 'theone'
);

DELETE FROM casting.casting_profiles
WHERE entity_uid IN (
    SELECT guest_uid FROM casting.casting_guests
    WHERE JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.migrated_from')) = 'theone'
);

DELETE FROM casting.casting_orders
WHERE JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.legacy_personalize')) = 'true';

DELETE FROM casting.casting_guests
WHERE JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.migrated_from')) = 'theone';
```

theone DB는 모든 단계에서 read-only이므로 롤백해도 원본 100% 보존.

---

## 4. 스키마 마이그레이션 단계

### Phase 0 — 사전 준비 (Day 0)

- [ ] `MATCHING_DESIGN.md` 최종 확정 (현재 문서)
- [ ] `casting_schema.sql` 스키마 검토
- [ ] `darakbang/casting/models.py` SQLModel 검토
- [ ] DB 운영자(SRE)와 prod RDS 신규 DB 생성 일정 협의
- [ ] casting domain 또는 라우트 결정 (`casting.publicvoid.im` vs `someonetheone.publicvoid.im/casting`)
- [ ] PIPA 대응 카피 / 약관 / privacy policy 초안

### Phase 1 — 인프라 (Day 1)

#### Local
- [x] `CASTING_DB_NAME=casting_local` 설정
- [x] `casting_local` DB 생성 확인
- [x] `migrations/casting_schema.sql` 스키마 적용
- [ ] backend 사용자 권한 부여 확인
- [ ] `darakbang/casting/models.py` import 테스트
  ```bash
  cd darakbang-backend
  python3 -c "from darakbang.casting import models; print(len([n for n in dir(models) if n.startswith('Casting')]))"
  ```

#### Sandbox
- [ ] AWS RDS sandbox에 `casting` DB 생성 (DBA 협조)
- [ ] sandbox `.env`에 `CASTING_DB_*` 환경변수 추가
- [ ] sandbox 배포 → backend 기동 확인

#### Production
- [ ] AWS RDS prod에 `casting` DB 생성 (변경 일정 공지)
- [ ] prod `.env`에 `CASTING_DB_*` 환경변수 추가
- [ ] **이 시점에서는 backend에 casting 모듈 router 등록 X** — DB만 만들고 코드 미배포
- [ ] DB 생성 후 `SHOW DATABASES` / `SHOW TABLES IN casting` 검증

### Phase 2 — 백엔드 코드 배포 (Week 1)

- [ ] `darakbang/casting/` 모듈 전체
- [ ] `app.py`에 casting router 등록
- [ ] sandbox 배포 → 단위 테스트 + 수동 검증
  - [ ] POST /casting/guests/start 정상 응답
  - [ ] casting_guests INSERT 확인
  - [ ] casting_activity_events 로그 정상
- [ ] prod 배포

이 시점에 **API endpoint는 살아있지만 frontend 미연동**. 어드민 / 내부 테스트만 가능.

### Phase 2.5 — 데이터 전환 (Week 1, Phase 2 후반)

- [ ] dry-run: SELECT 카운트로 전환 대상 검증 (INSERT 미실행)
  - [ ] `theone_guests` answers 있는 row 수
  - [ ] `theone_orders` 결제 row 수, status='paid' 수
  - [ ] product_id/product_name/amount/status별 분포
  - [ ] A1 선택 시 credits=0 예정 paid order가 0건인지 확인
- [ ] sandbox에서 전환 SQL 시범 실행 + 검증 쿼리 5종
- [ ] 의사결정자에게 dry-run 결과 + credits 정책(A1/A2) 최종 승인 받음
- [ ] prod 전환 실행 (off-peak 시간, 트랜잭션 단일 batch)
  - [ ] casting_guests INSERT
  - [ ] casting_orders INSERT (credits 정책 반영)
  - [ ] (A1 시) casting_user_credits + casting_credit_transactions INSERT
- [ ] 검증 쿼리 1:1 매핑 확인 (사용자/결제/크레딧 합계)
- [ ] 임베딩 백필 잡 실행 → casting_profiles row 생성
- [ ] 첫 진입 안내 모달 카피 / 참여 endpoint 작동 확인 (`draft` → `ready`)
- [ ] 동의 캠페인 발송 + 14일 cron 활성화 여부 결정

### Phase 3 — 외부 풀 시드 + 어드민 (Week 2)

- [ ] 어드민 endpoint (`POST /casting/admin/external`) 작동 확인
- [ ] 운영자 manual 큐레이션 50~100명 시드
  - 각 row에 `consent_status='unknown'`, `curated_by`, photos/bio 채우기
  - `recompute_trust_score()`로 trust 캐시 갱신
- [ ] 외부 프로필 임베딩 backfill 잡 실행
- [ ] (선택) 인스타 manual 크롤러 — 운영자가 username 입력 → 시스템이 fetch

### Phase 4 — 베타 오픈 (Week 3)

- [ ] frontend `/casting/*` 페이지 또는 `casting.publicvoid.im` 도메인 오픈
- [ ] 가격 페이지, 설문, 리포트 UI 배포
- [ ] 결제 webhook (테스트 모드) 검증
- [ ] 첫 매칭 검증 — 운영자가 직접 가입해서 매칭 받기
- [ ] LLM 비용 모니터링 (Supabase ai_usage_logs)

베타 기간 KPI:
- 매칭 0건 발생률 < 5%
- 리포트 LLM 실패율 < 1%
- 결제 → unlocked 리포트 노출 latency < 30s
- 평균 conversion (preview → 결제) — 측정 후 base line 산정

### Phase 5 — 정식 오픈 (Week 4+)

- [ ] 광고 채널 노출 (Meta Pixel `service='casting'`)
- [ ] threshold 튜닝 (실 데이터 기반)
- [ ] trust 보정 활성화
- [ ] 외부 풀 자동 크롤러 점진 도입 (인스타 → 트위터 순)

---

## 5. 환경별 실행 절차

### Local

```bash
# 1. DB 생성
# 로컬은 casting_local을 사용한다.
# 현재 로컬에는 생성/적용 완료.
CASTING_DB_NAME=casting_local

# 스키마를 새로 적용해야 하면 casting_schema.sql의 DB명을 casting_local로 치환해 실행한다.
# 예: sed 's/CREATE DATABASE IF NOT EXISTS casting /CREATE DATABASE IF NOT EXISTS casting_local /; s/USE casting;/USE casting_local;/; s/ON casting\\.\\*/ON casting_local.*/' \
#   /Users/joey/repository/darakbang/darakbang-backend/migrations/casting_schema.sql | mysql -h localhost -P 3306 -u joey -p

# 2. .env 환경변수
# CASTING_DB_NAME=casting_local
# 나머지는 DB_HOST/DB_PORT/DB_USER/DB_PASSWORD 기본값 사용

# 3. backend 기동
cd /Users/joey/repository/darakbang/darakbang-backend
python app.py

# 4. 검증
curl http://localhost:8000/casting/products
```

### Sandbox

```bash
# AWS RDS sandbox에 DB 생성 (DBA 또는 SSM 포트포워딩 통해)
# sandbox .env 업데이트:
# CASTING_DB_NAME=casting
# CASTING_DB_HOST=<sandbox-rds-host>
# (USER/PASSWORD는 기존 RDS 자격증명 재사용)

# 배포 후 검증
curl https://sandbox.<...>/casting/products
```

### Production

prod RDS는 SRE/DBA 권한 필요. 변경 일정 공지 후 진행:
1. `CREATE DATABASE casting` + 12개 테이블 + 권한 (casting_schema.sql 실행)
2. prod `.env`에 환경변수 추가
3. backend 무중단 재시작 (blue-green)
4. 검증 endpoint hit
5. 1주일 모니터링 후 frontend 연동

---

## 6. 모니터링 / 검증 포인트

### DB 메트릭
- `casting_*` 테이블 row count 일별 증가 추이
- `casting_activity_events` write throughput
- `casting_match_reports.status` 분포 (queued / generating / ready / failed 비율)
- `casting_user_credits.balance` 합계

### 비즈니스 메트릭
- 신규 가입 → 결제 conversion
- 매칭 검색 → 리포트 노출 latency
- 리포트당 평균 평점 (`casting_match_reviews.rating`)
- 외부 후보 outreach 응답률 (`casting_outreach_requests.status`)

### LLM 비용
- Supabase `ai_usage_logs` (service='casting') 일별 토큰 사용량
- 결제 1건당 평균 LLM 변동비

### 알림 (Sentry)
- 결제 webhook 실패
- LLM 호출 실패 (transient → retry, 영구 → 운영자 큐)
- 매칭 0건 발생 (cold start 보호 미작동)

---

## 7. 롤백 계획

casting은 별도 DB / 별도 모듈이므로 롤백 단순.

### Phase 1 (DB만 생성된 상태) 롤백
```sql
-- local
DROP DATABASE casting_local;

-- sandbox/prod
DROP DATABASE casting;
```
+ `.env`에서 `CASTING_DB_*` 제거.

### Phase 2 (백엔드 코드 배포된 상태) 롤백
- `app.py`에서 casting router 등록 라인 주석 처리 → 재배포
- DB는 그대로 둠 (데이터 보존 위해)
- frontend 미연동이라 사용자 영향 0

### Phase 3+ (사용자 데이터 쌓이기 시작한 후) 롤백
- 단순 DROP 위험 (사용자 결제 이력 손실)
- 대안: `app.py`에서 router 비활성화 + 사용자에게 공지 + 환불 처리
- DB는 보존하다가 안정화 후 재오픈

### 핵심 원칙
**theone DB는 어떤 phase에서도 손대지 않음** → 기존 서비스 항상 안전.

---

## 8. 리스크 매트릭스

| 리스크 | 영향 | 완화 |
|---|---|---|
| 매칭 0건 발생 (cold start) | 결제 환불 컴플레인 | `MIN_REPORTS_FOR_NEW_USER=3` 강제, 외부 풀 50~100명 사전 시드 |
| 외부 프로필 PIPA 컴플레인 | 법적 리스크 | `consent_status` + `removal_requested_at` 처리, 가입 시 고지 UX |
| 인스타 TOS 위반 (자동 크롤) | Meta 차단 | manual 등록부터 시작, 자동 크롤 단계적 도입 |
| LLM 비용 폭주 | 운영비↑ | threshold 동적 조정, 결제 1건당 매몰 한계 모니터링 |
| 결제 webhook 중복 / 누락 | 크레딧 정합성 깨짐 | `provider_payment_id` UNIQUE, `idempotency_key` 활용, raw_webhook_json 보관 |
| 임베딩 모델 단종 / 가격 인상 | 마이그 필요 | `embedding_version` 컬럼으로 관리, 백필 잡 준비 |
| External → Guest 전환 시 데이터 정합성 | 매칭 풀 중복 | 한 트랜잭션 처리, snapshot 보존 정책 |
| theone DB 영향 | 기존 서비스 중단 | 격리 원칙 — ALTER 0, casting과 코드 분리 |

---

## 9. 결정 미정 (운영 시작 전)

1. ~~기존 사용자 이관 정책~~ → **결정: 1:1 전환** (같은 서비스 업그레이드)
2. **결제 → 매칭 크레딧 정책** — A1 (intro_count 그대로 충전) vs A2 (history만, credits=0) vs A3 (할인 쿠폰)
   → **A1 추천**, 단 실제 `product_id/product_name/amount` 분포 dry-run 후 credits 매핑 확정
3. **동의 모델** — 옵트인 (첫 진입 동의 후 매칭 풀 진입) vs 옵트아웃 (즉시 매칭 풀, 사용자가 거부 가능)
   → **옵트인 추천**. 기본 이관은 `draft`, 참여 선택 후 `ready`
4. **prod casting RDS 인스턴스** — 신규 instance vs 기존 RDS의 별도 DB
5. **frontend 도메인** — `casting.publicvoid.im` 신규 vs `someonetheone.publicvoid.im` 그대로 사용 vs path 분리
6. **결제 PG 통합** — 기존 toss/iamport 그대로 사용 가정
7. **personalize 서비스 deprecate 일정** — 신규 가입 차단 시점, 기존 결제 deliver 종료 시점
8. **마케팅 메시지** — "서비스 업그레이드" 안내 카피

---

## 10. 체크리스트 요약 (Phase별 1-line)

```
[Phase 0]   설계 / 스키마 / 모델 검토 + DBA 일정 협의
[Phase 1]   casting DB 생성 (local → sandbox → prod), env 추가
[Phase 2]   casting 모듈 배포, API 살아있는지 검증
[Phase 2.5] 기존 데이터 이관 + 상품 dry-run + 동의 캠페인 발송
[Phase 3]   외부 풀 50~100명 시드, 어드민 도구 작동 확인
[Phase 4]   frontend 베타 오픈, 운영자 직접 매칭 검증
[Phase 5]   정식 오픈, threshold 튜닝, trust 보정 활성화
```

각 Phase 완료 시 회고 1회 (1주 단위), 다음 Phase 진행 결정.
