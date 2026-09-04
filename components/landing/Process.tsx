const STEPS = [
  {
    num: '01',
    when: '전날',
    title: '프로필 카드 수령',
    desc: '참가자 전원의 프로필 카드를 미리 전달받아요.\n이름·연락처·직장은 포함되지 않습니다.',
    icon: '/txme-assets/icons/business-user-curriculum.svg',
  },
  {
    num: '02',
    when: '당일',
    title: '현장 로테이션 소개팅',
    desc: '1:1로 10분씩 대화해요. 마음에 드시면\n쪽지에 연락처를 적어 봉투에 넣습니다.',
    icon: '/txme-assets/icons/party-popper.svg',
  },
  {
    num: '03',
    when: '이후',
    title: '귀가 후 쪽지 확인',
    desc: '집에서 봉투 속 쪽지를 열어보세요.\n연락처가 있다면 자유롭게 연락하시면 됩니다.',
    icon: '/txme-assets/icons/mail-love.svg',
  },
];

export default function Process() {
  return (
    <section id="how" className="bg-white px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">

        {/* 섹션 라벨 */}
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-cana-ink sm:text-3xl">
            이렇게 진행돼요
          </h2>
          <p className="text-base text-cana-ink3">총 소요 시간 약 120분, 4~10명의 이성과 대화합니다.</p>
        </div>

        {/* 스텝 */}
        <div className="relative grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-4">
          {/* 연결선 (데스크탑) */}
          <div aria-hidden className="absolute left-1/4 right-1/4 top-10 hidden h-px bg-cana-rule sm:block" />

          {STEPS.map((step) => (
            <div key={step.num} className="flex flex-col items-center text-center">
              {/* 아이콘 */}
              <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-xl border border-cana-rule bg-cana-muted text-cana shadow-sm shadow-cana/10">
                <img src={step.icon} alt="" className="h-8 w-8" />
                <span className="absolute -right-2 -top-2 rounded-full bg-cana px-2 py-0.5 text-[10px] font-bold text-white">
                  {step.when}
                </span>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-cana-ink">{step.title}</h3>
              <p className="whitespace-pre-line text-base leading-relaxed text-cana-ink3">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
