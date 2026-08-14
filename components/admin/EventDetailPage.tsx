'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { ApplicationWithProfile } from '@/lib/types';
import ProfileModal from './ProfileModal';

// ─── 타입 ──────────────────────────────────────────────────────────────────────

type Participant = ApplicationWithProfile;

interface EventData {
  id: string;
  title: string;
  event_date: string;
  location: string;
  venue_name?: string;
  venue_url?: string;
  venue_detail?: string;
  capacity: number;
  price?: number | null;
  is_active: boolean;
  cancelled_at?: string | null;
  age_range_male?: string;
  age_range_female?: string;
  birth_year_min_male?: number | null;
  birth_year_max_male?: number | null;
  birth_year_min_female?: number | null;
  birth_year_max_female?: number | null;
}

interface DetailData {
  event: EventData;
  participants: Participant[];
  waitlist: Participant[];
}

const EMPTY_FORM = {
  title: '',
  event_date: '',
  location: '',
  venue_detail: '',
  capacity: 20,
  price: '',
  is_active: true,
  birth_year_min_male: '',
  birth_year_max_male: '',
  birth_year_min_female: '',
  birth_year_max_female: '',
};

// ─── 헬퍼 ──────────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const hour = d.getHours();
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]}) ${hour < 12 ? '오전' : '오후'} ${hour > 12 ? hour - 12 : hour || 12}시`;
}

function toISO(local: string) {
  if (!local) return '';
  return new Date(local).toISOString();
}

function toLocal(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toYearOrNull(v: string): number | null {
  const n = parseInt(v, 10);
  return isNaN(n) ? null : n;
}

function formatAgeRange(min: number | null | undefined, max: number | null | undefined): string {
  if (!min && !max) return '-';
  const minStr = min ? String(min).slice(-2) : '?';
  const maxStr = max ? String(max).slice(-2) : '?';
  return `${minStr}~${maxStr}년생`;
}

function getDuplicates(items: Participant[], field: keyof Participant['profiles']): Set<string> {
  const counts: Record<string, number> = {};
  items.forEach((p) => {
    const val = p.profiles[field] as string | undefined;
    if (val) counts[val] = (counts[val] ?? 0) + 1;
  });
  return new Set(Object.entries(counts).filter(([, c]) => c > 1).map(([k]) => k));
}

// 두 그룹(남/여) 간 공통 값 반환
function getCrossGenderOverlap(a: Participant[], b: Participant[], field: keyof Participant['profiles']): Set<string> {
  const setA = new Set(a.map((p) => p.profiles[field] as string | undefined).filter(Boolean) as string[]);
  const result = new Set<string>();
  b.forEach((p) => {
    const val = p.profiles[field] as string | undefined;
    if (val && setA.has(val)) result.add(val);
  });
  return result;
}

// ─── 참여자 테이블 ─────────────────────────────────────────────────────────────

function WarnIcon() {
  return (
    <svg className="h-3.5 w-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
  );
}

function CrossIcon() {
  // 남녀 교차 겹침 표시 — 파란색 계열
  return (
    <svg className="h-3.5 w-3.5 flex-shrink-0 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
    </svg>
  );
}

function ParticipantTable({
  title,
  accentBg,
  accentText,
  participants,
  dupCompanies,
  dupChurches,
  crossCompanies,
  crossChurches,
  onRowClick,
}: {
  title: string;
  accentBg: string;
  accentText: string;
  participants: Participant[];
  dupCompanies: Set<string>;
  dupChurches: Set<string>;
  crossCompanies: Set<string>;
  crossChurches: Set<string>;
  onRowClick: (p: Participant) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className={`flex items-center justify-between rounded-xl px-4 py-3 ${accentBg}`}>
        <span className={`text-base font-semibold ${accentText}`}>{title}</span>
        <span className={`text-xl font-bold ${accentText}`}>
          {participants.length}
          <span className="ml-1 text-base font-normal">명</span>
        </span>
      </div>

      {participants.length === 0 ? (
        <p className="px-1 text-base text-gray-400">확정된 참여자가 없어요.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-400">
                <th className="px-3 py-2.5 text-left font-medium w-20">이름</th>
                <th className="px-3 py-2.5 text-left font-medium w-14">나이</th>
                <th className="px-3 py-2.5 text-left font-medium w-36">연락처</th>
                <th className="px-3 py-2.5 text-left font-medium w-4">MBTI</th>
                <th className="px-3 py-2.5 text-left font-medium w-36">직업 / 직장</th>
                <th className="px-3 py-2.5 text-left font-medium w-24">교회</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {participants.map((p) => {
                const pr = p.profiles;
                const hasDupCompany = !!(pr.company_name && dupCompanies.has(pr.company_name));
                const hasDupChurch = !!(pr.church_name && dupChurches.has(pr.church_name));
                const hasCrossCompany = !!(pr.company_name && crossCompanies.has(pr.company_name));
                const hasCrossChurch = !!(pr.church_name && crossChurches.has(pr.church_name));
                const companyColor = hasDupCompany ? 'text-amber-600 font-medium' : hasCrossCompany ? 'text-blue-500 font-medium' : 'text-gray-400';
                return (
                  <tr
                    key={p.id}
                    className="cursor-pointer hover:bg-gray-50/80 transition"
                    onClick={() => onRowClick(p)}
                  >
                    <td className="px-3 py-3 font-medium text-gray-800">{pr.nickname}</td>
                    <td className="px-3 py-3 text-gray-500">{pr.birth_year ? `${2026 - pr.birth_year}세` : '-'}</td>
                    <td className="px-3 py-3 text-gray-500">{pr.phone || '-'}</td>
                    <td className="px-3 py-3 text-gray-500">{pr.mbti || '-'}</td>
                    <td className="px-3 py-3">
                      <div className="text-gray-700">{pr.job || '-'}</div>
                      <div className={`flex items-center gap-1 text-xs mt-0.5 ${companyColor}`}>
                        {pr.company_name || '-'}
                        {hasDupCompany && <WarnIcon />}
                        {!hasDupCompany && hasCrossCompany && <CrossIcon />}
                      </div>
                    </td>
                    <td className={`px-3 py-3 ${hasDupChurch ? 'font-medium text-amber-600' : hasCrossChurch ? 'font-medium text-blue-500' : 'text-gray-500'}`}>
                      <span className="flex items-center gap-1">
                        {pr.church_name || '-'}
                        {hasDupChurch && <WarnIcon />}
                        {!hasDupChurch && hasCrossChurch && <CrossIcon />}
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

export default function EventDetailPage({ eventId }: { eventId: string }) {
  const [data, setData] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(true);

  // 참여자 프로필 팝업
  const [selectedProfile, setSelectedProfile] = useState<Participant | null>(null);

  // 상세 장소 인라인 편집
  const [venueName, setVenueName] = useState('');
  const [venueUrl, setVenueUrl] = useState('');
  const [venueEditing, setVenueEditing] = useState(false);
  const [savingVenue, setSavingVenue] = useState(false);

  // 장소 확정 문자 발송 모달
  const [venueNotifyModal, setVenueNotifyModal] = useState(false);
  const [sendingNotify, setSendingNotify] = useState(false);
  const [notifyResult, setNotifyResult] = useState<{ sent: number } | null>(null);

  // 이벤트 수정 모달
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // 이벤트 취소 모달
  // 프로필카드 URL 생성
  const [cardGenerating, setCardGenerating] = useState(false);
  const [cardTokens, setCardTokens] = useState<{ male: string; female: string } | null>(null);
  const [cardUrlsOpen, setCardUrlsOpen] = useState(false);

  const [cancelModal, setCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelResult, setCancelResult] = useState<{ affected: number; refunded: number; smsSent: number; refundErrors: string[] } | null>(null);
  const [cancelError, setCancelError] = useState('');

  const load = () => {
    setLoading(true);
    fetch(`/api/admin/events/${eventId}`)
      .then((r) => r.json())
      .then((d: DetailData | { error: string }) => {
        if (!d || 'error' in d || !d.event) return;
        setData(d);
        setVenueName(d.event.venue_name ?? '');
        setVenueUrl(d.event.venue_url ?? '');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [eventId]); // eslint-disable-line react-hooks/exhaustive-deps

  const openEdit = () => {
    if (!data) return;
    const ev = data.event;
    setForm({
      title: ev.title,
      event_date: toLocal(ev.event_date),
      location: ev.location,
      venue_detail: ev.venue_detail ?? '',
      capacity: ev.capacity,
      price: typeof ev.price === 'number' ? String(ev.price) : '',
      is_active: ev.is_active,
      birth_year_min_male: ev.birth_year_min_male ? String(ev.birth_year_min_male) : '',
      birth_year_max_male: ev.birth_year_max_male ? String(ev.birth_year_max_male) : '',
      birth_year_min_female: ev.birth_year_min_female ? String(ev.birth_year_min_female) : '',
      birth_year_max_female: ev.birth_year_max_female ? String(ev.birth_year_max_female) : '',
    });
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.event_date || !form.location) return;
    setSaving(true);
    try {
      const minMale = toYearOrNull(form.birth_year_min_male);
      const maxMale = toYearOrNull(form.birth_year_max_male);
      const minFemale = toYearOrNull(form.birth_year_min_female);
      const maxFemale = toYearOrNull(form.birth_year_max_female);
      await fetch('/api/admin/events', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: eventId,
          title: form.title,
          event_date: toISO(form.event_date),
          location: form.location,
          venue_detail: form.venue_detail || null,
          capacity: form.capacity,
          price: form.price ? Number(form.price) : null,
          is_active: form.is_active,
          birth_year_min_male: minMale,
          birth_year_max_male: maxMale,
          birth_year_min_female: minFemale,
          birth_year_max_female: maxFemale,
          age_range_male: formatAgeRange(minMale, maxMale),
          age_range_female: formatAgeRange(minFemale, maxFemale),
        }),
      });
      setEditOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleSaveVenue = async () => {
    setSavingVenue(true);
    try {
      await fetch(`/api/admin/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venue_name: venueName || null,
          venue_url: venueUrl || null,
        }),
      });
      setVenueEditing(false);
      load();
    } finally {
      setSavingVenue(false);
    }
  };

  const handleSendVenueNotify = async () => {
    setSendingNotify(true);
    try {
      const res = await fetch(`/api/admin/events/${eventId}/notify-venue`, { method: 'POST' });
      const json = await res.json() as { ok?: boolean; sent?: number; error?: string };
      if (!res.ok) throw new Error(json.error ?? '발송 실패');
      setNotifyResult({ sent: json.sent ?? 0 });
    } catch (err) {
      alert((err as Error).message);
      setVenueNotifyModal(false);
    } finally {
      setSendingNotify(false);
    }
  };

  const handleToggleActive = async () => {
    if (!data) return;
    await fetch('/api/admin/events', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: eventId, is_active: !data.event.is_active }),
    });
    load();
  };

  // ── 이벤트 전체 취소 ─────────────────────────────────────────────────────────
  const handleCancelEvent = async () => {
    setCancelling(true);
    setCancelError('');
    try {
      const res = await fetch(`/api/admin/events/${eventId}/cancel`, { method: 'PATCH' });
      const json = await res.json() as {
        ok?: boolean; affected?: number; refunded?: number; smsSent?: number;
        refundErrors?: string[]; error?: string;
      };
      if (!res.ok) throw new Error(json.error ?? '취소 처리에 실패했어요.');
      setCancelResult({
        affected: json.affected ?? 0,
        refunded: json.refunded ?? 0,
        smsSent: json.smsSent ?? 0,
        refundErrors: json.refundErrors ?? [],
      });
      load();
    } catch (err) {
      setCancelError((err as Error).message);
    } finally {
      setCancelling(false);
    }
  };

  const males = (data?.participants ?? []).filter((p) => p.profiles.gender === 'male');
  const females = (data?.participants ?? []).filter((p) => p.profiles.gender === 'female');
  const waitlist = data?.waitlist ?? [];
  const waitlistMales = waitlist.filter((p) => p.profiles.gender === 'male');
  const waitlistFemales = waitlist.filter((p) => p.profiles.gender === 'female');

  const maleDupCompanies = getDuplicates(males, 'company_name');
  const maleDupChurches = getDuplicates(males, 'church_name');
  const femaleDupCompanies = getDuplicates(females, 'company_name');
  const femaleDupChurches = getDuplicates(females, 'church_name');
  const crossCompanies = getCrossGenderOverlap(males, females, 'company_name');
  const crossChurches = getCrossGenderOverlap(males, females, 'church_name');
  const hasDuplicates =
    maleDupCompanies.size > 0 || maleDupChurches.size > 0 ||
    femaleDupCompanies.size > 0 || femaleDupChurches.size > 0 ||
    crossCompanies.size > 0 || crossChurches.size > 0;

  return (
    <main className="px-6 py-8">
      {/* ── 헤더 ── */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/rotation/admin/events"
            className="flex flex-shrink-0 items-center gap-1.5 text-base text-gray-400 transition hover:text-gray-600"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            이벤트 목록
          </Link>
          <span className="text-gray-200">/</span>
          <h1 className="truncate text-lg font-semibold text-gray-900">
            {loading ? '...' : (data?.event.title ?? '')}
          </h1>
          {data && (
            <span className={`flex-shrink-0 rounded-xl px-2.5 py-1 text-sm font-medium ${
              data.event.cancelled_at
                ? 'bg-red-50 text-red-500'
                : data.event.is_active ? 'bg-cana/10 text-cana' : 'bg-gray-100 text-gray-400'
            }`}>
              {data.event.cancelled_at ? '취소됨' : data.event.is_active ? '모집중' : '마감'}
            </span>
          )}
        </div>
        {data && !data.event.cancelled_at && (
          <div className="flex flex-shrink-0 items-center gap-2">
            <button
              onClick={handleToggleActive}
              className={`rounded-xl border px-4 py-2 text-base font-medium transition ${
                data.event.is_active
                  ? 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  : 'border-cana/30 bg-cana/5 text-cana hover:bg-cana/10'
              }`}
            >
              {data.event.is_active ? '마감 처리' : '모집 재개'}
            </button>
            <button
              onClick={() => { setCancelModal(true); setCancelResult(null); setCancelError(''); }}
              className="rounded-xl border border-red-200 px-4 py-2 text-base font-medium text-red-500 transition hover:bg-red-50"
            >
              이벤트 취소
            </button>
          </div>
        )}
      </div>

      {data?.event.cancelled_at && (
        <div className="mb-6 rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-600">
          이 소개팅은 {new Date(data.event.cancelled_at).toLocaleString('ko-KR')}에 취소 처리되었어요.
          신청자 전원이 &apos;취소&apos; 상태로 변경되고, 결제건은 환불 처리됐어요.
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-base text-gray-400">
          불러오는 중...
        </div>
      ) : !data ? (
        <div className="flex items-center justify-center py-20 text-base text-gray-400">
          데이터를 불러올 수 없어요.
        </div>
      ) : (
        <div className="flex flex-col gap-6">

          {/* ── 이벤트 정보 + 상세 장소 ── */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* 기본 정보 */}
              <div className="space-y-2">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-gray-700">이벤트 정보</h2>
                  <button
                    onClick={openEdit}
                    className="rounded-xl border border-gray-200 px-3 py-1.5 text-sm text-gray-500 transition hover:bg-gray-50 hover:text-gray-700"
                  >
                    수정
                  </button>
                </div>
                <InfoRow
                  icon={
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  }
                  label={formatDate(data.event.event_date)}
                />
                <InfoRow
                  icon={
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-9.5 11.25S.5 17.642.5 10.5a9 9 0 1119 0z" />
                    </svg>
                  }
                  label={data.event.location}
                />
                <InfoRow
                  icon={
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                  }
                  label={`정원 ${data.event.capacity}명`}
                />
                {typeof data.event.price === 'number' && (
                  <InfoRow
                    icon={
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    }
                    label={`참가비 ${data.event.price.toLocaleString('ko-KR')}원 (기본가 적용 안 함)`}
                  />
                )}
                <div className="flex gap-2 pt-1">
                  {(data.event.birth_year_min_male || data.event.birth_year_max_male) && (
                    <span className="rounded-xl bg-blue-50 px-2.5 py-1 text-sm text-blue-600">
                      남 {formatAgeRange(data.event.birth_year_min_male, data.event.birth_year_max_male)}
                    </span>
                  )}
                  {(data.event.birth_year_min_female || data.event.birth_year_max_female) && (
                    <span className="rounded-xl bg-pink-50 px-2.5 py-1 text-sm text-pink-600">
                      여 {formatAgeRange(data.event.birth_year_min_female, data.event.birth_year_max_female)}
                    </span>
                  )}
                </div>
              </div>

              {/* 상세 장소 */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-gray-700">상세 장소</h2>
                  {!venueEditing && (
                    <button
                      onClick={() => setVenueEditing(true)}
                      className="rounded-xl border border-gray-200 px-3 py-1.5 text-sm text-gray-500 transition hover:bg-gray-50 hover:text-gray-700"
                    >
                      수정
                    </button>
                  )}
                </div>

                {venueEditing ? (
                  /* 편집 모드 */
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="mb-1.5 block text-sm text-gray-500">장소명</label>
                      <input
                        value={venueName}
                        onChange={(e) => setVenueName(e.target.value)}
                        placeholder="예: 카나 카페"
                        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-cana focus:ring-1 focus:ring-cana/20"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm text-gray-500">장소 URL</label>
                      <input
                        value={venueUrl}
                        onChange={(e) => setVenueUrl(e.target.value)}
                        placeholder="예: https://naver.me/xxxx"
                        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-cana focus:ring-1 focus:ring-cana/20"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setVenueName(data.event.venue_name ?? '');
                          setVenueUrl(data.event.venue_url ?? '');
                          setVenueEditing(false);
                        }}
                        className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm text-gray-600 transition hover:bg-gray-50"
                      >
                        취소
                      </button>
                      <button
                        onClick={handleSaveVenue}
                        disabled={savingVenue}
                        className="flex-1 rounded-xl bg-cana py-2.5 text-sm font-medium text-white transition hover:bg-cana-dark disabled:opacity-50"
                      >
                        {savingVenue ? '저장 중...' : '저장'}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* 읽기 모드 */
                  <div className="space-y-2">
                    {data.event.venue_name ? (
                      <InfoRow
                        icon={
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                          </svg>
                        }
                        label={data.event.venue_name}
                      />
                    ) : null}
                    {data.event.venue_url ? (
                      <div className="flex items-center gap-2 text-base text-gray-600">
                        <span className="flex-shrink-0 text-gray-400">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                          </svg>
                        </span>
                        <a
                          href={data.event.venue_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate text-cana underline underline-offset-2 hover:text-cana-dark"
                        >
                          {data.event.venue_url}
                        </a>
                      </div>
                    ) : null}
                    {!data.event.venue_name && !data.event.venue_url && (
                      <p className="text-sm text-gray-400">아직 입력된 장소 정보가 없어요.</p>
                    )}

                    {/* 장소 확정 문자 발송 버튼 */}
                    {data.event.venue_name && (
                      <div className="pt-2">
                        <button
                          onClick={() => { setNotifyResult(null); setVenueNotifyModal(true); }}
                          className="flex items-center gap-1.5 rounded-xl border border-cana/30 bg-cana/5 px-3 py-2 text-sm font-medium text-cana transition hover:bg-cana/10"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                          </svg>
                          장소 확정 문자 발송
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── 확정 인원 현황 ── */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-gray-700">확정 인원 현황</h2>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={`/rotation/admin/profile-card-preview/${eventId}/male`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs text-gray-500 transition hover:border-cana/40 hover:text-cana"
                >
                  남자 프로필카드
                </a>
                <a
                  href={`/rotation/admin/profile-card-preview/${eventId}/female`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs text-gray-500 transition hover:border-cana/40 hover:text-cana"
                >
                  여자 프로필카드
                </a>
                <button
                  onClick={async () => {
                    setCardGenerating(true);
                    try {
                      const res = await fetch('/api/admin/profile-cards', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ eventId }),
                      });
                      const json = await res.json();
                      if (json.card_token_male && json.card_token_female) {
                        setCardTokens({ male: json.card_token_male, female: json.card_token_female });
                      }
                      setCardUrlsOpen(true);
                    } finally {
                      setCardGenerating(false);
                    }
                  }}
                  disabled={cardGenerating}
                  className="rounded-lg border border-cana/40 bg-cana/5 px-2.5 py-1 text-xs font-medium text-cana transition hover:bg-cana/10 disabled:opacity-40"
                >
                  {cardGenerating ? 'URL 생성 중...' : '카드 URL 생성'}
                </button>
              </div>
            </div>

            {/* 중복 경고 */}
            {hasDuplicates && (
              <div className="mb-4 flex flex-col gap-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
                <div className="flex items-start gap-2">
                  <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  <p className="text-base text-amber-700">겹치는 직장 또는 교회가 있어요.</p>
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-1 pl-6 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><span className="font-medium text-amber-600">주황색 ▲</span> 동성 내 겹침</span>
                  <span className="flex items-center gap-1"><span className="font-medium text-blue-500">파란색 ●</span> 남녀 간 겹침</span>
                </div>
              </div>
            )}

            {/* 참여자 명단 */}
            <div className="grid grid-cols-2 gap-6">
              <ParticipantTable
                title="남성 확정자"
                accentBg="bg-blue-50"
                accentText="text-blue-700"
                participants={males}
                dupCompanies={maleDupCompanies}
                dupChurches={maleDupChurches}
                crossCompanies={crossCompanies}
                crossChurches={crossChurches}
                onRowClick={setSelectedProfile}
              />
              <ParticipantTable
                title="여성 확정자"
                accentBg="bg-pink-50"
                accentText="text-pink-700"
                participants={females}
                dupCompanies={femaleDupCompanies}
                dupChurches={femaleDupChurches}
                crossCompanies={crossCompanies}
                crossChurches={crossChurches}
                onRowClick={setSelectedProfile}
              />
            </div>
          </div>

          {/* ── 대기 인원 ── */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6">
            <h2 className="mb-4 text-base font-semibold text-gray-700">
              대기 인원
              <span className="ml-2 text-base font-normal text-gray-400">{waitlist.length}명</span>
            </h2>

            {waitlist.length === 0 ? (
              <p className="text-sm text-gray-400">대기 중인 신청자가 없어요.</p>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 text-sm text-gray-400">
                      <th className="px-4 py-2.5 text-left font-medium">이름</th>
                      <th className="px-4 py-2.5 text-left font-medium">성별</th>
                      <th className="px-4 py-2.5 text-left font-medium">출생연도</th>
                      <th className="px-4 py-2.5 text-left font-medium">직장</th>
                      <th className="px-4 py-2.5 text-left font-medium">교회</th>
                      <th className="px-4 py-2.5 text-left font-medium">상태</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {waitlist.map((p) => (
                      <tr
                        key={p.id}
                        className="cursor-pointer transition hover:bg-gray-50/80"
                        onClick={() => setSelectedProfile(p)}
                      >
                        <td className="px-4 py-3 font-medium text-gray-800">{p.profiles.nickname}</td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-medium ${p.profiles.gender === 'male' ? 'text-blue-600' : 'text-pink-600'}`}>
                            {p.profiles.gender === 'male' ? '남' : '여'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{p.profiles.birth_year}</td>
                        <td className="px-4 py-3 text-gray-500">{p.profiles.company_name || '-'}</td>
                        <td className="px-4 py-3 text-gray-500">{p.profiles.church_name || '-'}</td>
                        <td className="px-4 py-3">
                          <WaitlistStatusBadge status={p.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="border-t border-gray-50 px-4 py-2.5 text-sm text-gray-400">
                  남 {waitlistMales.length}명 · 여 {waitlistFemales.length}명
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 참여자 프로필 팝업 ── */}
      {selectedProfile && (
        <ProfileModal
          profile={selectedProfile}
          eventDate={data?.event.event_date}
          onClose={() => setSelectedProfile(null)}
          onStatusChange={(id, status) => {
            setSelectedProfile((prev) =>
              prev && prev.id === id ? { ...prev, status } : prev
            );
          }}
          onUpdate={() => {
            setSelectedProfile(null);
            load();
          }}
        />
      )}

      {/* ── 프로필카드 URL 모달 ── */}
      {cardUrlsOpen && cardTokens && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setCardUrlsOpen(false)}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-base font-semibold text-gray-800">프로필카드 URL</h3>
            <p className="mb-4 text-sm text-gray-500">
              남자 카드 URL → 여자 참가자에게, 여자 카드 URL → 남자 참가자에게 발송하세요.
            </p>
            <div className="flex flex-col gap-3">
              {([
                { label: '남자 프로필카드', sublabel: '(여성 참가자에게 발송)', token: cardTokens.male, color: 'bg-blue-400' },
                { label: '여자 프로필카드', sublabel: '(남성 참가자에게 발송)', token: cardTokens.female, color: 'bg-pink-400' },
              ]).map(({ label, sublabel, token, color }) => {
                const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cana.im';
                const url = `${siteUrl}/rotation/profile-card/event/${token}`;
                return (
                  <div key={token} className="rounded-xl bg-gray-50 px-4 py-3">
                    <div className="mb-2 flex items-center gap-2">
                      <span className={`h-3 w-3 rounded-full ${color}`} />
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                      <span className="text-xs text-gray-400">{sublabel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        readOnly
                        value={url}
                        className="min-w-0 flex-1 rounded-lg bg-white px-3 py-2 text-xs text-gray-500 outline-none"
                        onFocus={(e) => e.target.select()}
                      />
                      <button
                        onClick={() => navigator.clipboard.writeText(url)}
                        className="flex-shrink-0 rounded-lg bg-cana/10 px-3 py-2 text-xs font-medium text-cana transition hover:bg-cana/20"
                      >
                        복사
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => setCardUrlsOpen(false)}
              className="mt-4 w-full rounded-xl border border-gray-200 py-2.5 text-sm text-gray-600 transition hover:bg-gray-50"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* ── 장소 확정 문자 발송 확인 모달 ── */}
      {venueNotifyModal && data && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => { if (!sendingNotify) setVenueNotifyModal(false); }}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {notifyResult ? (
              /* 발송 완료 */
              <div className="flex flex-col items-center gap-4 py-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cana/10">
                  <svg className="h-6 w-6 text-cana" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-800">발송 완료</p>
                  <p className="mt-1 text-sm text-gray-500">
                    확정 참여자 <span className="font-medium text-gray-700">{notifyResult.sent}명</span>에게 장소 확정 문자를 발송했어요.
                  </p>
                </div>
                <button
                  onClick={() => setVenueNotifyModal(false)}
                  className="w-full rounded-xl bg-cana py-2.5 text-base font-medium text-white transition hover:bg-cana-dark"
                >
                  확인
                </button>
              </div>
            ) : (
              /* 발송 전 확인 */
              <>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-50">
                    <svg className="h-5 w-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-gray-800">장소 확정 문자 발송</h3>
                </div>

                <p className="mb-4 text-sm text-gray-500">
                  확정 참여자 전원({data.participants.length}명)에게 아래 내용으로 문자를 발송해요.
                  <br />한 번 발송하면 취소할 수 없어요.
                </p>

                {/* 미리보기 */}
                <div className="mb-5 rounded-xl bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-700 whitespace-pre-line">
                  {[
                    `[카나] 홍길동님 ${formatDate(data.event.event_date).split(' ').slice(0, 2).join(' ')} 소개팅 장소가 확정되었습니다.`,
                    '',
                    `- 장소: ${data.event.venue_name ?? ''}`,
                    `- 주소: ${data.event.venue_detail ?? data.event.location ?? ''}`,
                    data.event.venue_url ? `- 오시는 길: ${data.event.venue_url}` : '',
                    '',
                    '신분증을 반드시 지참해 주세요.',
                  ].filter(Boolean).join('\n')}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setVenueNotifyModal(false)}
                    disabled={sendingNotify}
                    className="flex-1 rounded-xl border border-gray-200 py-2.5 text-base text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSendVenueNotify}
                    disabled={sendingNotify}
                    className="flex-1 rounded-xl bg-cana py-2.5 text-base font-medium text-white transition hover:bg-cana-dark disabled:opacity-50"
                  >
                    {sendingNotify ? '발송 중...' : '발송'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── 이벤트 취소 확인 모달 ── */}
      {cancelModal && data && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => { if (!cancelling) setCancelModal(false); }}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {cancelResult ? (
              /* 처리 완료 */
              <div className="flex flex-col items-center gap-4 py-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                  <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-800">이벤트 취소 처리 완료</p>
                  <div className="mt-2 space-y-1 text-sm text-gray-500">
                    <p>대상 신청 <span className="font-medium text-gray-700">{cancelResult.affected}건</span> → 전체 &apos;취소&apos; 처리</p>
                    <p>환불 처리 <span className="font-medium text-gray-700">{cancelResult.refunded}건</span></p>
                    <p>SMS 발송 <span className="font-medium text-gray-700">{cancelResult.smsSent}명</span></p>
                  </div>
                  {cancelResult.refundErrors.length > 0 && (
                    <div className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-left text-xs text-amber-700">
                      <p className="mb-1 font-semibold">환불 실패 — 직접 확인이 필요해요</p>
                      <ul className="list-disc pl-4">
                        {cancelResult.refundErrors.map((e, i) => <li key={i}>{e}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setCancelModal(false)}
                  className="w-full rounded-xl bg-cana py-2.5 text-base font-medium text-white transition hover:bg-cana-dark"
                >
                  확인
                </button>
              </div>
            ) : (
              /* 취소 전 확인 */
              <>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-50">
                    <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-gray-800">이 소개팅을 전체 취소할까요?</h3>
                </div>

                <div className="mb-4 space-y-1.5 text-sm text-gray-600">
                  <p>· 검토중/대기/확정 신청 전체가 <span className="font-medium text-red-500">&apos;취소&apos;</span> 상태로 변경돼요.</p>
                  <p>· 결제가 완료된 건은 <span className="font-medium text-red-500">전액 환불</span> 처리돼요.</p>
                  <p>· 대상자 전원에게 <span className="font-medium text-red-500">&apos;소개팅 취소&apos;</span> 안내 문자가 발송돼요.</p>
                </div>

                <p className="mb-5 text-xs text-gray-400">
                  이 작업은 되돌릴 수 없어요. 진행 전에 다시 한 번 확인해주세요.
                </p>

                {cancelError && (
                  <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">{cancelError}</p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setCancelModal(false)}
                    disabled={cancelling}
                    className="flex-1 rounded-xl border border-gray-200 py-2.5 text-base text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                  >
                    닫기
                  </button>
                  <button
                    onClick={handleCancelEvent}
                    disabled={cancelling}
                    className="flex-1 rounded-xl bg-red-500 py-2.5 text-base font-medium text-white transition hover:bg-red-600 disabled:opacity-50"
                  >
                    {cancelling ? '처리 중...' : '취소 처리'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── 이벤트 수정 모달 ── */}
      {editOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setEditOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-5 text-base font-semibold text-gray-800">이벤트 수정</h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-sm text-gray-500">이벤트명 *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-cana focus:ring-1 focus:ring-cana/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-500">일시 *</label>
                <input
                  type="datetime-local"
                  value={form.event_date}
                  onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-cana focus:ring-1 focus:ring-cana/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-500">장소 *</label>
                <input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-cana focus:ring-1 focus:ring-cana/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-500">남성 출생연도 범위 (년생)</label>
                <div className="flex items-center gap-2">
                  <input type="number" value={form.birth_year_min_male} placeholder="예: 1995" min={1950} max={2010}
                    onChange={(e) => setForm({ ...form, birth_year_min_male: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-cana focus:ring-1 focus:ring-cana/20" />
                  <span className="flex-shrink-0 text-sm text-gray-400">~</span>
                  <input type="number" value={form.birth_year_max_male} placeholder="예: 2001" min={1950} max={2010}
                    onChange={(e) => setForm({ ...form, birth_year_max_male: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-cana focus:ring-1 focus:ring-cana/20" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-500">여성 출생연도 범위 (년생)</label>
                <div className="flex items-center gap-2">
                  <input type="number" value={form.birth_year_min_female} placeholder="예: 1996" min={1950} max={2010}
                    onChange={(e) => setForm({ ...form, birth_year_min_female: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-cana focus:ring-1 focus:ring-cana/20" />
                  <span className="flex-shrink-0 text-sm text-gray-400">~</span>
                  <input type="number" value={form.birth_year_max_female} placeholder="예: 2002" min={1950} max={2010}
                    onChange={(e) => setForm({ ...form, birth_year_max_female: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-cana focus:ring-1 focus:ring-cana/20" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm text-gray-500">정원 (명)</label>
                  <input type="number" value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-cana focus:ring-1 focus:ring-cana/20" />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-500">모집 상태</label>
                  <select value={form.is_active ? 'true' : 'false'}
                    onChange={(e) => setForm({ ...form, is_active: e.target.value === 'true' })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-cana focus:ring-1 focus:ring-cana/20">
                    <option value="true">모집중</option>
                    <option value="false">마감</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-500">참가비 (원)</label>
                <input type="number" value={form.price} placeholder="비워두면 기본 참가비 적용" min={0} step={1000}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-cana focus:ring-1 focus:ring-cana/20" />
                <p className="mt-1 text-xs text-gray-400">할인가 등 이 이벤트에만 적용할 참가비를 설정할 수 있어요. 비워두면 기본 참가비가 적용됩니다.</p>
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <button onClick={() => setEditOpen(false)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-base text-gray-600 transition hover:bg-gray-50">
                취소
              </button>
              <button onClick={handleSave}
                disabled={saving || !form.title || !form.event_date || !form.location}
                className="flex-1 rounded-xl bg-cana py-2.5 text-base font-medium text-white transition hover:bg-cana-dark disabled:opacity-50">
                {saving ? '저장 중...' : '수정 완료'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// ─── 유틸 컴포넌트 ─────────────────────────────────────────────────────────────

function InfoRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-base text-gray-600">
      <span className="flex-shrink-0 text-gray-400">{icon}</span>
      {label}
    </div>
  );
}

const STATUS_STYLE: Record<string, string> = {
  '대기': 'bg-amber-100 text-amber-700',
  '취소': 'bg-gray-200 text-gray-400',
};

function WaitlistStatusBadge({ status }: { status: string }) {
  const cls = STATUS_STYLE[status] ?? 'bg-gray-100 text-gray-500';
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-sm font-medium ${cls}`}>
      {status}
    </span>
  );
}
