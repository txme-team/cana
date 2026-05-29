import { redirect } from 'next/navigation';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import MembersPage from '@/components/admin/MembersPage';

export const dynamic = 'force-dynamic';

export default async function AdminMembersPage() {
  const authClient = createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) redirect('/admin/login');

  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supa = supabase as any;

  const [{ data: members }, { data: events }] = await Promise.all([
    supa
      .from('profiles')
      .select('*, applications(id, event_id, status, created_at)')
      .order('created_at', { ascending: false }),
    supa.from('events').select('id, title'),
  ]);

  const eventMap: Record<string, string> = Object.fromEntries(
    ((events as { id: string; title: string }[]) ?? []).map((e) => [e.id, e.title])
  );

  return (
    <main className="px-6 py-8">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-gray-900">회원 목록</h1>
        <p className="mt-0.5 text-xs text-gray-400">가입된 전체 회원을 관리해요. 행을 클릭하면 상세 정보를 볼 수 있어요.</p>
      </div>
      <MembersPage
        members={members ?? []}
        eventMap={eventMap}
      />
    </main>
  );
}
