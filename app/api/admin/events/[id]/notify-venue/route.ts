import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { sendPersonalizedSMS } from '@/lib/sms';
import { substituteVars, buildEventVars, DEFAULT_TEMPLATES } from '@/lib/sms-templates';

async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('인증이 필요합니다.');
  return user;
}

// POST — 장소 확정 LMS 발송 (확정 참여자 전원)
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await requireAdmin();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supa = createServiceClient() as any;

    // 이벤트 정보 조회
    const { data: event, error: evtErr } = await supa
      .from('events')
      .select('event_date, location, venue_name, venue_url, venue_detail')
      .eq('id', params.id)
      .single() as {
        data: {
          event_date: string;
          location: string | null;
          venue_name: string | null;
          venue_url: string | null;
          venue_detail: string | null;
        } | null;
        error: { message: string } | null;
      };

    if (evtErr || !event) throw new Error('이벤트를 찾을 수 없어요.');
    if (!event.venue_name) {
      return NextResponse.json({ error: '장소명을 먼저 입력해 주세요.' }, { status: 400 });
    }

    // 확정 참여자 조회
    const { data: confirmedApps } = await supa
      .from('applications')
      .select('profiles ( name, nickname, phone )')
      .eq('event_id', params.id)
      .eq('status', '확정') as {
        data: { profiles: { name: string | null; nickname: string; phone: string | null } | null }[] | null;
      };

    // 템플릿 조회 (DB 우선 → 기본값 fallback)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: tmplRow } = await (supa as any)
      .from('sms_templates').select('content').eq('key', 'venue_confirmed').maybeSingle() as
      { data: { content: string } | null };
    const content = tmplRow?.content
      ?? DEFAULT_TEMPLATES.find((t) => t.key === 'venue_confirmed')?.content ?? '';

    const eventVars = buildEventVars(event);

    const messages = (confirmedApps ?? [])
      .filter((a) => !!a.profiles?.phone)
      .map((a) => {
        const displayName = a.profiles!.name ?? a.profiles!.nickname;
        return {
          phone: a.profiles!.phone!,
          text:  substituteVars(content, { name: displayName, ...eventVars }),
        };
      });

    if (messages.length === 0) {
      return NextResponse.json({ error: '확정된 참여자 중 연락처가 등록된 분이 없어요.' }, { status: 400 });
    }

    await sendPersonalizedSMS(messages);

    return NextResponse.json({ ok: true, sent: messages.length });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
