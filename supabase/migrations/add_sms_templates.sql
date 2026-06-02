-- SMS 템플릿 테이블
CREATE TABLE IF NOT EXISTS public.sms_templates (
  key          text        PRIMARY KEY,
  name         text        NOT NULL,
  content      text        NOT NULL,
  trigger_type text        NOT NULL CHECK (trigger_type IN ('auto', 'manual', 'scheduled')),
  trigger_desc text        NOT NULL DEFAULT '',
  variables    jsonb       NOT NULL DEFAULT '[]',
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- 기본 템플릿 삽입 (이미 존재하면 무시)
INSERT INTO public.sms_templates (key, name, content, trigger_type, trigger_desc, variables) VALUES
(
  'application_complete', '신청 완료',
  '[카나] {{name}}님 {{event_date}} 소개팅 신청이 접수되었습니다. 운영진 검토 후 참석 확정 문자를 별도로 안내드릴게요.',
  'auto', '신청서 제출 및 결제 완료 시 즉시',
  '[{"key":"name","label":"신청자 이름","desc":"프로필 실명 (없으면 닉네임)"},{"key":"event_date","label":"행사일","desc":"예: 6월 14일"}]'
),
(
  'attendance_confirmed', '참석 확정',
  '[카나] {{name}}님 {{event_date}} 소개팅 참석이 확정되었습니다. 정확한 장소는 행사 전 별도 문자로 안내드릴게요. 좋은 만남이 되실 수 있도록 정성껏 준비하겠습니다.',
  'auto', '운영진이 참석 확정 처리 시 즉시',
  '[{"key":"name","label":"신청자 이름","desc":"프로필 실명 (없으면 닉네임)"},{"key":"event_date","label":"행사일","desc":"예: 6월 14일"}]'
),
(
  'venue_confirmed', '장소 확정',
  '[카나] {{name}}님 {{event_date}} 소개팅 장소가 확정되었습니다.

- 장소: {{venue_name}}
- 주소: {{address}}
- 오시는 길: {{map_url}}

신분증을 반드시 지참해 주세요.',
  'manual', '운영진이 장소 확정 문자 발송 버튼 클릭 시',
  '[{"key":"name","label":"신청자 이름","desc":"프로필 실명 (없으면 닉네임)"},{"key":"event_date","label":"행사일","desc":"예: 6월 14일"},{"key":"venue_name","label":"장소명","desc":"이벤트 venue_name"},{"key":"address","label":"주소","desc":"이벤트 venue_detail 또는 location"},{"key":"map_url","label":"지도 URL","desc":"이벤트 venue_url"}]'
),
(
  'attendance_rejected', '참석 반려',
  '[카나] {{name}}님 이번 {{event_date}} 회차 참석이 어렵게 되었습니다. 참가비는 영업일 기준 3~5일 내 전액 환불됩니다. 다음 일정에서 좋은 인연을 만나시길 바랍니다.',
  'auto', '운영진이 참석 반려 처리 시 즉시',
  '[{"key":"name","label":"신청자 이름","desc":"프로필 실명 (없으면 닉네임)"},{"key":"event_date","label":"행사일","desc":"예: 6월 14일"}]'
),
(
  'profile_card', '프로필 카드 발송',
  '[카나] {{name}}님 {{event_date}} 소개팅 참가자 프로필 카드를 보내드립니다.

내일 만나실 분들을 미리 살펴보고 오시면, 당일 훨씬 깊은 대화를 나누실 수 있어요.

프로필 카드 확인하기: {{profile_card_url}}
(링크는 행사 종료 후 만료됩니다)',
  'scheduled', '행사 전날 오후 6시 자동 발송',
  '[{"key":"name","label":"신청자 이름","desc":"프로필 실명 (없으면 닉네임)"},{"key":"event_date","label":"행사일","desc":"예: 6월 14일"},{"key":"profile_card_url","label":"프로필 카드 URL","desc":"수동 발송 시 직접 입력"}]'
),
(
  'day_before', '1일 전 안내',
  '[카나] {{name}}님 내일 {{event_datetime}} 소개팅입니다. 장소: {{venue_name}} {{address}} 신분증을 반드시 지참해 주세요.',
  'scheduled', '행사 전날 오후 7시 자동 발송',
  '[{"key":"name","label":"신청자 이름","desc":"프로필 실명 (없으면 닉네임)"},{"key":"event_datetime","label":"행사 일시","desc":"예: 6월 14일 오후 3시"},{"key":"venue_name","label":"장소명","desc":"이벤트 venue_name"},{"key":"address","label":"주소","desc":"이벤트 venue_detail 또는 location"}]'
),
(
  'event_ended', '소개팅 종료',
  '[카나] {{name}}님 오늘 {{event_date}} 소개팅에 함께해 주셔서 감사합니다. 좋은 인연으로 이어지길 바랍니다. 만족도 조사: {{survey_url}}',
  'scheduled', '행사 종료 1시간 후 자동 발송',
  '[{"key":"name","label":"신청자 이름","desc":"프로필 실명 (없으면 닉네임)"},{"key":"event_date","label":"행사일","desc":"예: 6월 14일"},{"key":"survey_url","label":"만족도 조사 URL","desc":"수동 발송 시 직접 입력"}]'
)
ON CONFLICT (key) DO NOTHING;
