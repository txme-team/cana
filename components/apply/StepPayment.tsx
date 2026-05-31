'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

// ─── Toss Payments V2 타입 선언 ───────────────────────────────────────────────

interface TossWidgets {
  setAmount: (options: { value: number; currency: string }) => Promise<void>;
  renderPaymentMethods: (
    selector: string,
    options?: { variantKey?: string }
  ) => Promise<void>;
  renderAgreement: (
    selector: string,
    options?: { variantKey?: string }
  ) => Promise<void>;
  requestPayment: (options: {
    orderId: string;
    orderName: string;
    successUrl: string;
    failUrl: string;
    customerName?: string;
  }) => Promise<void>;
}

declare global {
  interface Window {
    TossPayments?: (clientKey: string) => {
      widgets: (options: { customerKey: string }) => TossWidgets;
    };
  }
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface StepPaymentProps {
  applicationId: string;
  eventTitle: string;
  amount: number;
  customerKey: string; // Supabase user_id (UUID)
}

// ─── 컴포넌트 ─────────────────────────────────────────────────────────────────

export default function StepPayment({
  applicationId,
  eventTitle,
  amount,
  customerKey,
}: StepPaymentProps) {
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [widgetReady, setWidgetReady] = useState(false);
  const [paying, setPaying] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);
  const widgetsRef = useRef<TossWidgets | null>(null);

  const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;
  const formatted = amount.toLocaleString('ko-KR');

  // SDK 로드 완료 후 위젯 초기화
  useEffect(() => {
    if (!sdkLoaded || !window.TossPayments) return;

    let cancelled = false;

    (async () => {
      try {
        const tossPayments = window.TossPayments!(clientKey);
        const widgets = tossPayments.widgets({ customerKey });
        widgetsRef.current = widgets;

        await widgets.setAmount({ value: amount, currency: 'KRW' });
        await Promise.all([
          widgets.renderPaymentMethods('#toss-payment-methods', {
            variantKey: 'DEFAULT',
          }),
          widgets.renderAgreement('#toss-agreement', {
            variantKey: 'AGREEMENT',
          }),
        ]);

        if (!cancelled) setWidgetReady(true);
      } catch (err) {
        if (!cancelled) {
          setInitError(
            err instanceof Error
              ? err.message
              : '결제 모듈을 불러오지 못했어요. 새로고침 해보세요.'
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sdkLoaded, clientKey, customerKey, amount]);

  const handlePayment = async () => {
    if (!widgetsRef.current || paying) return;
    setPaying(true);
    setPayError(null);

    try {
      await widgetsRef.current.requestPayment({
        orderId: applicationId,
        orderName: 'cana 소개팅 참여비',
        successUrl: `${window.location.origin}/apply/success`,
        failUrl: `${window.location.origin}/apply/fail`,
      });
      // requestPayment는 성공 시 successUrl로 리다이렉트 → 아래 코드는 실행 안 됨
    } catch (err: unknown) {
      // 결제 취소 또는 오류 (리다이렉트 전 에러)
      const msg =
        err instanceof Error ? err.message : '결제 중 오류가 발생했어요.';
      setPayError(msg);
      setPaying(false);
    }
  };

  return (
    <>
      <Script
        src="https://js.tosspayments.com/v2/standard"
        strategy="afterInteractive"
        onReady={() => setSdkLoaded(true)}
      />

      <div className="flex flex-col gap-6">
        {/* 헤더 */}
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-cana-ink">결제</h2>
          <p className="text-sm text-cana-ink3">{eventTitle}</p>
        </div>

        {/* 금액 요약 */}
        <div className="flex items-center justify-between rounded-2xl border border-cana-rule bg-cana-cream px-5 py-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-cana-ink3">참여비</span>
            <span className="text-base text-cana-ink">cana 소개팅 참여비</span>
          </div>
          <span className="text-xl font-bold text-cana">{formatted}원</span>
        </div>

        {/* 위젯 로딩 중 스켈레톤 */}
        {!widgetReady && !initError && (
          <div className="flex flex-col gap-3">
            <div className="h-[200px] animate-pulse rounded-2xl bg-cana-rule/40" />
            <div className="h-[80px] animate-pulse rounded-2xl bg-cana-rule/40" />
          </div>
        )}

        {/* 초기화 오류 */}
        {initError && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {initError}
          </div>
        )}

        {/* Toss 결제 위젯 마운트 포인트 */}
        <div id="toss-payment-methods" />
        <div id="toss-agreement" />

        {/* 결제 에러 */}
        {payError && (
          <p className="text-center text-sm text-red-500">{payError}</p>
        )}

        {/* 결제 버튼 */}
        <button
          type="button"
          onClick={handlePayment}
          disabled={!widgetReady || paying}
          className="w-full rounded-xl bg-cana py-3.5 text-base font-semibold text-white transition active:bg-cana-dark disabled:opacity-50"
        >
          {paying
            ? '결제 처리 중...'
            : !widgetReady
            ? '불러오는 중...'
            : `${formatted}원 결제하기`}
        </button>

        {/* 환불 안내 */}
        <p className="text-center text-xs text-cana-ink3">
          행사 3일 전까지 취소 시 전액 환불 · 문의: @cana_official
        </p>
      </div>
    </>
  );
}
