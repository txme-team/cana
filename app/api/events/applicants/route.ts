import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

// GET /api/events/applicants?eventId=xxx
// 로그인 유저에게 해당 이벤트의 신청자 기본 정보(성별·나이·직업·MBTI)만 공개한다.
export async function GET(req: NextRequest) {
  const authClient = createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });

  const eventId = new URL(req.url).searchParams.get('eventId');
  if (!eventId) return NextResponse.json({ error: 'eventId가 필요해요.' }, { status: 400 });

  const supa = createServiceClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any

  const { data, error } = await supa
    .from('applications')
    .select('profiles(gender, birth_year, job, mbti)')
    .eq('event_id', eventId)
    .in('status', ['검토중', '대기', '확정']) as {
      data: { profiles: { gender: string; birth_year: number; job: string; mbti: string } | null }[] | null;
      error: { message: string } | null;
    };

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const applicants = (data ?? [])
    .map((row) => row.profiles)
    .filter((p): p is { gender: string; birth_year: number; job: string; mbti: string } => p !== null);

  return NextResponse.json(applicants);
}
