import FadeUp from "./FadeUp";
import IllustIcon, { IllustIconName } from "./IllustIcon";

const features: { icon: IllustIconName; title: string; desc: string }[] = [
  {
    icon: "chat",
    title: "소모적인 채팅은 생략",
    desc: "연락처부터 주고받으며 무슨 말을 할지 고민하지 마세요. 매칭이 성사되면 카나에서 직접 첫 만남 장소와 시간까지 알아서 조율해 드립니다.",
  },
  {
    icon: "ticket",
    title: "책임감 있는 만남을 위한 구조",
    desc: "만남을 신청할 때도, 수락할 때도 양쪽 모두 매칭권을 사용해요. 남녀 일방에게만 부담을 지우지 않기 때문에, 정말 진지하게 만나볼 분들만 마주 앉게 됩니다.",
  },
];

export default function Solution3() {
  return (
    <section className="bg-[#F4F0EC] py-20 sm:py-28 px-5">
      <div className="max-w-5xl mx-auto text-center">
        <FadeUp>
          <h2 className="text-[28px] lg:text-[34px] font-bold leading-[1.35] tracking-[-1px] text-[#1C1B1A] mb-14">
            무의미한 채팅은 No!
            <br />
            카나는 진짜 소개팅을 잡아드려요.
          </h2>
        </FadeUp>

        <div className="grid sm:grid-cols-2 gap-6 items-stretch">
          {features.map((f, i) => (
            <FadeUp key={i} delay={0.1 * (i + 1)} className="h-full">
              <div className="h-full bg-white rounded-3xl p-8 text-left border border-[rgba(28,27,26,0.06)] shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="w-12 h-12 flex items-center justify-center mb-5">
                  <IllustIcon name={f.icon} size={36} />
                </div>
                <h3 className="text-[18px] font-bold text-[#1C1B1A] mb-3 leading-[1.4]">{f.title}</h3>
                <p className="text-[16px] leading-[26px] text-[rgba(28,27,26,0.6)]">{f.desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
