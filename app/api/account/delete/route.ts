import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { notifyError } from '@/lib/slack';

// ── POST: 회원 탈퇴 (프로필/신청/대기 데이터 삭제 + 계정 삭제) ─────────────────
export async function POST() {
  try {
    const authClient = createClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const supabase = createServiceClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supa = supabase as any;

    // ── 프로필 조회 ──────────────────────────────────────────────────────────
    const { data: profile } = await supa
      .from('profiles').select('id')
      .eq('user_id', user.id).maybeSingle() as { data: { id: string } | null };

    if (profile) {
      // 신청/대기 내역 삭제 후 프로필 삭제
      await supa.from('applications').delete().eq('profile_id', profile.id);
      await supa.from('waitlist').delete().eq('profile_id', profile.id);
      await supa.from('profiles').delete().eq('id', profile.id);
    }

    // ── 계정(인증) 삭제 ──────────────────────────────────────────────────────
    const { error: deleteUserError } = await supa.auth.admin.deleteUser(user.id);
    if (deleteUserError) throw new Error(deleteUserError.message);

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류';
    await notifyError(message, 'POST /api/account/delete').catch(() => {});
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
