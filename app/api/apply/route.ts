import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { notifyNewProfile, notifyError } from '@/lib/slack';

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
        // 결제 재시도 허용 — 기존 ID 반환
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

    // ── 슬랙 알림 ──────────────────────────────────────────────────────────────
    await notifyNewProfile(profile.nickname, applicationId);

    return NextResponse.json({ id: applicationId }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류';
    await notifyError(message, 'POST /api/apply').catch(() => {});
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
