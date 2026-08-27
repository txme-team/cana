import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('인증이 필요합니다.');
  return user;
}

// GET — 이벤트 상세 + 확정 참여자 + 대기 인원
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const supabase = createServiceClient();
    const { id } = params;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supa = supabase as any;

    const [eventResult, participantsResult, waitlistResult] = await Promise.all([
      supa.from('events').select('*').eq('id', id).single(),
      supa
        .from('applications')
        .select('*, profiles(*)')
        .eq('event_id', id)
        .eq('status', '확정')
        .order('created_at', { ascending: true }),
      supa
        .from('applications')
        .select('*, profiles(*)')
        .eq('event_id', id)
        .eq('status', '대기')
        .order('created_at', { ascending: true }),
    ]);

    if (eventResult.error) throw new Error(eventResult.error.message);

    return NextResponse.json({
      event: eventResult.data,
      participants: participantsResult.data ?? [],
      waitlist: waitlistResult.data ?? [],
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 401 });
  }
}

// PATCH — 이벤트 개별 필드 수정 (venue_detail 등)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const body = await req.json();
    const supabase = createServiceClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('events')
      .update(body)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
