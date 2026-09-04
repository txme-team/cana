import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;
  // ── /rotation/admin 보호 ────────────────────────────────────────────────────
  const isAdminPath = pathname.startsWith('/rotation/admin');
  const isAdminLogin = pathname === '/rotation/admin/login';

  if (isAdminPath && !isAdminLogin) {
    // 미인증
    if (!user) {
      const url = new URL('/rotation/admin/login', request.url);
      url.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(url);
    }
    // app_metadata.role === 'admin' 인 계정만 허용
    // (일반 회원은 절대 이 값을 가질 수 없음 — 서비스 롤 키로만 설정 가능)
    const isAdmin = user.app_metadata?.role === 'admin';
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/rotation', request.url));
    }

    // 인증/권한 확인이 끝난 사용자 정보를 요청 헤더로 전달 →
    // 이후 layout/page에서 auth.getUser()를 다시 호출(중복 네트워크 요청)하지 않아도 됨
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-admin-email', user.email ?? '');
    const newResponse = NextResponse.next({ request: { headers: requestHeaders } });
    response.cookies.getAll().forEach((cookie) => newResponse.cookies.set(cookie));
    response = newResponse;
  }

  // ── /rotation/apply 보호 ────────────────────────────────────────────────────
  const isApplyPath = pathname.startsWith('/rotation/apply');
  const isApplyComplete = pathname === '/rotation/apply/complete';

  if (isApplyPath && !isApplyComplete && !user) {
    const url = new URL('/rotation/login', request.url);
    url.searchParams.set('redirectTo', pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/rotation/admin/:path*', '/rotation/apply/:path*', '/rotation/apply'],
};
