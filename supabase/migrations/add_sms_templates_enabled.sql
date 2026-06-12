-- sms_templates: 자동/예약 문자 발송 ON/OFF 토글
-- 수동(manual) 템플릿은 관리자가 직접 발송 버튼을 누르므로 영향 없음.
alter table sms_templates
  add column if not exists enabled boolean not null default true;
