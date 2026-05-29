const STEPS = [
  {
    num: '01',
    when: '전날',
    title: '프로필 카드 수령',
    desc: '참가자 전원의 프로필 카드를 미리 전달받아요.\n이름·연락처·직장은 포함되지 않습니다.',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    num: '02',
    when: '당일',
    title: '현장 로테이션 소개팅',
    desc: '1:1로 10분씩 대화해요. 마음에 드시면\n쪽지에 연락처를 적어 봉투에 넣습니다.',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    ),
  },
  {
    num: '03',
    when: '이후',
    title: '귀가 후 쪽지 확인',
    desc: '집에서 봉투 속 쪽지를 열어보세요.\n연락처가 있다면 자유롭게 연락하시면 됩니다.',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
  },
];

export default function Process() {
  return (
    <section id="how" className="bg-white px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">

        {/* 섹션 라벨 */}
        <div className="mb-12 text-center">
          <span className="mb-3 inline-block rounded-xl border border-cana-rule bg-cana-muted px-3 py-1 text-[11px] font-semibold tracking-widest text-cana">
            HOW IT WORKS
          </span>
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-cana-ink sm:text-3xl">
            이렇게 진행돼요
          </h2>
          <p className="text-base text-cana-ink3">총 소요 시간 약 120분, 6~10명의 이성과 대화합니다.</p>
        </div>

        {/* 스텝 */}
        <div className="relative grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-4">
          {/* 연결선 (데스크탑) */}
          <div aria-hidden className="absolute left-1/4 right-1/4 top-10 hidden h-px bg-cana-rule sm:block" />

          {STEPS.map((step) => (
            <div key={step.num} className="flex flex-col items-center text-center">
              {/* 아이콘 */}
              <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-xl border border-cana-rule bg-cana-muted text-cana shadow-sm shadow-cana/10">
                {step.icon}
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
