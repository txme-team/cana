import CanaPromoCards from './CanaPromoCards';

export default function CanaPromo() {
  return (
    <section className="bg-white px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col items-center justify-between gap-10 rounded-3xl bg-cana-cream p-10 lg:flex-row lg:p-16">
          {/* 텍스트 */}
          <div>
            <h2 className="mb-4 text-[28px] font-bold leading-[1.3] tracking-tight text-cana-ink lg:text-[34px]">
              더 많은 인연을
              <br />
              카나에서 만나보세요.
            </h2>
            <p className="mb-8 max-w-md text-base leading-relaxed text-cana-ink3">
              바른 신앙관은 물론, 단정한 외모와 탄탄한 커리어까지. 교회 안에서는 마주치기 어려웠던 매력적인 선남선녀 크리스천들이 지금 카나에서 기다리고 있어요.
            </p>
            <a
              href="https://cana.im/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl bg-cana px-8 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-cana/25 transition-colors duration-200 hover:bg-cana-dark"
            >
              카나 1:1 소개팅 보러가기 →
            </a>
          </div>

          {/* 프로필 카드 캐러셀 */}
          <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-2xl lg:w-[400px]">
            <CanaPromoCards />
          </div>
        </div>
      </div>
    </section>
  );
}
