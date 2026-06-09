import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import EventDetailPage from '@/components/admin/EventDetailPage';

export const dynamic = 'force-dynamic';

export default async function AdminEventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/rotation/admin/login');

  return <EventDetailPage eventId={params.id} />;
}
