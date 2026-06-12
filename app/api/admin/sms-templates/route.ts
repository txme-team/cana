import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { DEFAULT_TEMPLATES } from '@/lib/sms-templates';

async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('인증이 필요합니다.');
  return user;
}

// GET — 전체 템플릿 목록 (DB 우선, 없으면 기본값 병합)
export async function GET() {
  try {
    await requireAdmin();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supa = createServiceClient() as any;

    const { data, error } = await supa
      .from('sms_templates')
      .select('*')
      .order('key');

    if (error) throw new Error(error.message);

    // DB에 없는 기본 템플릿은 기본값으로 채움
    const dbMap = new Map((data ?? []).map((t: { key: string }) => [t.key, t]));
    const result = DEFAULT_TEMPLATES.map((def) =>
      dbMap.has(def.key) ? dbMap.get(def.key) : { ...def, enabled: true, updated_at: null },
    );

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 401 });
  }
}
