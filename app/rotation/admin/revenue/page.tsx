import { createServiceClient } from '@/lib/supabase/server';
import RevenuePage, { type RevenueItem } from '@/components/admin/RevenuePage';

export const dynamic = 'force-dynamic';

export default async function AdminRevenuePage() {
  // 인증/권한 확인은 middleware에서 이미 끝났음 (auth.getUser() 중복 호출 방지)
  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supa = supabase as any;

  const buildQuery = (cols: string) =>
    supa
      .from('applications')
      .select(`${cols}, events ( title, event_date ), profiles ( gender, birth_year )`)
      .not('paid_at', 'is', null)
      .order('paid_at', { ascending: false });

  const base = 'id, status, paid_at, amount, event_id';
  let { data, error } = await buildQuery(`${base}, refunded_amount`);
  // refunded_amount 마이그레이션 적용 전에는 기존 방식으로 조회
  const hasRefundColumn = !error;
  if (error) ({ data } = await buildQuery(base));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payments: RevenueItem[] = (data ?? []).map((row: any) => ({
    id:          row.id,
    status:      row.status,
    paid_at:     row.paid_at,
    amount:      row.amount == null
      ? null
      : hasRefundColumn
        ? row.amount - (row.refunded_amount ?? 0)
        : (row.status === '취소' || row.status === '반려') ? 0 : row.amount,
    event_id:    row.event_id,
    event_title: row.events?.title ?? '—',
    event_date:  row.events?.event_date ?? null,
    gender:      row.profiles?.gender     ?? null,
    birth_year:  row.profiles?.birth_year ?? null,
  }));

  return (
    <main className="px-6 py-8">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-gray-900">매출 현황</h1>
        <p className="mt-0.5 text-xs text-gray-400">월별·이벤트별·성별·연령별 매출 현황을 확인할 수 있어요.</p>
      </div>
      <RevenuePage payments={payments} />
    </main>
  );
}
