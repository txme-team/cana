/**
 * 취소 환불 정책 — 유저 셀프취소, 어드민 취소(2곳) 공통 사용
 * 클라이언트(확인 모달)·서버(API) 양쪽에서 import 가능 (서버 전용 의존성 없음)
 */

export interface RefundTier {
  minDays: number;
  rate: number;
  label: string;
}

// 행사일까지 남은 일수 기준 — 순서대로 평가 (첫 매치 적용)
export const REFUND_POLICY_TIERS: RefundTier[] = [
  { minDays: 7, rate: 1,   label: '전액 환불' },
  { minDays: 2, rate: 0.5, label: '50% 환불' },
  { minDays: 0, rate: 0,   label: '환불 불가' },
];

export const REFUND_POLICY_TEXT = [
  '결제 후 ~ 행사 7일 전 취소: 전액 환불',
  '행사 6일 전 ~ 2일 전 취소: 50% 환불',
  '행사 1일 전 ~ 당일 취소: 환불 불가',
];

export interface RefundResult {
  rate: number;
  amount: number;
  label: string;
}

/** 행사일까지 남은 일수 기준 환불율 계산. event_date 없으면 안전하게 전액(1)로 처리 */
export function calcRefundRate(eventDateStr?: string | null, now: Date = new Date()): number {
  if (!eventDateStr) return 1;
  const eventDate = new Date(eventDateStr);
  if (Number.isNaN(eventDate.getTime())) return 1;

  const diffDays = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  for (const tier of REFUND_POLICY_TIERS) {
    if (diffDays >= tier.minDays) return tier.rate;
  }
  return 0;
}

export function calcRefund(
  amount: number | null | undefined,
  eventDateStr?: string | null,
  now: Date = new Date(),
): RefundResult {
  const rate = calcRefundRate(eventDateStr, now);
  const tier = REFUND_POLICY_TIERS.find((t) => t.rate === rate) ?? REFUND_POLICY_TIERS[REFUND_POLICY_TIERS.length - 1];
  const amt = amount != null ? Math.round(amount * rate) : 0;
  return { rate, amount: amt, label: tier.label };
}

/** SMS/알림 본문에 넣을 환불 안내 한 줄 */
export function refundNoticeText(refund: RefundResult): string {
  if (refund.rate === 0) return '환불 규정상 참가비는 환불되지 않습니다.';
  if (refund.rate === 1) return `참가비 ${refund.amount.toLocaleString('ko-KR')}원이 전액 환불됩니다.`;
  return `환불 규정에 따라 참가비의 ${Math.round(refund.rate * 100)}%인 ${refund.amount.toLocaleString('ko-KR')}원이 환불됩니다.`;
}
