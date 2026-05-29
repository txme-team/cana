import Link from 'next/link';
import HeroCardSkeleton from './HeroCardSkeleton';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-cana-cream" style={{ paddingTop: '180px', paddingBottom: '0' }}>

      {/* 배경 장식 */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-[480px] w-[480px] rounded-xl bg-cana/6" />
        <div className="absolute -bottom-24 -left-24 h-[360px] w-[360px] rounded-xl bg-cana/4" />
        <svg className="absolute right-10 top-32 opacity-[0.06] sm:right-24 sm:top-24" width="120" height="120" viewBox="0 0 40 40" fill="none">
          <rect x="17" y="2" width="6" height="36" rx="3" fill="#b5436a" />
          <rect x="2" y="13" width="36" height="6" rx="3" fill="#b5436a" />
        </svg>
        <svg className="absolute bottom-28 left-8 opacity-[0.05] sm:left-20" width="72" height="72" viewBox="0 0 40 40" fill="none">
          <rect x="17" y="2" width="6" height="36" rx="3" fill="#b5436a" />
          <rect x="2" y="13" width="36" height="6" rx="3" fill="#b5436a" />
        </svg>
      </div>

      {/* ── 모바일: 중앙 정렬 ── */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-5 lg:hidden">
        <div className="flex items-center gap-2">
          <img src="/icons/christian.svg" alt="" className="h-5 w-5" />
          <span className="text-sm font-medium tracking-wide text-cana-ink2">크리스천 직장인 로테이션 소개팅</span>
        </div>
        <h1 className="text-center text-3xl font-bold leading-tight tracking-tight text-cana-ink sm:text-4xl sm:leading-tight">
          자기소개만 반복하다<br />
          <span className="text-cana">끝나는 소개팅</span>은 이제 그만
        </h1>
        <p className="text-center text-base leading-relaxed text-cana-ink3">
          만나기 전에 서로를 먼저 알고,<br />당일엔 진짜 대화를 시작하세요.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Link href="/apply" className="rounded-xl bg-cana px-8 py-3.5 text-base font-semibold text-white transition hover:bg-cana-dark active:scale-95">
            지금 신청하기
          </Link>
          <a href="#how" className="rounded-xl border border-cana-rule px-8 py-3.5 text-base font-medium text-cana-ink2 transition hover:border-cana/40 hover:bg-white">
            진행 방식 보기
          </a>
        </div>
      </div>

      {/* ── 데스크탑: 풀 블리드 우측 카드 ── */}
      <div className="relative z-10 hidden items-start lg:flex">

        {/* 좌측 텍스트 */}
        <div
          className="flex w-[55%] flex-shrink-0 flex-col items-start gap-6 pr-16 text-left"
          style={{ paddingLeft: 'max(20px, calc((100vw - 1024px) / 2 + 20px))' }}
        >
          <div className="flex items-center gap-2">
            <img src="/icons/christian.svg" alt="" className="h-5 w-5" />
            <span className="text-sm font-medium tracking-wide text-cana-ink2">크리스천 직장인 로테이션 소개팅</span>
          </div>

          <h1 className="text-4xl font-bold leading-tight tracking-tight text-cana-ink xl:text-5xl xl:leading-tight">
            자기소개만 반복하다<br />
            <span className="text-cana">끝나는 소개팅</span>은 이제 그만
          </h1>

          <p className="text-base leading-relaxed text-cana-ink3 sm:text-lg">
            만나기 전에 서로를 먼저 알고,<br />
            당일엔 진짜 대화를 시작하세요.
          </p>

          <div className="flex items-center gap-3">
            <Link href="/apply" className="rounded-xl bg-cana px-8 py-3.5 text-base font-semibold text-white transition hover:bg-cana-dark active:scale-95">
              지금 신청하기
            </Link>
            <a href="#how" className="rounded-xl border border-cana-rule px-8 py-3.5 text-base font-medium text-cana-ink2 transition hover:border-cana/40 hover:bg-white">
              진행 방식 보기
            </a>
          </div>
        </div>

        {/* 우측 카드 */}
        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="relative rounded-tl-3xl bg-gradient-to-br from-cana/10 via-cana-muted to-cana-rule/40 p-5 pb-0">
            <div className="translate-y-3 rotate-1 transform overflow-hidden rounded-t-xl shadow-2xl shadow-cana/20">
              <HeroCardSkeleton />
            </div>
          </div>
        </div>

      </div>

    </section>
  );
}
