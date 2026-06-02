-- 대기 신청 테이블
CREATE TABLE IF NOT EXISTS public.waitlist (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id    uuid        NOT NULL REFERENCES public.events(id)   ON DELETE CASCADE,
  gender      text        NOT NULL CHECK (gender IN ('male', 'female')),
  status      text        NOT NULL DEFAULT '대기중'
                          CHECK (status IN ('대기중', '연락됨', '결제완료', '취소')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  notified_at timestamptz,
  UNIQUE (profile_id, event_id)
);

-- 이벤트별·성별·상태별 빠른 조회용 인덱스
CREATE INDEX IF NOT EXISTS waitlist_event_gender_status_idx
  ON public.waitlist (event_id, gender, status, created_at);

-- RLS: 본인 데이터만 조회/수정 (서비스 롤은 모두 허용)
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "유저 본인 waitlist 조회"
  ON public.waitlist FOR SELECT
  USING (
    profile_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "유저 본인 waitlist 삽입"
  ON public.waitlist FOR INSERT
  WITH CHECK (
    profile_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "유저 본인 waitlist 수정"
  ON public.waitlist FOR UPDATE
  USING (
    profile_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );
