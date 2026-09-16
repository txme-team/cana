// 실제 참가자 후기(익명). E-E-A-T의 Experience 신호가 거의 없던 문제를
// 해결하기 위해 추가 — 지어낸 수치/후기 없이 실제 텍스트 중 긍정적인 것만 사용.
const TESTIMONIALS: string[] = [
  '진행자님이 이렇게까지 세세하게 신경써주시고 조율해주신건 처음봐서 감사했습니다. 적지 않은 인원이었는데 친절하게 배려해주셔서 감사했습니다.',
  '처음 자기소개때문에 대화하는게 더 재밋어요',
  '자기소개가 처음엔 부담되었는데 그거 통해서 서로 첫인상 맘에드는 사람 찾는게 좋았어요!',
  '서먹할 수 있는 상황에서 진행자님이 먼저 많이 물어봐주시고 이끌어주셔서 감사했어요 ㅎㅎ',
];

export default function Testimonials() {
  return (
    <section className="bg-white px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-cana-ink sm:text-3xl">
            실제 참가자 후기
          </h2>
          <p className="mt-3 text-base text-cana-ink3">
            카나 로테이션을 다녀가신 분들의 이야기예요
          </p>
        </div>

        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          {TESTIMONIALS.map((quote, i) => {
            const isLeft = i % 2 === 0;
            return (
              <div key={i} className={`flex ${isLeft ? 'justify-start' : 'justify-end'}`}>
                <div
                  className={[
                    'relative w-full max-w-[380px] rounded-2xl bg-sky-100 px-5 py-4 shadow-sm',
                    isLeft ? 'rounded-bl-md' : 'rounded-br-md',
                  ].join(' ')}
                >
                  <p className="text-base leading-relaxed text-cana-ink2">{quote}</p>
                  <span
                    className={[
                      'absolute -bottom-1.5 h-4 w-4 rotate-45 rounded-sm bg-sky-100',
                      isLeft ? 'left-6' : 'right-6',
                    ].join(' ')}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
