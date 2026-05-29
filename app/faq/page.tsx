import Nav from '@/components/landing/Nav';
import FAQ from '@/components/landing/FAQ';
import Footer from '@/components/landing/Footer';

export const metadata = {
  title: '자주 묻는 질문 | cana',
};

export default function FAQPage() {
  return (
    <>
      <Nav />
      <FAQ showBack />
      <Footer />
    </>
  );
}
