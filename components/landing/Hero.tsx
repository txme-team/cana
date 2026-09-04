import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden">
      {/* 배경 이미지 */}
      <Image
        src="/txme-assets/images/hero.png"
        alt="카나 로테이션 소개팅"
        fill
        priority
        className="object-cover"
      />

      {/* 그라데이션 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

      {/* 텍스트 */}
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-5 pt-24 text-center lg:items-start lg:pt-0 lg:text-left">
        <span className="text-[18px] font-medium tracking-wide text-white/75">
          크리스천 직장인 로테이션 소개팅
        </span>

        <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl sm:leading-tight xl:text-5xl xl:leading-tight">
          자기소개만 반복하다<br />
          <span className="text-cana-light">끝나는 소개팅</span>은 이제 그만
        </h1>

        <p className="text-base leading-relaxed text-white/80 sm:text-lg">
          만나기 전에 서로를 먼저 알고,<br />
          당일엔 진짜 대화를 시작하세요.
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Link href="/rotation/apply" className="rounded-xl bg-cana px-8 py-3.5 text-base font-semibold text-white transition hover:bg-cana-dark active:scale-95">
            지금 신청하기
          </Link>
        </div>
      </div>
    </section>
  );
}
