'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Pagination from './Pagination';
import { calcRefund, REFUND_POLICY_TEXT } from '@/lib/refund-policy';

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
  event_date: string | null;
  profile_id: string;
  nickname: string;
}

export type PaymentFilter = '전체' | '성공' | '취소' | '반려';

const SUCCESS_STATUSES = ['검토중', '대기', '확정'];
// 상태는 이미 바뀌었지만 Toss 환불은 안 됐을 수 있는 건 — 환불만 다시 처리할 수 있어야 한다
const REFUND_ONLY_STATUSES = ['취소', '반려'];

// ─── Toss 건별 조회 응답 타입 (사용하는 필드만) ────────────────────────────────

interface TossCancel {
  cancelAmount: number;
  cancelReason: string;
  canceledAt: string;
  transactionKey: string;
}

interface TossPaymentQuery {
  status: string;
  method: string | null;
  orderId: string;
  orderName: string;
  totalAmount: number;
  balanceAmount: number;
  requestedAt: string;
  approvedAt: string | null;
  receipt?: { url: string } | null;
  cancels?: TossCancel[] | null;
  card?: { company?: string; number?: string; installmentPlanMonths?: number } | null;
  virtualAccount?: { bankCode?: string; accountNumber?: string; dueDate?: string } | null;
  easyPay?: { provider?: string } | null;
  failure?: { code: string; message: string } | null;
}

const STATUS_LABELS: Record<string, string> = {
  READY: '결제 대기',
  IN_PROGRESS: '진행 중',
  WAITING_FOR_DEPOSIT: '입금 대기',
  DONE: '결제 완료',
  CANCELED: '전액 취소',
  PARTIAL_CANCELED: '부분 취소',
  ABORTED: '결제 실패',
  EXPIRED: '만료',
};

// ─── 헬퍼 ─────────────────────────────────────────────────────────────────────

function fmtAmount(n: number | null | undefined) {
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

export default function PaymentsPage({
  payments: initial, count, page, pageSize, q, filter,
}: {
  payments: PaymentItem[];
  count: number;
  page: number;
  pageSize: number;
  q: string;
  filter: PaymentFilter;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch]         = useState(q);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [payments, setPayments]     = useState<PaymentItem[]>(initial);
  const [error, setError]           = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<PaymentItem | null>(null);
  const [refundAmount, setRefundAmount] = useState<number | null>(null);

  const [queryTarget, setQueryTarget]   = useState<PaymentItem | null>(null);
  const [queryData, setQueryData]       = useState<TossPaymentQuery | null>(null);
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryError, setQueryError]     = useState<string | null>(null);

  useEffect(() => setPayments(initial), [initial]);

  const FILTERS: PaymentFilter[] = ['전체', '성공', '취소', '반려'];
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  const updateParams = (next: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value === '전체' || value === '') params.delete(key);
      else params.set(key, value);
    });
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // 검색어 디바운스
  useEffect(() => {
    if (search === q) return;
    const t = setTimeout(() => updateParams({ q: search }), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleQuery = async (p: PaymentItem) => {
    if (!p.payment_key) return;
    setQueryTarget(p);
    setQueryData(null);
    setQueryError(null);
    setQueryLoading(true);
    try {
      const res = await fetch(`/api/rotation/admin/payments/query?paymentKey=${encodeURIComponent(p.payment_key)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? '조회 실패');
      setQueryData(data as TossPaymentQuery);
    } catch (e) {
      setQueryError(e instanceof Error ? e.message : '오류가 발생했어요.');
    } finally {
      setQueryLoading(false);
    }
  };

  const handleCancelConfirm = async () => {
    const p = cancelTarget;
    if (!p || !p.payment_key) return;

    setCancelling(p.id);
    setError(null);

    try {
      const res = await fetch('/api/rotation/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: p.id,
          paymentKey: p.payment_key,
          ...(refundAmount != null ? { refundAmount } : {}),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(err.error ?? '취소 실패');
      }
      setPayments((prev) =>
        prev.map((item) => item.id === p.id ? { ...item, status: '취소' } : item)
      );
      setCancelTarget(null);
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
              onClick={() => updateParams({ filter: f })}
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
        <span className="ml-auto text-xs text-gray-400">총 {count}건</span>
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
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-sm text-gray-400">
                    결제 내역이 없어요
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-800">{p.nickname}</td>
                    <td className="max-w-[180px] truncate px-4 py-3 text-gray-600">{p.event_title}</td>
                    <td className="px-4 py-3 text-gray-500">{p.pay_method ?? '—'}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800">{fmtAmount(p.amount)}</td>
                    <td className="px-4 py-3 text-center"><StatusBadge status={p.status} /></td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-500">{fmtDate(p.paid_at)}</td>
                    <td className="px-4 py-3 text-center">
                      {p.payment_key ? (
                        <button
                          onClick={() => handleQuery(p)}
                          className="text-xs text-cana underline-offset-2 hover:underline"
                        >
                          보기
                        </button>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {(SUCCESS_STATUSES.includes(p.status) || REFUND_ONLY_STATUSES.includes(p.status)) && p.payment_key ? (
                        <button
                          onClick={() => {
                            setRefundAmount(p.status === '반려' ? (p.amount ?? 0) : calcRefund(p.amount, p.event_date).amount);
                            setCancelTarget(p);
                          }}
                          disabled={cancelling === p.id}
                          className="rounded-lg border border-red-200 px-2.5 py-1 text-xs text-red-500 transition hover:bg-red-50 disabled:opacity-40"
                        >
                          {cancelling === p.id ? '처리중...' : p.status === '취소' ? '재취소' : p.status === '반려' ? '환불' : '취소'}
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

      <Pagination page={page} totalPages={totalPages} paramName="page" />

      {/* 취소 확인 모달 */}
      {cancelTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
          onClick={() => !cancelling && setCancelTarget(null)}
        >
          <div
            className="w-full max-w-xs rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-1 text-base font-semibold text-gray-900">
              {cancelTarget.status === '취소' ? '결제 취소를 다시 처리할까요?' : cancelTarget.status === '반려' ? '반려 건을 환불할까요?' : '결제를 취소할까요?'}
            </p>
            {REFUND_ONLY_STATUSES.includes(cancelTarget.status) && (
              <p className="mb-2 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-700">
                이미 {cancelTarget.status} 처리된 신청이에요. Toss 환불만 요청하고, 상태 변경과 안내 문자·대기자 알림은 하지 않아요.
                환불 금액을 0원보다 크게 입력해주세요. 영수증 &lsquo;보기&rsquo;의 취소 이력에서 이미 환불됐는지 먼저 확인하세요.
              </p>
            )}

            {(() => {
              const suggested = cancelTarget.status === '반려'
                ? { rate: 1, amount: cancelTarget.amount ?? 0, label: '전액 환불' }
                : calcRefund(cancelTarget.amount, cancelTarget.event_date);
              const max = cancelTarget.amount ?? 0;
              const current = refundAmount ?? suggested.amount;
              return (
                <>
                  <p className="text-sm text-gray-600">
                    환불 규정 기본값: <span className="font-medium text-gray-900">{suggested.label}</span>
                    {suggested.rate > 0 && (
                      <> (<span className="font-medium text-gray-900">{suggested.amount.toLocaleString('ko-KR')}원</span>)</>
                    )}
                  </p>
                  <ul className="mt-2 list-disc space-y-0.5 pl-4 text-xs text-gray-400">
                    {REFUND_POLICY_TEXT.map((t) => <li key={t}>{t}</li>)}
                  </ul>

                  <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3">
                    <label className="shrink-0 text-xs font-medium text-gray-700">환불 금액</label>
                    <input
                      type="number"
                      min={0}
                      max={max}
                      step={100}
                      value={current}
                      onChange={(e) => {
                        const n = Number(e.target.value);
                        if (Number.isNaN(n)) return;
                        setRefundAmount(Math.max(0, Math.min(n, max)));
                      }}
                      className="w-full min-w-0 rounded-md border border-gray-200 px-2 py-1 text-right text-sm text-gray-800 outline-none focus:border-cana"
                    />
                    <span className="shrink-0 text-xs text-gray-400">원</span>
                  </div>
                  <p className="mt-1 text-[11px] text-gray-400">
                    우리 쪽 사유로 취소하는 경우 등 날짜와 무관하게 금액을 직접 조정할 수 있어요.
                  </p>
                </>
              );
            })()}

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setCancelTarget(null)}
                disabled={!!cancelling}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm text-gray-500 transition hover:bg-gray-50 disabled:opacity-40"
              >
                닫기
              </button>
              <button
                onClick={handleCancelConfirm}
                disabled={!!cancelling}
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-medium text-white transition hover:bg-red-600 disabled:opacity-40"
              >
                {cancelling ? '처리 중...' : REFUND_ONLY_STATUSES.includes(cancelTarget.status) ? '환불 요청' : '취소하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 결제 건별 조회 팝업 */}
      {queryTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
          onClick={() => setQueryTarget(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-base font-semibold text-gray-900">Toss 결제 조회</p>
              <button
                onClick={() => setQueryTarget(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="mb-3 text-xs text-gray-400">{queryTarget.nickname}님 · {queryTarget.event_title}</p>

            {queryLoading ? (
              <div className="py-10 text-center text-sm text-gray-400">조회 중...</div>
            ) : queryError ? (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{queryError}</p>
            ) : queryData ? (
              <div className="flex flex-col gap-3 text-sm">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg bg-gray-50 px-3 py-2.5">
                  <div>
                    <p className="text-[11px] text-gray-400">상태</p>
                    <p className="font-medium text-gray-800">{STATUS_LABELS[queryData.status] ?? queryData.status}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400">결제수단</p>
                    <p className="font-medium text-gray-800">
                      {queryData.card?.company ?? queryData.easyPay?.provider ?? queryData.method ?? '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400">총 결제금액</p>
                    <p className="font-medium text-gray-800">{fmtAmount(queryData.totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400">잔여금액</p>
                    <p className="font-medium text-gray-800">{fmtAmount(queryData.balanceAmount)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[11px] text-gray-400">승인 일시</p>
                    <p className="font-medium text-gray-800">{fmtDate(queryData.approvedAt)}</p>
                  </div>
                </div>

                {queryData.failure && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                    실패: {queryData.failure.message} ({queryData.failure.code})
                  </p>
                )}

                {/* 취소 이력 — 우리가 요청한 취소가 Toss에 실제로 반영됐는지 여기서 확인 */}
                <div>
                  <p className="mb-1.5 text-xs font-medium text-gray-700">취소 이력</p>
                  {queryData.cancels && queryData.cancels.length > 0 ? (
                    <div className="flex flex-col gap-1.5">
                      {queryData.cancels.map((c) => (
                        <div key={c.transactionKey} className="rounded-lg border border-gray-100 px-3 py-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-800">{fmtAmount(c.cancelAmount)}</span>
                            <span className="text-gray-400">{fmtDate(c.canceledAt)}</span>
                          </div>
                          <p className="mt-0.5 text-gray-500">{c.cancelReason}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">취소 이력 없음</p>
                  )}
                </div>

                {queryData.receipt?.url && (
                  <a
                    href={queryData.receipt.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-cana underline-offset-2 hover:underline"
                  >
                    영수증 페이지 열기
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </a>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
