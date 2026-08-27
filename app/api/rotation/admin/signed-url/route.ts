import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/server';

const BUCKET = 'profile-photos';

export async function GET(req: NextRequest) {
  // 관리자 인증 확인
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });

  const url = req.nextUrl.searchParams.get('url');
  if (!url) return NextResponse.json({ error: 'url 파라미터가 필요합니다.' }, { status: 400 });

  // 버킷 내 파일 경로 추출 (public URL에서 파일명만 꺼냄)
  const pathMatch = url.match(/profile-photos\/(.+)$/);
  if (!pathMatch) return NextResponse.json({ error: '잘못된 URL입니다.' }, { status: 400 });
  const filePath = pathMatch[1];

  // Signed URL 발급 (1시간)
  const serviceClient = createServiceClient();
  const { data, error } = await serviceClient.storage
    .from(BUCKET)
    .createSignedUrl(filePath, 3600);

  if (error || !data) return NextResponse.json({ error: error?.message }, { status: 500 });

  return NextResponse.json({ signedUrl: data.signedUrl });
}
