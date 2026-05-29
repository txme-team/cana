'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import BackButton from './BackButton';

interface Props {
  preview?: boolean;
  showBack?: boolean;
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

export default function Events({ preview = false, showBack = false }: Props) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/events')
      .then((r) => r.json())
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="events" className="bg-cana-cream px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">

        {showBack && <BackButton />}

        {/* 섹션 라벨 */}
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

        {/* 이벤트 목록 */}
        {loading ? (
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
            {(preview ? events.slice(0, 3) : events).map((event) => {
              const { date, time } = formatEventDate(event.event_date);
              return (
                <div
                  key={event.id}
                  className="flex flex-col gap-5 rounded-2xl border border-cana-rule bg-white p-6 shadow-sm shadow-cana/5 transition hover:shadow-md hover:shadow-cana/10"
                >
                  {/* 타이틀 */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-bold text-cana-ink">{event.title}</h3>
                    {event.confirmed_count >= event.capacity ? (
                      <span className="flex h-[22px] flex-shrink-0 items-center rounded-xl bg-gray-100 px-2.5 text-xs font-semibold text-gray-500">
                        마감
                      </span>
                    ) : (
                      <span className="flex h-[22px] flex-shrink-0 items-center rounded-xl bg-cana/10 px-2.5 text-xs font-semibold text-cana">
                        모집중
                      </span>
                    )}
                  </div>

                  {/* 날짜·장소 */}
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
                    <span className="flex h-[26px] items-center rounded-xl bg-gray-100 px-2.5 text-sm text-gray-500">
                      남 {event.age_range_male}
                    </span>
                    <span className="flex h-[26px] items-center rounded-xl bg-gray-100 px-2.5 text-sm text-gray-500">
                      여 {event.age_range_female}
                    </span>
                  </div>

                  {/* 확정 인원 / 정원 바 */}
                  {(() => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const isFull = event.confirmed_count >= event.capacity;
                    const pct = Math.min((event.confirmed_count / event.capacity) * 100, 100);
                    return (
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-base">
                          <span className="text-cana-ink3">확정 인원</span>
                          <span className="font-semibold text-cana">
                            {event.confirmed_count} / {event.capacity}명
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-xl bg-gray-100">
                          <div
                            className="h-full rounded-xl bg-cana transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })()}

                  {/* CTA */}
                  {event.confirmed_count >= event.capacity ? (
                    <Link
                      href="/apply"
                      className="mt-auto block rounded-xl border border-cana bg-white py-3.5 text-center text-base font-semibold text-cana transition hover:bg-cana/5 active:scale-95"
                    >
                      대기 신청하기
                    </Link>
                  ) : (
                    <Link
                      href="/apply"
                      className="mt-auto block rounded-xl bg-cana py-3.5 text-center text-base font-semibold text-white transition hover:bg-cana-dark active:scale-95"
                    >
                      이 일정 신청하기
                    </Link>
                  )}
                </div>
              );
            })}
          </div>

          {/* 더보기 — preview 모드이고 숨겨진 일정이 있을 때 */}
          {preview && events.length > 3 && (
            <div className="mt-8 flex justify-center">
              <Link href="/events" className="text-sm font-medium text-cana transition hover:opacity-70">
                일정 전체 보기 →
              </Link>
            </div>
          )}
          </>
        )}
      </div>
    </section>
  );
}
