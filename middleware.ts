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
    // 어드민 이메일 화이트리스트 검사
    const adminEmails = (process.env.ADMIN_EMAILS ?? '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const isAdmin = adminEmails.length === 0 || adminEmails.includes((user.email ?? '').toLowerCase());
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
