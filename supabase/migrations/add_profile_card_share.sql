-- ============================================================
-- 참가자 프로필 카드 공유 페이지용 컬럼 추가
-- (소개팅 전날 SMS로 발송되는 "내일 만날 분들" 프로필 카드 페이지)
-- Supabase SQL Editor에서 실행
-- ============================================================

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS share_token text,
  ADD COLUMN IF NOT EXISTS display_no  int;

-- 토큰 조회 최적화 + 중복 방지
CREATE UNIQUE INDEX IF NOT EXISTS idx_applications_share_token
  ON public.applications(share_token)
  WHERE share_token IS NOT NULL;
