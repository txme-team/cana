import { createServiceClient } from '@/lib/supabase/server';
import PaymentsPage, { type PaymentItem, type PaymentFilter } from '@/components/admin/PaymentsPage';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 10;

const SUCCESS_STATUSES = ['검토중', '대기', '확정'];

interface PageProps {
  searchParams: {
    q?: string;
    filter?: string;
    page?: string;
  };
}

export default async function AdminPaymentsPage({ searchParams }: PageProps) {
  // 인증/권한 확인은 middleware에서 이미 끝났음 (auth.getUser() 중복 호출 방지)
  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supa = supabase as any;

  const q = (searchParams.q ?? '').trim();
  const filter: PaymentFilter =
    (['전체', '성공', '취소', '반려'] as const).includes(searchParams.filter as PaymentFilter)
      ? (searchParams.filter as PaymentFilter)
      : '전체';
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10) || 1);

  let query = supa
    .from('applications')
    .select(`
      id,
      status,
      order_id,
      payment_key,
      paid_at,
      amount,
      pay_method,
      event_id,
      profile_id,
      profiles!inner ( nickname ),
      events ( title )
    `, { count: 'exact' })
    .not('paid_at', 'is', null)
    .order('paid_at', { ascending: false });

  if (filter === '성공') query = query.in('status', SUCCESS_STATUSES);
  else if (filter === '취소') query = query.eq('status', '취소');
  else if (filter === '반려') query = query.eq('status', '반려');

  if (q) query = query.ilike('profiles.nickname', `%${q}%`);

  const from = (page - 1) * PAGE_SIZE;
  const { data, count } = await query.range(from, from + PAGE_SIZE - 1);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payments: PaymentItem[] = (data ?? []).map((row: any) => ({
    id:          row.id,
    status:      row.status,
    order_id:    row.order_id,
    payment_key: row.payment_key,
    paid_at:     row.paid_at,
    amount:      row.amount,
    pay_method:  row.pay_method,
    event_id:    row.event_id,
    event_title: row.events?.title ?? '—',
    profile_id:  row.profile_id,
    nickname:    row.profiles?.nickname ?? '—',
  }));

  return (
    <main className="px-6 py-8">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-gray-900">결제 내역</h1>
        <p className="mt-0.5 text-xs text-gray-400">전체 결제 현황과 통계를 확인하고 결제를 취소할 수 있어요.</p>
      </div>
      <PaymentsPage
        payments={payments}
        count={count ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        q={q}
        filter={filter}
      />
    </main>
  );
}
