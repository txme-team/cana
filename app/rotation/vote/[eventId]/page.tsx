import { createServiceClient } from '@/lib/supabase/server';
import NoticeScreen from '@/components/profile-card/NoticeScreen';
import VoteForm from '@/components/vote/VoteForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: '첫인상 투표',
  robots: { index: false, follow: false },
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function VotePage({ params }: { params: { eventId: string } }) {
  const notFound = (
    <NoticeScreen
      title="페이지를 찾을 수 없어요"
      description="잘못된 링크예요. 현장의 QR코드를 다시 스캔해주세요."
    />
  );

  if (!UUID_RE.test(params.eventId)) return notFound;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supa = createServiceClient() as any;
  const { data: event } = await supa
    .from('events')
    .select('id, title')
    .eq('id', params.eventId)
    .maybeSingle() as { data: { id: string; title: string } | null };

  if (!event) return notFound;

  return <VoteForm eventId={event.id} eventTitle={event.title} />;
}
