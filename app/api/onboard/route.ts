/**
 * POST /api/onboard
 * 온보딩 1단계: 연락처 저장 (프로필 레코드 upsert — phone + nickname)
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const authClient = createClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { phone } = await req.json() as { phone?: string };

    if (!phone || !/^010-\d{4}-\d{4}$/.test(phone.trim())) {
      return NextResponse.json({ error: '올바른 연락처 형식이 아닙니다.' }, { status: 400 });
    }

    const nickname =
      (user.user_metadata?.full_name as string | undefined) ??
      (user.user_metadata?.name    as string | undefined) ??
      '';

    const supabase = createServiceClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('profiles')
      .upsert(
        { user_id: user.id, phone: phone.trim(), nickname },
        { onConflict: 'user_id', ignoreDuplicates: false }
      );

    if (error) throw new Error(error.message);

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
