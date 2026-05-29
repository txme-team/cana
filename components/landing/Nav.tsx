'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function Nav() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // 드롭다운 바깥 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
          <div className="flex items-center gap-3">
            <Link href="/">
              <img src="/logos/logo_black.svg" alt="cana" className="h-[18px]" />
            </Link>
          </div>

          {/* 중앙 네비게이션 */}
          <nav className="hidden items-center gap-6 sm:flex">
            <Link href="/events" className="text-sm font-medium text-cana-ink3 transition hover:text-cana-ink">
              일정
            </Link>
            <Link href="/faq" className="text-sm font-medium text-cana-ink3 transition hover:text-cana-ink">
              FAQ
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            {userEmail ? (
              /* 로그인 상태 — 이메일 클릭 시 드롭다운 */
              <div ref={dropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-xs font-medium text-gray-500 transition hover:bg-gray-50 active:scale-95"
                >
                  {userEmail}
                  <svg
                    className={`h-3 w-3 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                    viewBox="0 0 12 12" fill="none"
                  >
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-full min-w-max overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
                    <Link
                      href="/my/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50"
                    >
                      <img src="/icons/paper.svg" alt="" className="h-5 w-5 flex-shrink-0" /> 프로필 카드
                    </Link>
                    <Link
                      href="/my/applications"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50"
                    >
                      <img src="/icons/ticket.svg" alt="" className="h-5 w-5 flex-shrink-0" /> 신청 내역
                    </Link>
                    <div className="mx-3 border-t border-gray-100" />
                    <button
                      type="button"
                      onClick={() => { setDropdownOpen(false); setShowLogoutModal(true); }}
                      className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-red-500 transition hover:bg-red-50"
                    >
                      <span className="text-base">🚪</span> 로그아웃
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login?redirectTo=/"
                className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-medium text-gray-500 transition hover:bg-gray-50 active:scale-95"
              >
                로그인
              </Link>
            )}
            <Link
              href="/apply"
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
            <p className="mb-1 text-center text-sm font-semibold text-gray-800">로그아웃</p>
            <p className="mb-5 text-center text-xs text-gray-400">정말 로그아웃 하시겠어요?</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm text-gray-600 transition hover:bg-gray-50"
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
