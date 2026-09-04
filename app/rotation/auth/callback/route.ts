import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createServiceClient } from '@/lib/supabase/server';

const POST_LOGIN_REDIRECT_COOKIE = 'cana_post_login_redirect';
const DEFAULT_POST_LOGIN_REDIRECT = '/rotation/apply';

function getSafePostLoginRedirect(rawValue: string | undefined, origin: string) {
  if (!rawValue) return DEFAULT_POST_LOGIN_REDIRECT;

  try {
    // NextRequest.cookies already decodes the cookie value once. Decoding it
    // again would alter legitimate encoded query-string values.
    const destination = new URL(rawValue, origin);
    const isRotationPath =
      destination.pathname === '/rotation' ||
      destination.pathname.startsWith('/rotation/');

    if (destination.origin !== origin || !isRotationPath) {
      return DEFAULT_POST_LOGIN_REDIRECT;
    }

    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return DEFAULT_POST_LOGIN_REDIRECT;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // Supabase에는 허용 목록과 정확히 일치하는 고정 콜백 URL만 전달한다.
  // 실제 목적지는 짧게 유지되는 쿠키에서 읽고 /rotation 내부로 제한한다.
  const cookieNext = request.cookies.get(POST_LOGIN_REDIRECT_COOKIE)?.value;
  const next = getSafePostLoginRedirect(cookieNext, origin);

  if (code) {
    // We need a mutable response; create a temporary redirect target first.
    const response = NextResponse.redirect(`${origin}${next}`);
    // 1회용 쿠키 — 사용 후 즉시 제거
    response.cookies.delete(POST_LOGIN_REDIRECT_COOKIE);

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
          nudgeResponse.cookies.delete(POST_LOGIN_REDIRECT_COOKIE);
          return nudgeResponse;
        }
      } catch {
        // On error, fall through to default redirect
      }

      return response;
    }
  }

  const failureResponse = NextResponse.redirect(`${origin}/rotation/login?error=auth_failed`);
  failureResponse.cookies.delete(POST_LOGIN_REDIRECT_COOKIE);
  return failureResponse;
}
