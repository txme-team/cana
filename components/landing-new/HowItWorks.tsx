import FadeUp from "./FadeUp";
import IllustIcon, { IllustIconName } from "./IllustIcon";

const steps: { num: string; icon: IllustIconName; title: string; desc: string }[] = [
  {
    num: "01",
    icon: "diamond-blue",
    title: "무료 맞춤 추천",
    desc: "매주 2~5명, 내 이상형과 신앙관에 맞는 분들의 프로필을 무료로 받아보세요.",
  },
  {
    num: "02",
    icon: "creditcard",
    title: "원할 때만 결제",
    desc: "마음에 드는 분에게 신청하거나 수락할 때만 매칭권을 사용해요. (상대가 거절하면 100% 다시 돌려드려요.)",
  },
  {
    num: "03",
    icon: "calander",
    title: "편안한 일정 조율",
    desc: "약속 장소와 시간은 카나가 알아서 조율하고, 연락처는 만남 하루 전에 안전하게 공유해 드려요.",
  },
  {
    num: "04",
    icon: "paper",
    title: "만남 후 꼼꼼한 케어",
    desc: "첫 만남 이후 상호 매너 평가를 통해 비매너 회원까지 꼼꼼하게 체크합니다.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-[#F4F0EC] py-20 sm:py-28 px-5">
      <div className="max-w-5xl mx-auto">
        <FadeUp className="text-center mb-16">
          <h2 className="text-[28px] lg:text-[34px] font-bold leading-[1.35] tracking-[-1px] text-[#1C1B1A]">
            카나 이용 방법, 아주 간단해요.
          </h2>
        </FadeUp>

        {/* Desktop: horizontal timeline */}
        <div className="hidden lg:grid grid-cols-4 gap-6 relative">
          {/* Connector line between icon boxes */}
          <div className="absolute top-[44px] left-[calc(12.5%+44px)] right-[calc(12.5%+44px)] h-[1.5px] bg-[rgba(28,27,26,0.12)]" />

          {steps.map((s, i) => (
            <FadeUp key={i} delay={0.1 * i}>
              <div className="flex flex-col items-center text-center">
                {/* Icon box with badge */}
                <div className="relative mb-6 z-10">
                  <div className="w-[88px] h-[88px] bg-white rounded-[12px] border border-[rgba(28,27,26,0.07)] shadow-sm flex items-center justify-center">
                    <IllustIcon name={s.icon} size={36} />
                  </div>
                  {/* Badge */}
                  <span className="absolute -top-2.5 -right-2.5 bg-[#559BFF] text-white text-[11px] font-bold px-2 py-0.5 rounded-full leading-tight">
                    {s.num}
                  </span>
                </div>
                <h3 className="text-[18px] font-bold text-[#1C1B1A] mb-2">{s.title}</h3>
                <p className="text-[16px] leading-[26px] text-[rgba(28,27,26,0.6)]">{s.desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>

        {/* Mobile: vertical list */}
        <div className="lg:hidden space-y-6">
          {steps.map((s, i) => (
            <FadeUp key={i} delay={0.08 * i}>
              <div className="bg-white rounded-2xl p-6 flex gap-5 border border-[rgba(28,27,26,0.06)]">
                <div className="relative shrink-0">
                  <div className="w-[56px] h-[56px] bg-[#F4F0EC] rounded-[14px] flex items-center justify-center">
                    <IllustIcon name={s.icon} size={36} />
                  </div>
                  <span className="absolute -top-2 -right-2 bg-[#559BFF] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-tight">
                    {s.num}
                  </span>
                </div>
                <div>
                  <h3 className="text-[18px] font-bold text-[#1C1B1A] mb-1">{s.title}</h3>
                  <p className="text-[16px] leading-[26px] text-[rgba(28,27,26,0.6)]">{s.desc}</p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
