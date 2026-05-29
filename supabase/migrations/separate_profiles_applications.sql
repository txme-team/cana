-- ============================================================
-- profiles / applications 테이블 분리 마이그레이션
-- 실행 순서를 반드시 지켜야 함 (위에서 아래로 순차 실행)
-- Supabase SQL Editor에서 전체 선택 후 한 번에 실행 권장
-- ============================================================


-- ============================================================
-- PHASE 1. profiles 테이블 생성
-- ============================================================

CREATE TABLE public.profiles (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             uuid NOT NULL UNIQUE,   -- Supabase auth.users.id
  -- 기본 정보
  nickname            text NOT NULL,
  gender              text NOT NULL,          -- 'male' | 'female'
  birth_year          int  NOT NULL,
  height              int,
  mbti                text,
  education           text,
  workplace           text,
  residence           text,
  living_with         text,                   -- 'family' | 'alone' | 'other'
  job                 text,
  company_name        text,
  drinking            text,
  smoking             text,
  hobbies             text[] DEFAULT '{}',
  personality         text[] DEFAULT '{}',
  -- 사전 정보
  contact_preference  text,
  date_frequency      text,
  opposite_friends    text,
  marriage_view       text,
  conflict_resolution text,
  day_off_style       text,
  pet                 text,
  date_style          text,
  -- 신앙
  church_denomination text,
  faith_years         int,
  church_location     text,
  church_name         text,
  church_pastor       text,
  faith_style         text,
  worship_frequency   text,
  ministry            text,
  faith_level         text,
  -- 인증
  photo_urls          text[] DEFAULT '{}',
  job_cert_url        text,
  bulletin_url        text,
  -- 연락처 & 동의
  phone               text,
  agree_privacy       boolean,
  agree_attendance    boolean,
  agree_profile_share boolean,
  agree_instagram     boolean,
  -- 메타
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);


-- ============================================================
-- PHASE 2. 기존 applications → profiles 데이터 이전
--   같은 user_id로 여러 신청이 있으면 가장 최근 신청 정보 기준
-- ============================================================

INSERT INTO public.profiles (
  user_id, nickname, gender, birth_year, height, mbti, education,
  workplace, residence, living_with, job, company_name, drinking, smoking,
  hobbies, personality, contact_preference, date_frequency, opposite_friends,
  marriage_view, conflict_resolution, day_off_style, pet, date_style,
  church_denomination, faith_years, church_location, church_name, church_pastor,
  faith_style, worship_frequency, ministry, faith_level,
  photo_urls, job_cert_url, bulletin_url, phone,
  agree_privacy, agree_attendance, agree_profile_share, agree_instagram,
  created_at
)
SELECT DISTINCT ON (user_id)
  user_id, nickname, gender, birth_year, height, mbti, education,
  workplace, residence, living_with, job, company_name, drinking, smoking,
  hobbies, personality, contact_preference, date_frequency, opposite_friends,
  marriage_view, conflict_resolution, day_off_style, pet, date_style,
  church_denomination, faith_years, church_location, church_name, church_pastor,
  faith_style, worship_frequency, ministry, faith_level,
  photo_urls, job_cert_url, bulletin_url, phone,
  agree_privacy, agree_attendance, agree_profile_share, agree_instagram,
  created_at
FROM public.applications
WHERE user_id IS NOT NULL
ORDER BY user_id, created_at DESC;


-- ============================================================
-- PHASE 3. applications 테이블에 profile_id 컬럼 추가 & 매핑
-- ============================================================

ALTER TABLE public.applications ADD COLUMN profile_id uuid;

UPDATE public.applications a
SET    profile_id = p.id
FROM   public.profiles p
WHERE  a.user_id = p.user_id;


-- ============================================================
-- PHASE 4. applications 정리 — 프로필 컬럼 제거 & 제약 추가
-- ============================================================

-- user_id가 없는 행 제거 (비로그인 신청 잔존 데이터)
DELETE FROM public.applications WHERE profile_id IS NULL;

-- NOT NULL + FK + UNIQUE 제약
ALTER TABLE public.applications
  ALTER COLUMN profile_id SET NOT NULL,
  ADD CONSTRAINT applications_profile_id_fkey
    FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT applications_unique_profile_event
    UNIQUE (profile_id, event_id);

-- 프로필 관련 컬럼 전부 제거
ALTER TABLE public.applications
  DROP COLUMN IF EXISTS user_id,
  DROP COLUMN IF EXISTS nickname,
  DROP COLUMN IF EXISTS gender,
  DROP COLUMN IF EXISTS birth_year,
  DROP COLUMN IF EXISTS height,
  DROP COLUMN IF EXISTS mbti,
  DROP COLUMN IF EXISTS education,
  DROP COLUMN IF EXISTS workplace,
  DROP COLUMN IF EXISTS residence,
  DROP COLUMN IF EXISTS living_with,
  DROP COLUMN IF EXISTS job,
  DROP COLUMN IF EXISTS company_name,
  DROP COLUMN IF EXISTS drinking,
  DROP COLUMN IF EXISTS smoking,
  DROP COLUMN IF EXISTS hobbies,
  DROP COLUMN IF EXISTS personality,
  DROP COLUMN IF EXISTS contact_preference,
  DROP COLUMN IF EXISTS date_frequency,
  DROP COLUMN IF EXISTS opposite_friends,
  DROP COLUMN IF EXISTS marriage_view,
  DROP COLUMN IF EXISTS conflict_resolution,
  DROP COLUMN IF EXISTS day_off_style,
  DROP COLUMN IF EXISTS pet,
  DROP COLUMN IF EXISTS date_style,
  DROP COLUMN IF EXISTS church_denomination,
  DROP COLUMN IF EXISTS faith_years,
  DROP COLUMN IF EXISTS church_location,
  DROP COLUMN IF EXISTS church_name,
  DROP COLUMN IF EXISTS church_pastor,
  DROP COLUMN IF EXISTS faith_style,
  DROP COLUMN IF EXISTS worship_frequency,
  DROP COLUMN IF EXISTS ministry,
  DROP COLUMN IF EXISTS faith_level,
  DROP COLUMN IF EXISTS photo_urls,
  DROP COLUMN IF EXISTS job_cert_url,
  DROP COLUMN IF EXISTS bulletin_url,
  DROP COLUMN IF EXISTS phone,
  DROP COLUMN IF EXISTS agree_privacy,
  DROP COLUMN IF EXISTS agree_attendance,
  DROP COLUMN IF EXISTS agree_profile_share,
  DROP COLUMN IF EXISTS agree_instagram;


-- ============================================================
-- PHASE 5. 인덱스
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_applications_profile_id ON public.applications(profile_id);
CREATE INDEX IF NOT EXISTS idx_applications_event_id   ON public.applications(event_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id        ON public.profiles(user_id);


-- ============================================================
-- PHASE 6. profiles updated_at 자동 갱신 트리거
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- 최종 확인용 쿼리 (실행 후 결과 확인)
-- ============================================================

-- SELECT count(*) FROM public.profiles;           -- 유저 수
-- SELECT count(*) FROM public.applications;        -- 신청 수
-- SELECT * FROM public.applications LIMIT 5;       -- profile_id, event_id, status 확인
-- SELECT * FROM public.profiles LIMIT 5;           -- 프로필 데이터 확인
