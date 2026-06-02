import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

// ─── DELETE: 대기 취소 ──────────────────────────────────────────────────────────
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const authClient = createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supa = createServiceClient() as any;

  const { data: profile } = await supa
    .from('profiles').select('id').eq('user_id', user.id).maybeSingle() as
    { data: { id: string } | null };
  if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // 본인 소유 확인 후 취소 처리
  const { error } = await supa
    .from('waitlist')
    .update({ status: '취소' })
    .eq('id', params.id)
    .eq('profile_id', profile.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
