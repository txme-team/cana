'use client';

import { useEffect, useState, useMemo } from 'react';
import type { Profile } from '@/lib/types';
import AdminProfileDetail from './AdminProfileDetail';

interface ApplicationSummary {
  id: string;
  event_id: string;
  status: string;
  created_at: string;
}

interface MemberWithApplications extends Profile {
  applications: ApplicationSummary[];
}

// ─── 상태 스타일 ───────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, string> = {
  검토중: 'bg-gray-100 text-gray-500',
  대기:   'bg-amber-100 text-amber-700',
  확정:   'bg-cana/10 text-cana',
  반려:   'bg-red-50 text-red-500',
  취소:   'bg-gray-100 text-gray-400',
};

// ─── 회원 상세 모달 ────────────────────────────────────────────────────────────

function MemberModal({
  member,
  eventMap,
  onClose,
}: {
  member: MemberWithApplications;
  eventMap: Record<string, string>;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const birthYear = member.birth_year < 100 ? 1900 + member.birth_year : member.birth_year;
  const displayYear = String(birthYear).slice(2) + '년생';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 backdrop-blur-sm">
      <div className="relative my-6 w-full max-w-3xl rounded-2xl bg-white shadow-2xl mx-4">

        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <span className="text-sm font-semibold text-gray-900">{member.nickname}</span>
            <span className="ml-2 text-sm text-gray-400">
              {member.gender === 'male' ? '남' : '여'} · {displayYear} · {member.job ?? '—'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5" style={{ maxHeight: '80vh' }}>

          <AdminProfileDetail profile={member} />

          <div className="my-6 h-px bg-gray-100" />

          {/* 신청 이력 */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="shrink-0 text-[11px] font-semibold uppercase tracking-widest text-gray-400">신청 이력</span>
              <div className="h-px flex-1 bg-gray-100" />
              <span className="shrink-0 text-[11px] text-gray-400">{member.applications.length}건</span>
            </div>
            {member.applications.length === 0 ? (
              <p className="text-sm text-gray-300">신청 이력이 없어요.</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {member.applications.map((app) => (
                  <div key={app.id} className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-2.5">
                    <span className="text-sm text-gray-700">
                      {eventMap[app.event_id] ?? app.event_id}
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[app.status] ?? 'bg-gray-100 text-gray-500'}`}>
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── 메인 컴포넌트 ─────────────────────────────────────────────────────────────

export default function MembersPage({
  members: initialMembers,
  eventMap,
}: {
  members: MemberWithApplications[];
  eventMap: Record<string, string>;
}) {
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [selected, setSelected] = useState<MemberWithApplications | null>(null);

  const filtered = useMemo(() => {
    return initialMembers.filter((m) => {
      const matchSearch = m.nickname.includes(search);
      const matchGender = genderFilter === 'all' || m.gender === genderFilter;
      return matchSearch && matchGender;
    });
  }, [initialMembers, search, genderFilter]);

  const birthDisplay = (year: number) => {
    const y = year < 100 ? 1900 + year : year;
    return String(y).slice(2) + '년생';
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  };

  const males   = filtered.filter((m) => m.gender === 'male');
  const females = filtered.filter((m) => m.gender === 'female');

  return (
    <>
      {/* 필터 바 */}
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white px-5 py-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

          {/* 성별 필터 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400 w-10 shrink-0">성별</span>
            {([
              { value: 'all',    label: '전체' },
              { value: 'male',   label: '남성' },
              { value: 'female', label: '여성' },
            ] as const).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setGenderFilter(opt.value)}
                className={[
                  'rounded-full px-3 py-1 text-sm font-medium transition',
                  genderFilter === opt.value
                    ? 'bg-cana text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
                ].join(' ')}
              >
                {opt.label}
              </button>
            ))}
            <span className="ml-1 text-sm text-gray-400">
              {filtered.length !== initialMembers.length
                ? `${filtered.length} / ${initialMembers.length}명`
                : `${initialMembers.length}명`}
            </span>
          </div>

          {/* 검색 */}
          <div className="relative w-full sm:w-56">
            <svg className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-300"
              fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="이름 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-1.5 pl-8 pr-3 text-sm outline-none focus:border-cana focus:ring-1 focus:ring-cana/20"
            />
          </div>
        </div>
      </div>

      {/* 남녀 테이블 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[
          { title: '남성', data: males },
          { title: '여성', data: females },
        ].map(({ title, data }) => (
          <div key={title} className="flex flex-col">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">{title}</span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-sm text-gray-500">{data.length}명</span>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-sm text-gray-400">
                    <th className="px-4 py-3 text-left font-medium">이름</th>
                    <th className="px-4 py-3 text-left font-medium">나이</th>
                    <th className="px-4 py-3 text-left font-medium">직업 / 회사</th>
                    <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">교회</th>
                    <th className="px-4 py-3 text-left font-medium">신청</th>
                    <th className="hidden px-4 py-3 text-left font-medium md:table-cell">가입일</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-sm text-gray-400">
                        조건에 맞는 회원이 없어요.
                      </td>
                    </tr>
                  ) : (
                    data.map((m) => (
                      <tr
                        key={m.id}
                        onClick={() => setSelected(m)}
                        className="cursor-pointer transition hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 font-medium text-gray-800">{m.nickname}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{birthDisplay(m.birth_year)}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          <div>{m.job ?? '—'}</div>
                          {m.company_name && <div className="text-gray-400">{m.company_name}</div>}
                        </td>
                        <td className="hidden px-4 py-3 text-sm text-gray-500 sm:table-cell">
                          {m.church_name ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {m.applications.length > 0 ? (
                            <span className="rounded-full bg-cana/10 px-2 py-0.5 text-xs font-medium text-cana">
                              {m.applications.length}건
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="hidden px-4 py-3 text-sm text-gray-400 md:table-cell">
                          {formatDate(m.created_at)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* 상세 모달 */}
      {selected && (
        <MemberModal
          member={selected}
          eventMap={eventMap}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
