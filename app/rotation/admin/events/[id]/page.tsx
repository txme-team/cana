import EventDetailPage from '@/components/admin/EventDetailPage';

export const dynamic = 'force-dynamic';

export default function AdminEventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // 인증/권한 확인은 middleware에서 이미 끝났음 (auth.getUser() 중복 호출 방지)
  return <EventDetailPage eventId={params.id} />;
}
