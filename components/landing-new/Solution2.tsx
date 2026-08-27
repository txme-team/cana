"use client";

import FadeUp from "./FadeUp";
import Icon from "./Icon";
import IllustIcon, { IllustIconName } from "./IllustIcon";
import Image from "next/image";
import { useState, useEffect } from "react";

function TinderCard() {
  return (
    <div className="w-[38%]">
      <p className="text-[11px] text-[rgba(28,27,26,0.35)] uppercase tracking-widest mb-2 text-center">일반 앱</p>
      <div className="relative rounded-2xl overflow-hidden h-[260px] shadow-sm opacity-80">
        <Image src="/txme-assets/images/model.png" alt="준혁" fill className="object-cover object-top" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-14">
          <p className="text-[17px] font-bold text-white">준혁, 31</p>
          <p className="text-[12px] text-white/60 mt-0.5">서울시 강남구</p>
        </div>
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-4 z-10">
          <div className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center">
            <Icon name="block" size={18} className="text-[rgba(28,27,26,0.45)]" />
          </div>
          <div className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center">
            <Icon name="like" size={18} className="text-red-400" />
          </div>
        </div>
      </div>
    </div>
  );
}

function CanaScroll() {
  const [y, setY] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    const totalScroll = 1580; // rendered height of one image (~2115 * container_width/375)
    const duration = 7000;

    const tick = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const progress = (elapsed % duration) / duration;
      setY(-progress * totalScroll);
      raf = requestAnimationFrame(tick);
    };

    let raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div style={{ transform: `translateY(${y}px)`, willChange: "transform" }}>
      <Image src="/txme-assets/images/home 3.png" alt="카나 프로필" width={375} height={2115} className="w-full h-auto block" />
      <Image src="/txme-assets/images/home 3.png" alt="카나 프로필" width={375} height={2115} className="w-full h-auto block" />
    </div>
  );
}

function CardComparison() {
  return (
    <div className="flex gap-5 items-end">
      <TinderCard />

      {/* 카나 카드 — 크고 선명 */}
      <div className="flex-1">
        <p className="text-[11px] text-[#559BFF] uppercase tracking-widest font-semibold mb-2 text-center">카나</p>
        <div className="rounded-2xl border-2 border-[#559BFF]/50 shadow-xl shadow-[#559BFF]/20 relative overflow-hidden h-[420px]">
          <CanaScroll />
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
}

const features: { icon: IllustIconName; title: string; desc: string }[] = [
  {
    icon: "rose",
    title: "외모와 스펙은 기본",
    desc: "사진 몇 장으로 끝나는 가벼운 프로필이 아니에요. 학력, 직업, 외모 등 원하는 조건이 맞는지 확실하게 볼 수 있어요. (안전을 위해 소속 교회는 만남 확정 후에만 공개돼요.)",
  },
  {
    icon: "rate-search",
    title: "내면을 보여주는 깊은 인터뷰",
    desc: "신앙, 커리어, 연애에 대한 진솔한 생각부터 개인의 성격과 매력까지. 값비싼 결정사에서도 알려주기 힘든 상대방의 진짜 결을 미리 읽어볼 수 있어요.",
  },
];

export default function Solution2() {
  return (
    <section className="bg-white py-20 sm:py-28 px-5">
      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text */}
          <div className="order-1 lg:order-2">
            <FadeUp>
              <h2 className="text-[28px] lg:text-[34px] font-bold leading-[1.35] tracking-[-1px] text-[#1C1B1A] mb-10">
                결정사에서도 알기 힘든
                <br />
                &apos;진짜 정보&apos;를 미리 확인하세요.
              </h2>
            </FadeUp>

            <div className="space-y-6">
              {features.map((f, i) => (
                <FadeUp key={i} delay={0.1 * (i + 1)}>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 flex items-center justify-center shrink-0 mt-0.5">
                      <IllustIcon name={f.icon} size={36} />
                    </div>
                    <div>
                      <h3 className="text-[18px] font-semibold text-[#1C1B1A] mb-1">{f.title}</h3>
                      <p className="text-[16px] leading-[26px] text-[rgba(28,27,26,0.6)]">{f.desc}</p>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>

          {/* Right: Card comparison */}
          <FadeUp className="order-2 lg:order-1">
            <CardComparison />
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
