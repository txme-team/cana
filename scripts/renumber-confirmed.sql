-- 확정자 '오늘의 번호'(applications.display_no) 재정렬 — 이벤트 1개 대상
-- Supabase 대시보드 SQL Editor에서 실행한다.
--
-- 배경: lib/profile-card.ts의 ensureProfileCardMeta()가 번호를 새로 매길 때
-- 취소/반려된 신청까지 '이미 쓰인 번호'로 세는 버그가 있었다(코드는 별도로 수정됨).
-- 그 버그 때문에 과거에 확정된 사람들의 번호에 결번이 남아있을 수 있다.
-- 아래는 지정한 이벤트의 '확정' 상태 신청만, 성별 그룹별로, 현재 display_no 순서를
-- 그대로 유지한 채 1부터 결번 없이 다시 매긴다. 취소/반려 건은 건드리지 않는다.
--
-- 사용법: 아래 두 곳의 '00000000-0000-0000-0000-000000000000'를
--        실제 이벤트 id로 바꾼 뒤, 1) 미리보기 → 2) 확인되면 적용 순서로 실행한다.


-- ── 1) 미리보기 (읽기 전용, 아무것도 바꾸지 않음) ──────────────────────────────
-- 바뀔 사람만 나온다. 결과가 없으면 결번이 없다는 뜻.

select
  p.gender,
  p.nickname,
  a.display_no as 현재_번호,
  row_number() over (
    partition by p.gender
    order by a.display_no nulls last, a.created_at
  ) as 새_번호
from applications a
join profiles p on p.id = a.profile_id
where a.event_id = '00000000-0000-0000-0000-000000000000'  -- ← 이벤트 id로 교체
  and a.status = '확정'
order by p.gender, 새_번호;


-- ── 2) 실제 적용 ────────────────────────────────────────────────────────────
-- 위 미리보기 결과를 확인한 뒤에만 실행할 것.

with ranked as (
  select
    a.id,
    row_number() over (
      partition by p.gender
      order by a.display_no nulls last, a.created_at
    ) as new_no
  from applications a
  join profiles p on p.id = a.profile_id
  where a.event_id = '00000000-0000-0000-0000-000000000000'  -- ← 이벤트 id로 교체
    and a.status = '확정'
)
update applications a
set display_no = ranked.new_no
from ranked
where a.id = ranked.id
  and a.display_no is distinct from ranked.new_no;
