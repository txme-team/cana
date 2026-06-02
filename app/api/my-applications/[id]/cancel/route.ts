/**
 * POST /api/my-applications/[id]/cancel
 * 본인 신청 취소 + Toss 환불
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

const CANCELLABLE_STATUSES = ['검토중', '대기'];

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authClient = createClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });

    const supabase = createServiceClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supa = supabase as any;

    // 본인 프로필 조회
    const { data: profile } = await supa
      .from('profiles').select('id').eq('user_id', user.id).maybeSingle() as
      { data: { id: string } | null };

    if (!profile) return NextResponse.json({ error: '프로필이 없어요.' }, { status: 400 });

    // 신청 조회 (본인 소유인지 확인)
    const { data: application } = await supa
      .from('applications')
      .select('id, status, payment_key, amount')
      .eq('id', params.id)
      .eq('profile_id', profile.id)
      .maybeSingle() as
      { data: { id: string; status: string; payment_key: string | null; amount: number | null } | null };

    if (!application) {
      return NextResponse.json({ error: '신청 내역을 찾을 수 없어요.' }, { status: 404 });
    }

    if (!CANCELLABLE_STATUSES.includes(application.status)) {
      return NextResponse.json({ error: '현재 상태에서는 취소할 수 없어요.' }, { status: 400 });
    }

    // Toss 환불 (결제된 경우)
    if (application.payment_key) {
      const secretKey = process.env.TOSS_SECRET_KEY!;
      const token = Buffer.from(`${secretKey}:`).toString('base64');

      const refundRes = await fetch(
        `https://api.tosspayments.com/v1/payments/${application.payment_key}/cancel`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ cancelReason: '고객 요청 취소' }),
          cache: 'no-store',
        }
      );

      if (!refundRes.ok) {
        const err = await refundRes.json().catch(() => ({})) as { message?: string };
        return NextResponse.json(
          { error: err.message ?? '환불 처리에 실패했어요. 운영팀에 문의해주세요.' },
          { status: 400 }
        );
      }
    }

    // 상태 → 취소
    await supa.from('applications').update({ status: '취소' }).eq('id', params.id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : '서버 오류가 발생했어요.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
