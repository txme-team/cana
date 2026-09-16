import { NextResponse } from 'next/server';
import { unstable_noStore as noStore } from 'next/cache';
import { getActiveEvents } from '@/lib/rotation/events';

export const dynamic = 'force-dynamic';

export async function GET() {
  noStore();
  try {
    const events = await getActiveEvents();
    return NextResponse.json(events);
  } catch (e) {
    const message = e instanceof Error ? e.message : '조회에 실패했어요.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
