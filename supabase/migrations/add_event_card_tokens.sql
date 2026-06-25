-- 이벤트별 프로필카드 공유 토큰 (남자카드용, 여자카드용 각 1개)
alter table events
  add column if not exists card_token_male text,
  add column if not exists card_token_female text;
