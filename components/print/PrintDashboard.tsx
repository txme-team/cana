'use client';

import { useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { ApplicationWithProfile, ProfileStatus } from '@/lib/types';
import StatusBadge from '@/components/admin/StatusBadge';
import ProfileCardTemplate from './ProfileCardTemplate';
import ProfileCardBackTemplate from './ProfileCardBackTemplate';
import { PRINT_CARD_STYLES } from './printStyles';

const FILTERS: { value: ProfileStatus | 'default'; label: string; query: string }[] = [
  { value: 'default', label: '확정 전체', query: '' },
  { value: '확정',    label: '확정만',   query: '?status=확정' },
  { value: '대기',    label: '대기',     query: '?status=대기' },
  { value: '검토중',  label: '검토중',   query: '?status=검토중' },
];

function birthDisplay(year: number) {
  const y = year < 100 ? 1900 + year : year;
  return String(y).slice(2) + '년생';
}

function PrinterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
    </svg>
  );
}

interface PrintDashboardProps {
  list: ApplicationWithProfile[];
  eventMap: Record<string, string>;
  currentStatus: ProfileStatus | null;
}

export default function PrintDashboard({ list, eventMap, currentStatus }: PrintDashboardProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [previewApp, setPreviewApp] = useState<ApplicationWithProfile | null>(null);

  const activeValue = currentStatus ?? 'default';
  const allChecked = list.length > 0 && selected.size === list.length;

  const toggleAll = () => {
    setSelected(allChecked ? new Set() : new Set(list.map((a) => a.id)));
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // 선택한 카드만 별도 인쇄 창으로 열어서 인쇄
  const printApps = (apps: ApplicationWithProfile[]) => {
    if (apps.length === 0) return;

    const cardsHtml = renderToStaticMarkup(
      <>
        {apps.map((app) => {
          // 동일 이벤트의 이성 참석자 (display_no 순 정렬)
          const oppositeApps = list
            .filter(
              (a) =>
                a.event_id === app.event_id &&
                a.profiles?.gender !== app.profiles?.gender &&
                a.profiles != null,
            )
            .sort((a, b) => (a.display_no ?? 99) - (b.display_no ?? 99));

          return (
            <>
              <ProfileCardTemplate key={`front-${app.id}`} profile={app.profiles} />
              <ProfileCardBackTemplate key={`back-${app.id}`} oppositeApps={oppositeApps} />
            </>
          );
        })}
      </>
    );

    const html = `<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <title>프로필 카드 인쇄</title>
    <style>${PRINT_CARD_STYLES}</style>
  </head>
  <body>${cardsHtml}</body>
</html>`;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('팝업이 차단되어 인쇄 창을 열 수 없어요. 팝업 차단을 해제해주세요.');
      return;
    }

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  };

  const printSelected = () => {
    const apps = list.filter((a) => selected.has(a.id));
    printApps(apps);
  };

  return (
    <>
      <main className="no-print px-6 py-8">
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-gray-900">프로필 카드 출력</h1>
          <p className="mt-0.5 text-xs text-gray-400">
            신청자의 프로필 카드를 인쇄용 A4 카드로 출력해요. 행을 클릭하면 미리볼 수 있어요.
          </p>
        </div>

        {/* 필터 + 선택 인쇄 */}
        <div className="mb-4 flex flex-col gap-2 rounded-2xl border border-gray-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-10 shrink-0 text-sm text-gray-400">상태</span>
            {FILTERS.map((f) => (
              <a
                key={f.value}
                href={`/rotation/admin/print${f.query}`}
                className={[
                  'rounded-full px-3 py-1 text-sm font-medium transition',
                  activeValue === f.value
                    ? 'bg-cana text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
                ].join(' ')}
              >
                {f.label}
              </a>
            ))}
            <span className="ml-1 text-sm text-gray-400">
              {list.length}명{selected.size > 0 ? ` / ${selected.size}건 선택` : ''}
            </span>
          </div>

          <button
            onClick={printSelected}
            disabled={selected.size === 0}
            className="flex items-center justify-center gap-2 rounded-full bg-cana px-4 py-1.5 text-sm font-medium text-white transition hover:bg-cana-dark disabled:cursor-not-allowed disabled:opacity-40"
          >
            <PrinterIcon className="h-3.5 w-3.5" />
            선택 인쇄 ({selected.size})
          </button>
        </div>

        {/* 목록 테이블 */}
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-sm text-gray-400">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={toggleAll}
                    aria-label="전체 선택"
                  />
                </th>
                <th className="px-4 py-3 text-left font-medium">이름</th>
                <th className="px-4 py-3 text-left font-medium">나이</th>
                <th className="px-4 py-3 text-left font-medium">성별</th>
                <th className="hidden px-4 py-3 text-left font-medium md:table-cell">회차</th>
                <th className="px-4 py-3 text-left font-medium">상태</th>
                <th className="w-16 px-4 py-3 text-right font-medium">출력</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {list.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-sm text-gray-400">
                    출력할 프로필이 없어요.
                  </td>
                </tr>
              ) : (
                list.map((app) => {
                  const pr = app.profiles;
                  return (
                    <tr
                      key={app.id}
                      onClick={() => setPreviewApp(app)}
                      className="cursor-pointer transition hover:bg-gray-50"
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selected.has(app.id)}
                          onChange={() => toggleOne(app.id)}
                          aria-label={`${pr.nickname} 선택`}
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">{pr.nickname}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{birthDisplay(pr.birth_year)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{pr.gender === 'male' ? '남' : '여'}</td>
                      <td className="hidden px-4 py-3 text-sm text-gray-500 md:table-cell">
                        {app.event_id ? (eventMap[app.event_id] ?? '—') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={app.status ?? '검토중'} />
                      </td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => printApps([app])}
                          className="rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-cana"
                          title="개별 인쇄"
                          aria-label={`${pr.nickname} 개별 인쇄`}
                        >
                          <PrinterIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* 미리보기 모달 */}
      {previewApp && (
        <div
          className="no-print fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-6"
          onClick={() => setPreviewApp(null)}
        >
          <div
            className="relative max-h-full max-w-full overflow-auto rounded-xl bg-white p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {previewApp.profiles.nickname} · 프로필 카드 미리보기
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => printApps([previewApp])}
                  className="flex items-center gap-1.5 rounded-full bg-cana px-3 py-1.5 text-xs font-medium text-white transition hover:bg-cana-dark"
                >
                  <PrinterIcon className="h-3.5 w-3.5" />
                  인쇄
                </button>
                <button
                  onClick={() => setPreviewApp(null)}
                  className="rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                  aria-label="닫기"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            {(() => {
              const oppositeApps = list
                .filter(
                  (a) =>
                    a.event_id === previewApp.event_id &&
                    a.profiles?.gender !== previewApp.profiles?.gender &&
                    a.profiles != null,
                )
                .sort((a, b) => (a.display_no ?? 99) - (b.display_no ?? 99));
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ width: '673px', height: '476px', overflow: 'hidden' }}>
                    <div style={{ width: '297mm', height: '210mm', transform: 'scale(0.6)', transformOrigin: 'top left' }}>
                      <ProfileCardTemplate profile={previewApp.profiles} />
                    </div>
                  </div>
                  <div style={{ width: '673px', height: '476px', overflow: 'hidden' }}>
                    <div style={{ width: '297mm', height: '210mm', transform: 'scale(0.6)', transformOrigin: 'top left' }}>
                      <ProfileCardBackTemplate oppositeApps={oppositeApps} />
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </>
  );
}
