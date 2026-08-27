import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('인증이 필요합니다.');
  return user;
}

// PATCH — 템플릿 content 수정
export async function PATCH(
  req: NextRequest,
  { params }: { params: { key: string } },
) {
  try {
    await requireAdmin();
    const { content, enabled } = await req.json() as { content?: string; enabled?: boolean };

    if (content === undefined && enabled === undefined) {
      return NextResponse.json({ error: 'content 또는 enabled가 필요합니다.' }, { status: 400 });
    }
    if (content !== undefined && (typeof content !== 'string' || !content.trim())) {
      return NextResponse.json({ error: 'content가 필요합니다.' }, { status: 400 });
    }
    if (enabled !== undefined && typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'enabled는 boolean이어야 합니다.' }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supa = createServiceClient() as any;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (content !== undefined) updates.content = content.trim();
    if (enabled !== undefined) updates.enabled = enabled;

    // 템플릿 row는 마이그레이션에서 미리 seed되어 있으므로 항상 존재한다.
    // upsert(ON CONFLICT DO UPDATE)를 쓰면 Postgres가 충돌 해소 전에
    // INSERT될 행 전체에 대해 NOT NULL 제약(name, trigger_type 등)을 검사하는데,
    // 여기서는 content/enabled만 보내기 때문에 "name" NOT NULL 위반 에러가 난다.
    // 기존 행을 그대로 갱신하면 되므로 update로 변경.
    const { data, error } = await supa
      .from('sms_templates')
      .update(updates)
      .eq('key', params.key)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
