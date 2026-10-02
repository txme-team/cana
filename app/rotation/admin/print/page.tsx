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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: events } = await (supabase as any).from('events').select('id, title, event_date');
  const eventRows = (events as { id: string; title: string; event_date: string }[]) ?? [];
  const eventMap: Record<string, string> = Object.fromEntries(eventRows.map((e) => [e.id, e.title]));
  const eventTime: Record<string, number> = Object.fromEntries(
    eventRows.map((e) => [e.id, Date.parse(e.event_date) || 0])
  );

  // 정렬: 최신 행사 먼저 → 남자 → 여자 → 번호 오름차순(번호 없으면 맨 뒤, 같으면 신청 등록순).
  // 이벤트 상세·웹 프로필 카드와 같은 번호 순서를 따른다.
  const genderRank = (a: ApplicationWithProfile) => (a.profiles.gender === 'male' ? 0 : 1);
  const noRank = (a: ApplicationWithProfile) => a.display_no ?? Number.MAX_SAFE_INTEGER;
  const list = ((applications as ApplicationWithProfile[]) ?? [])
    .filter((a) => a.profiles)
    .sort(
      (a, b) =>
        (eventTime[b.event_id] ?? 0) - (eventTime[a.event_id] ?? 0) ||
        genderRank(a) - genderRank(b) ||
        noRank(a) - noRank(b) ||
        Date.parse(a.created_at) - Date.parse(b.created_at),
    );

  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: PRINT_CARD_STYLES }} />

      <PrintDashboard list={list} eventMap={eventMap} currentStatus={statusFilter} />
    </>
  );
}
