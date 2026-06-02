// Toss 결제 리다이렉트 전/후에 sessionStorage로 공유되는 데이터 타입

export interface PendingPayload {
  orderId: string;
  eventId: string;
  agreePrivacy: boolean;
  agreeAttendance: boolean;
  agreeProfileShare: boolean;
  agreeInstagram: boolean;
}

export const PAYMENT_PENDING_KEY = 'cana_payment_pending';
