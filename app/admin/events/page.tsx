import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import EventsManager from '@/components/admin/EventsManager';

export const dynamic = 'force-dynamic';

export default async function AdminEventsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  return (
    <main className="px-6 py-8">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-gray-900">이벤트 관리</h1>
        <p className="mt-0.5 text-xs text-gray-400">이벤트를 생성·수정하거나 모집 상태를 변경할 수 있어요.</p>
      </div>
      <EventsManager />
    </main>
  );
}
