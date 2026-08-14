/**
 * POST /api/my-applications/[id]/cancel
 * 본인 신청 취소 + Toss 환불
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { sendSMS } from '@/lib/sms';
import { notifyApplicationCancelled, notifyError } from '@/lib/slack';
import { calcRefund, refundNoticeText } from '@/lib/refund-policy';
import { substituteVars, buildEventVars, getTemplateConfig } from '@/lib/sms-templates';

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

    // 신청 조회 (본인 소유인지 확인) — 환불 계산에 필요한 정보를 한 번에 조회
    const { data: application } = await supa
      .from('applications')
      .select(`
        id, status, payment_key, amount, event_id,
        profiles ( phone, gender, nickname, birth_year, job, company_name ),
        events ( title, event_date )
      `)
      .eq('id', params.id)
      .eq('profile_id', profile.id)
      .maybeSingle() as {
        data: {
          id: string;
          status: string;
          payment_key: string | null;
          amount: number | null;
          event_id: string;
          profiles: { phone: string | null; gender: string; nickname: string; birth_year: number | null; job: string | null; company_name: string | null } | null;
          events: { title: string; event_date: string } | null;
        } | null;
      };

    if (!application) {
      return NextResponse.json({ error: '신청 내역을 찾을 수 없어요.' }, { status: 404 });
    }

    if (!CANCELLABLE_STATUSES.includes(application.status)) {
      return NextResponse.json({ error: '현재 상태에서는 취소할 수 없어요.' }, { status: 400 });
    }

    // 날짜 기반 환불 정책 계산
    const eventDate = application.events?.event_date;
    const refund = calcRefund(application.amount, eventDate);

    // Toss 환불 (결제됐고, 환불 대상 금액이 있을 때만)
    if (application.payment_key && refund.rate > 0) {
      const secretKey = process.env.TOSS_SECRET_KEY!;
      const token = Buffer.from(`${secretKey}:`).toString('base64');

      const cancelBody: { cancelReason: string; cancelAmount?: number } = {
        cancelReason: '고객 요청 취소',
      };
      if (refund.rate < 1) cancelBody.cancelAmount = refund.amount;

      const refundRes = await fetch(
        `https://api.tosspayments.com/v1/payments/${application.payment_key}/cancel`,
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

    const cancelledApp = application;

    // 슬랙 알림 — 신청 취소
    await notifyApplicationCancelled({
      nickname: cancelledApp?.profiles?.nickname ?? '알 수 없음',
      birthYear: cancelledApp?.profiles?.birth_year,
      job: cancelledApp?.profiles?.job,
      company: cancelledApp?.profiles?.company_name,
      eventTitle: cancelledApp?.events?.title,
      eventDate: cancelledApp?.events?.event_date,
    }).catch(() => {});

    // 본인 취소 안내 SMS
    try {
      const phone = cancelledApp?.profiles?.phone;
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
    } catch (smsErr) {
      console.error('[취소 SMS error — user cancel]', smsErr);
    }

    // waitlist SMS 트리거 (취소로 빈자리 발생 시)
    try {
      const gender = cancelledApp?.profiles?.gender;
      const eventId = cancelledApp?.event_id;
      const eventTitle = cancelledApp?.events?.title ?? '이벤트';

      if (gender && eventId) {
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

          await supa
            .from('waitlist')
            .update({ status: '연락됨', notified_at: new Date().toISOString() })
            .in('id', waitlistEntries.map((e) => e.id));
        }
      }
    } catch (smsErr) {
      console.error('[waitlist SMS error — user cancel]', smsErr);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : '서버 오류가 발생했어요.';
    await notifyError(message, 'POST /api/my-applications/[id]/cancel').catch(() => {});
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
