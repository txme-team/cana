'use client';

import { useEffect, useState } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import type { ApplyFormData } from '@/lib/types';

interface EventOption {
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


export default function Step0() {
  const { control, formState: { errors } } = useFormContext<ApplyFormData>();
  const [events, setEvents] = useState<EventOption[]>([]);
  const [appliedEventIds, setAppliedEventIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/events').then((r) => r.json()),
      fetch('/api/my-applications').then((r) => r.json()),
    ]).then(([eventsData, appliedData]) => {
      setEvents(Array.isArray(eventsData) ? eventsData : []);
      // 결제대기·취소는 재신청 허용 — 그 외(검토중·확정·반려 등)만 disabled
      const REAPPLY_STATUSES = ['결제대기', '취소'];
      const applied = Array.isArray(appliedData)
        ? (appliedData as { event_id: string; status: string }[])
            .filter((a) => !REAPPLY_STATUSES.includes(a.status))
            .map((a) => a.event_id)
        : [];
      setAppliedEventIds(applied);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-8">

      {/* 이벤트 선택 */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <p className="text-base font-semibold text-gray-800">참여 일정을 선택해주세요</p>
          <p className="text-sm text-gray-400">신청 후 확정은 개별 안내를 통해 전달드려요</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8 text-sm text-gray-400">
            일정 불러오는 중...
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-6 text-center text-sm text-gray-400">
            현재 모집 중인 일정이 없어요
          </div>
        ) : (
          <Controller
            name="eventId"
            control={control}
            rules={{ required: '참여 일정을 선택해주세요' }}
            render={({ field }) => (
              <div className="flex flex-col gap-2.5">
                {events.map((event) => {
                  const selected = field.value === event.id;
                  const applied  = appliedEventIds.includes(event.id);
                  const isFull   = event.confirmed_count >= event.capacity;

                  return (
                    <button
                      key={event.id}
                      type="button"
                      disabled={applied}
                      onClick={() => !applied && field.onChange(event.id)}
                      className={[
                        'flex items-start gap-3.5 rounded-2xl border px-4 py-4 text-left transition',
                        applied
                          ? 'cursor-not-allowed border-gray-100 bg-gray-50 opacity-60'
                          : selected
                          ? 'border-cana bg-cana/5'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50',
                      ].join(' ')}
                    >
                      {/* 라디오 원 */}
                      <span
                        className={[
                          'mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition',
                          applied
                            ? 'border-gray-200 bg-gray-100'
                            : selected
                            ? 'border-cana bg-cana'
                            : 'border-gray-300 bg-white',
                        ].join(' ')}
                      >
                        {selected && !applied && <span className="h-2 w-2 rounded-full bg-white" />}
                      </span>

                      {/* 이벤트 정보 */}
                      <div className="flex min-w-0 flex-1 flex-col gap-2">

                        {/* 제목 + 상태 뱃지 */}
                        <div className="flex items-center gap-2">
                          <p className={`text-base font-semibold ${applied ? 'text-gray-400' : selected ? 'text-cana' : 'text-gray-800'}`}>
                            {event.title}
                          </p>
                          {applied ? (
                            <span className="flex h-[20px] flex-shrink-0 items-center rounded-xl bg-gray-200 px-2 text-[11px] font-medium text-gray-500">
                              신청 완료
                            </span>
                          ) : isFull ? (
                            <span className="flex h-[20px] flex-shrink-0 items-center rounded-xl bg-gray-100 px-2 text-[11px] font-medium text-gray-500">
                              마감
                            </span>
                          ) : (
                            <span className="flex h-[20px] flex-shrink-0 items-center rounded-xl bg-cana/10 px-2 text-[11px] font-medium text-cana">
                              모집중
                            </span>
                          )}
                        </div>

                        {/* 날짜 · 장소 */}
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <img src="/icons/calander.svg" alt="" className="h-4 w-4 flex-shrink-0" />
                            <span>{formatEventDate(event.event_date)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <img src="/icons/location.svg" alt="" className="h-4 w-4 flex-shrink-0" />
                            <span>{event.location}</span>
                          </div>
                        </div>

                        {/* 연령대 · 정원 뱃지 */}
                        <div className="flex flex-wrap gap-1.5">
                          <span className="flex h-[22px] items-center rounded-xl bg-gray-100 px-2.5 text-sm text-gray-500">
                            남 {event.age_range_male}
                          </span>
                          <span className="flex h-[22px] items-center rounded-xl bg-gray-100 px-2.5 text-sm text-gray-500">
                            여 {event.age_range_female}
                          </span>
                          <span className="flex h-[22px] items-center rounded-xl bg-gray-100 px-2.5 text-sm text-gray-500">
                            정원 {event.capacity}명
                          </span>
                        </div>

                      </div>
                    </button>
                  );
                })}

                {errors.eventId && (
                  <p className="text-xs text-red-500">{errors.eventId.message}</p>
                )}
              </div>
            )}
          />
        )}
      </div>
    </div>
  );
}
