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

// POST — 수동 발송
// body: { eventId, recipients: 'confirmed' | 'all_active', extraVars?: Record<string,string> }
export async function POST(
  req: NextRequest,
  { params }: { params: { key: string } },
) {
  try {
    await requireAdmin();

    const body = await req.json() as {
      eventId: string;
      recipients: 'confirmed' | 'all_active';
      genderFilter?: 'all' | 'male' | 'female';
      extraVars?: Record<string, string>;
    };

    const { eventId, recipients = 'confirmed', genderFilter = 'all', extraVars = {} } = body;
    if (!eventId) return NextResponse.json({ error: 'eventId가 필요합니다.' }, { status: 400 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supa = createServiceClient() as any;

    // ── 템플릿 content 조회 (DB → 기본값 fallback) ─────────────────────────
    const { data: tmplRow } = await supa
      .from('sms_templates').select('content').eq('key', params.key).maybeSingle() as
      { data: { content: string } | null };

    const defaultContent = DEFAULT_TEMPLATES.find((t) => t.key === params.key)?.content ?? '';
    const content = tmplRow?.content ?? defaultContent;
    if (!content) return NextResponse.json({ error: '템플릿을 찾을 수 없어요.' }, { status: 404 });

    // ── 이벤트 정보 조회 ─────────────────────────────────────────────────────
    const { data: event } = await supa
      .from('events')
      .select('event_date, location, venue_name, venue_url, venue_detail')
      .eq('id', eventId)
      .single() as {
        data: {
          event_date: string;
          location: string | null;
          venue_name: string | null;
          venue_url: string | null;
          venue_detail: string | null;
        } | null;
      };

    if (!event) return NextResponse.json({ error: '이벤트를 찾을 수 없어요.' }, { status: 404 });

    // ── 수신자 조회 ──────────────────────────────────────────────────────────
    const statusFilter = recipients === 'confirmed'
      ? ['확정']
      : ['검토중', '대기', '확정'];

    let appsQuery = supa
      .from('applications')
      .select('profiles!inner ( nickname, phone, gender )')
      .eq('event_id', eventId)
      .in('status', statusFilter);

    if (genderFilter === 'male' || genderFilter === 'female') {
      appsQuery = appsQuery.eq('profiles.gender', genderFilter);
    }

    const { data: apps } = await appsQuery as {
      data: { profiles: { nickname: string; phone: string | null; gender: string } | null }[] | null;
    };

    const eventVars = buildEventVars(event);

    const messages = (apps ?? [])
      .filter((a) => !!a.profiles?.phone)
      .map((a) => {
        const displayName = a.profiles!.nickname;
        return {
          phone: a.profiles!.phone!,
          text:  substituteVars(content, { name: displayName, ...eventVars, ...extraVars }),
        };
      });

    if (messages.length === 0) {
      return NextResponse.json({ error: '발송 대상 중 연락처가 등록된 분이 없어요.' }, { status: 400 });
    }

    await sendPersonalizedSMS(messages);

    return NextResponse.json({ ok: true, sent: messages.length });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
