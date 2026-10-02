import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

function fmtDate(iso: string) {
  const kst = new Date(new Date(iso).getTime() + 9 * 60 * 60 * 1000);
  return `${kst.getUTCFullYear()}.${String(kst.getUTCMonth() + 1).padStart(2, '0')}.${String(kst.getUTCDate()).padStart(2, '0')}`;
}

export default async function AdminVoteListPage() {
  // 인증/권한 확인은 middleware에서 이미 끝났음
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supa = createServiceClient() as any;

  const { data } = await supa
    .from('events')
    .select('id, title, event_date')
    .order('event_date', { ascending: false })
    .limit(30) as { data: { id: string; title: string; event_date: string }[] | null };

  const events = data ?? [];

  return (
    <main className="px-6 py-8">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-gray-900">첫인상 투표</h1>
        <p className="mt-0.5 text-xs text-gray-400">
          회차를 선택하면 투표 링크·QR코드와 실시간 투표 현황, 매칭 결과를 볼 수 있어요.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        {events.length === 0 ? (
          <p className="py-16 text-center text-sm text-gray-400">이벤트가 없어요</p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {events.map((ev) => (
              <li key={ev.id}>
                <Link
                  href={`/rotation/admin/vote/${ev.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-gray-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-800">{ev.title}</p>
                    <p className="mt-0.5 text-xs text-gray-400">{fmtDate(ev.event_date)}</p>
                  </div>
                  <span className="shrink-0 text-xs text-cana">투표 결과 보기 →</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
