import { createServiceClient } from '@/lib/supabase/server';

export interface RotationEvent {
  id: string;
  title: string;
  event_date: string;
  location: string;
  age_range_male: string;
  age_range_female: string;
  capacity: number;
  price?: number;
  confirmed_count: number;
}

// 서버 컴포넌트(SSR)와 /api/rotation/events 라우트가 공유하는 활성 일정 조회 로직.
// 기존엔 클라이언트에서만 fetch했기 때문에 크롤러에게 "일정 불러오는 중..."만 노출되던 문제를 해결하기 위해 분리했다.
export async function getActiveEvents(): Promise<RotationEvent[]> {
  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supa = supabase as any;

  // 이 함수는 이제 페이지 SSR 경로에서도 호출된다(기존엔 클라이언트 fetch만 사용).
  // Supabase가 느려지거나 응답이 없을 때 페이지 렌더 자체가 무한정 멈추지 않도록
  // 타임아웃을 걸어, 최악의 경우에도 빈 목록으로 폴백해 페이지는 계속 나가게 한다.
  const [eventsResult, confirmedResult] = await Promise.all([
    supa
      .from('events')
      .select('id, title, event_date, location, age_range_male, age_range_female, capacity, price, birth_year_min_male, birth_year_max_male, birth_year_min_female, birth_year_max_female')
      .eq('is_active', true)
      .order('event_date', { ascending: true })
      .abortSignal(AbortSignal.timeout(5000)),
    supa
      .from('applications')
      .select('event_id')
      .eq('status', '확정')
      .abortSignal(AbortSignal.timeout(5000)),
  ]);

  if (eventsResult.error) throw new Error(eventsResult.error.message);

  const confirmedCountMap: Record<string, number> = {};
  (confirmedResult.data ?? []).forEach((row: { event_id: string }) => {
    if (row.event_id) {
      confirmedCountMap[row.event_id] = (confirmedCountMap[row.event_id] ?? 0) + 1;
    }
  });

  return (eventsResult.data ?? []).map((event: { id: string;[key: string]: unknown }) => ({
    ...event,
    confirmed_count: confirmedCountMap[event.id] ?? 0,
  })) as RotationEvent[];
}
