import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export async function GET() {
  const authClient = createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json([]);

  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supa = supabase as any;

  // profile_id 조회
  const { data: profile } = await supa
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!profile) return NextResponse.json([]);

  // 신청 내역 + 이벤트 정보 조인
  const { data, error } = await supa
    .from('applications')
    .select('id, event_id, status, created_at, events(title, event_date, location)')
    .eq('profile_id', profile.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json([]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = (data ?? []).map((row: any) => ({
    id: row.id,
    event_id: row.event_id,
    status: row.status,
    created_at: row.created_at,
    event_title: row.events?.title ?? '',
    event_date: row.events?.event_date ?? '',
    event_location: row.events?.location ?? '',
  }));

  return NextResponse.json(result);
}
