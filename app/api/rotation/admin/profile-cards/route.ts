import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { generateShareToken, ensureProfileCardMeta } from '@/lib/profile-card';

// POST /api/rotation/admin/profile-cards
// 이벤트에 남자/여자 프로필카드 공유 토큰을 생성하고, 확정자의 display_no도 일괄 부여한다.
// body: { eventId: string }
export async function POST(req: NextRequest) {
  const authClient = createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });

  const { eventId } = await req.json() as { eventId?: string };
  if (!eventId) return NextResponse.json({ error: 'eventId가 필요합니다.' }, { status: 400 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supa = createServiceClient() as any;

  // 1) 이벤트에 card_token이 없으면 생성
  const { data: event } = await supa
    .from('events')
    .select('card_token_male, card_token_female')
    .eq('id', eventId)
    .maybeSingle() as { data: { card_token_male: string | null; card_token_female: string | null } | null };

  if (!event) return NextResponse.json({ error: '이벤트를 찾을 수 없어요.' }, { status: 404 });

  const updates: Record<string, string> = {};
  if (!event.card_token_male) updates.card_token_male = generateShareToken();
  if (!event.card_token_female) updates.card_token_female = generateShareToken();

  if (Object.keys(updates).length > 0) {
    await supa.from('events').update(updates).eq('id', eventId);
  }

  const tokenMale = updates.card_token_male ?? event.card_token_male!;
  const tokenFemale = updates.card_token_female ?? event.card_token_female!;

  // 2) 확정자 display_no 일괄 부여
  const { data: apps } = await supa
    .from('applications')
    .select('id')
    .eq('event_id', eventId)
    .eq('status', '확정') as { data: { id: string }[] | null };

  for (const app of (apps ?? [])) {
    await ensureProfileCardMeta(supa, app.id);
  }

  return NextResponse.json({
    ok: true,
    card_token_male: tokenMale,
    card_token_female: tokenFemale,
  });
}
