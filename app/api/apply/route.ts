import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { notifyError } from '@/lib/slack';

// ─── GET: 결제 전 적격 검사 (레코드 생성 없음) ──────────────────────────────────
export async function GET(req: NextRequest) {
  const eventId = new URL(req.url).searchParams.get('eventId');
  if (!eventId) return NextResponse.json({ error: 'eventId가 필요해요.' }, { status: 400 });

  const authClient = createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });

  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supa = supabase as any;

  const { data: profile } = await supa
    .from('profiles').select('id').eq('user_id', user.id).maybeSingle() as
    { data: { id: string } | null };
  if (!profile) return NextResponse.json({ error: '프로필을 먼저 작성해주세요.' }, { status: 400 });

  // 중복 신청 여부, 이벤트 정보, 확정 인원을 동시에 조회
  const [existingResult, eventResult, confirmedResult] = await Promise.all([
    supa
      .from('applications').select('status')
      .eq('profile_id', profile.id).eq('event_id', eventId).maybeSingle() as
      Promise<{ data: { status: string } | null }>,
    supa
      .from('events').select('capacity, is_active, price').eq('id', eventId).maybeSingle() as
      Promise<{ data: { capacity: number; is_active: boolean; price: number | null } | null }>,
    supa
      .from('applications')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .in('status', ['검토중', '대기', '확정']) as Promise<{ count: number | null }>,
  ]);

  const { data: existing } = existingResult;
  if (existing && !['취소'].includes(existing.status)) {
    return NextResponse.json({ error: '이미 신청한 이벤트예요.' }, { status: 409 });
  }

  // 마감 이벤트는 waitlist '연락됨' 상태인 사람만 신청 가능
  const { data: eventData } = eventResult;
  const { count: confirmedCount } = confirmedResult;

  const isFull = eventData && (confirmedCount ?? 0) >= eventData.capacity;

  if (isFull) {
    const { data: waitEntry } = await supa
      .from('waitlist').select('status')
      .eq('profile_id', profile.id).eq('event_id', eventId)
      .eq('status', '연락됨').maybeSingle() as
      { data: { status: string } | null };

    if (!waitEntry) {
      return NextResponse.json(
        { error: '현재 정원이 마감됐어요. 대기 신청 후 빈자리 알림을 받아주세요.' },
        { status: 403 }
      );
    }
  }

  return NextResponse.json({ ok: true, price: eventData?.price ?? null });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      eventId: string;
      agreePrivacy: boolean;
      agreeAttendance: boolean;
      agreeProfileShare?: boolean;
      agreeInstagram?: boolean;
    };

    const { eventId, agreePrivacy, agreeAttendance, agreeProfileShare, agreeInstagram } = body;

    if (!eventId) {
      return NextResponse.json({ error: 'eventId 필드가 없습니다.' }, { status: 400 });
    }

    // ── 비로그인 차단 ──────────────────────────────────────────────────────────
    const authClient = createClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }
    const userId = user.id;

    const supabase = createServiceClient();

    // ── 프로필 조회 ────────────────────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile, error: profileFetchError } = await (supabase as any)
      .from('profiles')
      .select('id, nickname')
      .eq('user_id', userId)
      .maybeSingle() as { data: { id: string; nickname: string } | null; error: { message: string } | null };

    if (profileFetchError) throw new Error(`프로필 조회 실패: ${profileFetchError.message}`);

    if (!profile) {
      return NextResponse.json({ error: '프로필을 먼저 작성해주세요.' }, { status: 400 });
    }

    // ── 중복 신청 확인 (멱등성: 결제대기 상태라면 기존 ID 재사용) ────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase as any)
      .from('applications')
      .select('id, status')
      .eq('profile_id', profile.id)
      .eq('event_id', eventId)
      .maybeSingle() as { data: { id: string; status: string } | null };

    if (existing) {
      if (existing.status === '결제대기') {
        // 결제 재시도 — 기존 ID 반환
        return NextResponse.json({ id: existing.id }, { status: 200 });
      }
      if (existing.status === '취소') {
        // 취소 후 재신청 — UNIQUE 제약으로 insert 불가, 기존 행 업데이트
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: reapplyErr } = await (supabase as any)
          .from('applications')
          .update({ status: '결제대기' })
          .eq('id', existing.id);
        if (reapplyErr) throw new Error(`재신청 처리 실패: ${reapplyErr.message}`);
        return NextResponse.json({ id: existing.id }, { status: 200 });
      }
      return NextResponse.json({ error: '이미 신청한 이벤트예요.' }, { status: 409 });
    }

    // ── applications insert ────────────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: application, error: appError } = await (supabase as any)
      .from('applications')
      .insert({
        profile_id: profile.id,
        event_id:   eventId,
        status:     '결제대기',
      })
      .select('id')
      .single() as { data: { id: string } | null; error: { message: string } | null };

    if (appError) throw new Error(`신청 저장 실패: ${appError.message}`);

    // ── Update agreements on profile ──────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('profiles')
      .update({
        agree_privacy:       agreePrivacy ?? false,
        agree_attendance:    agreeAttendance ?? false,
        agree_profile_share: agreeProfileShare ?? false,
        agree_instagram:     agreeInstagram ?? false,
      })
      .eq('id', profile.id);

    const applicationId = application!.id;


    return NextResponse.json({ id: applicationId }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류';
    await notifyError(message, 'POST /api/apply').catch(() => {});
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
