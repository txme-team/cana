'use client';

import { useState, useMemo } from 'react';

// ─── 타입 ─────────────────────────────────────────────────────────────────────

export interface PaymentItem {
  id: string;
  status: string;
  order_id: string | null;
  payment_key: string | null;
  paid_at: string | null;
  amount: number | null;
  pay_method: string | null;
  event_id: string;
  event_title: string;
  profile_id: string;
  nickname: string;
}

type FilterStatus = '전체' | '성공' | '취소' | '반려';

const SUCCESS_STATUSES = ['검토중', '대기', '확정'];

// ─── 헬퍼 ─────────────────────────────────────────────────────────────────────

function fmtAmount(n: number | null) {
  if (n == null) return '—';
  return n.toLocaleString('ko-KR') + '원';
}

function fmtDate(s: string | null) {
  if (!s) return '—';
  const d = new Date(s);
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
    + ' '
    + d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    검토중: 'bg-yellow-50 text-yellow-700',
    대기:   'bg-gray-100 text-gray-500',
    확정:   'bg-green-50 text-green-700',
    반려:   'bg-red-50 text-red-500',
    취소:   'bg-gray-100 text-gray-400',
  };
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${map[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  );
}

// ─── 메인 컴포넌트 ─────────────────────────────────────────────────────────────

export default function PaymentsPage({ payments: initial }: { payments: PaymentItem[] }) {
  const [search, setSearch]         = useState('');
  const [filter, setFilter]         = useState<FilterStatus>('전체');
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [payments, setPayments]     = useState<PaymentItem[]>(initial);
  const [error, setError]           = useState<string | null>(null);

  const FILTERS: FilterStatus[] = ['전체', '성공', '취소', '반려'];

  const filtered = useMemo(() => {
    return payments.filter((p) => {
      // 검색
      if (search && !p.nickname.includes(search)) return false;
      // 상태 필터
      if (filter === '성공' && !SUCCESS_STATUSES.includes(p.status)) return false;
      if (filter === '취소' && p.status !== '취소') return false;
      if (filter === '반려' && p.status !== '반려') return false;
      return true;
    });
  }, [payments, search, filter]);

  const handleCancel = async (p: PaymentItem) => {
    if (!p.payment_key) return;
    if (!confirm(`${p.nickname}님의 결제를 취소하시겠어요?\n${fmtAmount(p.amount)}`)) return;

    setCancelling(p.id);
    setError(null);

    try {
      const res = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: p.id, paymentKey: p.payment_key }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(err.error ?? '취소 실패');
      }
      setPayments((prev) =>
        prev.map((item) => item.id === p.id ? { ...item, status: '취소' } : item)
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : '오류가 발생했어요.');
    } finally {
      setCancelling(null);
    }
  };

  return (
    <>
      {/* 검색 + 필터 */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="회원명 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-cana"
        />
        <div className="flex gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={[
                'rounded-full px-3 py-1 text-xs font-medium transition',
                filter === f
                  ? 'bg-cana text-white'
                  : 'border border-gray-200 bg-white text-gray-500 hover:border-cana/40 hover:text-cana',
              ].join(' ')}
            >
              {f}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-gray-400">{filtered.length}건</span>
      </div>

      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
      )}

      {/* 테이블 */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold text-gray-400">이름</th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold text-gray-400">이벤트</th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold text-gray-400">결제 방식</th>
                <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold text-gray-400">결제 금액</th>
                <th className="whitespace-nowrap px-4 py-3 text-center text-xs font-semibold text-gray-400">상태</th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold text-gray-400">결제 일시</th>
                <th className="whitespace-nowrap px-4 py-3 text-center text-xs font-semibold text-gray-400">영수증</th>
                <th className="whitespace-nowrap px-4 py-3 text-center text-xs font-semibold text-gray-400">취소</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-sm text-gray-400">
                    결제 내역이 없어요
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-800">{p.nickname}</td>
                    <td className="max-w-[180px] truncate px-4 py-3 text-gray-600">{p.event_title}</td>
                    <td className="px-4 py-3 text-gray-500">{p.pay_method ?? '—'}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800">{fmtAmount(p.amount)}</td>
                    <td className="px-4 py-3 text-center"><StatusBadge status={p.status} /></td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-500">{fmtDate(p.paid_at)}</td>
                    <td className="px-4 py-3 text-center">
                      {p.payment_key ? (
                        <a
                          href={`https://dashboard.tosspayments.com/receipts/${p.payment_key}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-cana underline-offset-2 hover:underline"
                        >
                          보기
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                          </svg>
                        </a>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {SUCCESS_STATUSES.includes(p.status) && p.payment_key ? (
                        <button
                          onClick={() => handleCancel(p)}
                          disabled={cancelling === p.id}
                          className="rounded-lg border border-red-200 px-2.5 py-1 text-xs text-red-500 transition hover:bg-red-50 disabled:opacity-40"
                        >
                          {cancelling === p.id ? '처리중...' : '취소'}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
