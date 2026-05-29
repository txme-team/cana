'use client';

import { useState, useMemo } from 'react';
import type { ApplicationWithProfile, ProfileStatus } from '@/lib/types';
import StatusBadge from './StatusBadge';
import ProfileModal from './ProfileModal';

// ─── 공통 필터 바 ──────────────────────────────────────────────────────────────

function SharedFilterBar({
  search, onSearch,
  statusFilter, onStatus,
  eventFilter, onEvent,
  eventOptions,
  total, filtered,
}: {
  search: string; onSearch: (v: string) => void;
  statusFilter: ProfileStatus | 'all'; onStatus: (v: ProfileStatus | 'all') => void;
  eventFilter: string; onEvent: (v: string) => void;
  eventOptions: { id: string; title: string }[];
  total: number; filtered: number;
}) {
  const STATUS_OPTIONS: { value: ProfileStatus | 'all'; label: string }[] = [
    { value: 'all',    label: '전체' },
    { value: '검토중', label: '검토중' },
    { value: '대기',   label: '대기' },
    { value: '확정',   label: '확정' },
    { value: '반려',   label: '반려' },
    { value: '취소',   label: '취소' },
  ];

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white px-5 py-4">
      {/* 이벤트 필터 */}
      {eventOptions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-400 w-10 shrink-0">회차</span>
          <button
            onClick={() => onEvent('all')}
            className={['rounded-full px-3 py-1 text-sm font-medium transition',
              eventFilter === 'all' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
            ].join(' ')}
          >전체</button>
          {eventOptions.map((ev) => (
            <button key={ev.id} onClick={() => onEvent(ev.id)}
              className={['rounded-full px-3 py-1 text-sm font-medium transition',
                eventFilter === ev.id ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
              ].join(' ')}
            >{ev.title}</button>
          ))}
        </div>
      )}

      {/* 상태 + 검색 */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-400 w-10 shrink-0">상태</span>
          {STATUS_OPTIONS.map((opt) => (
            <button key={opt.value} onClick={() => onStatus(opt.value)}
              className={['rounded-full px-3 py-1 text-sm font-medium transition',
                statusFilter === opt.value ? 'bg-cana text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
              ].join(' ')}
            >{opt.label}</button>
          ))}
          <span className="ml-1 text-sm text-gray-400">
            {filtered !== total ? `${filtered} / ${total}명` : `${total}명`}
          </span>
        </div>

        <div className="relative w-full sm:w-56">
          <svg className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-300"
            fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input type="text" placeholder="이름 검색" value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 py-1.5 pl-8 pr-3 text-sm outline-none focus:border-cana focus:ring-1 focus:ring-cana/20"
          />
        </div>
      </div>
    </div>
  );
}

// ─── 성별 테이블 ────────────────────────────────────────────────────────────────

function GenderTable({
  title, profiles, eventMap, onSelect,
}: {
  title: string;
  profiles: ApplicationWithProfile[];
  eventMap: Record<string, string>;
  onSelect: (p: ApplicationWithProfile) => void;
}) {
  const birthDisplay = (year: number) => {
    const y = year < 100 ? 1900 + year : year;
    return String(y).slice(2) + '년생';
  };

  return (
    <div className="flex flex-col">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-sm font-semibold text-gray-700">{title}</span>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-sm text-gray-500">{profiles.length}명</span>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-sm text-gray-400">
              <th className="px-4 py-3 text-left font-medium">이름</th>
              <th className="px-4 py-3 text-left font-medium">나이</th>
              <th className="px-4 py-3 text-left font-medium">직업 / 회사</th>
              <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">교회</th>
              <th className="hidden px-4 py-3 text-left font-medium md:table-cell">이벤트</th>
              <th className="px-4 py-3 text-left font-medium">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {profiles.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-sm text-gray-400">
                  조건에 맞는 신청자가 없어요.
                </td>
              </tr>
            ) : (
              profiles.map((app) => {
                const pr = app.profiles;
                return (
                  <tr key={app.id} onClick={() => onSelect(app)}
                    className="cursor-pointer transition hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">{pr.nickname}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{birthDisplay(pr.birth_year)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      <div>{pr.job}</div>
                      {pr.company_name && <div className="text-gray-400">{pr.company_name}</div>}
                    </td>
                    <td className="hidden px-4 py-3 text-sm text-gray-500 sm:table-cell">
                      {pr.church_name ?? '—'}
                    </td>
                    <td className="hidden px-4 py-3 text-sm text-gray-500 md:table-cell">
                      {app.event_id ? (eventMap[app.event_id] ?? '—') : '—'}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <StatusBadge status={app.status ?? '검토중'} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── 메인 대시보드 ─────────────────────────────────────────────────────────────

export default function AdminDashboard({
  profiles: initialProfiles,
  eventMap,
}: {
  profiles: ApplicationWithProfile[];
  eventMap: Record<string, string>;
}) {
  const [profiles, setProfiles] = useState<ApplicationWithProfile[]>(initialProfiles);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProfileStatus | 'all'>('all');
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [selected, setSelected] = useState<ApplicationWithProfile | null>(null);

  const eventOptions = useMemo(() => {
    const seen = new Set<string>();
    const ids: string[] = [];
    profiles.forEach((p) => { if (p.event_id && !seen.has(p.event_id)) { seen.add(p.event_id); ids.push(p.event_id); } });
    return ids.map((id) => ({ id, title: eventMap[id] ?? id }));
  }, [profiles, eventMap]);

  const filtered = useMemo(() => {
    return profiles.filter((p) => {
      const matchSearch = p.profiles.nickname.includes(search);
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchEvent  = eventFilter === 'all' || p.event_id === eventFilter;
      return matchSearch && matchStatus && matchEvent;
    });
  }, [profiles, search, statusFilter, eventFilter]);

  const males   = filtered.filter((p) => p.profiles.gender === 'male');
  const females = filtered.filter((p) => p.profiles.gender === 'female');

  const handleStatusChange = (id: string, status: ProfileStatus) => {
    setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  };

  return (
    <>
      <SharedFilterBar
        search={search} onSearch={setSearch}
        statusFilter={statusFilter} onStatus={setStatusFilter}
        eventFilter={eventFilter} onEvent={setEventFilter}
        eventOptions={eventOptions}
        total={profiles.length} filtered={filtered.length}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GenderTable title="남성" profiles={males} eventMap={eventMap} onSelect={setSelected} />
        <GenderTable title="여성" profiles={females} eventMap={eventMap} onSelect={setSelected} />
      </div>

      {selected && (
        <ProfileModal
          profile={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
          onUpdate={() => setSelected(null)}
        />
      )}
    </>
  );
}
