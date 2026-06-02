/**
 * 인포뱅크 REST API v1.0.13 SMS 발송 유틸
 * 환경 변수:
 *   INFOBANK_CLIENT_ID      – 인포뱅크 발급 ID
 *   INFOBANK_CLIENT_PASSWD  – 인포뱅크 발급 Password
 *   INFOBANK_SENDER_NUMBER  – 사전 등록된 발신번호 (예: 01012345678)
 */

const AUTH_URL = 'https://auth.supersms.co:7000/auth/v3/token';
const SMS_URL  = 'https://sms.supersms.co:7020/sms/v3/multiple-destinations';

/** ISO date → "6월 14일" */
export function fmtSmsDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

async function getToken(): Promise<{ schema: string; accessToken: string }> {
  const res = await fetch(AUTH_URL, {
    method: 'POST',
    headers: {
      'X-IB-Client-Id':     process.env.INFOBANK_CLIENT_ID!,
      'X-IB-Client-Passwd': process.env.INFOBANK_CLIENT_PASSWD!,
      'Accept':             'application/json',
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`인포뱅크 인증 실패 (${res.status}): ${body}`);
  }
  return res.json() as Promise<{ schema: string; accessToken: string }>;
}

/** "010-XXXX-XXXX" 또는 "01012345678" → "+8201012345678" */
function formatPhone(phone: string): string {
  const d = phone.replace(/\D/g, '');
  if (d.startsWith('82')) return `+${d}`;
  if (d.startsWith('0'))  return `+82${d.slice(1)}`;
  return `+82${d}`;
}

/**
 * SMS/LMS 동보 발송 (최대 200건)
 * - 90byte 이하 → SMS, 초과 → 자동 LMS 전환
 */
export async function sendSMS(phones: string[], text: string): Promise<void> {
  if (!phones.length) return;

  const { schema, accessToken } = await getToken();

  const destinations = phones.map((p) => ({ to: formatPhone(p) }));

  const res = await fetch(SMS_URL, {
    method: 'POST',
    headers: {
      Authorization:  `${schema} ${accessToken}`,
      'Content-Type': 'application/json',
      Accept:         'application/json',
    },
    body: JSON.stringify({
      from:         process.env.INFOBANK_SENDER_NUMBER!,
      text,
      destinations,
    }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { errorText?: string };
    throw new Error(`SMS 발송 실패 (${res.status}): ${err.errorText ?? ''}`);
  }
}

/**
 * 개인화 SMS 동보 — 수신자마다 다른 문자 발송
 * 토큰은 한 번만 발급 후 병렬 발송
 */
export async function sendPersonalizedSMS(
  messages: { phone: string; text: string }[],
): Promise<void> {
  if (!messages.length) return;

  const { schema, accessToken } = await getToken();
  const sender = process.env.INFOBANK_SENDER_NUMBER!;

  await Promise.allSettled(
    messages.map(({ phone, text }) =>
      fetch(SMS_URL, {
        method: 'POST',
        headers: {
          Authorization:  `${schema} ${accessToken}`,
          'Content-Type': 'application/json',
          Accept:         'application/json',
        },
        body: JSON.stringify({
          from:         sender,
          text,
          destinations: [{ to: formatPhone(phone) }],
        }),
        cache: 'no-store',
      }),
    ),
  );
}
