'use client';

import { useEffect, useState } from 'react';

// ─── 타입 ──────────────────────────────────────────────────────────────────────

interface Participant {
  id: string;
  nickname: string;
  gender: 'male' | 'female';
  birth_year: number;
  company_name?: string;
  workplace?: string;
  church_name?: string;
}

export interface EventDetailEvent {
  id: string;
  title: string;
  event_date: string;
  location: string;
  venue_detail?: string;
  capacity: number;
  is_active: boolean;
  age_range_male?: string;
  age_range_female?: string;
  birth_year_min_male?: number | null;
  birth_year_max_male?: number | null;
  birth_year_min_female?: number | null;
  birth_year_max_female?: number | null;
}

interface DetailData {
  event: EventDetailEvent;
  participants: Participant[];
}

// ─── 헬퍼 ──────────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const hour = d.getHours();
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]}) ${hour < 12 ? '오전' : '오후'} ${hour > 12 ? hour - 12 : hour || 12}시`;
}

function getDuplicates(items: Participant[], field: keyof Participant): Set<string> {
  const counts: Record<string, number> = {};
  items.forEach((p) => {
    const val = p[field] as string | undefined;
    if (val) counts[val] = (counts[val] ?? 0) + 1;
  });
  return new Set(Object.entries(counts).filter(([, c]) => c > 1).map(([k]) => k));
}

// ─── 참여자 테이블 ─────────────────────────────────────────────────────────────

function ParticipantSection({
  title,
  accentClass,
  participants,
  dupCompanies,
  dupChurches,
}: {
  title: string;
  accentClass: string;
  participants: Participant[];
  dupCompanies: Set<string>;
  dupChurches: Set<string>;
}) {
  return (
    <div className="px-6 py-5">
      <h3 className={`mb-3 text-sm font-semibold ${accentClass}`}>
        {title}
        <span className="ml-2 text-xs font-normal text-gray-400">{participants.length}명</span>
      </h3>

      {participants.length === 0 ? (
        <p className="text-xs text-gray-400">확정된 참여자가 없어요.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-100">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-400">
                <th className="px-3 py-2 text-left font-medium">이름</th>
                <th className="px-3 py-2 text-left font-medium">출생연도</th>
                <th className="px-3 py-2 text-left font-medium">직장</th>
                <th className="px-3 py-2 text-left font-medium">교회</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {participants.map((p) => {
                const hasDupCompany = !!(p.company_name && dupCompanies.has(p.company_name));
                const hasDupChurch = !!(p.church_name && dupChurches.has(p.church_name));
                return (
                  <tr key={p.id} className="hover:bg-gray-50/80">
                    <td className="px-3 py-2.5 font-medium text-gray-800">{p.nickname}</td>
                    <td className="px-3 py-2.5 text-gray-500">{p.birth_year}</td>
                    <td className={`px-3 py-2.5 ${hasDupCompany ? 'font-medium text-amber-600' : 'text-gray-500'}`}>
                      <span className="flex items-center gap-1">
                        {p.company_name || '-'}
                        {hasDupCompany && (
                          <svg className="h-3 w-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                          </svg>
                        )}
                      </span>
                    </td>
                    <td className={`px-3 py-2.5 ${hasDupChurch ? 'font-medium text-amber-600' : 'text-gray-500'}`}>
                      <span className="flex items-center gap-1">
                        {p.church_name || '-'}
                        {hasDupChurch && (
                          <svg className="h-3 w-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                          </svg>
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── 메인 컴포넌트 ─────────────────────────────────────────────────────────────

interface Props {
  eventId: string;
  onClose: () => void;
  onEdit: (event: EventDetailEvent) => void;
  onRefresh: () => void;
}

export default function EventDetail({ eventId, onClose, onEdit, onRefresh }: Props) {
  const [data, setData] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [venueDetail, setVenueDetail] = useState('');
  const [savingVenue, setSavingVenue] = useState(false);
  const [venueSaved, setVenueSaved] = useState(false);

  const load = () => {
    setLoading(true);
    fetch(`/api/admin/events/${eventId}`)
      .then((r) => r.json())
      .then((d: DetailData) => {
        setData(d);
        setVenueDetail(d.event.venue_detail ?? '');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [eventId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSaveVenue = async () => {
    setSavingVenue(true);
    try {
      await fetch(`/api/admin/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ venue_detail: venueDetail }),
      });
      setVenueSaved(true);
      setTimeout(() => setVenueSaved(false), 2000);
      onRefresh();
    } finally {
      setSavingVenue(false);
    }
  };

  const males = data?.participants.filter((p) => p.gender === 'male') ?? [];
  const females = data?.participants.filter((p) => p.gender === 'female') ?? [];
  const totalConfirmed = males.length + females.length;
  const capacity = data?.event.capacity ?? 0;
  const fillPct = capacity > 0 ? Math.min(100, Math.round((totalConfirmed / capacity) * 100)) : 0;

  const maleDupCompanies = getDuplicates(males, 'company_name');
  const maleDupChurches = getDuplicates(males, 'church_name');
  const femaleDupCompanies = getDuplicates(females, 'company_name');
  const femaleDupChurches = getDuplicates(females, 'church_name');

  const hasDuplicates =
    maleDupCompanies.size > 0 ||
    maleDupChurches.size > 0 ||
    femaleDupCompanies.size > 0 ||
    femaleDupChurches.size > 0;

  return (
    <>
      {/* 백드롭 */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* 드로어 */}
      <div className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-[520px] flex-col bg-white shadow-2xl">
        {/* 헤더 */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={onClose}
              className="flex-shrink-0 rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="truncate text-base font-semibold text-gray-800">
              {loading ? '불러오는 중...' : (data?.event.title ?? '')}
            </h2>
          </div>
          {data && (
            <button
              onClick={() => onEdit(data.event)}
              className="ml-3 flex-shrink-0 rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
            >
              이벤트 수정
            </button>
          )}
        </div>

        {/* 본문 */}
        {loading ? (
          <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
            불러오는 중...
          </div>
        ) : !data ? (
          <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
            데이터를 불러올 수 없어요.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">

            {/* 이벤트 기본 정보 */}
            <div className="border-b border-gray-100 px-6 py-5">
              <div className="mb-4 space-y-1 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <svg className="h-4 w-4 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  {formatDate(data.event.event_date)}
                </p>
                <p className="flex items-center gap-2">
                  <svg className="h-4 w-4 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-9.5 11.25S.5 17.642.5 10.5a9 9 0 1119 0z" />
                  </svg>
                  {data.event.location}
                </p>
              </div>

              {/* 상세 장소 */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500">상세 장소</label>
                <div className="flex gap-2">
                  <input
                    value={venueDetail}
                    onChange={(e) => setVenueDetail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveVenue()}
                    placeholder="예: 강남구 OO빌딩 3층 룸 A"
                    className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-cana focus:ring-1 focus:ring-cana/20"
                  />
                  <button
                    onClick={handleSaveVenue}
                    disabled={savingVenue}
                    className={`flex-shrink-0 rounded-xl px-4 py-2 text-sm font-medium text-white transition disabled:opacity-50 ${
                      venueSaved ? 'bg-green-500' : 'bg-cana hover:bg-cana-dark'
                    }`}
                  >
                    {venueSaved ? '저장됨 ✓' : savingVenue ? '...' : '저장'}
                  </button>
                </div>
              </div>
            </div>

            {/* 확정 인원 요약 */}
            <div className="border-b border-gray-100 px-6 py-5">
              <div className="mb-3 flex gap-3">
                <div className="flex-1 rounded-xl bg-blue-50 px-4 py-3">
                  <p className="text-xs text-blue-500">남성 확정자</p>
                  <p className="mt-0.5 text-xl font-bold text-blue-700">
                    {males.length}
                    <span className="ml-1 text-sm font-normal">명</span>
                  </p>
                </div>
                <div className="flex-1 rounded-xl bg-pink-50 px-4 py-3">
                  <p className="text-xs text-pink-500">여성 확정자</p>
                  <p className="mt-0.5 text-xl font-bold text-pink-700">
                    {females.length}
                    <span className="ml-1 text-sm font-normal">명</span>
                  </p>
                </div>
                <div className="flex-1 rounded-xl bg-gray-50 px-4 py-3">
                  <p className="text-xs text-gray-500">총 / 정원</p>
                  <p className="mt-0.5 text-xl font-bold text-gray-700">
                    {totalConfirmed}
                    <span className="text-sm font-normal text-gray-400"> / {capacity}</span>
                  </p>
                </div>
              </div>

              {/* 진행률 바 */}
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-gray-400">
                  <span>정원 충족률</span>
                  <span className={fillPct >= 100 ? 'font-medium text-red-500' : ''}>{fillPct}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full transition-all ${fillPct >= 100 ? 'bg-red-400' : 'bg-cana'}`}
                    style={{ width: `${fillPct}%` }}
                  />
                </div>
              </div>

              {/* 중복 경고 */}
              {hasDuplicates && (
                <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2.5">
                  <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs text-amber-700">
                    동일 직장 또는 교회 출신 참여자가 있어요. 주황색 표시를 확인해 주세요.
                  </p>
                </div>
              )}
            </div>

            {/* 남성 참여자 */}
            <div className="border-b border-gray-100">
              <ParticipantSection
                title="남성 확정자"
                accentClass="text-blue-700"
                participants={males}
                dupCompanies={maleDupCompanies}
                dupChurches={maleDupChurches}
              />
            </div>

            {/* 여성 참여자 */}
            <ParticipantSection
              title="여성 확정자"
              accentClass="text-pink-700"
              participants={females}
              dupCompanies={femaleDupCompanies}
              dupChurches={femaleDupChurches}
            />
          </div>
        )}
      </div>
    </>
  );
}
