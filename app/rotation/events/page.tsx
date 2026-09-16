import Nav from '@/components/landing/Nav';
import EventsList from '@/components/landing/EventsPage';
import Footer from '@/components/landing/Footer';
import BackButton from '@/components/landing/BackButton';
import { getActiveEvents } from '@/lib/rotation/events';
import { breadcrumbJsonLd, rotationEventsJsonLd } from '@/lib/rotation/schema';

const title = '소개팅 일정';
const description = '카나에서 진행되는 크리스천 로테이션 소개팅 일정을 확인하고 신청하세요.';

export const metadata = {
  title,
  description,
  alternates: { canonical: '/rotation/events' },
  openGraph: {
    title: `${title} | 카나`,
    description,
    url: '/rotation/events',
    siteName: '카나',
    locale: 'ko_KR',
    type: 'website',
    images: [{ url: '/txme-assets/landing/og-image.png', width: 1200, height: 630, alt: title }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${title} | 카나`,
    description,
    images: ['/txme-assets/landing/og-image.png'],
  },
};

export default async function EventsPage() {
  const events = await getActiveEvents().catch(() => []);
  const jsonLd = [
    breadcrumbJsonLd([
      { name: '홈', path: '/' },
      { name: '로테이션 소개팅', path: '/rotation' },
      { name: '소개팅 일정', path: '/rotation/events' },
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
      <main className="min-h-screen bg-cana-cream pb-20 pt-24">
        <div className="mx-auto max-w-2xl px-5">
          <BackButton />
          <h1 className="mb-8 text-xl font-bold text-cana-ink">소개팅 일정</h1>
          <EventsList initialEvents={events} />
        </div>
      </main>
      <Footer />
    </>
  );
}
