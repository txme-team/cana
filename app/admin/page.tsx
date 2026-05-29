import { redirect } from 'next/navigation';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import AdminDashboard from '@/components/admin/AdminDashboard';
import type { ApplicationWithProfile } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  // 인증 확인은 RLS 클라이언트로
  const authClient = createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) redirect('/admin/login');

  // 데이터 조회는 서비스 클라이언트로 (RLS 우회 — profiles JOIN 포함)
  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supa = supabase as any;

  const [{ data: applications }, { data: events }] = await Promise.all([
    supa
      .from('applications')
      .select('*, profiles(*)')
      .order('created_at', { ascending: false }),
    supa.from('events').select('id, title'),
  ]);

  const eventMap: Record<string, string> = Object.fromEntries(
    ((events as { id: string; title: string }[]) ?? []).map((e) => [e.id, e.title])
  );

  return (
    <main className="px-6 py-8">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-gray-900">신청자 명단</h1>
        <p className="mt-0.5 text-xs text-gray-400">행을 클릭하면 프로필 카드를 볼 수 있어요.</p>
      </div>
      <AdminDashboard
        profiles={(applications as ApplicationWithProfile[]) ?? []}
        eventMap={eventMap}
      />
    </main>
  );
}
