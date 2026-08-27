'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface EventRow {
  id: string;
  title: string;
  event_date: string;
  location: string;
  age_range_male: string;
  age_range_female: string;
  capacity: number;
  price?: number | null;
  is_active: boolean;
  cancelled_at?: string | null;
  birth_year_min_male: number | null;
  birth_year_max_male: number | null;
  birth_year_min_female: number | null;
  birth_year_max_female: number | null;
  venue_detail?: string;
  confirmed_male: number;
  confirmed_female: number;
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

function toYearOrNull(v: string): number | null {
  const n = parseInt(v, 10);
  return isNaN(n) ? null : n;
}

function formatAgeRange(min: number | null, max: number | null): string {
  if (!min && !max) return '-';
  const minStr = min ? String(min).slice(-2) : '?';
  const maxStr = max ? String(max).slice(-2) : '?';
  return `${minStr}~${maxStr}년생`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]}) ${d.getHours() < 12 ? '오전' : '오후'} ${d.getHours() > 12 ? d.getHours() - 12 : d.getHours() || 12}시`;
}

// datetime-local input 값 → ISO string
function toISO(local: string) {
  if (!local) return '';
  return new Date(local).toISOString();
}

// ISO string → datetime-local input 값
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function toLocal(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EventsManager() {
  const router = useRouter();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EventRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const fetchEvents = () => {
    setLoading(true);
    fetch('/api/rotation/admin/events')
      .then((r) => r.json())
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEvents(); }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.event_date || !form.location) return;
    setSaving(true);
    try {
      const minMale = toYearOrNull(form.birth_year_min_male);
      const maxMale = toYearOrNull(form.birth_year_max_male);
      const minFemale = toYearOrNull(form.birth_year_min_female);
      const maxFemale = toYearOrNull(form.birth_year_max_female);
      const payload = {
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
      };
      await fetch('/api/rotation/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setModalOpen(false);
      fetchEvents();
    } finally {
      setSaving(false);
    }
  };

  // 모집 상태(모집중/마감) 토글 — 마감 처리 시 공개 목록에서도 숨겨짐
  const handleToggleActive = async (ev: EventRow) => {
    setTogglingId(ev.id);
    try {
      await fetch('/api/rotation/admin/events', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ev.id, is_active: !ev.is_active }),
      });
      fetchEvents();
    } finally {
      setTogglingId(null);
    }
  };

  // 이벤트 삭제
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError('');
    try {
      const res = await fetch('/api/rotation/admin/events', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteTarget.id }),
      });
      const json = await res.json().catch(() => ({})) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? '삭제에 실패했어요.');
      setDeleteTarget(null);
      fetchEvents();
    } catch (err) {
      setDeleteError((err as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-end">
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-xl bg-cana px-4 py-2 text-sm font-medium text-white transition hover:bg-cana-dark"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          이벤트 추가
        </button>
      </div>


      {/* 테이블 */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-sm text-gray-400">
              <th className="px-5 py-3 text-left font-medium">이벤트명</th>
              <th className="px-5 py-3 text-left font-medium">일시</th>
              <th className="hidden px-5 py-3 text-left font-medium sm:table-cell">장소</th>
              <th className="hidden px-5 py-3 text-left font-medium md:table-cell">연령대</th>
              <th className="px-5 py-3 text-left font-medium">정원</th>
              <th className="px-5 py-3 text-left font-medium">확정</th>
              <th className="hidden px-5 py-3 text-left font-medium lg:table-cell">참가비</th>
              <th className="px-5 py-3 text-left font-medium">상태</th>
              <th className="px-5 py-3 text-left font-medium">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-sm text-gray-400">불러오는 중...</td>
              </tr>
            ) : events.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-sm text-gray-400">등록된 이벤트가 없어요.</td>
              </tr>
            ) : events.map((ev) => (
              <tr
                key={ev.id}
                className="cursor-pointer transition hover:bg-gray-50"
                onClick={() => router.push(`/rotation/admin/events/${ev.id}`)}
              >
                <td className="px-5 py-3 font-medium text-gray-800">{ev.title}</td>
                <td className="px-5 py-3 text-sm text-gray-500">{formatDate(ev.event_date)}</td>
                <td className="hidden px-5 py-3 text-sm text-gray-500 sm:table-cell">{ev.location}</td>
                <td className="hidden px-5 py-3 text-sm text-gray-500 md:table-cell">
                  <div>남 {formatAgeRange(ev.birth_year_min_male, ev.birth_year_max_male) !== '-' ? formatAgeRange(ev.birth_year_min_male, ev.birth_year_max_male) : ev.age_range_male || '-'}</div>
                  <div>여 {formatAgeRange(ev.birth_year_min_female, ev.birth_year_max_female) !== '-' ? formatAgeRange(ev.birth_year_min_female, ev.birth_year_max_female) : ev.age_range_female || '-'}</div>
                </td>
                <td className="px-5 py-3 text-sm text-gray-500">{ev.capacity}명</td>
                <td className="px-5 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">남 {ev.confirmed_male ?? 0}</span>
                    <span className="text-gray-200">·</span>
                    <span className="text-pink-600">여 {ev.confirmed_female ?? 0}</span>
                  </div>
                </td>
                <td className="hidden px-5 py-3 text-sm text-gray-500 lg:table-cell">
                  {typeof ev.price === 'number' ? `${ev.price.toLocaleString('ko-KR')}원` : '기본'}
                </td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-sm font-medium ${
                    ev.cancelled_at
                      ? 'bg-red-50 text-red-500'
                      : ev.is_active ? 'bg-cana/10 text-cana' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {ev.cancelled_at ? '취소됨' : ev.is_active ? '모집중' : '마감'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {!ev.cancelled_at && (
                      <button
                        onClick={() => handleToggleActive(ev)}
                        disabled={togglingId === ev.id}
                        className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs text-gray-500 transition hover:bg-gray-50 disabled:opacity-50"
                      >
                        {ev.is_active ? '숨기기' : '공개'}
                      </button>
                    )}
                    <button
                      onClick={() => { setDeleteTarget(ev); setDeleteError(''); }}
                      className="rounded-lg border border-red-200 px-2.5 py-1 text-xs text-red-500 transition hover:bg-red-50"
                    >
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 생성/수정 모달 */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-5 text-base font-semibold text-gray-800">이벤트 추가</h3>

            <div className="flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-sm text-gray-500">이벤트명 *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="예: CANA 1회차"
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
                  placeholder="예: 서울 마포구"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-cana focus:ring-1 focus:ring-cana/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-500">상세 장소</label>
                <input
                  value={form.venue_detail}
                  onChange={(e) => setForm({ ...form, venue_detail: e.target.value })}
                  placeholder="예: 강남구 OO빌딩 3층 룸 A"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-cana focus:ring-1 focus:ring-cana/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-gray-500">남성 출생연도 범위 (년생)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={form.birth_year_min_male}
                    onChange={(e) => setForm({ ...form, birth_year_min_male: e.target.value })}
                    placeholder="예: 1995"
                    min={1950}
                    max={2010}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-cana focus:ring-1 focus:ring-cana/20"
                  />
                  <span className="flex-shrink-0 text-sm text-gray-400">~</span>
                  <input
                    type="number"
                    value={form.birth_year_max_male}
                    onChange={(e) => setForm({ ...form, birth_year_max_male: e.target.value })}
                    placeholder="예: 2001"
                    min={1950}
                    max={2010}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-cana focus:ring-1 focus:ring-cana/20"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-gray-500">여성 출생연도 범위 (년생)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={form.birth_year_min_female}
                    onChange={(e) => setForm({ ...form, birth_year_min_female: e.target.value })}
                    placeholder="예: 1996"
                    min={1950}
                    max={2010}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-cana focus:ring-1 focus:ring-cana/20"
                  />
                  <span className="flex-shrink-0 text-sm text-gray-400">~</span>
                  <input
                    type="number"
                    value={form.birth_year_max_female}
                    onChange={(e) => setForm({ ...form, birth_year_max_female: e.target.value })}
                    placeholder="예: 2002"
                    min={1950}
                    max={2010}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-cana focus:ring-1 focus:ring-cana/20"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm text-gray-500">정원 (명)</label>
                  <input
                    type="number"
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-cana focus:ring-1 focus:ring-cana/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-500">모집 상태</label>
                  <select
                    value={form.is_active ? 'true' : 'false'}
                    onChange={(e) => setForm({ ...form, is_active: e.target.value === 'true' })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-cana focus:ring-1 focus:ring-cana/20"
                  >
                    <option value="true">모집중</option>
                    <option value="false">마감</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-500">참가비 (원)</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="비워두면 기본 참가비 적용"
                  min={0}
                  step={1000}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-cana focus:ring-1 focus:ring-cana/20"
                />
                <p className="mt-1 text-xs text-gray-400">할인가 등 이 이벤트에만 적용할 참가비를 설정할 수 있어요. 비워두면 기본 참가비가 적용됩니다.</p>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm text-gray-600 transition hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.title || !form.event_date || !form.location}
                className="flex-1 rounded-xl bg-cana py-2.5 text-sm font-medium text-white transition hover:bg-cana-dark disabled:opacity-50"
              >
                {saving ? '저장 중...' : '추가'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => { if (!deleting) setDeleteTarget(null); }}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-2 text-base font-semibold text-gray-800">이벤트를 삭제할까요?</h3>
            <p className="mb-4 text-sm text-gray-500">
              <span className="font-medium text-gray-700">{deleteTarget.title}</span> 이벤트를 영구적으로 삭제해요.
              신청 내역이 있는 이벤트는 삭제할 수 없으니, 그런 경우 &apos;숨기기&apos;를 이용해주세요.
            </p>
            {deleteError && (
              <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">{deleteError}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-medium text-white transition hover:bg-red-600 disabled:opacity-50"
              >
                {deleting ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
