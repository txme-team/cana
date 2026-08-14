import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { sendSMS } from '@/lib/sms';
import { substituteVars, buildEventVars, getTemplateConfig } from '@/lib/sms-templates';
import { calcRefund, refundNoticeText } from '@/lib/refund-policy';

async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('인증이 필요합니다.');
  return user;
}

// GET — 결제 내역 전체
export async function GET() {
  try {
    await requireAdmin();
    const supabase = createServiceClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supa = supabase as any;

    const { data, error } = await supa
      .from('applications')
      .select(`
        id,
        status,
        order_id,
        payment_key,
        paid_at,
        amount,
        pay_method,
        event_id,
        profile_id,
        profiles ( nickname ),
        events   ( title, event_date )
      `)
      .not('paid_at', 'is', null)
      .order('paid_at', { ascending: false });

    if (error) throw new Error(error.message);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = (data ?? []).map((row: any) => ({
      id:          row.id,
      status:      row.status,
      order_id:    row.order_id,
      payment_key: row.payment_key,
      paid_at:     row.paid_at,
      amount:      row.amount,
      pay_method:  row.pay_method,
      event_id:    row.event_id,
      event_title: row.events?.title ?? '—',
      event_date:  row.events?.event_date ?? null,
      profile_id:  row.profile_id,
      nickname:    row.profiles?.nickname ?? '—',
    }));

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 401 });
  }
}

// POST — 결제 취소
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const { applicationId, paymentKey } = await req.json() as {
      applicationId: string;
      paymentKey: string;
    };

    if (!applicationId || !paymentKey) {
      return NextResponse.json({ error: '필수 파라미터 누락' }, { status: 400 });
    }

    const supabase = createServiceClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supa = supabase as any;

    // 환불 계산에 필요한 정보 조회 (DB 값을 신뢰 — 클라이언트 입력값 사용 안 함)
    const { data: appRow } = await supa
      .from('applications')
      .select('amount, events ( event_date )')
      .eq('id', applicationId)
      .maybeSingle() as { data: { amount: number | null; events: { event_date: string } | null } | null };

    if (!appRow) {
      return NextResponse.json({ error: '신청 내역을 찾을 수 없어요.' }, { status: 404 });
    }

    const eventDate = appRow.events?.event_date;
    const refund = calcRefund(appRow.amount, eventDate);

    // Toss 결제 취소 API 호출 (환불 대상 금액이 있을 때만)
    if (refund.rate > 0) {
      const secretKey = process.env.TOSS_SECRET_KEY!;
      const token = Buffer.from(`${secretKey}:`).toString('base64');

      const cancelBody: { cancelReason: string; cancelAmount?: number } = {
        cancelReason: '관리자 요청 취소',
      };
      if (refund.rate < 1) cancelBody.cancelAmount = refund.amount;

      const tossRes = await fetch(
        `https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cancelBody),
          cache: 'no-store',
        }
      );

      if (!tossRes.ok) {
        const err = await tossRes.json().catch(() => ({})) as { message?: string };
        return NextResponse.json(
          { error: err.message ?? '결제 취소에 실패했어요.' },
          { status: 400 }
        );
      }
    }

    // applications 상태를 '취소'로 업데이트
    await supa.from('applications').update({ status: '취소' }).eq('id', applicationId);

    // ── 취소 당사자 안내 SMS ────────────────────────────────────────────────────
    try {
      const { data: cancelledApp } = await supa
        .from('applications')
        .select('event_id, profiles ( phone, gender, nickname ), events ( title, event_date )')
        .eq('id', applicationId)
        .maybeSingle() as {
          data: {
            event_id: string;
            profiles: { phone: string | null; gender: string; nickname: string } | null;
            events:   { title: string; event_date: string }  | null;
          } | null;
        };

      const phone       = cancelledApp?.profiles?.phone;
      const displayName = cancelledApp?.profiles?.nickname;
      if (phone && displayName && eventDate) {
        const { content, enabled } = await getTemplateConfig(supa, 'application_cancelled');
        if (enabled) {
          const text = substituteVars(content, {
            name: displayName,
            refund_text: refundNoticeText(refund),
            ...buildEventVars({ event_date: eventDate }),
          });
          await sendSMS([phone], text);
        }
      }

      // ── 대기자 SMS 자동 발송 ──────────────────────────────────────────────────
      // 취소된 신청의 이벤트 + 성별 파악 → 동일 성별 대기자 전원에게 SMS
      const gender    = cancelledApp?.profiles?.gender;
      const eventId   = cancelledApp?.event_id;
      const eventTitle = cancelledApp?.events?.title ?? '이벤트';

      if (gender && eventId) {
        // 같은 이벤트 + 성별의 '대기중' 인원 조회 (프로필에서 phone 포함)
        const { data: waitlistEntries } = await supa
          .from('waitlist')
          .select('id, profiles ( phone )')
          .eq('event_id', eventId)
          .eq('gender', gender)
          .eq('status', '대기중') as {
            data: { id: string; profiles: { phone: string | null } | null }[] | null;
          };

        if (waitlistEntries && waitlistEntries.length > 0) {
          const phones = waitlistEntries
            .map((e) => e.profiles?.phone)
            .filter((p): p is string => !!p);

          if (phones.length > 0) {
            const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://cana.im';
            await sendSMS(
              phones,
              `[cana] ${eventTitle} 빈자리가 생겼어요! 지금 신청 후 결제하시면 자리를 확보할 수 있어요.\n${appUrl}/apply?eventId=${eventId}`,
            );
          }

          // 상태 → '연락됨'
          await supa
            .from('waitlist')
            .update({ status: '연락됨', notified_at: new Date().toISOString() })
            .in('id', waitlistEntries.map((e) => e.id));
        }
      }
    } catch (smsErr) {
      // SMS 실패는 취소 성공에 영향 주지 않음 — 로그만 기록
      console.error('[waitlist SMS error]', smsErr);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
