import { Suspense } from 'react';
import { headers } from 'next/headers';
import AdminSidebar from '@/components/admin/AdminSidebar';
import SessionTimer from '@/components/admin/SessionTimer';

export const metadata = {
  title: '어드민',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // 인증/권한 확인은 middleware에서 이미 끝났음 (auth.getUser() 중복 호출 방지)
  // 미들웨어가 통과시킨 요청에는 x-admin-email 헤더가 항상 포함됨
  const userEmail = headers().get('x-admin-email');

  // 로그인 페이지 등 미들웨어가 헤더를 세팅하지 않은 경로 → 사이드바 없이 그대로 렌더
  if (!userEmail) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 print:block print:h-auto print:overflow-visible print:bg-white">
      <AdminSidebar userEmail={userEmail} />
      <div className="flex flex-1 flex-col overflow-auto print:block print:overflow-visible">
        {/* 상단 세션 타이머 바 */}
        <div className="flex items-center justify-end border-b border-gray-100 bg-white px-6 py-2 print:hidden">
          <SessionTimer />
        </div>
        <Suspense fallback={<AdminContentFallback />}>
          {children}
        </Suspense>
      </div>
    </div>
  );
}

function AdminContentFallback() {
  return (
    <main className="px-6 py-8">
      <div className="animate-pulse space-y-4">
        <div className="h-5 w-32 rounded bg-gray-100" />
        <div className="h-3 w-56 rounded bg-gray-100" />
        <div className="mt-6 h-64 rounded-2xl bg-gray-100" />
      </div>
    </main>
  );
}
