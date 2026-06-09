import { Suspense } from 'react';
import Nav from '@/components/landing/Nav';
import SuccessHandler from './SuccessHandler';

export const dynamic = 'force-dynamic';
export const metadata = { title: '결제 확인 중 | cana' };

export default function PaymentSuccessPage() {
  return (
    <>
      <Nav />
      <main className="flex min-h-screen items-center justify-center bg-cana-cream px-4 pt-16">
        <Suspense
          fallback={
            <div className="w-full max-w-sm rounded-2xl border border-cana-rule bg-white p-8 text-center shadow-sm">
              <p className="text-base text-cana-ink3">결제를 확인하고 있어요...</p>
            </div>
          }
        >
          <SuccessHandler />
        </Suspense>
      </main>
    </>
  );
}
