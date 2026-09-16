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
    title: '자기소개 & Q&A 타임',
    desc: '3분간 자기소개와 Q&A를 진행해요.\n프로필 카드로 이미 알고 있으니 부담 없이 편하게 나누시면 됩니다.',
    icon: '/txme-assets/icons/bubble-smile-1.svg',
  },
  {
    num: '03',
    when: '당일',
    title: '첫인상 투표',
    desc: '자기소개를 들으며 느낀 첫인상을 바탕으로\n투표를 진행해요.',
    icon: '/txme-assets/icons/like.svg',
  },
  {
    num: '04',
    when: '당일',
    title: '매칭 시 1:1 데이트 · 불발 시 로테이션 대화',
    desc: '서로 투표가 맞으면 그 분과 바로 1:1 데이트를,\n맞지 않으면 나머지 분들과 로테이션 대화를 이어가요.',
    icon: '/txme-assets/icons/man&woman.svg',
  },
  {
    num: '05',
    when: '당일',
    title: '마음에 든 분께 쪽지 전달',
    desc: '대화 후 마음에 드시는 분이 계시면,\n쪽지에 연락처를 적어 봉투에 넣으시면 됩니다.',
    icon: '/txme-assets/icons/paper.svg',
  },
  {
    num: '06',
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
          <p className="text-base text-cana-ink3">
            회차별로 4~10명 규모로 진행되며, 첫인상 투표 결과에 따라 1:1 데이트 또는 로테이션 대화로 이어져요.
          </p>
        </div>

        {/* 타임라인 */}
        <div className="mx-auto flex max-w-xl flex-col">
          {STEPS.map((step, i) => (
            <div key={step.num} className="flex gap-5">
              {/* 아이콘 + 연결선 */}
              <div className="flex flex-col items-center">
                <div className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl border border-cana-rule bg-cana-muted text-cana shadow-sm shadow-cana/10">
                  <img src={step.icon} alt="" className="h-6 w-6" />
                  <span className="absolute -right-2 -top-2 rounded-full bg-cana px-2 py-0.5 text-[10px] font-bold text-white">
                    {step.when}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div aria-hidden className="my-1 w-px flex-1 bg-cana-rule" />
                )}
              </div>

              {/* 텍스트 */}
              <div className={i < STEPS.length - 1 ? 'pb-8' : ''}>
                <h3 className="mb-1.5 pt-3 text-lg font-semibold text-cana-ink">{step.title}</h3>
                <p className="whitespace-pre-line text-base leading-relaxed text-cana-ink3">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
