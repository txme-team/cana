/**
 * POST /api/rotation/onboard
 * 온보딩 1단계: 연락처를 user_metadata에 저장
 * (profiles 테이블은 NOT NULL 제약이 많아 전화번호만 INSERT 불가 → auth metadata 활용)
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

    // user_metadata에 전화번호 저장 (profiles 스키마 제약 없음)
    const supabase = createServiceClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        phone: phone.trim(),
      },
    });

    if (error) throw new Error(error.message);

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
