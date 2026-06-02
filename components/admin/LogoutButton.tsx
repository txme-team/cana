'use client';

import { createClient } from '@/lib/supabase/client';

export default function LogoutButton() {

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    // 하드 리다이렉트로 서버 레이아웃이 세션 만료를 정확히 읽도록
    window.location.href = '/admin/login';
  };

  return (
    <button
      onClick={handleLogout}
      className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-500 transition hover:bg-gray-50"
    >
      로그아웃
    </button>
  );
}
