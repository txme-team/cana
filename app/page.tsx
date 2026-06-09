import Navbar from "@/components/landing-new/Navbar";
import Hero from "@/components/landing-new/Hero";
import Problem from "@/components/landing-new/Problem";
import Solution1 from "@/components/landing-new/Solution1";
import Solution2 from "@/components/landing-new/Solution2";
import Solution3 from "@/components/landing-new/Solution3";
import UserPool from "@/components/landing-new/UserPool";
import HowItWorks from "@/components/landing-new/HowItWorks";
import RotationPromo from "@/components/landing-new/RotationPromo";
import Footer from "@/components/landing-new/Footer";

export default function Home() {
  return (
    <>
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
      </main>
      <Footer />
    </>
  );
}
