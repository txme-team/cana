import FadeUp from "./FadeUp";

export default function FinalCTA() {
  return (
    <section className="relative py-32 sm:py-40 px-5 overflow-hidden bg-[#F7F6F4]">
      <div className="max-w-5xl mx-auto text-center relative z-10">
        <FadeUp>
          <h2 className="text-[32px] lg:text-[42px] font-bold leading-[1.25] tracking-[-1.5px] text-[#1C1B1A] mb-6">
            이제 카나에서
            <br />
            안심하고 연애하세요
          </h2>
        </FadeUp>

        <FadeUp delay={0.1}>
          <a
            href="https://cana.im/home"
            className="inline-flex items-center justify-center bg-[#559BFF] text-white text-[17px] font-semibold px-10 py-5 rounded-[12px] hover:bg-[#3A6EA5] transition-colors duration-200 shadow-2xl shadow-[#559BFF]/30"
          >
            카나 시작하기
          </a>
        </FadeUp>
      </div>
    </section>
  );
}
