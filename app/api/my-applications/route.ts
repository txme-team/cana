import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export async function GET() {
  const authClient = createClient();
  const { data: { user } } = await authClient.auth.getUser();

  if (!user) return NextResponse.json([]);

  const supabase = createServiceClient();

  // profiles 테이블에서 user_id로 profile_id 조회
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!profile) return NextResponse.json([]);

  // applications 테이블에서 profile_id로 신청한 이벤트 목록 조회
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('applications')
    .select('event_id')
    .eq('profile_id', profile.id);

  if (error) return NextResponse.json([]);

  const eventIds: string[] = (data ?? []).map((row: { event_id: string }) => row.event_id).filter(Boolean);
  return NextResponse.json(eventIds);
}
