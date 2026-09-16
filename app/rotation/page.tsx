import Nav from '@/components/landing/Nav';
import Hero from '@/components/landing/Hero';
import PainPoint from '@/components/landing/PainPoint';
import Process from '@/components/landing/Process';
import WhyCana from '@/components/landing/WhyCana';
import Testimonials from '@/components/landing/Testimonials';
import TrustSafety from '@/components/landing/TrustSafety';
import Events from '@/components/landing/Events';
import FAQ from '@/components/landing/FAQ';
import CanaPromo from '@/components/landing/CanaPromo';
import Footer from '@/components/landing/Footer';
import { getActiveEvents } from '@/lib/rotation/events';
import { rotationServiceJsonLd, breadcrumbJsonLd, rotationEventsJsonLd } from '@/lib/rotation/schema';

const title = '카나 | 크리스천 로테이션 소개팅';
const description = '신앙 안에서 진지한 만남을 찾는 크리스천을 위한 카나의 크리스천 로테이션 소개팅. 매주 새로운 인연을 만나보세요.';

export const metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: '/rotation' },
  openGraph: {
    title,
    description,
    url: '/rotation',
    siteName: '카나',
    locale: 'ko_KR',
    type: 'website',
    images: [{ url: '/txme-assets/landing/og-image.png', width: 1200, height: 630, alt: title }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/txme-assets/landing/og-image.png'],
  },
};

export default async function LandingPage() {
  const events = await getActiveEvents().catch(() => []);
  const jsonLd = [
    rotationServiceJsonLd(),
    breadcrumbJsonLd([
      { name: '홈', path: '/' },
      { name: '로테이션 소개팅', path: '/rotation' },
    ]),
    ...rotationEventsJsonLd(events),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Nav />
      <Hero />
      <PainPoint />
      <WhyCana />
      <Process />
      <Testimonials />
      <Events preview initialEvents={events} />
      <TrustSafety />
      <FAQ preview />
      <CanaPromo />
      <Footer />
    </>
  );
}
