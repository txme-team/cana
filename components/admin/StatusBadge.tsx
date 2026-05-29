import type { ProfileStatus } from '@/lib/types';

const CONFIG: Record<ProfileStatus, { label: string; className: string }> = {
  '검토중': { label: '검토중', className: 'bg-gray-100 text-gray-500' },
  '대기':   { label: '대기',   className: 'bg-amber-100 text-amber-700' },
  '확정':   { label: '확정',   className: 'bg-green-100 text-green-700' },
  '반려':   { label: '반려',   className: 'bg-red-100 text-red-600' },
  '취소':   { label: '취소',   className: 'bg-gray-200 text-gray-400' },
};

export default function StatusBadge({ status }: { status: ProfileStatus }) {
  const cfg = CONFIG[status] ?? CONFIG['검토중'];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}
