import FadeUp from "./FadeUp";

export default function FinalCTA() {
  return (
    <section className="bg-[#1C1B1A] py-20 sm:py-28 px-5 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#559BFF]/15 blur-3xl rounded-full" />

      <div className="max-w-5xl mx-auto text-center relative z-10">
        <FadeUp>
          <h2 className="text-[32px] lg:text-[42px] font-bold leading-[1.25] tracking-[-1.5px] text-white mb-6">
            이제 카나에서
            <br />
            안심하고 연애하세요
          </h2>
        </FadeUp>

        <FadeUp delay={0.1}>
          <a
            href="#"
            className="inline-flex items-center justify-center bg-[#559BFF] text-white text-[17px] font-semibold px-10 py-5 rounded-[12px] hover:bg-[#3A6EA5] transition-colors duration-200 shadow-2xl shadow-[#559BFF]/30"
          >
            카나 시작하기
          </a>
        </FadeUp>
      </div>
    </section>
  );
}
