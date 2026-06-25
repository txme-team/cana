import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

const BUCKET = 'profile-photos';
const ALLOWED_FIELDS = ['photo', 'workplaceVerification', 'churchVerification'] as const;

// GET /api/profile/upload-url?field=photo&ext=jpg
// 서버에서 서명된 업로드 URL을 발급해 클라이언트가 Supabase에 직접 업로드할 수 있도록 한다.
// Vercel 서버리스 함수의 4.5MB 요청 본문 한도를 우회하기 위함.
export async function GET(req: NextRequest) {
  const authClient = createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const field = searchParams.get('field') as typeof ALLOWED_FIELDS[number] | null;
  const ext = (searchParams.get('ext') ?? 'jpg').replace(/[^a-z0-9]/gi, '').toLowerCase();

  if (!field || !ALLOWED_FIELDS.includes(field)) {
    return NextResponse.json({ error: '잘못된 field 값이에요.' }, { status: 400 });
  }

  const prefix = field === 'photo' ? 'photo' : field === 'workplaceVerification' ? 'wp' : 'church';
  const path = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const supabase = createServiceClient();

  // 버킷이 없으면 생성
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some((b) => b.name === BUCKET)) {
    await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 10 * 1024 * 1024,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'],
    });
  }

  const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error || !data) {
    return NextResponse.json({ error: '업로드 URL 생성에 실패했어요.' }, { status: 500 });
  }

  const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;

  return NextResponse.json({ signedUrl: data.signedUrl, publicUrl });
}
