/**
 * Vercel Cron — SMS 스케줄러 (매시간 정각 실행)
 * vercel.json: { "crons": [{ "path": "/api/cron/sms-scheduler", "schedule": "0 * * * *" }] }
 *
 * 5-1. 프로필 카드 LMS  — 행사 전날 18:00 KST
 * 5-2. 1일 전 안내 SMS   — 행사 전날 19:00 KST
 * 6.   소개팅 종료 SMS   — 행사 종료 1시간 후
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { sendPersonalizedSMS } from '@/lib/sms';
import { substituteVars, buildEventVars, DEFAULT_TEMPLATES } from '@/lib/sms-templates';
import { ensureProfileCardMeta } from '@/lib/profile-card';

function verifyCron(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return true;
  // 헤더 방식
  const headerAuth = (req.headers.get('authorization') ?? '').trim();
  if (headerAuth === `Bearer ${secret}`) return true;
  // 쿼리 파라미터 방식 (?secret=xxx)
  const querySecret = req.nextUrl.searchParams.get('secret')?.trim() ?? '';
  return querySecret === secret;
}

function nowKST(): Date {
  return new Date(Date.now() + 9 * 60 * 60 * 1000);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getTemplate(supa: any, key: string): Promise<string> {
  const { data } = await supa
    .from('sms_templates').select('content').eq('key', key).maybeSingle() as
    { data: { content: string } | null };
  return data?.content ?? DEFAULT_TEMPLATES.find((t) => t.key === key)?.content ?? '';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchConfirmedParticipants(supa: any, eventId: string) {
  const { data } = await supa
    .from('applications')
    .select('profiles ( nickname, phone )')
    .eq('event_id', eventId)
    .eq('status', '확정') as {
      data: { profiles: { nickname: string; phone: string | null } | null }[] | null;
    };
  return (data ?? []).filter((a) => !!a.profiles?.phone);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchConfirmedParticipantsWithToken(supa: any, eventId: string) {
  const { data } = await supa
    .from('applications')
    .select('id, share_token, profiles ( nickname, phone )')
    .eq('event_id', eventId)
    .eq('status', '확정') as {
      data: { id: string; share_token: string | null; profiles: { nickname: string; phone: string | null } | null }[] | null;
    };

  const rows = (data ?? []).filter((a) => !!a.profiles?.phone);

  // share_token이 없는 신청건은 발송 직전 생성 (확정 처리 시 보통 이미 부여돼 있음)
  await Promise.all(
    rows.filter((r) => !r.share_token).map(async (r) => {
      const meta = await ensureProfileCardMeta(supa, r.id);
      r.share_token = meta?.share_token ?? r.share_token;
    })
  );

  return rows;
}

export async function GET(req: NextRequest) {
  if (!verifyCron(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const kst     = nowKST();
  const kstHour = kst.getUTCHours();

  const tomorrowStr = new Date(kst.getTime() + 24 * 60 * 60 * 1000)
    .toISOString().slice(0, 10);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supa    = createServiceClient() as any;
  const results: string[] = [];

  // ── 5-1. 프로필 카드 LMS (전날 18:00 KST) ──────────────────────────────────
  if (kstHour === 18) {
    const content = await getTemplate(supa, 'profile_card');
    const { data: events } = await supa
      .from('events').select('id, title, event_date, venue_name, venue_detail, location, venue_url')
      .gte('event_date', `${tomorrowStr}T00:00:00+09:00`)
      .lt('event_date',  `${tomorrowStr}T23:59:59+09:00`) as {
        data: { id: string; title: string; event_date: string; venue_name?: string | null; venue_detail?: string | null; location?: string | null; venue_url?: string | null }[] | null;
      };

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://cana.im';

    for (const event of events ?? []) {
      const participants = await fetchConfirmedParticipantsWithToken(supa, event.id);
      const eventVars    = buildEventVars(event);
      const messages     = participants
        .filter((a) => !!a.share_token)
        .map((a) => ({
          phone: a.profiles!.phone!,
          text:  substituteVars(content, {
            name: a.profiles!.nickname,
            ...eventVars,
            profile_card_url: `${appUrl}/rotation/profile-card/${a.share_token}`,
          }),
        }));
      if (messages.length > 0) {
        await sendPersonalizedSMS(messages).catch(console.error);
        results.push(`5-1 [${event.title}] ${messages.length}명`);
      }
    }
  }

  // ── 5-2. 1일 전 안내 SMS (전날 19:00 KST) ──────────────────────────────────
  if (kstHour === 19) {
    const content = await getTemplate(supa, 'day_before');
    const { data: events } = await supa
      .from('events').select('id, title, event_date, venue_name, venue_detail, location, venue_url')
      .gte('event_date', `${tomorrowStr}T00:00:00+09:00`)
      .lt('event_date',  `${tomorrowStr}T23:59:59+09:00`) as {
        data: { id: string; title: string; event_date: string; venue_name?: string | null; venue_detail?: string | null; location?: string | null; venue_url?: string | null }[] | null;
      };

    for (const event of events ?? []) {
      const participants = await fetchConfirmedParticipants(supa, event.id);
      const eventVars    = buildEventVars(event);
      const messages     = participants.map((a) => ({
        phone: a.profiles!.phone!,
        text:  substituteVars(content, { name: a.profiles!.nickname, ...eventVars }),
      }));
      if (messages.length > 0) {
        await sendPersonalizedSMS(messages).catch(console.error);
        results.push(`5-2 [${event.title}] ${messages.length}명`);
      }
    }
  }

  // ── 6. 소개팅 종료 SMS (행사 종료 +1h) ────────────────────────────────────
  {
    const content     = await getTemplate(supa, 'event_ended');
    const utcStart    = new Date(Date.now() - (60 + 5) * 60 * 1000).toISOString();
    const utcEnd      = new Date(Date.now() - (60 - 5) * 60 * 1000).toISOString();

    const { data: events } = await supa
      .from('events').select('id, title, event_date, venue_name, venue_detail, location, venue_url')
      .gte('event_date', utcStart)
      .lte('event_date', utcEnd) as {
        data: { id: string; title: string; event_date: string; venue_name?: string | null; venue_detail?: string | null; location?: string | null; venue_url?: string | null }[] | null;
      };

    for (const event of events ?? []) {
      const participants = await fetchConfirmedParticipants(supa, event.id);
      const eventVars    = buildEventVars(event);
      const messages     = participants.map((a) => ({
        phone: a.profiles!.phone!,
        text:  substituteVars(content, { name: a.profiles!.nickname, ...eventVars }),
      }));
      if (messages.length > 0) {
        await sendPersonalizedSMS(messages).catch(console.error);
        results.push(`6 [${event.title}] ${messages.length}명`);
      }
    }
  }

  return NextResponse.json({ ok: true, kstHour, results });
}
