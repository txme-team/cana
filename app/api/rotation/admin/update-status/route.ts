import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import type { ProfileStatus } from '@/lib/types';
import { logAdminAction } from '@/lib/admin-logger';
import { notifyApplicationCancelled } from '@/lib/slack';
import { sendSMS } from '@/lib/sms';
import { substituteVars, buildEventVars, getTemplateConfig } from '@/lib/sms-templates';
import { ensureProfileCardMeta } from '@/lib/profile-card';
import { calcRefund, refundNoticeText } from '@/lib/refund-policy';
import { buildPublicUrl } from '@/lib/public-url';

const VALID_STATUSES: ProfileStatus[] = ['검토중', '대기', '확정', '반려', '취소'];

interface CancelJoinRow {
  event_id: string;
  payment_key: string | null;
  amount: number | null;
  profiles: { phone: string | null; gender: string; nickname: string; birth_year: number | null; job: string | null; company_name: string | null } | null;
  events: { title: string; event_date: string } | null;
}

export async function PATCH(req: NextRequest) {
  // 인증 확인 (anon client)
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.id || !body?.status) {
    return NextResponse.json({ error: 'id, status 필드가 필요합니다.' }, { status: 400 });
  }

  if (!VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: '유효하지 않은 status입니다.' }, { status: 400 });
  }

  const serviceClient = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const svc = serviceClient as any;

  // ── 취소: 상태를 바꾸기 전에 환불부터 처리 (실패 시 상태 변경 자체를 막는다) ──
  let cancelJoin: CancelJoinRow | null = null;
  let cancelRefund: ReturnType<typeof calcRefund> | null = null;

  if (body.status === '취소') {
    const { data: appRow } = await svc
      .from('applications')
      .select(`
        event_id, payment_key, amount,
        profiles ( phone, gender, nickname, birth_year, job, company_name ),
        events ( title, event_date )
      `)
      .eq('id', body.id)
      .maybeSingle() as { data: CancelJoinRow | null };

    if (!appRow) {
      return NextResponse.json({ error: '신청 내역을 찾을 수 없습니다.' }, { status: 404 });
    }
    cancelJoin = appRow;

    const eventDate = appRow.events?.event_date;
    const refund = calcRefund(appRow.amount, eventDate);
    cancelRefund = refund;

    if (appRow.payment_key && refund.rate > 0) {
      const secretKey = process.env.TOSS_SECRET_KEY!;
      const token = Buffer.from(`${secretKey}:`).toString('base64');

      const cancelBody: { cancelReason: string; cancelAmount?: number } = {
        cancelReason: '운영진 취소 처리',
      };
      if (refund.rate < 1) cancelBody.cancelAmount = refund.amount;

      const tossRes = await fetch(
        `https://api.tosspayments.com/v1/payments/${appRow.payment_key}/cancel`,
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
          { error: err.message ?? '환불 처리에 실패했어요. 결제 상태를 확인해주세요.' },
          { status: 400 }
        );
      }
    }
  }

  // DB 업데이트 (service role — RLS 우회)
  const { error } = await svc
    .from('applications')
    .update({ status: body.status })
    .eq('id', body.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 활동 로그 기록
  logAdminAction({
    adminId:    user.id,
    adminEmail: user.email ?? '',
    action:     'APPLICATION_STATUS_CHANGED',
    targetType: 'application',
    targetId:   body.id,
    detail:     { status: body.status },
  }).catch(() => {});

  // 확정 처리 시, 프로필 카드 공유 페이지용 토큰/번호 부여 (없으면 생성, idempotent)
  if (body.status === '확정') {
    ensureProfileCardMeta(serviceClient, body.id).catch((e) => {
      console.error('[ensureProfileCardMeta error]', e);
    });
  }

  // 확정 처리 시, 해당 이벤트의 정원이 다 찼으면 자동 마감
  if (body.status === '확정') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: appData } = await (serviceClient as any)
        .from('applications')
        .select('event_id')
        .eq('id', body.id)
        .single();

      if (appData?.event_id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const svcSupa = serviceClient as any;
        const [{ count: confirmedCount }, { data: eventData }] = await Promise.all([
          svcSupa
            .from('applications')
            .select('id', { count: 'exact', head: true })
            .eq('event_id', appData.event_id)
            .eq('status', '확정'),
          svcSupa
            .from('events')
            .select('capacity, is_active')
            .eq('id', appData.event_id)
            .single(),
        ]);

        if (
          eventData?.is_active &&
          confirmedCount !== null &&
          confirmedCount >= eventData.capacity
        ) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (serviceClient as any)
            .from('events')
            .update({ is_active: false })
            .eq('id', appData.event_id);
        }
      }
    } catch {
      // 자동 마감 실패해도 status 업데이트는 성공으로 반환
    }
  }

  // ── 취소 처리 시 슬랙/SMS 알림 (환불은 위에서 이미 처리됨) ──────────────────
  if (body.status === '취소' && cancelJoin) {
    const gender = cancelJoin.profiles?.gender;
    const eventId = cancelJoin.event_id;
    const eventTitle = cancelJoin.events?.title ?? '이벤트';
    const eventDate = cancelJoin.events?.event_date;

    // 슬랙 알림 — 신청 취소 (어드민 처리)
    await notifyApplicationCancelled({
      nickname: cancelJoin.profiles?.nickname ?? '알 수 없음',
      birthYear: cancelJoin.profiles?.birth_year,
      job: cancelJoin.profiles?.job,
      company: cancelJoin.profiles?.company_name,
      eventTitle: cancelJoin.events?.title,
      eventDate: cancelJoin.events?.event_date,
    }).catch(() => {});

    // 취소 당사자 안내 SMS
    try {
      const phone = cancelJoin.profiles?.phone;
      const displayName = cancelJoin.profiles?.nickname;
      if (phone && displayName && eventDate && cancelRefund) {
        const { content, enabled } = await getTemplateConfig(svc, 'application_cancelled');
        if (enabled) {
          const text = substituteVars(content, {
            name: displayName,
            refund_text: refundNoticeText(cancelRefund),
            ...buildEventVars({ event_date: eventDate }),
          });
          await sendSMS([phone], text);
        }
      }
    } catch (smsErr) {
      console.error('[취소 SMS error — admin cancel]', smsErr);
    }

    // 대기자 SMS
    try {
      if (gender && eventId) {
        const { data: waitlistEntries } = await svc
          .from('waitlist')
          .select('id, profiles ( phone )')
          .eq('event_id', eventId)
          .eq('gender', gender)
          .eq('status', '대기중') as {
            data: { id: string; profiles: { phone: string | null } | null }[] | null;
          };

        if (waitlistEntries && waitlistEntries.length > 0) {
          const phones = waitlistEntries
            .map((e: { id: string; profiles: { phone: string | null } | null }) => e.profiles?.phone)
            .filter((p: string | null | undefined): p is string => !!p);

          if (phones.length > 0) {
            const applyUrl = buildPublicUrl('/rotation/apply', { eventId });
            await sendSMS(
              phones,
              `[cana] ${eventTitle} 빈자리가 생겼어요! 지금 신청 후 결제하시면 자리를 확보할 수 있어요.\n${applyUrl}`,
            );
          }

          await svc
            .from('waitlist')
            .update({ status: '연락됨', notified_at: new Date().toISOString() })
            .in('id', waitlistEntries.map((e: { id: string }) => e.id));
        }
      }
    } catch (smsErr) {
      console.error('[waitlist SMS error — admin cancel]', smsErr);
    }
  }

  // ── 확정 / 반려 SMS ───────────────────────────────────────────────────────
  if (body.status === '확정' || body.status === '반려') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supa = serviceClient as any;
      const { data: appData } = await supa
        .from('applications')
        .select('profiles ( nickname, phone ), events ( event_date )')
        .eq('id', body.id)
        .single() as {
          data: {
            profiles: { nickname: string; phone: string | null } | null;
            events:   { event_date: string } | null;
          } | null;
        };

      const phone       = appData?.profiles?.phone;
      const displayName = appData?.profiles?.nickname;
      const eventDate   = appData?.events?.event_date;

      if (phone && displayName && eventDate) {
        const tmplKey = body.status === '확정' ? 'attendance_confirmed' : 'attendance_rejected';
        const { content, enabled } = await getTemplateConfig(supa, tmplKey);
        if (enabled) {
          const text = substituteVars(content, { name: displayName, ...buildEventVars({ event_date: eventDate }) });
          await sendSMS([phone], text);
        }
      }
    } catch (smsErr) {
      console.error('[확정/반려 SMS error]', smsErr);
    }
  }

  return NextResponse.json({ ok: true });
}
