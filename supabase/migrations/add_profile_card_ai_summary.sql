-- ============================================================
-- 프로필 카드용 AI 한 줄 요약 컬럼 추가
-- (카드를 펼치기 전, 접힌 헤더에 보여줄 매력 요약 문구)
-- Supabase SQL Editor에서 실행
-- ============================================================

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS ai_summary text;
