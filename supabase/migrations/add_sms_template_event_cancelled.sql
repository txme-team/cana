-- 소개팅(이벤트) 전체 취소 시 안내 문자 템플릿 추가
insert into sms_templates (key, name, content, trigger_type, trigger_desc, variables, enabled)
values (
  'event_cancelled',
  '소개팅 취소',
  '[카나] 부득이한 사정으로 {{event_date}} 소개팅이 취소되었습니다. 참가비는 영업일 기준 3~5일 내 전액 환불됩니다. 다음 일정에서 좋은 인연을 만나시길 바랍니다. 불편을 드려 죄송합니다.',
  'manual',
  '운영진이 이벤트 취소 처리 후 수동 발송',
  '[{"key":"name","label":"신청자 이름","desc":"프로필 이름"},{"key":"event_date","label":"행사일","desc":"예: 6월 14일"}]'::jsonb,
  true
)
on conflict (key) do nothing;
