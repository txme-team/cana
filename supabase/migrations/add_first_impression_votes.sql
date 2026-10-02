-- 첫인상 투표 (행사 현장에서 QR로 접속해 번호로 투표)
-- 로그인 없이 /api/rotation/vote 로만 쓰기 — 서비스 롤로 접근하므로 RLS 정책은 두지 않는다
-- (RLS 켜고 정책 없음 = anon/authenticated 직접 접근 전부 차단).
create table if not exists public.first_impression_votes (
  id           uuid        primary key default gen_random_uuid(),
  event_id     uuid        not null references public.events(id) on delete cascade,
  voter_gender text        not null check (voter_gender in ('male', 'female')),
  voter_no     int         not null check (voter_no between 1 and 99),
  target_no    int         check (target_no between 1 and 99), -- null = 기권
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  -- 같은 이벤트의 같은 성별·번호는 1표 — 다시 제출하면 덮어쓴다
  unique (event_id, voter_gender, voter_no)
);

alter table public.first_impression_votes enable row level security;
