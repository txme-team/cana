'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function Nav() {
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // 히어로(이미지 배경) 페이지에서만 스크롤 전 흰색 테마 적용
  const isHeroPage = pathname === '/rotation';
  const transparent = isHeroPage && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

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
              <img
                src={transparent ? '/txme-assets/logos/logo_white.svg' : '/txme-assets/logos/logo_black.svg'}
                alt="cana"
                className="h-[14px]"
              />
            </Link>
            <nav className="hidden items-center gap-6 sm:flex">
              <Link
                href="/rotation/events"
                className={[
                  'text-base font-medium transition',
                  transparent ? 'text-white/80 hover:text-white' : 'text-cana-ink3 hover:text-cana-ink',
                ].join(' ')}
              >
                소개팅 일정
              </Link>
              <Link
                href="/rotation/faq"
                className={[
                  'text-base font-medium transition',
                  transparent ? 'text-white/80 hover:text-white' : 'text-cana-ink3 hover:text-cana-ink',
                ].join(' ')}
              >
                자주 묻는 질문
              </Link>
            </nav>
          </div>

          {/* 우측 — 인증 상태 + 신청 */}
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-4 sm:flex">
            {userEmail ? (
              <>
                <Link
                  href="/rotation/my"
                  className={[
                    'text-base font-medium transition',
                    transparent ? 'text-white/80 hover:text-white' : 'text-cana-ink3 hover:text-cana-ink',
                  ].join(' ')}
                >
                  마이페이지
                </Link>
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(true)}
                  className={[
                    'text-base font-medium transition',
                    transparent ? 'text-white/80 hover:text-white' : 'text-cana-ink3 hover:text-cana-ink',
                  ].join(' ')}
                >
                  로그아웃
                </button>
              </>
            ) : (
              <Link
                href="/rotation/login?redirectTo=/rotation"
                className={[
                  'text-base font-medium transition',
                  transparent ? 'text-white/80 hover:text-white' : 'text-cana-ink3 hover:text-cana-ink',
                ].join(' ')}
              >
                로그인
              </Link>
            )}
            </div>
            <Link
              href="/rotation/apply"
              className="hidden sm:inline-flex items-center justify-center text-[14px] font-semibold px-6 h-9 rounded-[8px] border border-[#D1C7C7] bg-[#EBE6E6] text-[#1C1B1A] hover:bg-[#D1C7C7] transition-colors duration-200"
            >
              신청하기
            </Link>
            <button
              type="button"
              aria-label="메뉴 열기"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
              className={[
                '-mr-2 flex h-10 w-10 items-center justify-center sm:hidden',
                transparent ? 'text-white' : 'text-cana-ink',
              ].join(' ')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>

        </div>
      </header>

      {/* 모바일 우측 슬라이드 메뉴 */}
      <div
        className={[
          'fixed inset-0 z-[60] sm:hidden',
          menuOpen ? 'pointer-events-auto' : 'pointer-events-none',
        ].join(' ')}
        aria-hidden={!menuOpen}
      >
        <div
          className={[
            'absolute inset-0 bg-black/40 transition-opacity duration-300',
            menuOpen ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
          onClick={() => setMenuOpen(false)}
        />
        <aside
          className={[
            'absolute inset-y-0 right-0 flex w-[280px] max-w-[80vw] flex-col bg-white shadow-xl transition-transform duration-300',
            menuOpen ? 'translate-x-0' : 'translate-x-full',
          ].join(' ')}
        >
          <div className="flex items-center justify-between px-5 py-4">
            <img src="/txme-assets/logos/logo_black.svg" alt="cana" className="h-[14px]" />
            <button
              type="button"
              aria-label="메뉴 닫기"
              onClick={() => setMenuOpen(false)}
              className="-mr-2 flex h-10 w-10 items-center justify-center text-cana-ink"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <nav className="flex flex-col px-2 pb-6">
            <Link
              href="/rotation/events"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-3.5 text-base font-medium text-cana-ink hover:bg-cana-warm"
            >
              소개팅 일정
            </Link>
            <Link
              href="/rotation/faq"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-3.5 text-base font-medium text-cana-ink hover:bg-cana-warm"
            >
              자주 묻는 질문
            </Link>
            <div className="mx-3 my-2 h-px bg-cana-rule" />
            {userEmail ? (
              <>
                <Link
                  href="/rotation/my"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-3.5 text-base font-medium text-cana-ink hover:bg-cana-warm"
                >
                  마이페이지
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setShowLogoutModal(true);
                  }}
                  className="rounded-lg px-3 py-3.5 text-left text-base font-medium text-cana-ink hover:bg-cana-warm"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <Link
                href="/rotation/login?redirectTo=/rotation"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-3.5 text-base font-medium text-cana-ink hover:bg-cana-warm"
              >
                로그인
              </Link>
            )}
          </nav>
        </aside>
      </div>

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
