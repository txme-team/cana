const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL!;

interface SlackMessage {
  text: string;
  blocks?: SlackBlock[];
}

interface SlackBlock {
  type: string;
  text?: { type: string; text: string };
  fields?: { type: string; text: string }[];
}

async function send(payload: SlackMessage) {
  if (!SLACK_WEBHOOK_URL) return;

  await fetch(SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function notifyNewProfile(nickname: string, profileId: string) {
  await send({
    text: `새 프로필 등록: ${nickname}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*새 프로필이 등록됐어요* :tada:\n이름: *${nickname}*\nID: \`${profileId}\``,
        },
      },
    ],
  });
}

export async function notifyPaymentComplete(nickname: string, applicationId: string) {
  await send({
    text: `결제 완료: ${nickname}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*결제가 완료됐어요* :moneybag:\n이름: *${nickname}*\n신청 ID: \`${applicationId}\``,
        },
      },
    ],
  });
}

export async function notifyApplicationCancelled(nickname: string, applicationId: string) {
  await send({
    text: `신청 취소: ${nickname}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*신청이 취소됐어요* :x:\n이름: *${nickname}*\n신청 ID: \`${applicationId}\``,
        },
      },
    ],
  });
}

export async function notifyNewMeeting(profileNickname: string, meetingId: string) {
  await send({
    text: `미팅 카드 생성: ${profileNickname}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*미팅 카드가 생성됐어요* :handshake:\n프로필: *${profileNickname}*\n미팅 ID: \`${meetingId}\``,
        },
      },
    ],
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
