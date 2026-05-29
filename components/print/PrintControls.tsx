'use client';

import Link from 'next/link';
import type { ProfileStatus } from '@/lib/types';

const FILTERS: { value: ProfileStatus | 'default'; label: string; query: string }[] = [
  { value: 'default', label: '확정 전체', query: '' },
  { value: '확정',    label: '확정만',   query: '?status=확정' },
  { value: '대기',    label: '대기',     query: '?status=대기' },
  { value: '검토중',  label: '검토중',   query: '?status=검토중' },
];

interface PrintControlsProps {
  total: number;
  currentStatus: ProfileStatus | null;
}

export default function PrintControls({ total, currentStatus }: PrintControlsProps) {
  const activeValue = currentStatus ?? 'default';

  return (
    <div className="no-print sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-3 shadow-sm">
      <div className="flex items-center gap-4">
        <Link href="/admin" className="text-xs text-gray-400 hover:text-gray-600">
          ← 명단으로
        </Link>
        <div className="h-4 w-px bg-gray-200" />
        <div className="flex gap-1.5">
          {FILTERS.map((f) => (
            <Link
              key={f.value}
              href={`/admin/print${f.query}`}
              className={[
                'rounded-full px-3 py-1 text-xs font-medium transition',
                activeValue === f.value
                  ? 'bg-cana text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
              ].join(' ')}
            >
              {f.label}
            </Link>
          ))}
        </div>
        <span className="text-xs text-gray-400">{total}장</span>
      </div>

      <button
        onClick={() => window.print()}
        className="flex items-center gap-2 rounded-lg bg-cana px-4 py-2 text-xs font-medium text-white transition hover:bg-cana-dark"
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
        </svg>
        인쇄
      </button>
    </div>
  );
}
