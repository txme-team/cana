import ProfileCardPreview from './ProfileCardPreview';

const POINTS = [
  {
    icon: '/icons/shining-profile.svg',
    title: '상대를 미리 파악해요',
    description: '소개팅 전날, 참가자 전원의 프로필 카드가 공유됩니다.',
  },
  {
    icon: '/icons/bubble-smile-2.svg',
    title: '깊은 대화로 바로 시작해요',
    description: '아이스브레이킹 없이, 10분을 온전히 대화에 씁니다.',
  },
  {
    icon: '/icons/flower.svg',
    title: '내 매력도 먼저 어필해요',
    description: '카드를 통해 내 가치관과 이야기를 만남 전에 전달할 수 있어요.',
  },
  {
    icon: '/icons/praying.svg',
    title: '대화 주제 고민할 필요 없어요',
    description: '프로필 카드 속 다양한 소재 뿐만 아니라 추천 질문 리스트도 드려요.',
  },
];

// ─── 메인 ─────────────────────────────────────────────────────────────────────

export default function WhyCana() {
  return (
    <section className="bg-cana-cream px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">

        {/* 섹션 라벨 + 타이틀 */}
        <div className="mb-12 text-center">
          <span className="mb-3 inline-block rounded-xl border border-cana-rule bg-white px-3 py-1 text-[11px] font-semibold tracking-widest text-cana">
            WHY CANA
          </span>
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-cana-ink sm:text-3xl">
            카나에선 만나기 전에 미리 알아봐요
          </h2>
          <p className="mx-auto max-w-lg text-base leading-relaxed text-cana-ink3">
            카나는 소개팅 전날, 참가자 전원의 프로필 카드를 미리 공유합니다.<br className="hidden sm:block" />
            당일엔 형식적인 자기소개 없이 바로 진짜 대화를 시작할 수 있어요.
          </p>
        </div>

        {/* 하단 2열 */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start">

          {/* 좌측 — 포인트 카드 */}
          <div className="flex flex-col gap-4">
            {POINTS.map((pt) => (
              <div
                key={pt.title}
                className="flex items-start gap-4 rounded-2xl border border-cana-rule bg-white px-5 py-5 shadow-sm shadow-cana/5"
              >
                <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-cana/8">
                  <img src={pt.icon} alt="" className="h-9 w-9" />
                </span>
                <div>
                  <p className="text-lg font-semibold text-cana-ink">{pt.title}</p>
                  <p className="mt-0.5 text-base leading-relaxed text-cana-ink3">{pt.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 우측 — 프로필 카드 미리보기 */}
          <div className="lg:sticky lg:top-24">
            {/* 프레임 배경 */}
            <div className="relative rounded-3xl bg-gradient-to-br from-cana/10 via-cana-muted to-cana-rule/40 p-6 pb-0">
              {/* 카드 — 살짝 기울이고 아래로 살짝 튀어나오게 */}
              <div className="translate-y-3 rotate-1 transform overflow-hidden rounded-2xl shadow-2xl shadow-cana/20">
                <ProfileCardPreview />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
