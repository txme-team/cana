export default function PainPoint() {
  const cards = [
    {
      icon: '/icons/section1_1.svg',
      title: '똑같은 자기소개만\n열 번 하다 지쳐요',
      description: '"직업이 어떻게 되세요? 몇 살이에요?"만 반복하다 끝납니다.',
    },
    {
      icon: '/icons/section1_2.svg',
      title: '대화가 깊어지려고 하면\n자리 이동할 시간이래요',
      description: '서로를 알아가기에는 주어진 시간이 너무나도 부족합니다.',
    },
    {
      icon: '/icons/section1_3.svg',
      title: '어떤 사람인지 알기도 전에\n판단해야 해요',
      description: '겉모습과 짧은 대화만으로 좋고 싫음을 결정하고 돌아갑니다.',
    },
  ];

  return (
    <section className="bg-white px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">

        {/* 섹션 라벨 */}
        <div className="mb-12 text-center">
          <span className="mb-3 inline-block rounded-xl border border-cana-rule bg-cana-cream px-3 py-1 text-[11px] font-semibold tracking-widest text-cana">
            PAIN POINT
          </span>
          <h2 className="text-2xl font-bold leading-snug tracking-tight text-cana-ink sm:text-3xl">
            로테이션 소개팅에서<br />인연 찾기 왜 힘들까?
          </h2>
        </div>

        {/* 카드 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {cards.map((card, i) => (
            <div
              key={i}
              className="flex flex-col gap-5 px-6 py-7"
            >
              <img src={card.icon} alt="" className="h-10 w-10" />
              <div className="flex flex-col gap-2">
                <p className="whitespace-pre-line text-lg font-bold leading-snug text-cana-ink">
                  {card.title}
                </p>
                <p className="text-base leading-relaxed text-cana-ink3">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
