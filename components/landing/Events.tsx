'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface WaitlistModal {
  open: boolean;
  event: { id: string; title: string } | null;
  loading: boolean;
  done: boolean;
  error: string | null;
}

interface Props {
  preview?: boolean;
}

interface EventItem {
  id: string;
  title: string;
  event_date: string;
  location: string;
  age_range_male: string;
  age_range_female: string;
  capacity: number;
  confirmed_count: number;
}

function formatEventDate(dateStr: string) {
  const d = new Date(dateStr);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const dow = days[d.getDay()];
  const hours = d.getHours();
  const ampm = hours < 12 ? '오전' : '오후';
  const h = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return { date: `${month}월 ${day}일 (${dow})`, time: `${ampm} ${h}시` };
}

export default function Events({ preview = false }: Props) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [wl, setWl] = useState<WaitlistModal>({ open: false, event: null, loading: false, done: false, error: null });

  const openWaitlist = (event: { id: string; title: string }) =>
    setWl({ open: true, event, loading: false, done: false, error: null });

  const closeWaitlist = () => setWl((m) => ({ ...m, open: false }));

  const handleWaitlistConfirm = async () => {
    if (!wl.event) return;
    setWl((m) => ({ ...m, loading: true, error: null }));
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: wl.event.id }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(err.error ?? '대기 신청에 실패했어요.');
      }
      setWl((m) => ({ ...m, loading: false, done: true }));
    } catch (e) {
      setWl((m) => ({ ...m, loading: false, error: e instanceof Error ? e.message : '오류가 발생했어요.' }));
    }
  };

  useEffect(() => {
    fetch('/api/events')
      .then((r) => r.json())
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const list = preview ? events.slice(0, 3) : events;

  const content = loading ? (
    <div className="flex items-center justify-center py-16 text-base text-cana-ink3">
      일정 불러오는 중...
    </div>
  ) : events.length === 0 ? (
    <div className="rounded-2xl border border-cana-rule bg-white px-6 py-12 text-center">
      <p className="text-base text-cana-ink3">현재 모집 중인 일정이 없어요</p>
      <p className="mt-1 text-sm text-cana-ink3/60">새로운 일정이 열리면 안내드릴게요</p>
    </div>
  ) : (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((event) => {
          const { date, time } = formatEventDate(event.event_date);
          const pct = Math.min((event.confirmed_count / event.capacity) * 100, 100);
          const isFull = event.confirmed_count >= event.capacity;

          return (
            <div
              key={event.id}
              className="flex flex-col gap-5 rounded-2xl border border-cana-rule bg-white p-6 shadow-sm shadow-cana/5 transition hover:shadow-md hover:shadow-cana/10"
            >
              {/* 제목 + 상태 */}
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-bold text-cana-ink">{event.title}</h3>
                {isFull ? (
                  <span className="flex h-[22px] flex-shrink-0 items-center rounded-xl bg-cana-rule px-2.5 text-xs font-semibold text-cana-ink3">
                    마감
                  </span>
                ) : (
                  <span className="flex h-[22px] flex-shrink-0 items-center rounded-xl bg-cana/10 px-2.5 text-xs font-semibold text-cana">
                    모집중
                  </span>
                )}
              </div>

              {/* 날짜 · 장소 */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-base text-cana-ink3">
                  <img src="/icons/calander.svg" alt="" className="h-5 w-5 flex-shrink-0" />
                  <span>{date} {time}</span>
                </div>
                <div className="flex items-center gap-2 text-base text-cana-ink3">
                  <img src="/icons/location.svg" alt="" className="h-5 w-5 flex-shrink-0" />
                  <span>{event.location}</span>
                </div>
              </div>

              {/* 연령대 */}
              <div className="flex flex-wrap gap-1.5">
                <span className="flex h-[26px] items-center rounded-xl bg-cana-cream px-2.5 text-sm text-cana-ink3">
                  남 {event.age_range_male}
                </span>
                <span className="flex h-[26px] items-center rounded-xl bg-cana-cream px-2.5 text-sm text-cana-ink3">
                  여 {event.age_range_female}
                </span>
              </div>

              {/* 확정 인원 바 */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-cana-ink3">확정 인원</span>
                  <span className="font-semibold text-cana">
                    {event.confirmed_count} / {event.capacity}명
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-xl bg-cana-rule">
                  <div className="h-full rounded-xl bg-cana transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>

              {/* 버튼 — 하단 풀 너비 */}
              {isFull ? (
                <button
                  type="button"
                  onClick={() => openWaitlist({ id: event.id, title: event.title })}
                  className="w-full rounded-xl border border-cana py-2.5 text-center text-sm font-semibold text-cana transition hover:bg-cana/5 active:scale-95"
                >
                  대기 신청
                </button>
              ) : (
                <Link
                  href={`/apply?eventId=${event.id}`}
                  className="block w-full rounded-xl bg-cana py-2.5 text-center text-sm font-semibold text-white transition hover:bg-cana-dark active:scale-95"
                >
                  신청하기
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {preview && events.length > 3 && (
        <div className="mt-8 flex justify-center">
          <Link href="/events" className="text-sm font-medium text-cana transition hover:opacity-70">
            일정 전체 보기 →
          </Link>
        </div>
      )}
    </>
  );

  return (
    <>
    {/* 대기 신청 모달 */}
    {wl.open && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5"
        onClick={() => !wl.loading && closeWaitlist()}
      >
        <div className="w-full max-w-xs rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
          {wl.done ? (
            <div className="flex flex-col gap-2">
              <p className="text-base font-semibold text-cana-ink">대기 신청 완료! 🎉</p>
              <p className="mb-4 text-sm leading-relaxed text-cana-ink3">
                빈자리가 생기면 문자로 알려드릴게요.<br />
                마이페이지에서 대기 현황을 확인할 수 있어요.
              </p>
              <button onClick={closeWaitlist} className="w-full rounded-xl bg-cana py-2.5 text-sm font-medium text-white transition active:bg-cana-dark">
                확인
              </button>
            </div>
          ) : (
            <>
              <p className="mb-1 text-base font-semibold text-cana-ink">대기 신청할까요?</p>
              <p className="mb-1 text-sm font-medium text-cana">{wl.event?.title}</p>
              <p className="mb-5 text-sm leading-relaxed text-cana-ink3">
                현재 정원이 마감됐어요.<br />
                빈자리가 생기면 문자로 알려드리고,<br />
                가장 먼저 결제하신 분이 자리를 확보해요.
              </p>
              {wl.error && (
                <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-500">{wl.error}</p>
              )}
              <div className="flex gap-2">
                <button onClick={closeWaitlist} disabled={wl.loading} className="flex-1 rounded-xl border border-cana-rule py-2.5 text-sm text-cana-ink3 transition hover:bg-cana-warm disabled:opacity-40">
                  취소
                </button>
                <button onClick={handleWaitlistConfirm} disabled={wl.loading} className="flex-1 rounded-xl bg-cana py-2.5 text-sm font-medium text-white transition active:bg-cana-dark disabled:opacity-40">
                  {wl.loading ? '신청 중...' : '대기 신청'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    )}
    <section id="events" className="bg-cana-cream px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <span className="mb-3 inline-block rounded-xl border border-cana-rule bg-white px-3 py-1 text-[11px] font-semibold tracking-widest text-cana">
            UPCOMING EVENTS
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-cana-ink sm:text-3xl">
            모집 중인 일정
          </h2>
          <p className="mt-3 text-base text-cana-ink3">
            아래 일정 중 참여 가능한 날짜를 선택해 신청해주세요
          </p>
        </div>
        {content}
      </div>
    </section>
    </>
  );
}
