import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('인증이 필요합니다.');
  return user;
}

// GET — 전체 이벤트 목록 (is_active 무관) + 확정 남녀 인원수
export async function GET() {
  try {
    await requireAdmin();
    const supabase = createServiceClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supa = supabase as any;

    const [eventsResult, confirmedResult] = await Promise.all([
      supa.from('events').select('*').order('event_date', { ascending: false }),
      supa.from('applications').select('event_id, profiles(gender)').eq('status', '확정'),
    ]);

    if (eventsResult.error) throw new Error(eventsResult.error.message);

    // 이벤트별 남녀 확정 인원 집계 (gender는 profiles 테이블에 있음)
    const countMap: Record<string, { male: number; female: number }> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (confirmedResult.data ?? []).forEach((row: any) => {
      if (!countMap[row.event_id]) countMap[row.event_id] = { male: 0, female: 0 };
      const gender = row.profiles?.gender;
      if (gender === 'male') countMap[row.event_id].male++;
      else if (gender === 'female') countMap[row.event_id].female++;
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const events = (eventsResult.data ?? []).map((ev: any) => ({
      ...ev,
      confirmed_male: countMap[ev.id]?.male ?? 0,
      confirmed_female: countMap[ev.id]?.female ?? 0,
    }));

    return NextResponse.json(events);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 401 });
  }
}

// POST — 이벤트 생성
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const supabase = createServiceClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('events')
      .insert(body)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}

// PATCH — 이벤트 수정
export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { id, ...fields } = body;
    if (!id) return NextResponse.json({ error: 'id가 없습니다.' }, { status: 400 });
    const supabase = createServiceClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('events')
      .update(fields)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}

// DELETE — 이벤트 삭제
export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'id가 없습니다.' }, { status: 400 });
    const supabase = createServiceClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('events').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
