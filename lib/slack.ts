const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL!;

interface SlackMessage {
  text: string;
  blocks?: object[];
}

async function send(payload: SlackMessage) {
  if (!SLACK_WEBHOOK_URL) return;
  await fetch(SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export interface SlackProfileInfo {
  nickname: string;
  birthYear?: number | null;
  job?: string | null;
  company?: string | null;
  eventTitle?: string | null;
  eventDate?: string | null; // 'YYYY-MM-DD'
}

function formatEventDate(date?: string | null) {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

function profileBlocks(emoji: string, title: string, info: SlackProfileInfo): object[] {
  const { nickname, birthYear, job, company, eventTitle, eventDate } = info;

  const birthDisplay = birthYear
    ? `${String(birthYear < 100 ? 1900 + birthYear : birthYear).slice(2)}년생`
    : '—';

  const jobLine = [job, company].filter(Boolean).join('\n') || '—';

  const eventLine = eventTitle
    ? `${eventTitle}${eventDate ? `\n${formatEventDate(eventDate)}` : ''}`
    : '—';

  return [
    {
      type: 'section',
      text: { type: 'mrkdwn', text: `${emoji} *${title}*` },
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*이름*\n${nickname}` },
        { type: 'mrkdwn', text: `*나이*\n${birthDisplay}` },
        { type: 'mrkdwn', text: `*직업/회사*\n${jobLine}` },
        { type: 'mrkdwn', text: `*신청 회차*\n${eventLine}` },
      ],
    },
  ];
}

export async function notifyPaymentComplete(info: SlackProfileInfo) {
  await send({
    text: `결제 완료: ${info.nickname}`,
    blocks: profileBlocks('💳', '결제가 완료됐어요', info),
  });
}

export async function notifyApplicationCancelled(info: SlackProfileInfo) {
  await send({
    text: `신청 취소: ${info.nickname}`,
    blocks: profileBlocks('❌', '신청이 취소됐어요', info),
  });
}

export async function notifyError(message: string, context?: string) {
  await send({
    text: `오류 발생: ${message}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*오류 발생* :rotating_light:\n${message}${context ? `\n\`\`\`${context}\`\`\`` : ''}`,
        },
      },
    ],
  });
}
