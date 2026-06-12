import { notFound } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { getProfileCardPreviewData } from '@/lib/profile-card';
import ProfileCardView from '@/components/profile-card/ProfileCardView';
import NoticeScreen from '@/components/profile-card/NoticeScreen';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: '프로필 카드 미리보기',
  robots: { index: false, follow: false },
};

interface PageProps {
  params: { eventId: string; gender: string };
}

export default async function ProfileCardPreviewPage({ params }: PageProps) {
  const { eventId, gender } = params;

  if (gender !== 'male' && gender !== 'female') {
    notFound();
  }

  const supabase = createServiceClient();
  const result = await getProfileCardPreviewData(supabase, eventId, gender);

  if (result.status === 'not_found') {
    return (
      <NoticeScreen
        title="이벤트를 찾을 수 없어요"
        description="잘못된 이벤트 ID예요."
      />
    );
  }

  return (
    <>
      <div className="bg-amber-100 px-4 py-2 text-center text-xs font-medium text-amber-800">
        관리자 미리보기 — {gender === 'male' ? '남자' : '여자'} 프로필카드
      </div>
      <ProfileCardView
        viewerLabel={result.viewerLabel}
        event={result.event}
        cards={result.cards}
      />
    </>
  );
}
