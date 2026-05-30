import Nav from '@/components/landing/Nav';
import Events from '@/components/landing/Events';
import Footer from '@/components/landing/Footer';
import BackButton from '@/components/landing/BackButton';

export const metadata = {
  title: '소개팅 일정 | cana',
};

export default function EventsPage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen bg-cana-cream px-5 pb-20 pt-24">
        <div className="mx-auto max-w-2xl">
          <BackButton />
          <h1 className="mb-8 text-xl font-bold text-cana-ink">소개팅 일정</h1>
          <Events standalone />
        </div>
      </main>
      <Footer />
    </>
  );
}
