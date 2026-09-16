import Nav from '@/components/landing/Nav';
import FAQ from '@/components/landing/FAQ';
import Footer from '@/components/landing/Footer';
import BackButton from '@/components/landing/BackButton';
import { breadcrumbJsonLd } from '@/lib/rotation/schema';

const title = '자주 묻는 질문';
const description = '카나 크리스천 로테이션 소개팅 이용 전 자주 묻는 질문을 확인해보세요.';

export const metadata = {
  title,
  description,
  alternates: { canonical: '/rotation/faq' },
  openGraph: {
    title: `${title} | 카나`,
    description,
    url: '/rotation/faq',
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

export default function FAQPage() {
  const jsonLd = breadcrumbJsonLd([
    { name: '홈', path: '/' },
    { name: '로테이션 소개팅', path: '/rotation' },
    { name: '자주 묻는 질문', path: '/rotation/faq' },
  ]);

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
          <h1 className="mb-8 text-xl font-bold text-cana-ink">자주 묻는 질문</h1>
          <FAQ standalone />
        </div>
      </main>
      <Footer />
    </>
  );
}
