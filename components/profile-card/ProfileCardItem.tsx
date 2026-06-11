'use client';

import { useState } from 'react';
import type { Profile } from '@/lib/types';

// ─── 자기소개 에세이 메타 ────────────────────────────────────────────────────────

const ESSAY_META: { field: string; label: string }[] = [
  { field: 'prayerRequest',       label: '요즘 나의 기도제목은요' },
  { field: 'bibleVerse',          label: '가장 좋아하는 성경 구절과 그 이유는요' },
  { field: 'ministryNote',        label: '교회에서 섬기고 있는 사역은요' },
  { field: 'faithGrowthMoment',   label: '나의 신앙이 성장했던 순간은요' },
  { field: 'answeredPrayer',      label: '가장 크게 응답받았던 기도는요' },
  { field: 'communityRole',       label: '공동체 안에서 내 모습은요' },
  { field: 'jobDescription',      label: '이런 일을 하고 있어요' },
  { field: 'careerGoal',          label: '설레는 커리어 목표가 있어요' },
  { field: 'coworkerOpinion',     label: "직장 동료들이 평가하는 '나'는요" },
  { field: 'careerMotivation',    label: '지금의 직업을 선택한 계기는요' },
  { field: 'relationshipPromise', label: "'이것' 하나만큼은 꼭 약속해 줄 수 있어요" },
  { field: 'partnerStyle',        label: '이런 남자/여자친구이고 싶어요' },
  { field: 'feelingLoved',        label: '내가 사랑받고 있다고 느끼는 순간은요' },
  { field: 'humorStyle',          label: '나의 유머 코드나 웃음 포인트는요' },
  { field: 'weekendStyle',        label: '주말엔 이렇게 시간 보내는 걸 좋아해요' },
  { field: 'spendingHabit',       label: '내 소비습관은요' },
  { field: 'conflictApproach',    label: '갈등이 생기면 이렇게 해결해요' },
];

const LIVING_WITH_MAP: Record<string, string> = {
  family: '가족과', alone: '혼자', other: '기타',
};

// ─── 작은 헬퍼 ──────────────────────────────────────────────────────────────────

function Pill({ label, on }: { label: string; on: boolean }) {
  return (
    <span
      className={[
        'rounded-full px-2.5 py-1 text-xs font-medium',
        on ? 'bg-cana text-white' : 'bg-cana-cream text-cana-ink3',
      ].join(' ')}
    >
      {label}
    </span>
  );
}

function PillRow({ options, selected }: { options: string[]; selected?: string }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <Pill key={opt} label={opt} on={selected === opt} />
      ))}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="shrink-0 text-xs text-cana-ink3">{label}</span>
      <span className="text-right text-sm font-medium text-cana-ink">{value}</span>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-widest text-cana/70">
      {children}
    </div>
  );
}

// ─── 메인 ─────────────────────────────────────────────────────────────────────

export default function ProfileCardItem({
  label,
  profile: p,
}: {
  label: string;
  profile: Profile;
}) {
  const [open, setOpen] = useState(false);

  const birthYear = p.birth_year < 100 ? 1900 + p.birth_year : p.birth_year;
  const displayYear = `${String(birthYear).slice(2)}년생`;
  const livingWith = p.living_with ? LIVING_WITH_MAP[p.living_with] ?? p.living_with : undefined;

  const essays = (p.profile_essays ?? {}) as Record<string, string>;
  const answeredEssays = ESSAY_META.filter((m) => essays[m.field]?.trim());

  return (
    <div className="overflow-hidden rounded-2xl border border-cana-rule bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cana/10 text-sm font-bold text-cana">
            {label.slice(-1)}
          </span>
          <div className="text-left">
            <div className="text-sm font-semibold text-cana-ink">{label}</div>
            <div className="text-xs text-cana-ink3">{displayYear} · {p.job ?? '—'}</div>
          </div>
        </div>
        <svg
          className={`h-4 w-4 text-cana-ink3 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-cana-rule px-5 py-4">

          {/* 기본 정보 */}
          <SectionLabel>기본 정보</SectionLabel>
          <div className="divide-y divide-cana-rule/60">
            <InfoRow label="나이" value={displayYear} />
            <InfoRow label="키" value={p.height ? `${p.height}cm` : undefined} />
            <InfoRow label="MBTI" value={p.mbti} />
            <InfoRow label="학력" value={p.education} />
            <InfoRow label="직업" value={p.job} />
            <InfoRow label="근무지" value={p.workplace} />
            <InfoRow label="거주지" value={p.residence} />
            <InfoRow label="동거 형태" value={livingWith} />
          </div>

          {(p.hobbies?.length || p.personality?.length) ? (
            <div className="mt-3 space-y-2">
              {!!p.hobbies?.length && (
                <div>
                  <div className="mb-1.5 text-xs text-cana-ink3">취미 / 관심사</div>
                  <div className="flex flex-wrap gap-1.5">
                    {p.hobbies.map((h) => (
                      <span key={h} className="rounded-full bg-cana-cream px-2.5 py-1 text-xs text-cana-ink3">{h}</span>
                    ))}
                  </div>
                </div>
              )}
              {!!p.personality?.length && (
                <div>
                  <div className="mb-1.5 text-xs text-cana-ink3">성격 / 스타일</div>
                  <div className="flex flex-wrap gap-1.5">
                    {p.personality.map((t) => (
                      <span key={t} className="rounded-full bg-cana-cream px-2.5 py-1 text-xs text-cana-ink3">{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          <div className="mt-3 space-y-2.5">
            <div>
              <div className="mb-1.5 text-xs text-cana-ink3">음주</div>
              <PillRow options={['안 마심', '분위기 따라', '월 1~2회', '주 1회 이상']} selected={p.drinking} />
            </div>
            <div>
              <div className="mb-1.5 text-xs text-cana-ink3">흡연</div>
              <PillRow options={['비흡연', '흡연(전자담배)', '흡연(연초)', '금연 중']} selected={p.smoking} />
            </div>
          </div>

          {/* 사전 정보 */}
          <SectionLabel>사전 정보</SectionLabel>
          <div className="space-y-2.5">
            <div>
              <div className="mb-1.5 text-xs text-cana-ink3">연락 선호도</div>
              <PillRow options={['자주', '적당히', '필요할 때만']} selected={p.contact_preference} />
            </div>
            <div>
              <div className="mb-1.5 text-xs text-cana-ink3">데이트 빈도</div>
              <PillRow options={['주 2회+', '주 1회', '격주', '월 1~2회']} selected={p.date_frequency} />
            </div>
            <div>
              <div className="mb-1.5 text-xs text-cana-ink3">이성 친구</div>
              <PillRow
                options={['친구로 지낼 수 없다', '가끔 연락은 괜찮다', '자주 만나도 괜찮다', '본인이 알아서 조율']}
                selected={p.opposite_friends}
              />
            </div>
            <div>
              <div className="mb-1.5 text-xs text-cana-ink3">결혼관</div>
              <PillRow
                options={['결혼 전제로 만남', '결혼보다 연애', '비혼주의', '딩크족']}
                selected={p.marriage_view}
              />
            </div>
            <div>
              <div className="mb-1.5 text-xs text-cana-ink3">갈등 해결</div>
              <PillRow options={['바로 대화', '감정 식힌 후', '상황에 따라']} selected={p.conflict_resolution} />
            </div>
            <div>
              <div className="mb-1.5 text-xs text-cana-ink3">쉬는 날</div>
              <PillRow options={['집에서 충전', '밖에서 활동', '상관없음']} selected={p.day_off_style} />
            </div>
            <div>
              <div className="mb-1.5 text-xs text-cana-ink3">반려동물</div>
              <PillRow
                options={['키우고 있음', '좋아하지만 키우진 않음', '좋아하지 않음']}
                selected={p.pet}
              />
            </div>
            <div>
              <div className="mb-1.5 text-xs text-cana-ink3">데이트 스타일</div>
              <PillRow
                options={['활동(액티비티·여행·운동)', '일상(카페·산책·맛집)', '문화(전시·공연·영화)', '집콕(집에서 영화·게임)']}
                selected={p.date_style}
              />
            </div>
          </div>

          {/* 신앙 */}
          <SectionLabel>신앙</SectionLabel>
          <div className="divide-y divide-cana-rule/60">
            <InfoRow label="신앙 연수" value={p.faith_years ? `${p.faith_years}년` : undefined} />
            <InfoRow label="신앙 단계" value={p.faith_level} />
          </div>
          <div className="mt-2.5 space-y-2.5">
            <div>
              <div className="mb-1.5 text-xs text-cana-ink3">주일 예배</div>
              <PillRow options={['거의 매주', '2~3주에 1회', '상황에 따라']} selected={p.worship_frequency} />
            </div>
            <div>
              <div className="mb-1.5 text-xs text-cana-ink3">섬기는 사역</div>
              <PillRow options={['찬양팀', '교육부', '행정', '없음', '기타']} selected={p.ministry} />
            </div>
          </div>

          {/* 자기소개 */}
          {answeredEssays.length > 0 && (
            <>
              <SectionLabel>자기소개</SectionLabel>
              <div className="space-y-3">
                {answeredEssays.map((e) => (
                  <div key={e.field}>
                    <div className="mb-1 text-xs font-medium text-cana-ink3">{e.label}</div>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-cana-ink">
                      {essays[e.field]}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
