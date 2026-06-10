'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function Nav() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogoutConfirm = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setShowLogoutModal(false);
    router.refresh();
  };

  return (
    <>
      <header
        className={[
          'fixed inset-x-0 top-0 z-50 px-5 transition-all duration-300',
          scrolled
            ? 'bg-white/90 shadow-sm shadow-cana-rule/60 backdrop-blur-md'
            : 'bg-transparent',
        ].join(' ')}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between py-4">

          {/* 좌측 — 로고 + 네비 */}
          <div className="flex items-center gap-6">
            <Link href="/rotation">
              <img src="/logos/logo_black.svg" alt="cana" className="h-[14px]" />
            </Link>
            <nav className="hidden items-center gap-6 sm:flex">
              <Link href="/rotation/events" className="text-base font-medium text-cana-ink3 transition hover:text-cana-ink">
                소개팅 일정
              </Link>
              <Link href="/rotation/faq" className="text-base font-medium text-cana-ink3 transition hover:text-cana-ink">
                자주 묻는 질문
              </Link>
            </nav>
          </div>

          {/* 우측 — 인증 상태 + 신청 */}
          <div className="flex items-center gap-4">
            {userEmail ? (
              <>
                <Link
                  href="/rotation/my"
                  className="text-base font-medium text-cana-ink3 transition hover:text-cana-ink"
                >
                  마이페이지
                </Link>
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(true)}
                  className="text-base font-medium text-cana-ink3 transition hover:text-cana-ink"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <Link
                href="/rotation/login?redirectTo=/"
                className="text-base font-medium text-cana-ink3 transition hover:text-cana-ink"
              >
                로그인
              </Link>
            )}
            <Link
              href="/rotation/apply"
              className="rounded-xl bg-cana px-5 py-2 text-xs font-semibold text-white transition hover:bg-cana-dark active:scale-95"
            >
              신청하기
            </Link>
          </div>

        </div>
      </header>

      {/* 로그아웃 확인 모달 */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-6"
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="w-full max-w-xs rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-1 text-base font-semibold text-cana-ink">로그아웃</p>
            <p className="mb-5 text-sm text-cana-ink3">정말 로그아웃 하시겠어요?</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 rounded-xl border border-cana-rule py-2.5 text-sm text-cana-ink3 transition hover:bg-cana-warm"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleLogoutConfirm}
                className="flex-1 rounded-xl bg-cana py-2.5 text-sm font-medium text-white transition hover:bg-cana-dark"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
