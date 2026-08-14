/**
 * SMS 템플릿 공유 유틸 (클라이언트/서버 모두 사용 가능 — no server imports)
 */

export interface SmsVariable {
  key: string;
  label: string;
  desc: string;
}

export interface SmsTemplate {
  key: string;
  name: string;
  content: string;
  trigger_type: 'auto' | 'manual' | 'scheduled';
  trigger_desc: string;
  variables: SmsVariable[];
  enabled?: boolean;
  updated_at?: string;
}

// ─── 기본 템플릿 정의 ────────────────────────────────────────────────────────
export const DEFAULT_TEMPLATES: Omit<SmsTemplate, 'updated_at'>[] = [
  {
    key: 'application_complete',
    name: '신청 완료',
    content: '[카나] {{name}}님 {{event_date}} 소개팅 신청이 접수되었습니다. 운영진 검토 후 참석 확정 문자를 별도로 안내드릴게요.',
    trigger_type: 'auto',
    trigger_desc: '신청서 제출 및 결제 완료 시 즉시',
    variables: [
      { key: 'name',       label: '신청자 이름', desc: '프로필 이름' },
      { key: 'event_date', label: '행사일',       desc: '예: 6월 14일' },
    ],
  },
  {
    key: 'attendance_confirmed',
    name: '참석 확정',
    content: '[카나] {{name}}님 {{event_date}} 소개팅 참석이 확정되었습니다. 정확한 장소는 행사 전 별도 문자로 안내드릴게요. 좋은 만남이 되실 수 있도록 정성껏 준비하겠습니다.',
    trigger_type: 'auto',
    trigger_desc: '운영진이 참석 확정 처리 시 즉시',
    variables: [
      { key: 'name',       label: '신청자 이름', desc: '프로필 이름' },
      { key: 'event_date', label: '행사일',       desc: '예: 6월 14일' },
    ],
  },
  {
    key: 'venue_confirmed',
    name: '장소 확정',
    content: '[카나] {{name}}님 {{event_date}} 소개팅 장소가 확정되었습니다.\n\n- 장소: {{venue_name}}\n- 주소: {{address}}\n- 오시는 길: {{map_url}}\n\n신분증을 반드시 지참해 주세요.',
    trigger_type: 'manual',
    trigger_desc: '운영진이 장소 확정 문자 발송 버튼 클릭 시',
    variables: [
      { key: 'name',       label: '신청자 이름', desc: '프로필 이름' },
      { key: 'event_date', label: '행사일',       desc: '예: 6월 14일' },
      { key: 'venue_name', label: '장소명',       desc: '이벤트 venue_name' },
      { key: 'address',    label: '주소',         desc: '이벤트 venue_detail 또는 location' },
      { key: 'map_url',    label: '지도 URL',     desc: '이벤트 venue_url' },
    ],
  },
  {
    key: 'attendance_rejected',
    name: '참석 반려',
    content: '[카나] {{name}}님 이번 {{event_date}} 회차 참석이 어렵게 되었습니다. 참가비는 영업일 기준 3~5일 내 전액 환불됩니다. 다음 일정에서 좋은 인연을 만나시길 바랍니다.',
    trigger_type: 'auto',
    trigger_desc: '운영진이 참석 반려 처리 시 즉시',
    variables: [
      { key: 'name',       label: '신청자 이름', desc: '프로필 이름' },
      { key: 'event_date', label: '행사일',       desc: '예: 6월 14일' },
    ],
  },
  {
    key: 'application_cancelled',
    name: '신청 취소',
    content: '[카나] {{name}}님 {{event_date}} 소개팅 신청이 취소 처리되었습니다. {{refund_text}}',
    trigger_type: 'auto',
    trigger_desc: '신청 취소 처리 시 즉시 (본인 취소·운영진 취소 공통)',
    variables: [
      { key: 'name',        label: '신청자 이름', desc: '프로필 이름' },
      { key: 'event_date',  label: '행사일',       desc: '예: 6월 14일' },
      { key: 'refund_text', label: '환불 안내',    desc: '환불 금액/비율 자동 삽입' },
    ],
  },
  {
    key: 'profile_card',
    name: '프로필 카드 발송',
    content: '[카나] {{name}}님 {{event_date}} 소개팅 참가자 프로필 카드를 보내드립니다.\n\n내일 만나실 분들을 미리 살펴보고 오시면, 당일 훨씬 깊은 대화를 나누실 수 있어요.\n\n프로필 카드 확인하기: {{profile_card_url}}\n(링크는 행사 종료 후 만료됩니다)',
    trigger_type: 'scheduled',
    trigger_desc: '행사 전날 오후 6시 자동 발송',
    variables: [
      { key: 'name',              label: '신청자 이름',      desc: '프로필 이름' },
      { key: 'event_date',        label: '행사일',            desc: '예: 6월 14일' },
      { key: 'profile_card_url',  label: '프로필 카드 URL',  desc: '수동 발송 시 직접 입력' },
    ],
  },
  {
    key: 'day_before',
    name: '1일 전 안내',
    content: '[카나] {{name}}님 내일 {{event_datetime}} 소개팅입니다. 장소: {{venue_name}} {{address}} 신분증을 반드시 지참해 주세요.',
    trigger_type: 'scheduled',
    trigger_desc: '행사 전날 오후 7시 자동 발송',
    variables: [
      { key: 'name',           label: '신청자 이름', desc: '프로필 이름' },
      { key: 'event_datetime', label: '행사 일시',   desc: '예: 6월 14일 오후 3시' },
      { key: 'venue_name',     label: '장소명',       desc: '이벤트 venue_name' },
      { key: 'address',        label: '주소',         desc: '이벤트 venue_detail 또는 location' },
    ],
  },
  {
    key: 'event_cancelled',
    name: '소개팅 취소',
    content: '[카나] 부득이한 사정으로 {{event_date}} 소개팅이 취소되었습니다. 참가비는 영업일 기준 3~5일 내 전액 환불됩니다. 다음 일정에서 좋은 인연을 만나시길 바랍니다. 불편을 드려 죄송합니다.',
    trigger_type: 'manual',
    trigger_desc: '운영진이 이벤트 취소 처리 후 수동 발송',
    variables: [
      { key: 'name',       label: '신청자 이름', desc: '프로필 이름' },
      { key: 'event_date', label: '행사일',       desc: '예: 6월 14일' },
    ],
  },
  {
    key: 'event_ended',
    name: '소개팅 종료',
    content: '[카나] {{name}}님 오늘 {{event_date}} 소개팅에 함께해 주셔서 감사합니다. 좋은 인연으로 이어지길 바랍니다. 만족도 조사: {{survey_url}}',
    trigger_type: 'scheduled',
    trigger_desc: '행사 종료 1시간 후 자동 발송',
    variables: [
      { key: 'name',        label: '신청자 이름',   desc: '프로필 이름' },
      { key: 'event_date',  label: '행사일',         desc: '예: 6월 14일' },
      { key: 'survey_url',  label: '만족도 조사 URL', desc: '수동 발송 시 직접 입력' },
    ],
  },
];

// ─── DB 템플릿 설정 조회 (content + enabled, 공통 헬퍼) ─────────────────────────
// supa: Supabase 클라이언트 (서버 전용 코드에서 createServiceClient() 등을 넘겨 사용)
export async function getTemplateConfig(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supa: any,
  key: string,
): Promise<{ content: string; enabled: boolean }> {
  const { data } = await supa
    .from('sms_templates')
    .select('content, enabled')
    .eq('key', key)
    .maybeSingle() as { data: { content: string; enabled: boolean | null } | null };

  const def = DEFAULT_TEMPLATES.find((t) => t.key === key);

  return {
    content: data?.content ?? def?.content ?? '',
    enabled: data?.enabled ?? def?.enabled ?? true,
  };
}

// ─── 변수 치환 ──────────────────────────────────────────────────────────────────
export function substituteVars(
  template: string,
  vars: Record<string, string>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '');
}

// ─── 이벤트 변수 빌드 ──────────────────────────────────────────────────────────
export function buildEventVars(event: {
  event_date: string;
  venue_name?: string | null;
  venue_detail?: string | null;
  location?: string | null;
  venue_url?: string | null;
}): Record<string, string> {
  const d    = new Date(event.event_date);
  const kst  = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  const hour = kst.getUTCHours();
  const ampm = hour < 12 ? '오전' : '오후';
  const h12  = hour > 12 ? hour - 12 : hour || 12;

  return {
    event_date:      `${kst.getUTCMonth() + 1}월 ${kst.getUTCDate()}일`,
    event_datetime:  `${kst.getUTCMonth() + 1}월 ${kst.getUTCDate()}일 ${ampm} ${h12}시`,
    venue_name:      event.venue_name   ?? '',
    address:         event.venue_detail ?? event.location ?? '',
    map_url:         event.venue_url    ?? '',
    profile_card_url: '',
    survey_url:      '',
  };
}

// ─── 바이트 수 (SMS ≤ 90B → SMS, 초과 → LMS) ──────────────────────────────────
export function approxBytes(text: string): number {
  let b = 0;
  for (const c of text) b += c.charCodeAt(0) > 127 ? 2 : 1;
  return b;
}

export type SmsType = 'SMS' | 'LMS';
export function getSmsType(text: string): SmsType {
  return approxBytes(text) <= 90 ? 'SMS' : 'LMS';
}
