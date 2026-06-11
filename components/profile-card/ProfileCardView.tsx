import type { ProfileCardEvent, ProfileCardItem as ProfileCardItemData } from '@/lib/profile-card';
import ProfileCardItem from './ProfileCardItem';

function fmtEventDateTime(iso: string): string {
  const d = new Date(iso);
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  const hour = kst.getUTCHours();
  const ampm = hour < 12 ? '오전' : '오후';
  const h12 = hour % 12 || 12;
  return `${kst.getUTCMonth() + 1}월 ${kst.getUTCDate()}일 ${ampm} ${h12}시`;
}

export default function ProfileCardView({
  viewerLabel,
  event,
  cards,
}: {
  viewerLabel: string;
  event: ProfileCardEvent;
  cards: ProfileCardItemData[];
}) {
  return (
    <main className="min-h-screen bg-cana-cream px-4 pb-16 pt-10">
      <div className="mx-auto w-full max-w-md">

        {/* 헤더 */}
        <div className="mb-6 text-center">
          <p className="text-xs font-medium tracking-wide text-cana">CANA</p>
          <h1 className="mt-2 text-xl font-semibold text-cana-ink">
            내일 만날 분들의 프로필이에요
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-cana-ink3">
            {fmtEventDateTime(event.event_date)} · {event.venue_name ?? event.location ?? '장소 추후 안내'}
          </p>
        </div>

        {/* 안내 박스 */}
        <div className="mb-6 rounded-2xl border border-cana-rule bg-white px-4 py-3 text-xs leading-relaxed text-cana-ink3">
          미리 프로필을 살펴보고 오시면, 당일 더 깊은 대화를 나눌 수 있어요.
          카드를 눌러 자세한 내용을 확인해보세요. (이 링크는 행사 종료 후 만료됩니다)
        </div>

        {/* 카드 리스트 */}
        {cards.length === 0 ? (
          <div className="rounded-2xl border border-cana-rule bg-white px-5 py-12 text-center text-sm text-cana-ink3">
            아직 표시할 프로필이 없어요.
          </div>
        ) : (
          <div className="space-y-3">
            {cards.map((c) => (
              <ProfileCardItem key={c.label} label={c.label} profile={c.profile} />
            ))}
          </div>
        )}

        <p className="mt-8 text-center text-[11px] text-cana-ink3">
          {viewerLabel}님, 내일 좋은 만남 되세요 🙏
        </p>
      </div>
    </main>
  );
}
