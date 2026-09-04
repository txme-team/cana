# cana 프로젝트 레퍼런스

크리스천 직장인 로테이션 소개팅 서비스.  
GitHub: `https://github.com/txme-team/cana.git`  
프로덕션: `https://cana-for-love.vercel.app`  
로컬 dev: `http://localhost:3000`

---

## 기술 스택

| 항목 | 기술 |
|------|------|
| 프레임워크 | Next.js 14 (App Router) |
| 언어 | TypeScript |
| 스타일 | Tailwind CSS 3.4 |
| 폼 | React Hook Form 7 |
| DB / Auth | Supabase (PostgreSQL + Auth) |
| 결제 | Toss Payments V2 Standard |
| SMS | Infobank API |
| 알림 | Slack Webhook |
| 배포 | Vercel |

---

## 환경 변수 (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

NEXT_PUBLIC_TOSS_AMOUNT=50000
NEXT_PUBLIC_APP_URL=https://cana.im

TOSS_SECRET_KEY=

INFOBANK_CLIENT_ID=
INFOBANK_CLIENT_PASSWD=
INFOBANK_SENDER_NUMBER=

SLACK_WEBHOOK_URL=
CRON_SECRET=
```

---

## 색상 팔레트 (tailwind.config.ts)

**Option D — Coral Blossom** 기준 (배경 #F4F0EC)

```ts
cana: {
  DEFAULT: '#e05c52',   // 포인트 코랄
  light:   '#ee9088',   // 연 코랄
  dark:    '#b83f38',   // 딥 코랄
  muted:   '#faf8f5',   // 카드/섹션 bg
  rule:    '#ddd4c8',   // 테두리
  ink:     '#1c1410',   // 본문 텍스트
  ink2:    '#4a3328',   // 서브 텍스트
  ink3:    '#a08878',   // 보조 텍스트
  warm:    '#ede8e2',   // 강조 bg
  cream:   '#f4f0ec',   // 주 배경
}
```

---

## 레이아웃 스펙

| 영역 | max-width | 패딩 | 상단 여백 |
|------|-----------|------|-----------|
| 헤더·푸터 내부 | `max-w-5xl` (1024px) | `px-5` | — |
| 랜딩 섹션 | `max-w-5xl` (1024px) | `px-5` | `py-20 sm:py-28` |
| 일반 페이지 본문 | `max-w-2xl` (672px) | `px-5` | `pt-24 pb-20` |
| 어드민 콘텐츠 | 제한 없음 | `px-6 py-8` | — |
| 모달 | `max-w-xs` (320px) | `p-6` | — |

헤더 높이: `py-4` (고정, `fixed inset-x-0 top-0 z-50`)  
어드민 사이드바: `w-56` (224px)

---

## 모달 디자인 통일 기준

```tsx
// 컨테이너
"w-full max-w-xs rounded-2xl bg-white p-6 shadow-xl"

// 타이틀 (16px)
"text-base font-semibold text-cana-ink"

// 디스크립션 (14px)
"text-sm text-cana-ink3 leading-relaxed"

// 취소 버튼
"flex-1 rounded-xl border border-cana-rule py-2.5 text-sm text-cana-ink3 hover:bg-cana-warm"

// 확인 버튼
"flex-1 rounded-xl bg-cana py-2.5 text-sm font-medium text-white hover:bg-cana-dark"
```

텍스트 좌측 정렬 (`text-center` 없음)

---

## 프로젝트 구조

```
cana/
├── app/
│   ├── page.tsx                    # 랜딩 페이지
│   ├── login/page.tsx              # 구글 OAuth 로그인
│   ├── onboard/page.tsx            # 온보딩 (첫 로그인)
│   ├── events/page.tsx             # 이벤트 목록
│   ├── apply/
│   │   ├── page.tsx                # 소개팅 신청 (다단계 폼)
│   │   ├── success/                # 결제 성공 처리
│   │   ├── fail/                   # 결제 실패
│   │   └── complete/               # 신청 완료
│   ├── my/page.tsx                 # 마이페이지 (내 정보/프로필카드/신청내역)
│   ├── profile/create/page.tsx     # 프로필 카드 작성
│   ├── faq/page.tsx
│   ├── auth/callback/route.ts      # Supabase OAuth 콜백
│   ├── admin/                      # 어드민 패널
│   │   ├── layout.tsx              # 사이드바 + 세션 타이머
│   │   ├── page.tsx                # 신청자 명단
│   │   ├── events/                 # 이벤트 관리
│   │   ├── members/                # 회원 목록
│   │   ├── payments/               # 결제 내역
│   │   ├── revenue/                # 매출 현황
│   │   ├── sms/                    # 문자 관리
│   │   ├── logs/                   # 활동 로그
│   │   ├── print/                  # 프로필 카드 인쇄
│   │   └── login/                  # 어드민 로그인
│   └── api/
│       ├── events/                 # GET: 이벤트 목록
│       ├── apply/                  # GET: 신청 자격 검사 / POST: 신청 생성
│       ├── profile/                # GET/POST: 프로필 조회·저장
│       ├── my-applications/        # GET: 내 신청 목록
│       │   └── [id]/cancel/        # POST: 신청 취소 + Toss 환불 + waitlist SMS
│       ├── waitlist/               # GET: 대기 목록 / POST: 대기 신청
│       │   └── [id]/               # DELETE: 대기 취소
│       ├── payment/confirm/        # POST: Toss 결제 확인
│       ├── onboard/                # POST: 온보딩 완료 처리
│       ├── cron/sms-scheduler/     # 이벤트 전날 SMS 자동 발송
│       └── admin/
│           ├── update-status/      # PATCH: 신청 상태 변경 + SMS + waitlist
│           ├── events/             # 이벤트 CRUD
│           ├── applications/[id]/  # 신청 수정
│           ├── payments/           # 결제 취소 + waitlist SMS
│           ├── members/            # 회원 목록
│           ├── sms-templates/      # SMS 템플릿 관리
│           ├── signed-url/         # Supabase 서명 URL 발급
│           └── logs/               # 활동 로그 조회
├── components/
│   ├── landing/
│   │   ├── Nav.tsx                 # 고정 헤더 + 로그아웃 모달
│   │   ├── Footer.tsx
│   │   ├── Hero.tsx                # 히어로 섹션
│   │   ├── PainPoint.tsx
│   │   ├── WhyCana.tsx             # WHY CANA 섹션 (SVG 아이콘)
│   │   ├── Process.tsx             # HOW IT WORKS 섹션
│   │   ├── Events.tsx              # 이벤트 카드 목록 + 대기 신청 모달
│   │   ├── EventsPage.tsx          # /events 전용 목록
│   │   ├── TrustSafety.tsx
│   │   ├── FAQ.tsx
│   │   ├── HeroCardSkeleton.tsx
│   │   ├── ProfileCardPreview.tsx
│   │   └── BackButton.tsx
│   ├── apply/
│   │   ├── Step0.tsx               # 이벤트 선택 (대기 신청 텍스트 링크 포함)
│   │   ├── Step1~5.tsx             # 기본정보·사전정보·신앙·연락처·인증
│   │   ├── StepQnA.tsx             # 자기소개 Q&A
│   │   └── StepPayment.tsx
│   ├── admin/
│   │   ├── AdminSidebar.tsx        # 사이드바 + 로그아웃 모달
│   │   ├── SessionTimer.tsx        # 세션 만료 타이머
│   │   ├── AdminDashboard.tsx      # 신청자 명단 테이블
│   │   ├── ProfileTable.tsx
│   │   ├── ProfileModal.tsx
│   │   ├── EventsManager.tsx
│   │   ├── EventDetailPage.tsx
│   │   ├── MembersPage.tsx
│   │   ├── PaymentsPage.tsx
│   │   ├── RevenuePage.tsx
│   │   └── SmsPage.tsx
│   └── print/
│       ├── ProfileCardTemplate.tsx  # A4 인쇄용 프로필 카드
│       └── PrintControls.tsx
├── lib/
│   ├── types.ts                    # 전체 타입 정의 (Profile, Application 등)
│   ├── supabase/
│   │   ├── client.ts               # 클라이언트용 createClient
│   │   └── server.ts               # 서버용 createClient / createServiceClient
│   ├── sms.ts                      # Infobank SMS 발송
│   ├── sms-templates.ts            # SMS 템플릿 치환 유틸
│   ├── payment.ts                  # Toss 결제 관련 타입/상수
│   ├── admin-logger.ts             # 어드민 활동 로그 기록
│   ├── slack.ts                    # Slack Webhook 알림
│   └── locations.ts                # 시/구 목록 데이터
├── public/icons/                   # SVG 아이콘 (하이픈 구분 이름)
│   ├── shining-profile.svg
│   ├── bubble-smile-2.svg
│   ├── flower.svg
│   ├── praying.svg
│   ├── business-user-curriculum.svg
│   ├── party-popper.svg
│   ├── mail-love.svg
│   ├── calander.svg
│   ├── location.svg
│   ├── clock.svg, docs.svg, profile.svg, job.svg, christian.svg
│   └── ... (기타 type=*.svg 원본 파일도 공존)
├── tailwind.config.ts
└── PROJECT_REFERENCE.md            # 이 파일
```

---

## DB 테이블 구조 (Supabase)

### profiles
사용자 1명당 1행. Auth user와 `user_id`로 연결.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| user_id | uuid | auth.users FK |
| nickname | text | 닉네임 |
| gender | text | 'male' / 'female' |
| birth_year | int | 출생연도 |
| phone | text | 연락처 |
| photo_urls | text[] | 프로필 사진 URL 배열 |
| job_cert_url | text | 직장 인증 파일 URL |
| bulletin_url | text | 교회 인증 파일 URL |
| profile_essays | jsonb | Q&A 자기소개 |
| agree_* | bool | 약관 동의 여부 |

### events
| 컬럼 | 설명 |
|------|------|
| id | uuid PK |
| title | 이벤트명 |
| event_date | 일시 |
| location | 장소 |
| capacity | 정원 (남/여 합산) |
| confirmed_count | 확정 인원 수 |
| age_range_male/female | 연령대 표시 문자열 |
| is_active | 모집 활성 여부 |

### applications
| 컬럼 | 설명 |
|------|------|
| id | uuid PK |
| profile_id | profiles FK |
| event_id | events FK |
| status | '검토중' / '대기' / '확정' / '반려' / '취소' / '결제대기' |
| payment_key | Toss 결제키 |
| order_id | 주문 ID |
| amount | 결제 금액 |
| paid_at | 결제 시각 |
| pay_method | 결제 수단 |

### waitlist
| 컬럼 | 설명 |
|------|------|
| id | uuid PK |
| profile_id | profiles FK |
| event_id | events FK |
| gender | 성별 |
| status | '대기중' / '연락됨' / '취소' |
| notified_at | SMS 발송 시각 |

> ⚠️ waitlist 테이블은 수동 생성 필요:
> ```sql
> CREATE TABLE IF NOT EXISTS waitlist (
>   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
>   profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
>   event_id   UUID NOT NULL REFERENCES events(id)   ON DELETE CASCADE,
>   gender     TEXT NOT NULL,
>   status     TEXT NOT NULL DEFAULT '대기중',
>   notified_at TIMESTAMPTZ,
>   created_at  TIMESTAMPTZ DEFAULT now(),
>   UNIQUE (profile_id, event_id)
> );
> ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
> CREATE POLICY "waitlist_user_select" ON waitlist FOR SELECT
>   USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
> ```

### admin_logs
| 컬럼 | 설명 |
|------|------|
| id | uuid PK |
| admin_id | auth.users FK |
| admin_email | text |
| action | 'APPLICATION_STATUS_CHANGED' 등 |
| target_type / target_id | 대상 정보 |
| detail | jsonb |
| created_at | timestamptz |

> ⚠️ admin_logs 테이블도 수동 생성 필요:
> ```sql
> CREATE TABLE IF NOT EXISTS admin_logs (
>   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
>   admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
>   admin_email TEXT,
>   action TEXT NOT NULL,
>   target_type TEXT,
>   target_id TEXT,
>   detail JSONB,
>   ip_address TEXT,
>   created_at TIMESTAMPTZ DEFAULT now()
> );
> ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
> CREATE POLICY "admin_logs_select" ON admin_logs FOR SELECT
>   USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
> ```

### sms_templates
SMS 내용을 DB에서 관리. `key` 기준 조회 후 변수 치환.

---

## 인증 & 권한

- **일반 유저**: Google OAuth (`/rotation/login` → `/rotation/auth/callback` → `/rotation/onboard` 또는 `/rotation/my`)
- **어드민**: `user.app_metadata.role === 'admin'` 확인
  - 어드민 권한 부여 SQL:
    ```sql
    UPDATE auth.users
    SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'
    WHERE email = 'admin@example.com';
    ```
- **Supabase RLS**: `auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'`
- **Service Role**: `createServiceClient()` — RLS 우회, 서버사이드 전용

---

## 신청 플로우

```
이벤트 선택 (Step0)
  └─ 마감 이벤트 → 카드 내 "대기 신청하기" 텍스트 링크 → waitlist 모달 → POST /api/rotation/waitlist
  └─ 모집 중 이벤트 → 선택 후 다음

→ 프로필 확인 (Step1 — DB 프로필 미리보기)
→ 약관 동의 (Step2)
→ Toss 결제창 (CARD, 50,000원)
→ /rotation/apply/success → POST /api/rotation/payment/confirm → applications 생성 (status: 검토중)
→ /rotation/apply/complete
```

**대기 자리 알림 플로우:**
```
취소 발생 (사용자/어드민) → 같은 성별 waitlist '대기중' 전원에게 SMS
→ status: '대기중' → '연락됨'
→ 해당 사용자가 결제 완료 → 나머지 '연락됨' → '대기중' 복원
```

**독점 신청 권한:**  
`/api/rotation/apply GET`에서 마감 이벤트는 `waitlist.status = '연락됨'`인 사람만 통과

---

## SMS 템플릿 키

| key | 발송 시점 |
|-----|-----------|
| `application_complete` | 신청 완료 (결제 확인 후) |
| `attendance_confirmed` | 관리자가 상태 → 확정 |
| `attendance_rejected` | 관리자가 상태 → 반려 |
| `venue_info` | 소개팅 전날 장소 안내 |
| `waitlist_notify` | 빈자리 발생 알림 |

변수: `{name}`, `{date}`, `{month}`, `{day}`, `{dow}`, `{hour}`, `{ampm}`

---

## 스토리지 (Supabase Storage)

버킷: `profile-photos` (public)  
업로드: `POST /api/rotation/profile` (FormData)  
파일 접두어: `photo-`, `workplace-`, `church-`  
URL 형식: `getPublicUrl()` → 전체 공개 URL로 저장

---

## 어드민 기능 목록

| 메뉴 | 경로 | 주요 기능 |
|------|------|-----------|
| 신청자 명단 | `/rotation/admin` | 필터·검색, 상태 변경, 프로필 상세 모달 |
| 이벤트 관리 | `/rotation/admin/events` | CRUD, 확정 인원 현황, waitlist 조회 |
| 회원 목록 | `/rotation/admin/members` | 전체 프로필 조회 |
| 결제 내역 | `/rotation/admin/payments` | 결제 취소 + 환불 + waitlist SMS |
| 매출 현황 | `/rotation/admin/revenue` | 이벤트별 매출 집계 |
| 문자 관리 | `/rotation/admin/sms` | 템플릿 편집, 수동 일괄 발송 |
| 활동 로그 | `/rotation/admin/logs` | 관리자 액션 이력 |
| 프로필 인쇄 | `/rotation/admin/print` | A4 프로필 카드 PDF 출력 |

---

## 주요 설계 원칙

1. **`app_metadata.role`**: 어드민 권한은 profiles 테이블이 아닌 auth.users app_metadata에 저장 (서비스 롤만 수정 가능)
2. **서비스 롤 분리**: `createClient()` (일반, RLS 적용) / `createServiceClient()` (RLS 우회, 서버 전용)
3. **결제 흐름**: Toss 리다이렉트 방식 — sessionStorage에 pendingPayload 저장 후 success URL에서 confirm
4. **프로필 draft**: localStorage에 임시저장 (파일 필드 제외), 기존 DB 프로필 없을 때만 복원
5. **이벤트 자동 마감**: 확정 인원 ≥ capacity 시 `is_active: false` 자동 설정

---

## 로컬 개발 시작

```bash
git clone https://github.com/txme-team/cana.git
cd cana
npm install
# .env.local 파일 생성 후 환경변수 입력
npm run dev
```
