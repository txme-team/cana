-- 자기소개 에세이 답변을 JSONB 컬럼으로 저장
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_essays JSONB;
