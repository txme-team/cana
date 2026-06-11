import Nav from '@/components/landing/Nav';
import Hero from '@/components/landing/Hero';
import PainPoint from '@/components/landing/PainPoint';
import Process from '@/components/landing/Process';
import WhyCana from '@/components/landing/WhyCana';
import TrustSafety from '@/components/landing/TrustSafety';
import Events from '@/components/landing/Events';
import FAQ from '@/components/landing/FAQ';
import CanaPromo from '@/components/landing/CanaPromo';
import Footer from '@/components/landing/Footer';

export const metadata = {
  title: '로테이션 소개팅',
  description: '신앙 안에서 진지한 만남을 찾는 크리스천을 위한 카나 로테이션 소개팅. 매주 새로운 인연을 만나보세요.',
};

export default function LandingPage() {
  return (
    <>
      <Nav />
      <Hero />
      <PainPoint />
      <WhyCana />
      <Process />
      <Events preview />
      <TrustSafety />
      <FAQ preview />
      <CanaPromo />
      <Footer />
    </>
  );
}
