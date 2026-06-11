'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export default function Pagination({
  page,
  totalPages,
  paramName = 'page',
}: {
  page: number;
  totalPages: number;
  /** 한 화면에 페이지네이션이 여러 개일 때 (예: 남성/여성 테이블) 쿼리 파라미터 이름을 구분 */
  paramName?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const goTo = (target: number) => {
    if (target < 1 || target > totalPages || target === page) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set(paramName, String(target));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // 페이지 번호 윈도우 (현재 페이지 기준 좌우 2개씩, 최대 5개)
  const windowSize = 2;
  const start = Math.max(1, page - windowSize);
  const end = Math.min(totalPages, page + windowSize);
  const pages = [];
  for (let p = start; p <= end; p++) pages.push(p);

  return (
    <div className="mt-3 flex items-center justify-center gap-1">
      <button
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        className="flex h-7 w-7 items-center justify-center rounded-md text-sm text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30"
        aria-label="이전 페이지"
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      {start > 1 && (
        <>
          <button onClick={() => goTo(1)} className="h-7 min-w-7 rounded-md px-1.5 text-sm text-gray-500 transition hover:bg-gray-100">1</button>
          {start > 2 && <span className="px-1 text-sm text-gray-300">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => goTo(p)}
          className={[
            'h-7 min-w-7 rounded-md px-1.5 text-sm font-medium transition',
            p === page ? 'bg-cana text-white' : 'text-gray-500 hover:bg-gray-100',
          ].join(' ')}
        >
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-sm text-gray-300">…</span>}
          <button onClick={() => goTo(totalPages)} className="h-7 min-w-7 rounded-md px-1.5 text-sm text-gray-500 transition hover:bg-gray-100">{totalPages}</button>
        </>
      )}

      <button
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages}
        className="flex h-7 w-7 items-center justify-center rounded-md text-sm text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30"
        aria-label="다음 페이지"
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  );
}
