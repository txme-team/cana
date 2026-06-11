import { createServiceClient } from '@/lib/supabase/server';
import MembersPage from '@/components/admin/MembersPage';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 10;

interface PageProps {
  searchParams: {
    q?: string;
    malePage?: string;
    femalePage?: string;
  };
}

export default async function AdminMembersPage({ searchParams }: PageProps) {
  // 인증/권한 확인은 middleware에서 이미 끝났음 (auth.getUser() 중복 호출 방지)
  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supa = supabase as any;

  const q = (searchParams.q ?? '').trim();
  const malePage = Math.max(1, parseInt(searchParams.malePage ?? '1', 10) || 1);
  const femalePage = Math.max(1, parseInt(searchParams.femalePage ?? '1', 10) || 1);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function buildQuery(gender: 'male' | 'female', page: number) {
    let query = supa
      .from('profiles')
      .select('*, applications(id, event_id, status, created_at)', { count: 'exact' })
      .eq('gender', gender)
      .order('created_at', { ascending: false });

    if (q) query = query.ilike('nickname', `%${q}%`);

    const from = (page - 1) * PAGE_SIZE;
    return query.range(from, from + PAGE_SIZE - 1);
  }

  const [
    { data: maleMembers, count: maleCount },
    { data: femaleMembers, count: femaleCount },
    { data: events },
  ] = await Promise.all([
    buildQuery('male', malePage),
    buildQuery('female', femalePage),
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
        maleMembers={maleMembers ?? []}
        femaleMembers={femaleMembers ?? []}
        maleCount={maleCount ?? 0}
        femaleCount={femaleCount ?? 0}
        malePage={malePage}
        femalePage={femalePage}
        pageSize={PAGE_SIZE}
        eventMap={eventMap}
        q={q}
      />
    </main>
  );
}
