import { createServiceClient } from '@/lib/supabase/server';
import AdminDashboard from '@/components/admin/AdminDashboard';
import type { ApplicationWithProfile, ProfileStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 10;

const VALID_STATUSES: ProfileStatus[] = ['검토중', '대기', '확정', '반려', '취소'];

interface PageProps {
  searchParams: {
    q?: string;
    status?: string;
    event?: string;
    malePage?: string;
    femalePage?: string;
  };
}

export default async function AdminPage({ searchParams }: PageProps) {
  // 인증/권한 확인은 middleware에서 이미 끝났음 (auth.getUser() 중복 호출 방지)
  // 데이터 조회는 서비스 클라이언트로 (RLS 우회 — profiles JOIN 포함)
  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supa = supabase as any;

  const q = (searchParams.q ?? '').trim();
  const status: ProfileStatus | 'all' =
    searchParams.status && VALID_STATUSES.includes(searchParams.status as ProfileStatus)
      ? (searchParams.status as ProfileStatus)
      : 'all';
  const eventId = searchParams.event ?? 'all';
  const malePage = Math.max(1, parseInt(searchParams.malePage ?? '1', 10) || 1);
  const femalePage = Math.max(1, parseInt(searchParams.femalePage ?? '1', 10) || 1);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function buildQuery(gender: 'male' | 'female', page: number) {
    let query = supa
      .from('applications')
      .select('*, profiles!inner(*)', { count: 'exact' })
      .eq('profiles.gender', gender)
      .order('created_at', { ascending: false });

    if (status !== 'all') query = query.eq('status', status);
    if (eventId !== 'all') query = query.eq('event_id', eventId);
    if (q) query = query.ilike('profiles.nickname', `%${q}%`);

    const from = (page - 1) * PAGE_SIZE;
    return query.range(from, from + PAGE_SIZE - 1);
  }

  const [
    { data: maleApps, count: maleCount },
    { data: femaleApps, count: femaleCount },
    { data: events },
  ] = await Promise.all([
    buildQuery('male', malePage),
    buildQuery('female', femalePage),
    supa.from('events').select('id, title').order('event_date', { ascending: false }),
  ]);

  const eventOptions = (events as { id: string; title: string }[]) ?? [];
  const eventMap: Record<string, string> = Object.fromEntries(
    eventOptions.map((e) => [e.id, e.title])
  );

  return (
    <main className="px-6 py-8">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-gray-900">신청자 명단</h1>
        <p className="mt-0.5 text-xs text-gray-400">행을 클릭하면 프로필 카드를 볼 수 있어요.</p>
      </div>
      <AdminDashboard
        maleApps={(maleApps as ApplicationWithProfile[]) ?? []}
        femaleApps={(femaleApps as ApplicationWithProfile[]) ?? []}
        maleCount={maleCount ?? 0}
        femaleCount={femaleCount ?? 0}
        malePage={malePage}
        femalePage={femalePage}
        pageSize={PAGE_SIZE}
        eventMap={eventMap}
        eventOptions={eventOptions}
        filters={{ q, status, eventId }}
      />
    </main>
  );
}
