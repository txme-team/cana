-- '대기' 처리 시 발송할 안내 문자 템플릿 추가
insert into sms_templates (key, name, content, trigger_type, trigger_desc, variables, enabled)
values (
  'attendance_waitlisted',
  '대기 안내',
  '[카나] {{name}}님 {{event_date}} 소개팅은 현재 대기 상태예요. 자리가 확정되면 별도로 안내드릴게요.',
  'auto',
  '운영진이 대기 처리 시 즉시',
  '[{"key":"name","label":"신청자 이름","desc":"프로필 이름"},{"key":"event_date","label":"행사일","desc":"예: 6월 14일"}]'::jsonb,
  true
)
on conflict (key) do nothing;
