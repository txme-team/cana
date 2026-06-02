import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

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

  // ── /admin 보호 ─────────────────────────────────────────────────────────────
  const isAdminPath = pathname.startsWith('/admin');
  const isAdminLogin = pathname === '/admin/login';

  if (isAdminPath && !isAdminLogin) {
    // 미인증
    if (!user) {
      const url = new URL('/admin/login', request.url);
      url.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(url);
    }
    // app_metadata.role === 'admin' 인 계정만 허용
    // (일반 회원은 절대 이 값을 가질 수 없음 — 서비스 롤 키로만 설정 가능)
    const isAdmin = user.app_metadata?.role === 'admin';
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // ── /apply 보호 ─────────────────────────────────────────────────────────────
  const isApplyPath = pathname.startsWith('/apply');
  const isApplyComplete = pathname === '/apply/complete';

  if (isApplyPath && !isApplyComplete && !user) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/apply/:path*', '/apply'],
};
