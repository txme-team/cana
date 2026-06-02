'use client';

import { useState, useMemo } from 'react';

// ─── 타입 ─────────────────────────────────────────────────────────────────────

export interface RevenueItem {
  id: string;
  status: string;
  paid_at: string | null;
  amount: number | null;
  event_id: string;
  event_title: string;
  gender: string | null;       // 'male' | 'female'
  birth_year: number | null;
}

// ─── 헬퍼 ─────────────────────────────────────────────────────────────────────

function fmtAmount(n: number | null) {
  if (n == null) return '—';
  return n.toLocaleString('ko-KR') + '원';
}

function fmtMonth(key: string) {               // "YYYY-MM"
  const [y, m] = key.split('-');
  return `${y}년 ${parseInt(m)}월`;
}

function fmtShortMonth(key: string) {          // "YYYY-MM" → "3월"
  return `${parseInt(key.split('-')[1])}월`;
}

// 이벤트 제목 → 바 레이블 ("cana 소개팅 1회차" → "1회차")
function eventLabel(title: string) {
  const parts = title.trim().split(/\s+/);
  return parts[parts.length - 1] ?? title;
}

// 공용 화살표 버튼
function NavArrow({
  dir, disabled, onClick,
}: { dir: 'left' | 'right'; disabled: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex h-6 w-6 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:opacity-25"
    >
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        {dir === 'left'
          ? <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          : <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />}
      </svg>
    </button>
  );
}

// ─── 메인 컴포넌트 ─────────────────────────────────────────────────────────────

export default function RevenuePage({ payments }: { payments: RevenueItem[] }) {
  const active = useMemo(
    () => payments.filter((p) => p.amount != null && p.status !== '취소' && p.status !== '반려'),
    [payments],
  );

  const total      = active.reduce((s, p) => s + (p.amount ?? 0), 0);
  const totalCount = active.length;

  const thisMonthKey    = new Date().toISOString().slice(0, 7);
  const thisMonthAmount = active
    .filter((p) => p.paid_at?.startsWith(thisMonthKey))
    .reduce((s, p) => s + (p.amount ?? 0), 0);

  // ── 월별 (오름차순: 차트 왼→오른) ───────────────────────────────────────────
  const byMonth = useMemo(() => {
    const map: Record<string, number> = {};
    active.forEach((p) => {
      if (!p.paid_at) return;
      const key = p.paid_at.slice(0, 7);
      map[key] = (map[key] ?? 0) + (p.amount ?? 0);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [active]);

  // ── 이벤트별 (내림차순) ─────────────────────────────────────────────────────
  const byEvent = useMemo(() => {
    const map: Record<string, { title: string; amount: number; count: number }> = {};
    active.forEach((p) => {
      if (!map[p.event_id]) map[p.event_id] = { title: p.event_title, amount: 0, count: 0 };
      map[p.event_id].amount += p.amount ?? 0;
      map[p.event_id].count  += 1;
    });
    return Object.entries(map).sort(([, a], [, b]) => a.title.localeCompare(b.title));
  }, [active]);

  // ── 성별별 ─────────────────────────────────────────────────────────────────
  const byGender = useMemo(() => {
    const m = { 남성: { amount: 0, count: 0 }, 여성: { amount: 0, count: 0 } };
    active.forEach((p) => {
      const k = p.gender === 'male' ? '남성' : p.gender === 'female' ? '여성' : null;
      if (k) { m[k].amount += p.amount ?? 0; m[k].count += 1; }
    });
    return m;
  }, [active]);

  // ── 연령별 ─────────────────────────────────────────────────────────────────
  const byAge = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const map: Record<string, { amount: number; count: number }> = {};
    active.forEach((p) => {
      if (!p.birth_year) return;
      const decade = Math.floor((currentYear - p.birth_year) / 10) * 10;
      const key = `${decade}대`;
      if (!map[key]) map[key] = { amount: 0, count: 0 };
      map[key].amount += p.amount ?? 0;
      map[key].count  += 1;
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [active]);

  // ── 월별 선택 state ─────────────────────────────────────────────────────────
  const [selectedMonth, setSelectedMonth] = useState<string>(
    () => byMonth[byMonth.length - 1]?.[0] ?? '',
  );
  const monthIdx         = byMonth.findIndex(([k]) => k === selectedMonth);
  const selectedMonthAmt = byMonth[monthIdx]?.[1] ?? 0;
  const maxMonthAmt      = Math.max(...byMonth.map(([, v]) => v), 1);

  // ── 이벤트별 선택 state ──────────────────────────────────────────────────────
  const [selectedEventId, setSelectedEventId] = useState<string>(
    () => byEvent[byEvent.length - 1]?.[0] ?? '',
  );
  const eventIdx    = byEvent.findIndex(([id]) => id === selectedEventId);
  const selectedEv  = byEvent[eventIdx]?.[1];
  const maxEventAmt = byEvent[0]?.[1]?.amount ?? 1;

  const maxAgeAmt = Math.max(...byAge.map(([, v]) => v.amount), 1);

  const genderTotal  = (byGender['남성'].amount) + (byGender['여성'].amount);
  const maleRatioPct = genderTotal > 0 ? Math.round((byGender['남성'].amount / genderTotal) * 100) : 50;

  const BAR_H = 60; // 바 영역 최대 높이 (px)

  return (
    <div className="space-y-5">

      {/* ── 요약 카드 3개 ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-gray-400">총 매출</p>
          <p className="text-xl font-bold text-gray-900">{fmtAmount(total)}</p>
          <p className="mt-1 text-[11px] text-gray-400">취소·반려 제외 {totalCount}건</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-gray-400">이번 달 매출</p>
          <p className="text-xl font-bold text-gray-900">{fmtAmount(thisMonthAmount)}</p>
          <p className="mt-1 text-[11px] text-gray-400">{fmtMonth(thisMonthKey)}</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-gray-400">총 결제 건수</p>
          <p className="text-xl font-bold text-gray-900">{totalCount.toLocaleString()}건</p>
          <p className="mt-1 text-[11px] text-gray-400">성공 기준</p>
        </div>
      </div>

      {/* ── 월별 | 이벤트별 ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* 월별 — 바 차트 */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          {/* 헤더 */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">월 별 매출</p>
            {byMonth.length > 0 && (
              <div className="flex items-center gap-0.5">
                <NavArrow
                  dir="left"
                  disabled={monthIdx <= 0}
                  onClick={() => setSelectedMonth(byMonth[monthIdx - 1][0])}
                />
                <NavArrow
                  dir="right"
                  disabled={monthIdx >= byMonth.length - 1}
                  onClick={() => setSelectedMonth(byMonth[monthIdx + 1][0])}
                />
              </div>
            )}
          </div>

          {byMonth.length === 0 ? (
            <p className="text-sm text-gray-400">데이터 없음</p>
          ) : (
            <div className="flex flex-col gap-5">
              {/* 선택 월 정보 */}
              <div className="min-h-[56px]">
                <p className="text-sm font-semibold text-gray-600">{fmtMonth(selectedMonth)}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{fmtAmount(selectedMonthAmt)}</p>
              </div>

              {/* 바 차트 */}
              <div className="flex items-end gap-1.5">
                {byMonth.map(([key, amt]) => {
                  const barH = Math.max(Math.round((amt / maxMonthAmt) * BAR_H), 4);
                  const sel  = key === selectedMonth;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedMonth(key)}
                      className="group flex flex-1 flex-col items-center gap-1.5"
                    >
                      <div className="flex w-full items-end" style={{ height: `${BAR_H}px` }}>
                        <div
                          className={[
                            'w-full rounded-t-md transition-all duration-200',
                            sel ? 'bg-cana' : 'bg-gray-100 group-hover:bg-cana/20',
                          ].join(' ')}
                          style={{ height: `${barH}px` }}
                        />
                      </div>
                      <span className={[
                        'text-xs leading-none transition-colors',
                        sel ? 'font-bold text-cana' : 'text-gray-400 group-hover:text-gray-600',
                      ].join(' ')}>
                        {fmtShortMonth(key)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 이벤트별 — 바 차트 (월별과 동일 포맷) */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          {/* 헤더 */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">이벤트 별 매출</p>
            {byEvent.length > 0 && (
              <div className="flex items-center gap-0.5">
                <NavArrow
                  dir="left"
                  disabled={eventIdx <= 0}
                  onClick={() => setSelectedEventId(byEvent[eventIdx - 1][0])}
                />
                <NavArrow
                  dir="right"
                  disabled={eventIdx >= byEvent.length - 1}
                  onClick={() => setSelectedEventId(byEvent[eventIdx + 1][0])}
                />
              </div>
            )}
          </div>

          {byEvent.length === 0 ? (
            <p className="text-sm text-gray-400">데이터 없음</p>
          ) : (
            <div className="flex flex-col gap-5">
              {/* 선택 이벤트 정보 */}
              <div className="min-h-[56px]">
                <p className="text-sm font-semibold text-gray-600">{selectedEv?.title ?? '—'}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{fmtAmount(selectedEv?.amount ?? null)}</p>
                {selectedEv && (
                  <p className="mt-0.5 text-xs text-gray-400">{selectedEv.count}건</p>
                )}
              </div>

              {/* 바 차트 */}
              <div className="flex items-end gap-1.5">
                {byEvent.map(([id, ev]) => {
                  const barH = Math.max(Math.round((ev.amount / maxEventAmt) * BAR_H), 4);
                  const sel  = id === selectedEventId;
                  return (
                    <button
                      key={id}
                      onClick={() => setSelectedEventId(id)}
                      className="group flex flex-1 flex-col items-center gap-1.5"
                    >
                      <div className="flex w-full items-end" style={{ height: `${BAR_H}px` }}>
                        <div
                          className={[
                            'w-full rounded-t-md transition-all duration-200',
                            sel ? 'bg-cana' : 'bg-gray-100 group-hover:bg-cana/20',
                          ].join(' ')}
                          style={{ height: `${barH}px` }}
                        />
                      </div>
                      <span className={[
                        'text-xs leading-none transition-colors',
                        sel ? 'font-bold text-cana' : 'text-gray-400 group-hover:text-gray-600',
                      ].join(' ')}>
                        {eventLabel(ev.title)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 성별 | 연령별 ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* 성별 */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-gray-400">성별 별 매출</p>

          {genderTotal === 0 ? (
            <p className="text-sm text-gray-400">데이터 없음</p>
          ) : (
            <div className="flex flex-col gap-5">
              {/* 남성 / 여성 수치 */}
              <div className="grid grid-cols-2 gap-4">
                {(['남성', '여성'] as const).map((g) => {
                  const d    = byGender[g];
                  const pct  = genderTotal > 0 ? Math.round((d.amount / genderTotal) * 100) : 0;
                  const isMale = g === '남성';
                  return (
                    <div
                      key={g}
                      className={[
                        'rounded-xl p-4',
                        isMale ? 'bg-cana/5' : 'bg-gray-50',
                      ].join(' ')}
                    >
                      <div className="mb-1 flex items-center gap-1.5">
                        <span className={[
                          'inline-block h-2 w-2 rounded-full',
                          isMale ? 'bg-cana' : 'bg-gray-300',
                        ].join(' ')} />
                        <span className="text-xs text-gray-500">{g}</span>
                      </div>
                      <p className={[
                        'text-xl font-bold',
                        isMale ? 'text-cana' : 'text-gray-700',
                      ].join(' ')}>
                        {pct}%
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-gray-900">
                        {fmtAmount(d.amount)}
                      </p>
                      <p className="mt-0.5 text-[11px] text-gray-400">{d.count}건</p>
                    </div>
                  );
                })}
              </div>

              {/* 비율 바 */}
              <div>
                <div className="flex h-2.5 w-full overflow-hidden rounded-full">
                  <div
                    className="h-full bg-cana transition-all duration-500"
                    style={{ width: `${maleRatioPct}%` }}
                  />
                  <div className="h-full flex-1 bg-gray-200" />
                </div>
                <div className="mt-2 flex justify-between text-[11px] text-gray-400">
                  <span>남성 {maleRatioPct}%</span>
                  <span>여성 {100 - maleRatioPct}%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 연령별 */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-gray-400">연령 별 매출</p>

          {byAge.length === 0 ? (
            <p className="text-sm text-gray-400">데이터 없음</p>
          ) : (
            <div className="flex flex-col gap-4">
              {byAge.map(([age, data], i) => {
                const pct = Math.round((data.amount / maxAgeAmt) * 100);
                return (
                  <div key={age}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-semibold text-gray-800">{age}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-gray-400">{data.count}건</span>
                        <span className="font-bold text-gray-900">{fmtAmount(data.amount)}</span>
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={[
                          'h-full rounded-full transition-all duration-500',
                          i === 0 ? 'bg-cana' : 'bg-cana/50',
                        ].join(' ')}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {total > 0 && (
                      <p className="mt-1 text-right text-[11px] text-gray-400">
                        전체의 {Math.round((data.amount / total) * 100)}%
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
