"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const images = ["/hero/bg1.png", "/hero/bg2.png", "/hero/bg3.png", "/hero/bg4.png"];
const INTERVAL = 4000;

export default function Hero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, INTERVAL);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-screen flex items-center overflow-hidden">
      {/* Rolling background images */}
      <AnimatePresence>
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${images[current]})` }}
        />
      </AnimatePresence>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

      {/* Text — vertically centered, left aligned */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-5">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-[18px] text-white/75 mb-4 tracking-wide"
        >
          교회 밖에서 안전하게 연애하기
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-[44px] lg:text-[56px] font-bold leading-[1.2] tracking-[-1.5px] text-white mb-10"
        >
          크리스천끼리 설레는
          <br />
          이상형 매칭, 카나
        </motion.h1>

        <motion.a
          href="https://cana.im/home"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center justify-center gap-1 h-[52px] px-6 rounded-[12px] border border-[#D1C7C7] bg-[#EBE6E6] text-[#1C1B1A] text-[15px] font-semibold hover:bg-[#D1C7C7] transition-colors duration-200"
        >
          지금 시작하기
        </motion.a>
      </div>
    </section>
  );
}
