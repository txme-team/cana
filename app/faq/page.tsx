import Nav from '@/components/landing/Nav';
import FAQ from '@/components/landing/FAQ';
import Footer from '@/components/landing/Footer';
import BackButton from '@/components/landing/BackButton';

export const metadata = {
  title: '자주 묻는 질문 | cana',
};

export default function FAQPage() {
  return (
    <>
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
