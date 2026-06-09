import { createClient } from '@/lib/supabase/server';
import AdminSidebar from '@/components/admin/AdminSidebar';
import SessionTimer from '@/components/admin/SessionTimer';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 미인증 → 사이드바 없이 그대로 렌더 (로그인 페이지)
  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar userEmail={user.email ?? ''} />
      <div className="flex flex-1 flex-col overflow-auto">
        {/* 상단 세션 타이머 바 */}
        <div className="flex items-center justify-end border-b border-gray-100 bg-white px-6 py-2">
          <SessionTimer />
        </div>
        {children}
      </div>
    </div>
  );
}
