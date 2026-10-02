import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { isValidVoteNo, type VoteGender } from '@/lib/first-impression';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// POST — 첫인상 투표 제출 (로그인 불필요, 같은 성별·번호로 다시 보내면 덮어씀)
// body: { eventId, gender: 'male'|'female', voterNo, targetNo: number|null (null = 기권) }
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as {
    eventId?: string;
    gender?: string;
    voterNo?: unknown;
    targetNo?: unknown;
  } | null;

  if (!body?.eventId || !UUID_RE.test(body.eventId)) {
    return NextResponse.json({ error: '잘못된 링크예요.' }, { status: 400 });
  }
  if (body.gender !== 'male' && body.gender !== 'female') {
    return NextResponse.json({ error: '성별을 선택해주세요.' }, { status: 400 });
  }
  if (!isValidVoteNo(body.voterNo)) {
    return NextResponse.json({ error: '내 번호를 1~99 사이 숫자로 입력해주세요.' }, { status: 400 });
  }
  const abstain = body.targetNo === null;
  if (!abstain && !isValidVoteNo(body.targetNo)) {
    return NextResponse.json({ error: '상대 번호를 1~99 사이 숫자로 입력하거나 기권을 선택해주세요.' }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supa = createServiceClient() as any;

  const { data: event } = await supa
    .from('events').select('id').eq('id', body.eventId).maybeSingle() as { data: { id: string } | null };
  if (!event) {
    return NextResponse.json({ error: '존재하지 않는 행사예요.' }, { status: 404 });
  }

  const { error } = await supa
    .from('first_impression_votes')
    .upsert(
      {
        event_id: body.eventId,
        voter_gender: body.gender as VoteGender,
        voter_no: body.voterNo,
        target_no: abstain ? null : body.targetNo,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'event_id,voter_gender,voter_no' },
    );

  if (error) {
    console.error('[vote upsert error]', error.message);
    return NextResponse.json({ error: '투표 저장에 실패했어요. 잠시 후 다시 시도해주세요.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
