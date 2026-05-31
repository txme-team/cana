import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { notifyNewProfile, notifyError } from '@/lib/slack';

const BUCKET = 'profile-photos';
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

async function ensureBucket(supabase: ReturnType<typeof createServiceClient>) {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === BUCKET);
  if (!exists) {
    await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: MAX_BYTES,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'],
    });
  }
}

async function uploadFile(
  supabase: ReturnType<typeof createServiceClient>,
  file: File,
  prefix = ''
): Promise<string> {
  if (file.size > MAX_BYTES) throw new Error('파일 크기는 5MB 이하여야 합니다.');
  const ext = file.name.split('.').pop() ?? 'jpg';
  const fileName = `${prefix}${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(`파일 업로드 실패: ${error.message}`);
  return supabase.storage.from(BUCKET).getPublicUrl(fileName).data.publicUrl;
}

// ── GET: return current user's profile (null if not exists) ──────────────────

export async function GET() {
  try {
    const authClient = createClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const supabase = createServiceClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile, error } = await (supabase as any)
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle() as { data: Record<string, unknown> | null; error: { message: string } | null };

    if (error) throw new Error(error.message);

    return NextResponse.json(profile ?? null);
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ── POST: upsert profile (no event/application creation) ─────────────────────

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const rawData = formData.get('data');
    if (!rawData || typeof rawData !== 'string') {
      return NextResponse.json({ error: '데이터가 없습니다.' }, { status: 400 });
    }

    const data = JSON.parse(rawData);

    const authClient = createClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }
    const userId = user.id;

    const required = [
      'name', 'birthYear', 'mbti', 'heightCm', 'education',
      'workplaceCity', 'workplaceDistrict', 'residenceCity', 'residenceDistrict',
      'livingWith', 'job', 'drinking', 'smoking', 'hobbies', 'personality',
      'contactFrequency', 'dateFrequency', 'oppositeFriend', 'marriageView',
      'conflictStyle', 'restDay', 'pet', 'dateStyle',
      'denomination', 'faithYears', 'churchName', 'churchCity', 'churchDistrict',
      'faithLevel', 'faithStyle', 'sundayAttendance', 'ministry',
      'phone',
    ];
    for (const key of required) {
      if (data[key] === undefined || data[key] === null || data[key] === '') {
        return NextResponse.json({ error: `${key} 필드가 없습니다.` }, { status: 400 });
      }
    }

    // 자기소개 필수 3개 (최소 30자)
    const essayRequired = ['prayerRequest', 'jobDescription', 'relationshipPromise'] as const;
    for (const key of essayRequired) {
      const val = String(data[key] ?? '').trim();
      if (val.length < 30) {
        return NextResponse.json({ error: `${key} 필드는 30자 이상 입력해주세요.` }, { status: 400 });
      }
    }

    const birthYear = parseInt(String(data.birthYear).trim(), 10);
    const supabase = createServiceClient();

    await ensureBucket(supabase);

    // ── 프로필 사진 업로드 ──────────────────────────────────────────────────────
    let photoUrl: string | null = null;
    const photo = formData.get('photo');
    if (photo instanceof File) photoUrl = await uploadFile(supabase, photo, 'photo-');

    // ── 직장 인증 업로드 ────────────────────────────────────────────────────────
    let workplaceVerificationUrl: string | null = null;
    const wpFile = formData.get('workplaceVerification');
    if (wpFile instanceof File) workplaceVerificationUrl = await uploadFile(supabase, wpFile, 'wp-');

    // ── 교인 인증 업로드 ────────────────────────────────────────────────────────
    let churchVerificationUrl: string | null = null;
    const churchFile = formData.get('churchVerification');
    if (churchFile instanceof File) churchVerificationUrl = await uploadFile(supabase, churchFile, 'church-');

    // ── profiles upsert (user_id 기준) ─────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile, error: profileError } = await (supabase as any)
      .from('profiles')
      .upsert(
        {
          user_id:             userId,
          nickname:            data.name,
          gender:              data.gender === '남성' ? 'male' : 'female',
          birth_year:          birthYear,
          height:              parseInt(data.heightCm, 10),
          education:           data.education,
          workplace:           `${data.workplaceCity} ${data.workplaceDistrict}`,
          residence:           `${data.residenceCity} ${data.residenceDistrict}`,
          living_with:         data.livingWith === '가족과' ? 'family' : data.livingWith === '혼자' ? 'alone' : 'other',
          job:                 data.job,
          company_name:        data.companyName,
          drinking:            data.drinking,
          smoking:             data.smoking,
          hobbies:             data.hobbies,
          personality:         data.personality,
          contact_preference:  data.contactFrequency,
          date_frequency:      data.dateFrequency,
          opposite_friends:    data.oppositeFriend,
          marriage_view:       data.marriageView,
          conflict_resolution: data.conflictStyle,
          day_off_style:       data.restDay,
          pet:                 data.pet,
          date_style:          data.dateStyle,
          church_denomination: data.denomination,
          faith_years:         parseInt(data.faithYears, 10),
          church_location:     `${data.churchCity} ${data.churchDistrict}`,
          faith_style:         data.faithStyle,
          worship_frequency:   data.sundayAttendance,
          ministry:            data.ministry,
          church_name:         data.churchName,
          faith_level:         data.faithLevel,
          mbti:                String(data.mbti).toUpperCase(),
          ...(photoUrl !== null && { photo_urls: [photoUrl] }),
          ...(workplaceVerificationUrl !== null && { job_cert_url: workplaceVerificationUrl }),
          ...(churchVerificationUrl !== null && { bulletin_url: churchVerificationUrl }),
          phone:               data.phone,
          profile_essays: {
            prayerRequest:       data.prayerRequest       ?? '',
            bibleVerse:          data.bibleVerse          ?? '',
            ministryNote:        data.ministryNote        ?? '',
            faithGrowthMoment:   data.faithGrowthMoment   ?? '',
            answeredPrayer:      data.answeredPrayer       ?? '',
            communityRole:       data.communityRole        ?? '',
            jobDescription:      data.jobDescription       ?? '',
            careerGoal:          data.careerGoal           ?? '',
            coworkerOpinion:     data.coworkerOpinion      ?? '',
            careerMotivation:    data.careerMotivation     ?? '',
            relationshipPromise: data.relationshipPromise  ?? '',
            partnerStyle:        data.partnerStyle         ?? '',
            feelingLoved:        data.feelingLoved         ?? '',
            humorStyle:          data.humorStyle           ?? '',
            weekendStyle:        data.weekendStyle         ?? '',
            spendingHabit:       data.spendingHabit        ?? '',
            conflictApproach:    data.conflictApproach     ?? '',
          },
        },
        { onConflict: 'user_id' }
      )
      .select('id, nickname')
      .single() as { data: { id: string; nickname: string } | null; error: { message: string } | null };

    if (profileError) throw new Error(`프로필 저장 실패: ${profileError.message}`);

    await notifyNewProfile(profile!.nickname, profile!.id);

    return NextResponse.json({ id: profile!.id }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류';
    await notifyError(message, 'POST /api/profile').catch(() => {});
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
