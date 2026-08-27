import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

// ─── GET: 내 대기 목록 ──────────────────────────────────────────────────────────
export async function GET() {
  const authClient = createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supa = createServiceClient() as any;

  const { data: profile } = await supa
    .from('profiles').select('id').eq('user_id', user.id).maybeSingle() as
    { data: { id: string } | null };
  if (!profile) return NextResponse.json([]);

  const { data } = await supa
    .from('waitlist')
    .select(`
      id,
      event_id,
      gender,
      status,
      created_at,
      notified_at,
      events ( title, event_date, location )
    `)
    .eq('profile_id', profile.id)
    .neq('status', '취소')
    .order('created_at', { ascending: false });

  return NextResponse.json(data ?? []);
}

// ─── POST: 대기 신청 ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { eventId } = await req.json() as { eventId?: string };
    if (!eventId) return NextResponse.json({ error: 'eventId가 필요해요.' }, { status: 400 });

    const authClient = createClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supa = createServiceClient() as any;

    // 프로필 + 성별 조회
    const { data: profile } = await supa
      .from('profiles').select('id, gender').eq('user_id', user.id).maybeSingle() as
      { data: { id: string; gender: string | null } | null };

    if (!profile) {
      return NextResponse.json({ error: '프로필을 먼저 작성해주세요.' }, { status: 400 });
    }
    if (!profile.gender) {
      return NextResponse.json({ error: '프로필에 성별을 입력해주세요.' }, { status: 400 });
    }

    // 이미 유효한 결제 신청이 있으면 waitlist 불필요
    const { data: existingApp } = await supa
      .from('applications').select('status')
      .eq('profile_id', profile.id).eq('event_id', eventId).maybeSingle() as
      { data: { status: string } | null };

    if (existingApp && existingApp.status !== '취소') {
      return NextResponse.json({ error: '이미 신청된 이벤트예요.' }, { status: 409 });
    }

    // 기존 대기 신청 확인
    const { data: existingWait } = await supa
      .from('waitlist').select('id, status')
      .eq('profile_id', profile.id).eq('event_id', eventId).maybeSingle() as
      { data: { id: string; status: string } | null };

    if (existingWait) {
      if (existingWait.status !== '취소') {
        return NextResponse.json({ error: '이미 대기 신청한 이벤트예요.' }, { status: 409 });
      }
      // 취소 후 재신청
      await supa.from('waitlist')
        .update({ status: '대기중', notified_at: null })
        .eq('id', existingWait.id);
      return NextResponse.json({ ok: true });
    }

    // 신규 대기 신청
    await supa.from('waitlist').insert({
      profile_id: profile.id,
      event_id:   eventId,
      gender:     profile.gender,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
