import { createServiceClient } from '@/lib/supabase/server';
import { getProfileCardData } from '@/lib/profile-card';
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

export default async function ProfileCardPage({ params }: PageProps) {
  const supabase = createServiceClient();
  const result = await getProfileCardData(supabase, params.token);

  if (result.status === 'not_found') {
    return (
      <NoticeScreen
        title="페이지를 찾을 수 없어요"
        description="잘못된 링크이거나 더 이상 유효하지 않아요."
      />
    );
  }

  if (result.status === 'expired') {
    return (
      <NoticeScreen
        title="만료된 링크예요"
        description="프로필 카드 페이지는 행사 종료 후 만료돼요. 다음 만남에서 다시 만나요!"
      />
    );
  }

  if (result.status === 'cancelled') {
    return (
      <NoticeScreen
        title="더 이상 볼 수 없는 페이지예요"
        description="신청이 취소되어 더 이상 프로필 카드를 확인할 수 없어요."
      />
    );
  }

  return (
    <ProfileCardView
      viewerLabel={result.viewerLabel}
      event={result.event}
      cards={result.cards}
    />
  );
}
