"use client";

import FadeUp from "./FadeUp";
import Icon from "./Icon";
import { motion } from "framer-motion";
import Image from "next/image";

const profiles = [
  {
    age: 28, job: "대학병원 간호사", school: "서울대 졸업", church: "장로교",
    quote: "신앙 안에서 진지하게 함께 성장해 나갈 분을 만나고 싶어요.",
    info: "164cm · 마포구 · INFJ",
    image: "/txme-assets/images/여자1.png",
  },
  {
    age: 31, job: "대기업 연구원", school: "카이스트 졸업", church: "침례교",
    quote: "완벽한 사람보다는, 함께 웃고 기도할 수 있는 사람이 좋습니다.",
    info: "178cm · 강남구 · INTJ",
    image: "/txme-assets/images/남자1.png",
  },
  {
    age: 27, job: "공무원 (5급)", school: "연세대 졸업", church: "감리교",
    quote: "소소한 일상도 함께라면 특별해진다고 믿어요.",
    info: "162cm · 서초구 · ENFP",
    image: "/txme-assets/images/여자2.png",
  },
  {
    age: 33, job: "스타트업 CTO", school: "포스텍 졸업", church: "순복음",
    quote: "서로의 믿음을 존중하며 함께 나아가는 관계를 원합니다.",
    info: "180cm · 용산구 · ISTP",
    image: "/txme-assets/images/남자2.png",
  },
  {
    age: 30, job: "병원 의사", school: "서울대 의대", church: "감리교",
    quote: "바쁜 일상 속에도 함께 예배드릴 수 있는 분을 찾고 있어요.",
    info: "175cm · 송파구 · ENTJ",
    image: "/txme-assets/images/남자3.png",
  },
  {
    age: 29, job: "공기업 재직", school: "한양대 졸업", church: "침례교",
    quote: "부족함도 은혜로 채워가며 동행할 수 있는 분이었으면 해요.",
    info: "165cm · 강동구 · ISFP",
    image: "/txme-assets/images/여자4.png",
  },
  {
    age: 32, job: "대기업 개발자", school: "포스텍 졸업", church: "순복음",
    quote: "서로를 향한 배려와 믿음으로 든든한 관계를 만들고 싶습니다.",
    info: "177cm · 분당구 · INTP",
    image: "/txme-assets/images/남자4.png",
  },
];

const loopedProfiles = [...profiles, ...profiles];
const bobOffsets = [0, -12, -6, -16, -4, -10, -8, -14, 0, -12, -6, -16, -4, -10, -8, -14];
const bobDurations = [2.8, 2.4, 3.1, 2.6, 2.9, 2.3, 3.2, 2.7, 2.8, 2.4, 3.1, 2.6, 2.9, 2.3, 3.2, 2.7];

function ProfileCard({ p, index }: { p: typeof profiles[0]; index: number }) {
  return (
    <motion.div
      animate={{ y: [0, bobOffsets[index % bobOffsets.length], 0] }}
      transition={{
        duration: bobDurations[index % bobDurations.length],
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="w-[260px] shrink-0"
    >
      <div className="relative rounded-3xl overflow-hidden h-[380px] flex flex-col justify-between">
        {/* Background image */}
        <Image
          src={p.image}
          alt={p.job}
          fill
          className="object-cover object-top blur-sm scale-105"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/10" />

        <div />

        {/* Bottom text */}
        <div className="relative z-10 px-5 pb-6">
          <h3 className="text-[20px] font-bold text-white leading-[1.2] mb-2">
            {p.age}세, {p.job}
          </h3>
          <p className="text-[13px] text-white/75 leading-[1.6] mb-4 line-clamp-2">
            {p.quote}
          </p>
          <div className="flex items-center gap-1.5">
            <Icon name="profile" size={14} className="text-white/60" />
            <span className="text-[12px] text-white/60">{p.info}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function UserPool() {
  return (
    <section className="bg-white py-20 sm:py-28 px-5 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <FadeUp className="text-center mb-14">
          <h2 className="text-[28px] lg:text-[34px] font-bold leading-[1.35] tracking-[-1px] text-[#1C1B1A] mb-4">
            어떤 분들이 모여 있을까요?
          </h2>
          <p className="text-[17px] leading-[28px] text-[rgba(28,27,26,0.6)] max-w-xl mx-auto">
            바른 신앙관은 물론, 단정한 외모와 탄탄한 커리어까지.
            교회 안에서는 마주치기 어려웠던 매력적인 선남선녀 크리스천들이
            지금 카나에서 기다리고 있어요.
          </p>
        </FadeUp>
      </div>

      {/* Marquee — negative margin to break out of px-5 */}
      <div className="relative -mx-5 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <motion.div
          className="flex gap-4 py-5 px-5"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          style={{ width: "max-content" }}
        >
          {loopedProfiles.map((p, i) => (
            <ProfileCard key={i} p={p} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
