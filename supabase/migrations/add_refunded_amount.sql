-- applications 테이블에 환불 금액 컬럼 추가 (매출 = amount - refunded_amount)
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS refunded_amount integer NOT NULL DEFAULT 0;
