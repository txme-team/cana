import { NextResponse } from 'next/server';
import { unstable_noStore as noStore } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  noStore();
  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supa = supabase as any;

  const [eventsResult, confirmedResult] = await Promise.all([
    supa
      .from('events')
      .select('id, title, event_date, location, age_range_male, age_range_female, capacity, birth_year_min_male, birth_year_max_male, birth_year_min_female, birth_year_max_female')
      .eq('is_active', true)
      .order('event_date', { ascending: true }),
    supa
      .from('applications')
      .select('event_id')
      .eq('status', '확정'),
  ]);

  if (eventsResult.error) return NextResponse.json({ error: eventsResult.error.message }, { status: 500 });

  // 이벤트별 확정 인원 집계
  const confirmedCountMap: Record<string, number> = {};
  (confirmedResult.data ?? []).forEach((row: { event_id: string }) => {
    if (row.event_id) {
      confirmedCountMap[row.event_id] = (confirmedCountMap[row.event_id] ?? 0) + 1;
    }
  });

  const events = (eventsResult.data ?? []).map((event: { id: string;[key: string]: unknown }) => ({
    ...event,
    confirmed_count: confirmedCountMap[event.id] ?? 0,
  }));

  return NextResponse.json(events);
}
