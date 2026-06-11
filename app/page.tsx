import Navbar from "@/components/landing-new/Navbar";
import Hero from "@/components/landing-new/Hero";
import Problem from "@/components/landing-new/Problem";
import Solution1 from "@/components/landing-new/Solution1";
import Solution2 from "@/components/landing-new/Solution2";
import Solution3 from "@/components/landing-new/Solution3";
import UserPool from "@/components/landing-new/UserPool";
import HowItWorks from "@/components/landing-new/HowItWorks";
import FinalCTA from "@/components/landing-new/FinalCTA";
import RotationPromo from "@/components/landing-new/RotationPromo";
import Footer from "@/components/landing-new/Footer";

export default function Home() {
  return (
    <>
      {/* LCP 이미지(히어로 첫 배경) 프리로드 */}
      <link rel="preload" as="image" href="/hero/bg1.png" />
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <Solution1 />
        <Solution2 />
        <Solution3 />
        <UserPool />
        <HowItWorks />
        <RotationPromo />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
