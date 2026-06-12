-- 이벤트(소개팅) 자체 취소 — 최소 인원 미달 등으로 행사를 통째로 취소하는 경우
-- cancelled_at이 설정되면: 모든 신청건이 '취소' 처리되고, 결제건은 환불, 참가자에게
-- '소개팅 취소' SMS가 발송된다 (app/api/admin/events/[id]/cancel/route.ts)
alter table events
  add column if not exists cancelled_at timestamptz;
