import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('인증이 필요합니다.');
  return user;
}

// GET — Toss 결제 건별 조회 (paymentKey 기준) — 취소 이력(cancels) 포함 원본 응답 그대로 반환
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const paymentKey = req.nextUrl.searchParams.get('paymentKey');
    if (!paymentKey) {
      return NextResponse.json({ error: 'paymentKey가 필요해요.' }, { status: 400 });
    }

    const secretKey = process.env.TOSS_SECRET_KEY!;
    const token = Buffer.from(`${secretKey}:`).toString('base64');

    const tossRes = await fetch(
      `https://api.tosspayments.com/v1/payments/${paymentKey}`,
      {
        headers: { Authorization: `Basic ${token}` },
        cache: 'no-store',
      }
    );

    const data = await tossRes.json().catch(() => ({}));

    if (!tossRes.ok) {
      return NextResponse.json(
        { error: data.message ?? 'Toss 조회에 실패했어요.', code: data.code },
        { status: tossRes.status }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 401 });
  }
}
