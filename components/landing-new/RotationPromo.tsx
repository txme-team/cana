import FadeUp from "./FadeUp";
import Image from "next/image";

export default function RotationPromo() {
  return (
    <section className="bg-white py-20 sm:py-28 px-5">
      <div className="max-w-5xl mx-auto">
        <FadeUp>
          <div className="bg-[#F4F0EC] rounded-3xl p-10 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-10">
            {/* Text */}
            <div>
              <h2 className="text-[28px] lg:text-[34px] font-bold leading-[1.3] tracking-[-1px] text-[#1C1B1A] mb-4">
                로테이션 소개팅도
                <br />
                카나에서 만나보세요.
              </h2>
              <p className="text-[16px] leading-[28px] text-[rgba(28,27,26,0.6)] max-w-md mb-8">
                1:1 매칭이 부담스럽다면? 여러 명과 편안하게 대화하며 인연을 찾는 로테이션 소개팅을 경험해보세요.
              </p>
              <a
                href="/rotation"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-[#559BFF] text-white text-[15px] font-semibold px-8 py-3.5 rounded-[12px] hover:bg-[#3A6EA5] transition-colors duration-200 shadow-lg shadow-[#559BFF]/25"
              >
                로테이션 소개팅 보러가기 →
              </a>
            </div>

            {/* Image */}
            <div className="shrink-0 w-full lg:w-[400px] relative aspect-[4/3] rounded-2xl overflow-hidden">
              <Image
                src="/txme-assets/hero/hf_20260605_094152_50de995d-b01b-44dd-a6f3-8896b8939fd9.png"
                alt="로테이션 소개팅"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
