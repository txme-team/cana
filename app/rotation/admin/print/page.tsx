import { createServiceClient } from '@/lib/supabase/server';
import type { ApplicationWithProfile, ProfileStatus } from '@/lib/types';
import PrintDashboard from '@/components/print/PrintDashboard';
import { PRINT_CARD_STYLES } from '@/components/print/printStyles';

export const dynamic = 'force-dynamic';


const VALID_STATUSES: ProfileStatus[] = ['검토중', '대기', '확정', '반려', '취소'];

interface PageProps {
  searchParams: { status?: string };
}

export default async function PrintPage({ searchParams }: PageProps) {
  // 인증/권한 확인은 middleware에서 이미 끝났음 (auth.getUser() 중복 호출 방지)
  const supabase = createServiceClient();

  const rawStatus = searchParams.status;
  const statusFilter: ProfileStatus | null =
    rawStatus && VALID_STATUSES.includes(rawStatus as ProfileStatus)
      ? (rawStatus as ProfileStatus)
      : null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from('applications')
    .select('*, profiles(*)')
    .order('created_at', { ascending: true });

  if (statusFilter) {
    query = query.eq('status', statusFilter);
  } else {
    query = query.eq('status', '확정');
  }

  const { data: applications } = await query;
  const list = ((applications as ApplicationWithProfile[]) ?? []).filter((a) => a.profiles);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: events } = await (supabase as any).from('events').select('id, title');
  const eventMap: Record<string, string> = Object.fromEntries(
    ((events as { id: string; title: string }[]) ?? []).map((e) => [e.id, e.title])
  );

  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: PRINT_CARD_STYLES }} />

      <PrintDashboard list={list} eventMap={eventMap} currentStatus={statusFilter} />
    </>
  );
}
