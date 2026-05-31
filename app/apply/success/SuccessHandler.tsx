'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function SuccessHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const calledRef = useRef(false);

  useEffect(() => {
    // StrictMode 이중 호출 방지
    if (calledRef.current) return;
    calledRef.current = true;

    const paymentKey = searchParams.get('paymentKey');
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');

    if (!paymentKey || !orderId || !amount) {
      router.replace(
        '/apply/fail?message=' + encodeURIComponent('결제 정보가 올바르지 않아요.')
      );
      return;
    }

    fetch('/api/payment/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount: Number(amount),
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({})) as { error?: string };
          throw new Error(err.error ?? '결제 확인에 실패했어요.');
        }
        router.replace('/apply/complete');
      })
      .catch((err: unknown) => {
        const msg =
          err instanceof Error ? err.message : '오류가 발생했어요.';
        router.replace(
          '/apply/fail?message=' + encodeURIComponent(msg)
        );
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full max-w-sm rounded-2xl border border-cana-rule bg-white p-8 text-center shadow-sm">
      <div className="mb-4 flex justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-cana-rule border-t-cana" />
      </div>
      <p className="text-base font-medium text-cana-ink">결제를 확인하고 있어요</p>
      <p className="mt-1.5 text-sm text-cana-ink3">잠시만 기다려주세요...</p>
    </div>
  );
}
