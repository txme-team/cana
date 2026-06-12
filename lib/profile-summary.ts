/**
 * 프로필 카드 — AI 한 줄 매력 요약
 * 카드를 펼치기 전, 접힌 헤더에 보여줄 "이 사람의 매력을 한 줄로" 요약 문구를
 * Claude API로 생성한다. 자기소개(essay)와 특징(취미/성격/스타일 등)을 바탕으로
 * 개인정보(이름/연락처/직장명/교회명 등)는 포함하지 않는다.
 */

import Anthropic from '@anthropic-ai/sdk';
import type { Profile } from './types';

const MODEL = 'claude-haiku-4-5-20251001';

let client: Anthropic | null = null;
function getClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  if (!client) client = new Anthropic({ apiKey });
  return client;
}

const ESSAY_LABELS: Record<string, string> = {
  prayerRequest: '요즘 기도제목',
  bibleVerse: '좋아하는 성경 구절과 이유',
  ministryNote: '교회에서 섬기는 사역',
  faithGrowthMoment: '신앙이 성장했던 순간',
  answeredPrayer: '크게 응답받은 기도',
  communityRole: '공동체 안에서의 모습',
  jobDescription: '하고 있는 일',
  careerGoal: '커리어 목표',
  coworkerOpinion: '동료들이 평가하는 모습',
  careerMotivation: '직업을 선택한 계기',
  relationshipPromise: '관계에서 약속할 수 있는 것',
  partnerStyle: '되고 싶은 연인의 모습',
  feelingLoved: '사랑받는다고 느끼는 순간',
  humorStyle: '유머 코드',
  weekendStyle: '주말을 보내는 방식',
  spendingHabit: '소비 습관',
  conflictApproach: '갈등 해결 방식',
};

/**
 * 프로필을 바탕으로 한 줄 매력 요약을 생성한다.
 * - 자기소개/특징 정보가 거의 없으면 null 반환 (요약 생략)
 * - API 키 미설정이나 호출 실패 시에도 null 반환 (기능 자체를 막지 않음)
 */
export async function generateProfileSummary(profile: Profile): Promise<string | null> {
  const anthropic = getClient();
  if (!anthropic) return null;

  const essays = (profile.profile_essays ?? {}) as Record<string, string>;
  const essayLines = Object.entries(essays)
    .filter(([, v]) => v?.trim())
    .map(([k, v]) => `- ${ESSAY_LABELS[k] ?? k}: ${v.trim()}`);

  const traitLines = [
    profile.job && `직업: ${profile.job}`,
    profile.mbti && `MBTI: ${profile.mbti}`,
    profile.hobbies?.length ? `취미: ${profile.hobbies.join(', ')}` : null,
    profile.personality?.length ? `성격: ${profile.personality.join(', ')}` : null,
    profile.date_style && `데이트 스타일: ${profile.date_style}`,
    profile.faith_level && `신앙: ${profile.faith_level}`,
  ].filter((v): v is string => !!v);

  if (essayLines.length === 0 && traitLines.length === 0) {
    return null;
  }

  const prompt = `아래는 한 크리스천 소개팅 참가자의 자기소개 및 특징 정보야.
이 정보를 바탕으로, 이 사람의 매력을 한눈에 느낄 수 있는 "한 줄 요약" 문구를 만들어줘.

[작성 규칙]
- 한국어로, 25자 내외의 한 문장
- 호기심을 자극해서 "더 알아보고 싶다"는 느낌을 주는 톤
- 과장되거나 거짓되지 않게, 실제 내용에 기반해서 작성
- 이름, 회사명, 교회명, 연락처 등 식별 정보는 절대 포함하지 말 것
- 따옴표나 설명 없이 결과 문구 한 줄만 출력

[특징]
${traitLines.join('\n') || '(없음)'}

[자기소개]
${essayLines.join('\n') || '(없음)'}`;

  try {
    const msg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 100,
      messages: [{ role: 'user', content: prompt }],
    });

    const block = msg.content.find((b) => b.type === 'text');
    const text = block && block.type === 'text' ? block.text.trim() : '';
    return text || null;
  } catch (e) {
    console.error('[generateProfileSummary error]', e);
    return null;
  }
}
