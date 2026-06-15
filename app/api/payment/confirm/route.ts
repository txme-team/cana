import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { notifyPaymentComplete, notifyError } from '@/lib/slack';
import { sendSMS } from '@/lib/sms';
import { substituteVars, buildEventVars, getTemplateConfig } from '@/lib/sms-templates';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      paymentKey: string;
      orderId: string;
      amount: number;
      eventId: string;
      agreePrivacy: boolean;
      agreeAttendance: boolean;
      agreeProfileShare?: boolean;
      agreeInstagram?: boolean;
    };
    const { paymentKey, orderId, amount, eventId,
            agreePrivacy, agreeAttendance, agreeProfileShare, agreeInstagram } = body;

    if (!paymentKey || !orderId || typeof amount !== 'number' || !eventId) {
      return NextResponse.json({ error: '필수 파라미터가 누락됐어요.' }, { status: 400 });
    }

    // ── 로그인 확인 ──────────────────────────────────────────────────────────
    const authClient = createClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const supabase = createServiceClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supa = supabase as any;

    // ── 금액 검증 (이벤트별 참가비, 없으면 기본값) ────────────────────────────
    const { data: priceEvent } = await supa
      .from('events').select('price').eq('id', eventId).maybeSingle() as
      { data: { price: number | null } | null };

    const expectedAmount = priceEvent?.price ?? parseInt(process.env.NEXT_PUBLIC_TOSS_AMOUNT ?? '39000', 10);
    if (amount !== expectedAmount) {
      return NextResponse.json({ error: '결제 금액이 올바르지 않아요.' }, { status: 400 });
    }

    // ── 프로필 조회 ──────────────────────────────────────────────────────────
    const { data: profile, error: profileLookupError } = await supa
      .from('profiles').select('id, nickname, phone')
      .eq('user_id', user.id).maybeSingle() as
      { data: { id: string; nickname: string; phone: string | null } | null; error: { message: string } | null };

    if (!profile) {
      console.error('[payment/confirm] profile not found for user_id=', user.id, 'error:', profileLookupError);
      return NextResponse.json({ error: '프로필을 먼저 작성해주세요.' }, { status: 400 });
    }

    // ── Toss 결제 승인 ────────────────────────────────────────────────────────
    const secretKey = process.env.TOSS_SECRET_KEY!;
    const token = Buffer.from(`${secretKey}:`).toString('base64');

    const tossRes = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: { Authorization: `Basic ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentKey, orderId, amount }),
      cache: 'no-store',
    });

    if (!tossRes.ok) {
      const tossErr = await tossRes.json().catch(() => ({})) as { message?: string; code?: string };
      return NextResponse.json(
        { error: tossErr.message ?? '결제 승인에 실패했어요.', code: tossErr.code },
        { status: 400 }
      );
    }

    // Toss 응답에서 결제 상세 정보 추출
    const tossPayment = await tossRes.json().catch(() => ({})) as {
      approvedAt?: string;
      method?: string;
      totalAmount?: number;
    };

    // ── 중복 신청 최종 검사 ───────────────────────────────────────────────────
    const { data: existing } = await supa
      .from('applications').select('id, status')
      .eq('profile_id', profile.id).eq('event_id', eventId).maybeSingle() as
      { data: { id: string; status: string } | null };

    if (existing && existing.status !== '취소') {
      // 결제는 됐지만 중복 — 운영팀에 알림 후 완료 처리
      await notifyError(
        `중복 결제 발생 — profile: ${profile.id}, event: ${eventId}, orderId: ${orderId}`,
        'POST /api/payment/confirm'
      ).catch(() => {});
      // 이미 검토중·확정인 경우 → 완료 페이지로 보내되 추가 레코드는 생성하지 않음
      return NextResponse.json({ ok: true });
    }

    // ── 신청 레코드 생성 (또는 취소 → 검토중으로 업데이트) ─────────────────────
    let applicationId: string;

    const paymentFields = {
      order_id:    orderId,
      payment_key: paymentKey,
      paid_at:     tossPayment.approvedAt ?? new Date().toISOString(),
      amount:      tossPayment.totalAmount ?? amount,
      pay_method:  tossPayment.method ?? null,
    };

    if (existing && existing.status === '취소') {
      // 취소 후 재신청 — UNIQUE 제약으로 insert 불가, 기존 행 업데이트
      await supa.from('applications').update({ status: '검토중', ...paymentFields }).eq('id', existing.id);
      applicationId = existing.id;
    } else {
      const { data: application, error: appError } = await supa
        .from('applications')
        .insert({ profile_id: profile.id, event_id: eventId, status: '검토중', ...paymentFields })
        .select('id').single() as { data: { id: string } | null; error: { message: string } | null };

      if (appError) throw new Error(`신청 저장 실패: ${appError.message}`);
      applicationId = application!.id;
    }

    // ── 약관 동의 저장 ────────────────────────────────────────────────────────
    await supa.from('profiles').update({
      agree_privacy:       agreePrivacy ?? false,
      agree_attendance:    agreeAttendance ?? false,
      agree_profile_share: agreeProfileShare ?? false,
      agree_instagram:     agreeInstagram ?? false,
    }).eq('id', profile.id);

    // ── 약관 동의 저장 ────────────────────────────────────────────────────────
    // (이미 위에서 처리됨)

    // ── waitlist '연락됨' 복원 ────────────────────────────────────────────────
    // 이 결제로 해당 성별 자리가 찼으면 '연락됨' 대기자들을 다시 '대기중'으로
    try {
      const { data: pProfile } = await supa
        .from('profiles').select('gender').eq('id', profile.id).maybeSingle() as
        { data: { gender: string | null } | null };

      const { count: activeCount } = await supa
        .from('applications')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .in('status', ['검토중', '대기', '확정']) as { count: number | null };

      const { data: eventData } = await supa
        .from('events').select('capacity').eq('id', eventId).maybeSingle() as
        { data: { capacity: number } | null };

      if (pProfile?.gender && eventData && (activeCount ?? 0) >= eventData.capacity) {
        // 자리가 다 찼으므로 같은 성별 '연락됨' → 다시 '대기중'으로 복원
        await supa
          .from('waitlist')
          .update({ status: '대기중', notified_at: null })
          .eq('event_id', eventId)
          .eq('gender', pProfile.gender)
          .eq('status', '연락됨');
      }
    } catch (waitErr) {
      console.error('[waitlist restore error]', waitErr);
    }

    // ── 신청 완료 SMS ─────────────────────────────────────────────────────────
    try {
      const { data: evtData } = await supa
        .from('events').select('event_date').eq('id', eventId).maybeSingle() as
        { data: { event_date: string } | null };

      if (profile.phone && evtData?.event_date) {
        const displayName = profile.nickname;
        const { content, enabled } = await getTemplateConfig(supa, 'application_complete');
        if (enabled) {
          const text = substituteVars(content, { name: displayName, ...buildEventVars(evtData) });
          await sendSMS([profile.phone], text);
        }
      }
    } catch (smsErr) {
      console.error('[신청완료 SMS error]', smsErr);
    }

    // ── 슬랙 알림 ─────────────────────────────────────────────────────────────
    await notifyPaymentComplete(profile.nickname, applicationId).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : '서버 오류가 발생했어요.';
    await notifyError(message, 'POST /api/payment/confirm').catch(() => {});
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
