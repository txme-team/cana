'use client';

import { useState, useMemo } from 'react';
import type { ApplicationWithProfile, ProfileStatus } from '@/lib/types';
import FilterBar from './FilterBar';
import StatusBadge from './StatusBadge';
import ProfileModal from './ProfileModal';

export default function ProfileTable({
  title,
  initialProfiles,
  eventMap = {},
}: {
  title: string;
  initialProfiles: ApplicationWithProfile[];
  eventMap?: Record<string, string>;
}) {
  const [profiles, setProfiles] = useState<ApplicationWithProfile[]>(initialProfiles);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProfileStatus | 'all'>('all');
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [selected, setSelected] = useState<ApplicationWithProfile | null>(null);

  // 이 테이블에 존재하는 이벤트 목록만 추출
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

  const handleStatusChange = (id: string, status: ProfileStatus) => {
    setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  };

  const birthDisplay = (year: number) => {
    const y = year < 100 ? 1900 + year : year;
    return String(y).slice(2) + '년생';
  };

  return (
    <div className="flex flex-col">
      {/* 헤더 */}
      <div className="mb-3 flex items-center gap-2">
        <span className="text-sm font-semibold text-gray-700">{title}</span>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-sm text-gray-500">{profiles.length}명</span>
      </div>

      {/* 이벤트 필터 */}
      {eventOptions.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          <button
            onClick={() => setEventFilter('all')}
            className={[
              'rounded-full px-3 py-1 text-sm font-medium transition',
              eventFilter === 'all' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
            ].join(' ')}
          >
            전체 회차
          </button>
          {eventOptions.map((ev) => (
            <button
              key={ev.id}
              onClick={() => setEventFilter(ev.id)}
              className={[
                'rounded-full px-3 py-1 text-sm font-medium transition',
                eventFilter === ev.id ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
              ].join(' ')}
            >
              {ev.title}
            </button>
          ))}
        </div>
      )}

      {/* 상태 필터 + 검색 */}
      <FilterBar
        search={search}
        status={statusFilter}
        onSearch={setSearch}
        onStatus={setStatusFilter}
        total={profiles.length}
        filtered={filtered.length}
      />

      {/* 테이블 */}
      <div className="mt-4 overflow-hidden rounded-xl border border-gray-100 bg-white">
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
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm text-gray-400">
                  조건에 맞는 신청자가 없어요.
                </td>
              </tr>
            ) : (
              filtered.map((app) => {
                const pr = app.profiles;
                return (
                  <tr
                    key={app.id}
                    onClick={() => setSelected(app)}
                    className="cursor-pointer transition hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-800">{pr.nickname}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {birthDisplay(pr.birth_year)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      <div>{pr.job}</div>
                      {pr.company_name && (
                        <div className="text-gray-400">{pr.company_name}</div>
                      )}
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

      {selected && (
        <ProfileModal
          profile={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
