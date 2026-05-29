import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import type { ProfileStatus } from '@/lib/types';

const VALID_STATUSES: ProfileStatus[] = ['검토중', '대기', '확정', '반려', '취소'];

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

  // DB 업데이트 (service role — RLS 우회)
  const serviceClient = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (serviceClient as any)
    .from('applications')
    .update({ status: body.status })
    .eq('id', body.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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

  return NextResponse.json({ ok: true });
}
