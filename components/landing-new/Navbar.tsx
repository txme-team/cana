"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-5xl mx-auto px-5 py-4 flex items-center gap-10">
        {/* Logo */}
        <a href="/">
          <Image
            src={scrolled ? "/txme-assets/logo-text-black.svg" : "/txme-assets/logo-text-white.svg"}
            alt="카나"
            width={52.5}
            height={14}
            priority
          />
        </a>

        <div className="flex-1" />

        {/* CTA — white bg always on hero, solid on scroll */}
        <a
          href="/home"
          className="inline-flex items-center justify-center text-[14px] font-semibold px-6 h-9 rounded-[8px] border border-[#D1C7C7] bg-[#EBE6E6] text-[#1C1B1A] hover:bg-[#D1C7C7] transition-colors duration-200"
        >
          시작하기
        </a>
      </div>
    </header>
  );
}
