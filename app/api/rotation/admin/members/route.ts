import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('인증이 필요합니다.');
  return user;
}

// GET — 전체 회원(profiles) 목록 + 각 회원의 신청 이력
export async function GET() {
  try {
    await requireAdmin();
    const supabase = createServiceClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('profiles')
      .select('*, applications(id, event_id, status, created_at)')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return NextResponse.json(data ?? []);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 401 });
  }
}
