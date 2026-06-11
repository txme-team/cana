'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

// ─── Toss Payments V2 타입 선언 ───────────────────────────────────────────────

interface TossWidgets {
  setAmount: (options: { value: number; currency: string }) => Promise<void>;
  renderPaymentMethods: (selector: string, options?: { variantKey?: string }) => Promise<void>;
  renderAgreement: (selector: string, options?: { variantKey?: string }) => Promise<void>;
  requestPayment: (options: {
    orderId: string;
    orderName: string;
    successUrl: string;
    failUrl: string;
  }) => Promise<void>;
}

declare global {
  interface Window {
    TossPayments?: (clientKey: string) => {
      widgets: (options: { customerKey: string }) => TossWidgets;
      payment: (options: { customerKey: string }) => {
        requestPayment: (options: {
          method: string;
          amount: { value: number; currency: string };
          orderId: string;
          orderName: string;
          successUrl: string;
          failUrl: string;
        }) => Promise<void>;
      };
    };
  }
}

// ─── sessionStorage 페이로드 타입 ────────────────────────────────────────────

export interface PendingPayload {
  orderId: string;
  eventId: string;
  agreePrivacy: boolean;
  agreeAttendance: boolean;
  agreeProfileShare: boolean;
  agreeInstagram: boolean;
}

export const PAYMENT_PENDING_KEY = 'cana_payment_pending';

// ─── Props ────────────────────────────────────────────────────────────────────

interface StepPaymentProps {
  eventId: string;
  eventTitle: string;
  amount: number;
  customerKey: string;
  agreePrivacy: boolean;
  agreeAttendance: boolean;
  agreeProfileShare: boolean;
  agreeInstagram: boolean;
}

// ─── 컴포넌트 ─────────────────────────────────────────────────────────────────

export default function StepPayment({
  eventId,
  eventTitle,
  amount,
  customerKey,
  agreePrivacy,
  agreeAttendance,
  agreeProfileShare,
  agreeInstagram,
}: StepPaymentProps) {
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [widgetReady, setWidgetReady] = useState(false);
  const [paying, setPaying] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);
  const widgetsRef = useRef<TossWidgets | null>(null);

  // orderId: 이 결제 시도에 대한 고유 ID (컴포넌트 수명 동안 유지)
  const orderIdRef = useRef<string>(crypto.randomUUID());

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
          widgets.renderPaymentMethods('#toss-payment-methods', { variantKey: 'DEFAULT' }),
          widgets.renderAgreement('#toss-agreement', { variantKey: 'AGREEMENT' }),
        ]);

        if (!cancelled) setWidgetReady(true);
      } catch (err) {
        if (!cancelled)
          setInitError(
            err instanceof Error ? err.message : '결제 모듈을 불러오지 못했어요. 새로고침 해보세요.'
          );
      }
    })();

    return () => { cancelled = true; };
  }, [sdkLoaded, clientKey, customerKey, amount]);

  const handlePayment = async () => {
    if (!widgetsRef.current || paying) return;
    setPaying(true);
    setPayError(null);

    // 결제 성공 콜백 페이지에서 신청을 완성하기 위한 데이터 저장
    const pending: PendingPayload = {
      orderId: orderIdRef.current,
      eventId,
      agreePrivacy,
      agreeAttendance,
      agreeProfileShare,
      agreeInstagram,
    };
    sessionStorage.setItem(PAYMENT_PENDING_KEY, JSON.stringify(pending));

    try {
      await widgetsRef.current.requestPayment({
        orderId: orderIdRef.current,
        orderName: 'cana 소개팅 참여비',
        successUrl: `${window.location.origin}/apply/success`,
        failUrl: `${window.location.origin}/apply/fail`,
      });
      // 성공 시 successUrl 로 리다이렉트 — 아래는 실행되지 않음
    } catch (err: unknown) {
      sessionStorage.removeItem(PAYMENT_PENDING_KEY);
      setPayError(err instanceof Error ? err.message : '결제 중 오류가 발생했어요.');
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

        {/* 금액 */}
        <div className="flex items-center justify-between rounded-2xl border border-cana-rule bg-cana-cream px-5 py-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-cana-ink3">참여비</span>
            <span className="text-base text-cana-ink">cana 소개팅 참여비</span>
          </div>
          <span className="text-xl font-bold text-cana">{formatted}원</span>
        </div>

        {/* 위젯 로딩 스켈레톤 */}
        {!widgetReady && !initError && (
          <div className="flex flex-col gap-3">
            <div className="h-[200px] animate-pulse rounded-2xl bg-cana-rule/40" />
            <div className="h-[80px] animate-pulse rounded-2xl bg-cana-rule/40" />
          </div>
        )}

        {initError && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{initError}</div>
        )}

        {/* Toss 위젯 마운트 포인트 */}
        <div id="toss-payment-methods" />
        <div id="toss-agreement" />

        {payError && <p className="text-center text-sm text-red-500">{payError}</p>}

        {/* 결제 버튼 */}
        <button
          type="button"
          onClick={handlePayment}
          disabled={!widgetReady || paying}
          className="w-full rounded-xl bg-cana py-3.5 text-base font-semibold text-white transition active:bg-cana-dark disabled:opacity-50"
        >
          {paying ? '결제 처리 중...' : !widgetReady ? '불러오는 중...' : `${formatted}원 결제하기`}
        </button>

      </div>
    </>
  );
}
