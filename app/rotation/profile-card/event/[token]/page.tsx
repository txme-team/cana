import { notFound } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { getProfileCardPreviewData } from '@/lib/profile-card';
import ProfileCardView from '@/components/profile-card/ProfileCardView';
import NoticeScreen from '@/components/profile-card/NoticeScreen';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: '프로필 카드',
  robots: { index: false, follow: false },
};

interface PageProps {
  params: { token: string };
}

export default async function EventProfileCardPage({ params }: PageProps) {
  const { token } = params;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supa = createServiceClient() as any;

  // token으로 이벤트 + 어느 성별 카드인지 조회
  const { data: eventByMale } = await supa
    .from('events')
    .select('id')
    .eq('card_token_male', token)
    .maybeSingle() as { data: { id: string } | null };

  const { data: eventByFemale } = !eventByMale
    ? await supa
        .from('events')
        .select('id')
        .eq('card_token_female', token)
        .maybeSingle() as { data: { id: string } | null }
    : { data: null };

  const eventId = eventByMale?.id ?? eventByFemale?.id;
  const cardGender: 'male' | 'female' = eventByMale ? 'male' : 'female';

  if (!eventId) {
    return (
      <NoticeScreen
        title="유효하지 않은 링크예요"
        description="프로필 카드 링크를 다시 확인해주세요."
      />
    );
  }

  const result = await getProfileCardPreviewData(supa, eventId, cardGender);

  if (result.status === 'not_found') {
    notFound();
  }

  return (
    <div className="bg-cana-cream">
      <ProfileCardView
        viewerLabel={result.viewerLabel}
        event={result.event}
        cards={result.cards}
      />
    </div>
  );
}
