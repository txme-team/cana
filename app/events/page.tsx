import Nav from '@/components/landing/Nav';
import EventsList from '@/components/landing/EventsPage';
import Footer from '@/components/landing/Footer';
import BackButton from '@/components/landing/BackButton';

export const metadata = {
  title: '소개팅 일정 | cana',
};

export default function EventsPage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen bg-cana-cream pb-20 pt-24">
        <div className="mx-auto max-w-2xl px-5">
          <BackButton />
          <h1 className="mb-8 text-xl font-bold text-cana-ink">소개팅 일정</h1>
          <EventsList />
        </div>
      </main>
      <Footer />
    </>
  );
}
