import FadeUp from "./FadeUp";
import Image from "next/image";

export default function Problem() {
  return (
    <section id="problem" className="bg-white py-20 sm:py-28 px-5">
      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left: Image */}
          <FadeUp className="order-2 lg:order-1">
            <div className="relative w-full aspect-square rounded-3xl overflow-hidden">
              <Image
                src="/txme-assets/hero/hf_20260605_073752_c334aed9-28d8-45f8-bb7f-4c40839ac8ce.png"
                alt="카나 서비스 소개"
                fill
                className="object-cover"
              />
            </div>
          </FadeUp>

          {/* Right: Text */}
          <div className="order-1 lg:order-2">
            <FadeUp>
              <h2 className="text-[28px] lg:text-[34px] font-bold leading-[1.35] tracking-[-1px] text-[#1C1B1A] mb-8">
                같은 크리스천을 만나고 싶은데,
                <br />
                현실은 참 쉽지 않죠.
              </h2>
            </FadeUp>

            <FadeUp delay={0.1}>
              <p className="text-[17px] leading-[30px] text-[rgba(28,27,26,0.65)] mb-12">
                교회 안 좁은 관계 속 연애는 항상 불편한 주제입니다. 교회 밖 세상에서 찾자니 내가 가진 신앙의 깊이를 이해해 줄 사람을 만나기는 더더욱 막막합니다. 크리스천의 연애, 왜 이렇게 조심스럽고 어려워야 할까요?
              </p>
            </FadeUp>

            <FadeUp delay={0.2}>
              {/* Speech bubble */}
              <div className="relative bg-[#559BFF]/10 border border-[#559BFF]/20 rounded-2xl px-8 py-5 w-full">
                {/* Tail — outer border triangle */}
                <div
                  className="absolute -top-[11px] left-10"
                  style={{
                    width: 0, height: 0,
                    borderLeft: "8px solid transparent",
                    borderRight: "8px solid transparent",
                    borderBottom: "11px solid rgba(85,155,255,0.2)",
                  }}
                />
                {/* Tail — inner fill triangle (hides border) */}
                <div
                  className="absolute -top-[9px] left-[41px]"
                  style={{
                    width: 0, height: 0,
                    borderLeft: "7px solid transparent",
                    borderRight: "7px solid transparent",
                    borderBottom: "9px solid rgba(85,155,255,0.1)",
                  }}
                />
                <p className="text-[18px] font-semibold text-[#3A6EA5] leading-[1.7]">
                  카나는 크리스천의 현실적인 연애 고민을 해결하기 위해 탄생했습니다.
                </p>
              </div>
            </FadeUp>
          </div>

        </div>
      </div>
    </section>
  );
}
