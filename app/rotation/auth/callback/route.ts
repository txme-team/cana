import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // 로그인 페이지에서 쿠키로 전달한 목적지를 우선 사용하고(쿼리스트링이 OAuth
  // 리다이렉트 허용 목록과 어긋나 사라지는 경우를 대비), 없으면 쿼리의 next,
  // 둘 다 없으면 신청 페이지로 보낸다.
  const cookieNext = request.cookies.get('cana_post_login_redirect')?.value;
  const next = cookieNext || searchParams.get('next') || '/rotation/apply';

  if (code) {
    // We need a mutable response; create a temporary redirect target first.
    const response = NextResponse.redirect(`${origin}${next}`);
    // 1회용 쿠키 — 사용 후 즉시 제거
    response.cookies.delete('cana_post_login_redirect');

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && sessionData.user) {
      const userId = sessionData.user.id;

      // Check if user already has a profile
      try {
        const serviceClient = createServiceClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profile } = await (serviceClient as any)
          .from('profiles')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle() as { data: { id: string } | null };

        if (!profile) {
          // No profile yet — start onboarding flow (원래 목적지를 next로 전달해
          // 온보딩/프로필 작성 완료 후 그 페이지로 돌아갈 수 있도록 한다)
          const onboardUrl = new URL(`${origin}/rotation/onboard`);
          onboardUrl.searchParams.set('next', next);
          const nudgeResponse = NextResponse.redirect(onboardUrl);
          // Copy session cookies to the new response
          response.cookies.getAll().forEach(({ name, value, ...opts }) => {
            nudgeResponse.cookies.set(name, value, opts);
          });
          nudgeResponse.cookies.delete('cana_post_login_redirect');
          return nudgeResponse;
        }
      } catch {
        // On error, fall through to default redirect
      }

      return response;
    }
  }

  return NextResponse.redirect(`${origin}/rotation/login?error=auth_failed`);
}
