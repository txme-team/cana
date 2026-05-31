import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { notifyError } from '@/lib/slack';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      paymentKey: string;
      orderId: string;
      amount: number;
    };
    const { paymentKey, orderId, amount } = body;

    if (!paymentKey || !orderId || typeof amount !== 'number') {
      return NextResponse.json({ error: '필수 파라미터가 누락됐어요.' }, { status: 400 });
    }

    // ── 금액 검증 (클라이언트 값 절대 신뢰 금지) ──────────────────────────────
    const expectedAmount = parseInt(process.env.NEXT_PUBLIC_TOSS_AMOUNT ?? '39000', 10);
    if (amount !== expectedAmount) {
      return NextResponse.json({ error: '결제 금액이 올바르지 않아요.' }, { status: 400 });
    }

    // ── Toss 승인 API 호출 ────────────────────────────────────────────────────
    const secretKey = process.env.TOSS_SECRET_KEY!;
    const token = Buffer.from(`${secretKey}:`).toString('base64');

    const tossRes = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
      cache: 'no-store',
    });

    if (!tossRes.ok) {
      const tossErr = await tossRes.json().catch(() => ({})) as { message?: string; code?: string };
      const msg = tossErr.message ?? '결제 승인에 실패했어요.';
      return NextResponse.json({ error: msg, code: tossErr.code }, { status: 400 });
    }

    // ── 신청 상태 업데이트 (orderId === applicationId) ─────────────────────────
    const supabase = createServiceClient();
    const { error: updateError } = await supabase
      .from('applications')
      .update({ status: '검토중' })
      .eq('id', orderId);

    if (updateError) {
      // 결제는 완료됐으므로 에러를 로그만 하고 성공 응답
      await notifyError(
        `결제 완료 후 상태 업데이트 실패 — orderId: ${orderId}, ${updateError.message}`,
        'POST /api/payment/confirm'
      ).catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : '서버 오류가 발생했어요.';
    await notifyError(message, 'POST /api/payment/confirm').catch(() => {});
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
