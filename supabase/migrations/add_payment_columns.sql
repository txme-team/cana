-- applications 테이블에 결제 정보 컬럼 추가
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS order_id    text,
  ADD COLUMN IF NOT EXISTS payment_key text,
  ADD COLUMN IF NOT EXISTS paid_at     timestamptz,
  ADD COLUMN IF NOT EXISTS amount      integer,
  ADD COLUMN IF NOT EXISTS pay_method  text;
