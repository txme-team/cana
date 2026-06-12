import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { sendPersonalizedSMS } from '@/lib/sms';
import { substituteVars, buildEventVars, getTemplateConfig } from '@/lib/sms-templates';
import { logAdminAction } from '@/lib/admin-logger';

async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('인증이 필요합니다.');
  return user;
}

// POST — 이벤트(소개팅) 전체 취소
// - 모집중/대기/확정 신청 전체를 '취소' 처리
// - 결제(paid_at)가 있는 건은 Toss 전액 환불
// - 참가자 전원에게 '소개팅 취소' SMS 발송
// - 이벤트는 cancelled_at 기록 + is_active = false
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await requireAdmin();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supa = createServiceClient() as any;
    const eventId = params.id;

    const { data: event, error: eventError } = await supa
      .from('events')
      .select('id, title, event_date, venue_name, venue_detail, location, venue_url, cancelled_at')
      .eq('id', eventId)
      .single() as {
        data: {
          id: string; title: string; event_date: string;
          venue_name?: string | null; venue_detail?: string | null;
          location?: string | null; venue_url?: string | null;
          cancelled_at: string | null;
        } | null;
        error: { message: string } | null;
      };

    if (eventError || !event) {
      return NextResponse.json({ error: '이벤트를 찾을 수 없어요.' }, { status: 404 });
    }
    if (event.cancelled_at) {
      return NextResponse.json({ error: '이미 취소된 이벤트예요.' }, { status: 400 });
    }

    // ── 영향받는 신청 조회 (검토중/대기/확정) ──────────────────────────────────
    const { data: apps } = await supa
      .from('applications')
      .select('id, status, payment_key, paid_at, amount, profiles ( nickname, phone )')
      .eq('event_id', eventId)
      .in('status', ['검토중', '대기', '확정']) as {
        data: {
          id: string; status: string;
          payment_key: string | null; paid_at: string | null; amount: number | null;
          profiles: { nickname: string; phone: string | null } | null;
        }[] | null;
      };

    const targets = apps ?? [];

    // ── 결제건 환불 (Toss) ────────────────────────────────────────────────────
    const secretKey = process.env.TOSS_SECRET_KEY!;
    const token = Buffer.from(`${secretKey}:`).toString('base64');

    const refundErrors: string[] = [];
    let refunded = 0;

    for (const app of targets) {
      if (!app.payment_key || !app.paid_at) continue;
      try {
        const tossRes = await fetch(
          `https://api.tosspayments.com/v1/payments/${app.payment_key}/cancel`,
          {
            method: 'POST',
            headers: {
              Authorization: `Basic ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cancelReason: '소개팅 취소 (최소 인원 미달 등)' }),
            cache: 'no-store',
          },
        );
        if (!tossRes.ok) {
          const errBody = await tossRes.json().catch(() => ({})) as { message?: string };
          refundErrors.push(`${app.profiles?.nickname ?? app.id}: ${errBody.message ?? '환불 실패'}`);
          continue;
        }
        refunded += 1;
      } catch (e) {
        refundErrors.push(`${app.profiles?.nickname ?? app.id}: ${(e as Error).message}`);
      }
    }

    // ── 신청 상태 전부 '취소'로 변경 ──────────────────────────────────────────
    if (targets.length > 0) {
      await supa
        .from('applications')
        .update({ status: '취소' })
        .in('id', targets.map((a) => a.id));
    }

    // ── 이벤트 취소 처리 ──────────────────────────────────────────────────────
    await supa
      .from('events')
      .update({ cancelled_at: new Date().toISOString(), is_active: false })
      .eq('id', eventId);

    // ── SMS 발송 ──────────────────────────────────────────────────────────────
    const { content } = await getTemplateConfig(supa, 'event_cancelled');
    const eventVars = buildEventVars(event);
    const messages = targets
      .filter((a) => !!a.profiles?.phone)
      .map((a) => ({
        phone: a.profiles!.phone!,
        text: substituteVars(content, { name: a.profiles!.nickname, ...eventVars }),
      }));

    let smsSent = 0;
    if (messages.length > 0) {
      await sendPersonalizedSMS(messages);
      smsSent = messages.length;
    }

    logAdminAction({
      adminId:    user.id,
      adminEmail: user.email ?? '',
      action:     'EVENT_CANCELLED',
      targetType: 'event',
      targetId:   eventId,
      detail:     { affected: targets.length, refunded, smsSent, refundErrors },
    }).catch(() => {});

    return NextResponse.json({
      ok: true,
      affected: targets.length,
      refunded,
      smsSent,
      refundErrors,
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
