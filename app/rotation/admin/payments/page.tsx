import { redirect } from 'next/navigation';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import PaymentsPage, { type PaymentItem } from '@/components/admin/PaymentsPage';

export const dynamic = 'force-dynamic';

export default async function AdminPaymentsPage() {
  const authClient = createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) redirect('/rotation/admin/login');

  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supa = supabase as any;

  const { data } = await supa
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
      profiles ( nickname ),
      events   ( title )
    `)
    .not('paid_at', 'is', null)
    .order('paid_at', { ascending: false });

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
      <PaymentsPage payments={payments} />
    </main>
  );
}
