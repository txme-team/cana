import Nav from '@/components/landing/Nav';
import Hero from '@/components/landing/Hero';
import PainPoint from '@/components/landing/PainPoint';
import Process from '@/components/landing/Process';
import WhyCana from '@/components/landing/WhyCana';
import TrustSafety from '@/components/landing/TrustSafety';
import Events from '@/components/landing/Events';
import FAQ from '@/components/landing/FAQ';
import Footer from '@/components/landing/Footer';

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
      <Footer />
    </>
  );
}
