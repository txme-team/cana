import Nav from '@/components/landing/Nav';
import Events from '@/components/landing/Events';
import Footer from '@/components/landing/Footer';

export const metadata = {
  title: '모집 중인 일정 | cana',
};

export default function EventsPage() {
  return (
    <>
      <Nav />
      <Events showBack />
      <Footer />
    </>
  );
}
