"use client";

import FadeUp from "./FadeUp";
import IllustIcon, { IllustIconName } from "./IllustIcon";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";

const features: { icon: IllustIconName; title: string; desc: string }[] = [
  {
    icon: "under-construction",
    title: "이단 원천 차단",
    desc: "검증된 데이터베이스를 통해 이단 소속 교인의 가입을 철저히 막아요.",
  },
  {
    icon: "shining-profile",
    title: "확실한 신원과 능력",
    desc: "직업과 학력까지 꼼꼼하게 인증해요.",
  },
  {
    icon: "shocked",
    title: "아는 사람 완벽 차단",
    desc: "같은 교회 교인, 직장 동료, 내 스마트폰 연락처 지인까지 모두 차단해서 민망한 상황을 미리 막아드려요.",
  },
];

const images = ["/images/1.png", "/images/2.png", "/images/3.png"];

export default function Solution1() {
  const [active, setActive] = useState<number>(0);
  const isHovering = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isHovering.current) {
        setActive((prev) => (prev + 1) % features.length);
      }
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const hovered = active;

  return (
    <section className="bg-[#F4F0EC] py-20 sm:py-28 px-5">
      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Right: Image */}
          <FadeUp className="order-1 lg:order-2">
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-white shadow-md border border-[rgba(28,27,26,0.06)]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={hovered}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={images[hovered]}
                    alt={`인증 ${hovered + 1}`}
                    fill
                    className="object-cover"
                  />
                </motion.div>
              </AnimatePresence>
              {/* Dot indicator */}
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
                {images.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === hovered ? "w-5 bg-white" : "w-1.5 bg-white/50"}`}
                  />
                ))}
              </div>
            </div>
          </FadeUp>

          {/* Left: Feature cards */}
          <div className="order-2 lg:order-1">
            <FadeUp>
              <h2 className="text-[28px] lg:text-[34px] font-bold leading-[1.35] tracking-[-1px] text-[#1C1B1A] mb-10">
                깐깐하게 검증하고,
                <br />
                마주칠 걱정은 없앴어요.
              </h2>
            </FadeUp>

            <div className="space-y-3">
              {features.map((f, i) => (
                <FadeUp key={i} delay={0.1 * (i + 1)}>
                  <div
                    onMouseEnter={() => { isHovering.current = true; setActive(i); }}
                    onMouseLeave={() => { isHovering.current = false; }}
                    className={`flex items-center gap-4 px-5 py-4 rounded-2xl border cursor-default transition-all duration-200 ${
                      hovered === i
                        ? "bg-white border-[rgba(28,27,26,0.1)] shadow-sm"
                        : "bg-transparent border-transparent hover:bg-white/60"
                    }`}
                  >
                    <div className="w-10 h-10 flex items-center justify-center shrink-0">
                      <IllustIcon name={f.icon} size={36} />
                    </div>
                    <div>
                      <h3 className={`text-[17px] font-semibold mb-0.5 transition-colors ${hovered === i ? "text-[#1C1B1A]" : "text-[rgba(28,27,26,0.6)]"}`}>
                        {f.title}
                      </h3>
                      <p className={`text-[14px] leading-[22px] transition-colors ${hovered === i ? "text-[rgba(28,27,26,0.6)]" : "text-[rgba(28,27,26,0.4)]"}`}>
                        {f.desc}
                      </p>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
