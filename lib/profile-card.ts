/**
 * 참가자 프로필 카드 공유 페이지 (소개팅 전날 발송)
 * - share_token: 신청건(application)별 추측 불가능한 랜덤 토큰
 * - display_no:  같은 이벤트 + 성별 그룹 내 순번 (확정 순서대로 1부터 부여, 한번 부여되면 고정)
 *
 * 카드 라벨은 "여자1", "남자1" 처럼 표시되며 display_no + 본인 성별로 조합한다.
 */

import { randomBytes } from 'crypto';
import type { Profile } from './types';
import { generateProfileSummary } from './profile-summary';

// 프로필 카드 페이지 만료 시점: 행사 시작 + 36시간
const EXPIRES_AFTER_MS = 36 * 60 * 60 * 1000;

export const GENDER_LABEL: Record<'male' | 'female', string> = {
  male: '남자',
  female: '여자',
};

export function genderLabel(gender: string, no: number | null | undefined): string {
  const prefix = gender === 'male' ? '남자' : '여자';
  return no != null ? `${prefix}${no}` : prefix;
}

export function generateShareToken(): string {
  return randomBytes(24).toString('base64url');
}

/**
 * 신청건이 '확정' 처리될 때 호출 — share_token / display_no가 없으면 새로 부여한다.
 * 이미 부여된 값이 있으면 그대로 반환 (idempotent).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function ensureProfileCardMeta(supa: any, applicationId: string) {
  const { data: app } = await supa
    .from('applications')
    .select('id, event_id, share_token, display_no, ai_summary, profiles ( * )')
    .eq('id', applicationId)
    .maybeSingle() as {
      data: {
        id: string;
        event_id: string;
        share_token: string | null;
        display_no: number | null;
        ai_summary: string | null;
        profiles: Profile | null;
      } | null;
    };

  if (!app) return null;

  const updates: Record<string, string | number> = {};

  if (!app.share_token) {
    updates.share_token = generateShareToken();
  }

  if (app.display_no == null && app.profiles?.gender) {
    const { data: existing } = await supa
      .from('applications')
      .select('display_no, profiles!inner ( gender )')
      .eq('event_id', app.event_id)
      .eq('profiles.gender', app.profiles.gender)
      .not('display_no', 'is', null) as {
        data: { display_no: number | null }[] | null;
      };

    const maxNo = (existing ?? []).reduce(
      (max, e) => (e.display_no != null && e.display_no > max ? e.display_no : max),
      0
    );
    updates.display_no = maxNo + 1;
  }

  if (!app.ai_summary && app.profiles) {
    const summary = await generateProfileSummary(app.profiles);
    if (summary) {
      updates.ai_summary = summary;
    }
  }

  if (Object.keys(updates).length > 0) {
    await supa.from('applications').update(updates).eq('id', applicationId);
  }

  return {
    share_token: (updates.share_token as string) ?? app.share_token,
    display_no: (updates.display_no as number) ?? app.display_no,
    ai_summary: (updates.ai_summary as string) ?? app.ai_summary,
  };
}

export interface ProfileCardEvent {
  id: string;
  title: string;
  event_date: string;
  venue_name?: string | null;
  venue_detail?: string | null;
  location?: string | null;
}

export interface ProfileCardItem {
  display_no: number | null;
  label: string;
  profile: Profile;
  aiSummary: string | null;
}

export type ProfileCardResult =
  | { status: 'not_found' }
  | { status: 'expired' }
  | { status: 'cancelled' }
  | { status: 'ok'; viewerLabel: string; event: ProfileCardEvent; cards: ProfileCardItem[] };

/**
 * 관리자 미리보기 — 특정 이벤트에서 특정 성별(cardGender)의 확정자 카드 목록을
 * (반대 성별 참가자가 보게 될 화면 그대로) 토큰 없이 재현한다.
 *
 * 예) cardGender='male' → "남자 프로필카드" 미리보기 → 여성 참가자에게 보여지는,
 *     확정된 남성 참가자들의 카드 목록.
 */
export async function getProfileCardPreviewData(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supa: any,
  eventId: string,
  cardGender: 'male' | 'female'
): Promise<{ status: 'not_found' } | { status: 'ok'; viewerLabel: string; event: ProfileCardEvent; cards: ProfileCardItem[] }> {
  const { data: event } = await supa
    .from('events')
    .select('id, title, event_date, venue_name, venue_detail, location')
    .eq('id', eventId)
    .maybeSingle() as { data: ProfileCardEvent | null };

  if (!event) {
    return { status: 'not_found' };
  }

  const viewerGender: 'male' | 'female' = cardGender === 'male' ? 'female' : 'male';

  const { data: rows } = await supa
    .from('applications')
    .select('display_no, ai_summary, profiles!inner ( * )')
    .eq('event_id', eventId)
    .eq('status', '확정')
    .eq('profiles.gender', cardGender)
    .order('display_no', { ascending: true, nullsFirst: false }) as {
      data: { display_no: number | null; ai_summary: string | null; profiles: Profile }[] | null;
    };

  const cards: ProfileCardItem[] = (rows ?? []).map((r) => ({
    display_no: r.display_no,
    label: genderLabel(cardGender, r.display_no),
    profile: r.profiles,
    aiSummary: r.ai_summary,
  }));

  return {
    status: 'ok',
    viewerLabel: `${GENDER_LABEL[viewerGender]} 참가자`,
    event,
    cards,
  };
}

/**
 * share_token으로 "내일 만날 반대 성별 확정자" 카드 목록을 조회한다.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getProfileCardData(supa: any, token: string): Promise<ProfileCardResult> {
  const { data: app } = await supa
    .from('applications')
    .select('id, event_id, status, display_no, profiles ( gender ), events ( id, title, event_date, venue_name, venue_detail, location )')
    .eq('share_token', token)
    .maybeSingle() as {
      data: {
        id: string;
        event_id: string;
        status: string;
        display_no: number | null;
        profiles: { gender: 'male' | 'female' } | null;
        events: ProfileCardEvent | null;
      } | null;
    };

  if (!app || !app.events || !app.profiles) {
    return { status: 'not_found' };
  }

  // 본인 신청건이 더 이상 '확정' 상태가 아니면(관리자 취소/반려, 또는 마이페이지에서 직접 취소)
  // 더 이상 상대방 프로필을 볼 수 없도록 차단한다.
  if (app.status !== '확정') {
    return { status: 'cancelled' };
  }

  const eventDate = new Date(app.events.event_date);
  if (Date.now() > eventDate.getTime() + EXPIRES_AFTER_MS) {
    return { status: 'expired' };
  }

  const myGender = app.profiles.gender;
  const oppositeGender: 'male' | 'female' = myGender === 'male' ? 'female' : 'male';

  const { data: rows } = await supa
    .from('applications')
    .select('display_no, ai_summary, profiles!inner ( * )')
    .eq('event_id', app.event_id)
    .eq('status', '확정')
    .eq('profiles.gender', oppositeGender)
    .order('display_no', { ascending: true, nullsFirst: false }) as {
      data: { display_no: number | null; ai_summary: string | null; profiles: Profile }[] | null;
    };

  const cards: ProfileCardItem[] = (rows ?? []).map((r) => ({
    display_no: r.display_no,
    label: genderLabel(oppositeGender, r.display_no),
    profile: r.profiles,
    aiSummary: r.ai_summary,
  }));

  return {
    status: 'ok',
    viewerLabel: genderLabel(myGender, app.display_no),
    event: app.events,
    cards,
  };
}
