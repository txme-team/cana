import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

// GET /api/events/applicants?eventId=xxx
// 비로그인 포함 누구나 신청자 기본 정보(성별·나이·직업·MBTI)를 확인할 수 있다.
export async function GET(req: NextRequest) {
  const eventId = new URL(req.url).searchParams.get('eventId');
  if (!eventId) return NextResponse.json({ error: 'eventId가 필요해요.' }, { status: 400 });

  const supa = createServiceClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any

  const { data, error } = await supa
    .from('applications')
    .select('profiles(gender, birth_year, job, mbti)')
    .eq('event_id', eventId)
    .eq('status', '확정') as {
      data: { profiles: { gender: string; birth_year: number; job: string; mbti: string } | null }[] | null;
      error: { message: string } | null;
    };

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const applicants = (data ?? [])
    .map((row) => row.profiles)
    .filter((p): p is { gender: string; birth_year: number; job: string; mbti: string } => p !== null);

  return NextResponse.json(applicants);
}
