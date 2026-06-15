-- 이벤트별 참가비(할인가 등) 설정 — null이면 기본 참가비(NEXT_PUBLIC_TOSS_AMOUNT) 사용
alter table events
  add column if not exists price integer;
