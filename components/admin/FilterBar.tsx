'use client';

import type { ProfileStatus } from '@/lib/types';

const STATUS_OPTIONS: { value: ProfileStatus | 'all'; label: string }[] = [
  { value: 'all',    label: '전체' },
  { value: '검토중', label: '검토중' },
  { value: '대기',   label: '대기' },
  { value: '확정',   label: '확정' },
  { value: '반려',   label: '반려' },
  { value: '취소',   label: '취소' },
];

interface FilterBarProps {
  search: string;
  status: ProfileStatus | 'all';
  onSearch: (v: string) => void;
  onStatus: (v: ProfileStatus | 'all') => void;
  total: number;
  filtered: number;
}

export default function FilterBar({
  search, status, onSearch, onStatus, total, filtered,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onStatus(opt.value as ProfileStatus | 'all')}
            className={[
              'rounded-full px-3 py-1 text-sm font-medium transition',
              status === opt.value
                ? 'bg-cana text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
            ].join(' ')}
          >
            {opt.label}
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-400">
          {filtered !== total ? `${filtered} / ${total}명` : `${total}명`}
        </span>
      </div>

      <div className="relative w-full sm:w-56">
        <svg
          className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-300"
          fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          placeholder="닉네임 검색"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-200 py-1.5 pl-8 pr-3 text-sm outline-none focus:border-cana focus:ring-1 focus:ring-cana/20"
        />
      </div>
    </div>
  );
}
