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
    const { content } = await req.json() as { content?: string };
    if (typeof content !== 'string' || !content.trim()) {
      return NextResponse.json({ error: 'content가 필요합니다.' }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supa = createServiceClient() as any;

    const { data, error } = await supa
      .from('sms_templates')
      .upsert(
        { key: params.key, content: content.trim(), updated_at: new Date().toISOString() },
        { onConflict: 'key', ignoreDuplicates: false },
      )
      .select()
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
