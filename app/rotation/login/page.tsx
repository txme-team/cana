'use client';

import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Suspense } from 'react';

function LoginContent() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') ?? '/rotation/apply';
  const error = searchParams.get('error');

  const handleGoogleLogin = async () => {
    const supabase = createClient();

    // OAuth 리다이렉트 URL에 쿼리스트링(?next=...)이 붙으면 Supabase의
    // Redirect URL 허용 목록과 정확히 일치하지 않아 인증 후 기본 Site URL
    // (랜딩페이지)로 떨어지는 경우가 있다. 그래서 목적지는 쿠키로 별도 전달하고,
    // OAuth 콜백 URL 자체는 쿼리 없이 고정해둔다.
    document.cookie = `cana_post_login_redirect=${encodeURIComponent(redirectTo)}; path=/; max-age=600; SameSite=Lax`;

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/rotation/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cana-cream px-8">
      <div className="w-full max-w-sm">
        {/* 타이틀 */}
        <div className="mb-8 text-center">
          <p className="text-[28px] font-semibold text-cana-ink">카나 로그인</p>
          <p className="mt-1.5 text-[16px] text-cana-ink3">구글 계정으로 간편하게 시작할 수 있어요</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-500">
            로그인 중 오류가 발생했어요. 다시 시도해주세요.
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-cana-rule bg-white px-4 py-3.5 text-base font-medium text-cana-ink transition hover:bg-cana-cream active:bg-cana-cream"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google로 계속하기
        </button>

        <p className="mt-6 text-center text-[11px] leading-relaxed text-cana-ink3/60">
          로그인 시 cana의{' '}
          <span className="underline">서비스 이용약관</span> 및{' '}
          <span className="underline">개인정보처리방침</span>에 동의하는 것으로 간주돼요.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
