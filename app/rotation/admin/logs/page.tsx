'use client';

import { useEffect, useMemo, useState } from 'react';

interface AdminLog {
  id: string;
  admin_email: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  detail: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

const ACTION_LABELS: Record<string, string> = {
  APPLICATION_STATUS_CHANGED: '신청 상태 변경',
  APPLICATION_UPDATED:        '신청 정보 수정',
  EVENT_CREATED:              '이벤트 생성',
  EVENT_UPDATED:              '이벤트 수정',
  EVENT_DELETED:              '이벤트 삭제',
  EVENT_CANCELLED:            '이벤트 전체 취소',
  PAYMENT_CONFIRM_SUCCEEDED:  '결제 승인 성공',
  PAYMENT_CONFIRM_FAILED:     '결제 승인 실패',
  PAYMENT_REFUND_SUCCEEDED:   '환불 처리 성공',
  PAYMENT_REFUND_FAILED:      '환불 처리 실패',
  PAYMENT_REFUND_SKIPPED:     '환불 대상 없음',
};

const PAYMENT_ACTIONS = new Set([
  'PAYMENT_CONFIRM_SUCCEEDED',
  'PAYMENT_CONFIRM_FAILED',
  'PAYMENT_REFUND_SUCCEEDED',
  'PAYMENT_REFUND_FAILED',
  'PAYMENT_REFUND_SKIPPED',
  'EVENT_CANCELLED',
]);

function actionBadgeStyle(action: string) {
  if (action.endsWith('_FAILED')) return 'bg-red-50 text-red-600';
  if (action.endsWith('_SKIPPED')) return 'bg-gray-100 text-gray-500';
  if (action.endsWith('_SUCCEEDED')) return 'bg-green-50 text-green-700';
  return 'bg-cana/10 text-cana';
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('ko-KR', {
    month: 'numeric', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

function DetailCell({ detail }: { detail: Record<string, unknown> | null }) {
  const [open, setOpen] = useState(false);
  if (!detail) return <span className="text-xs text-gray-300">—</span>;

  const summary = Object.entries(detail)
    .filter(([k]) => !['tossRequest', 'refundResults'].includes(k))
    .slice(0, 4)
    .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
    .join(' · ');

  return (
    <div className="max-w-md">
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-left text-xs text-gray-500 hover:text-gray-700"
      >
        <span className="line-clamp-1">{summary || '상세 보기'}</span>
        <span className="ml-1 text-gray-300">{open ? '접기' : '펼치기'}</span>
      </button>
      {open && (
        <pre className="mt-1.5 max-h-64 overflow-auto rounded-lg bg-gray-50 p-2.5 text-[11px] leading-relaxed text-gray-600">
          {JSON.stringify(detail, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlyPayments, setOnlyPayments] = useState(false);

  useEffect(() => {
    fetch('/api/rotation/admin/logs')
      .then((r) => r.json())
      .then((data) => setLogs(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const visibleLogs = useMemo(
    () => onlyPayments ? logs.filter((l) => PAYMENT_ACTIONS.has(l.action)) : logs,
    [logs, onlyPayments]
  );

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">활동 로그</h1>
        <button
          onClick={() => setOnlyPayments((v) => !v)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
            onlyPayments
              ? 'bg-cana text-white'
              : 'border border-gray-200 bg-white text-gray-500 hover:border-cana/40 hover:text-cana'
          }`}
        >
          결제/환불만 보기
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-sm text-gray-400">
          불러오는 중...
        </div>
      ) : visibleLogs.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white px-6 py-16 text-center text-sm text-gray-400">
          아직 기록된 로그가 없어요
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">시각</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">관리자</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">액션</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">대상</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">상세</th>
              </tr>
            </thead>
            <tbody>
              {visibleLogs.map((log, i) => (
                <tr
                  key={log.id}
                  className={i !== visibleLogs.length - 1 ? 'border-b border-gray-50' : ''}
                >
                  <td className="whitespace-nowrap px-4 py-3 align-top text-xs text-gray-400">
                    {formatDate(log.created_at)}
                  </td>
                  <td className="px-4 py-3 align-top text-gray-600">{log.admin_email}</td>
                  <td className="px-4 py-3 align-top">
                    <span className={`rounded-lg px-2 py-0.5 text-xs font-medium ${actionBadgeStyle(log.action)}`}>
                      {ACTION_LABELS[log.action] ?? log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top text-xs text-gray-400">
                    {log.target_type && (
                      <span>{log.target_type}</span>
                    )}
                    {log.target_id && (
                      <span className="ml-1 font-mono text-gray-300">
                        {log.target_id.slice(0, 8)}…
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <DetailCell detail={log.detail} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
