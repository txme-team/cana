'use client';

import { useState } from 'react';
import type { ProfileCardEvent, ProfileCardItem as ProfileCardItemData } from '@/lib/profile-card';
import { SUGGESTED_QUESTIONS, SUGGESTED_QUESTION_CATEGORIES } from '@/lib/suggested-questions';
import ProfileCardItem from './ProfileCardItem';

function fmtEventDateTime(iso: string): string {
  const d = new Date(iso);
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  const hour = kst.getUTCHours();
  const ampm = hour < 12 ? '오전' : '오후';
  const h12 = hour % 12 || 12;
  return `${kst.getUTCMonth() + 1}월 ${kst.getUTCDate()}일 ${ampm} ${h12}시`;
}

export default function ProfileCardView({
  viewerLabel,
  event,
  cards,
}: {
  viewerLabel: string;
  event: ProfileCardEvent;
  cards: ProfileCardItemData[];
}) {
  const [tab, setTab] = useState<'profile' | 'questions'>('profile');

  return (
    <main className="min-h-screen bg-cana-cream px-4 pb-16 pt-10">
      <div className="mx-auto w-full max-w-md">

        {/* 헤더 */}
        <div className="mb-6 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/txme-assets/logos/logo_black.svg" alt="CANA" className="mx-auto h-5" />
          <h1 className="mt-2 text-xl font-semibold text-cana-ink">
            내일 만날 분들의 프로필이에요
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-cana-ink3">
            {fmtEventDateTime(event.event_date)} · {event.venue_name ?? event.location ?? '장소 추후 안내'}
          </p>
        </div>

        {/* 탭 */}
        <div className="mb-6 flex rounded-full border border-cana-rule bg-white p-1">
          {([
            { key: 'profile', label: '프로필' },
            { key: 'questions', label: '추천 질문' },
          ] as const).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={[
                'flex-1 rounded-full py-2 text-sm font-medium transition',
                tab === t.key ? 'bg-cana text-white' : 'text-cana-ink3',
              ].join(' ')}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'profile' ? (
          <>
            {/* 안내 박스 */}
            <div className="mb-6 rounded-2xl border border-cana-rule bg-white px-4 py-3 text-xs leading-relaxed text-cana-ink3">
              미리 프로필을 살펴보고 오시면, 당일 더 깊은 대화를 나눌 수 있어요.
              카드를 눌러 자세한 내용을 확인해보세요. (이 링크는 행사 종료 후 만료됩니다)
            </div>

            {/* 카드 리스트 */}
            {cards.length === 0 ? (
              <div className="rounded-2xl border border-cana-rule bg-white px-5 py-12 text-center text-sm text-cana-ink3">
                아직 표시할 프로필이 없어요.
              </div>
            ) : (
              <div className="space-y-3">
                {cards.map((c) => (
                  <ProfileCardItem key={c.label} label={c.label} profile={c.profile} aiSummary={c.aiSummary} />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* 안내 박스 */}
            <div className="mb-6 rounded-2xl border border-cana-rule bg-white px-4 py-3 text-xs leading-relaxed text-cana-ink3">
              대화가 끊겼을 때 꺼내보세요. 상대 카드의 사역·신앙 스타일을 먼저 확인하면 더 자연스러운 대화가 돼요.
            </div>

            {/* 카테고리별 질문 목록 */}
            <div className="space-y-3">
              {SUGGESTED_QUESTION_CATEGORIES.map((cat) => (
                <div key={cat} className="rounded-2xl border border-cana-rule bg-white px-5 py-4">
                  <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-cana/70">
                    {cat}
                  </div>
                  <ul className="space-y-2">
                    {SUGGESTED_QUESTIONS[cat].map((q) => (
                      <li key={q} className="flex items-start gap-2 text-sm leading-relaxed text-cana-ink">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-cana/50" />
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </>
        )}

        <p className="mt-8 text-center text-[11px] text-cana-ink3">
          {viewerLabel}님, 내일 좋은 만남 되세요 🙏
        </p>
      </div>
    </main>
  );
}
