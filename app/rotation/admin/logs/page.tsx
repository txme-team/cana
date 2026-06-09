'use client';

import { useEffect, useState } from 'react';

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
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('ko-KR', {
    month: 'numeric', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/logs')
      .then((r) => r.json())
      .then((data) => setLogs(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <h1 className="mb-6 text-xl font-bold text-gray-800">활동 로그</h1>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-sm text-gray-400">
          불러오는 중...
        </div>
      ) : logs.length === 0 ? (
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
              {logs.map((log, i) => (
                <tr
                  key={log.id}
                  className={i !== logs.length - 1 ? 'border-b border-gray-50' : ''}
                >
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-400">
                    {formatDate(log.created_at)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{log.admin_email}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-lg bg-cana/10 px-2 py-0.5 text-xs font-medium text-cana">
                      {ACTION_LABELS[log.action] ?? log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {log.target_type && (
                      <span>{log.target_type}</span>
                    )}
                    {log.target_id && (
                      <span className="ml-1 font-mono text-gray-300">
                        {log.target_id.slice(0, 8)}…
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {log.detail ? (
                      <span className="font-mono">
                        {JSON.stringify(log.detail)}
                      </span>
                    ) : '—'}
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
