'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

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
  return `${month}월 ${day}일 (${dow}) ${ampm} ${h}시`;
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/events')
      .then((r) => r.json())
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-base text-cana-ink3">
        일정 불러오는 중...
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-cana-rule bg-white px-6 py-12 text-center">
        <p className="text-base text-cana-ink3">현재 모집 중인 일정이 없어요</p>
        <p className="mt-1 text-sm text-cana-ink3/60">새로운 일정이 열리면 안내드릴게요</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {events.map((event) => {
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
              <div className="flex items-center gap-1.5 text-base text-cana-ink3">
                <img src="/icons/calander.svg" alt="" className="h-5 w-5 flex-shrink-0" />
                <span>{formatEventDate(event.event_date)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-base text-cana-ink3">
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

            {/* 확정 인원 바 + 컴팩트 버튼 */}
            <div className="flex items-end gap-4">
              <div className="flex flex-1 flex-col gap-1.5">
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

              {isFull ? (
                <Link
                  href="/apply"
                  className="flex-shrink-0 rounded-xl border border-cana px-4 py-2 text-sm font-semibold text-cana transition hover:bg-cana/5 active:scale-95"
                >
                  대기 신청
                </Link>
              ) : (
                <Link
                  href="/apply"
                  className="flex-shrink-0 rounded-xl bg-cana px-4 py-2 text-sm font-semibold text-white transition hover:bg-cana-dark active:scale-95"
                >
                  신청하기
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
