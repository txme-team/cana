'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Nav from '@/components/landing/Nav';
import Footer from '@/components/landing/Footer';
import BackButton from '@/components/landing/BackButton';
import type { Profile } from '@/lib/types';

// ─── 타입 ─────────────────────────────────────────────────────────────────────

interface ApplicationItem {
  id: string;
  event_id: string;
  status: string;
  created_at: string;
  event_title: string;
  event_date: string;
  event_location: string;
}

type Tab = '내 정보' | '프로필 카드' | '신청 내역';

// ─── 공통 헬퍼 ────────────────────────────────────────────────────────────────

function F({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="mb-0.5 text-xs text-cana-ink3">{label}</p>
      <p className="text-sm font-medium text-cana-ink">{value ?? '—'}</p>
    </div>
  );
}

function Pill({ value }: { value?: string | null }) {
  if (!value) return <span className="text-sm text-cana-ink3/40">—</span>;
  return (
    <span className="inline-block rounded-lg bg-cana-cream px-2.5 py-1 text-sm text-cana-ink2">
      {value}
    </span>
  );
}

function Chips({ items }: { items?: string[] }) {
  if (!items?.length) return <span className="text-sm text-cana-ink3/40">—</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((i) => (
        <span key={i} className="rounded-full bg-cana/10 px-3 py-1 text-sm text-cana">
          {i}
        </span>
      ))}
    </div>
  );
}

function Sec({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <span className="shrink-0 text-xs font-semibold uppercase tracking-widest text-cana-ink3">
        {title}
      </span>
      <div className="h-px flex-1 bg-cana-rule" />
    </div>
  );
}

function FileStatus({ url, label }: { url?: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${url ? 'bg-green-400' : 'bg-gray-200'}`} />
      <span className={`text-sm ${url ? 'text-cana-ink' : 'text-cana-ink3/50'}`}>
        {label} {url ? '업로드됨' : '미업로드'}
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    검토중: 'bg-yellow-50 text-yellow-700',
    대기:   'bg-gray-100 text-gray-500',
    확정:   'bg-cana/10 text-cana',
    반려:   'bg-red-50 text-red-500',
    취소:   'bg-gray-100 text-gray-400',
  };
  return (
    <span className={`inline-block rounded-xl px-2.5 py-1 text-xs font-semibold ${map[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  );
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
}

// ─── 탭별 섹션 ────────────────────────────────────────────────────────────────

function InfoSection({ profile }: { profile: Profile | null | 'loading' }) {
  if (profile === 'loading') return <Spinner />;
  if (!profile) return <NoProfile />;

  const photoUrl = profile.photo_urls?.[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-cana-rule bg-white px-5 py-6">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-cana-ink3">
          프로필 사진
        </p>
        {photoUrl ? (
          <img
            src={photoUrl}
            alt="프로필 사진"
            className="h-24 w-24 rounded-2xl object-cover"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-cana-cream text-cana-ink3/40">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-cana-rule bg-white px-5 py-6">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-cana-ink3">
          연락처
        </p>
        <p className="text-base font-medium text-cana-ink">{profile.phone ?? '—'}</p>
        <p className="mt-1 text-xs text-cana-ink3">다른 참가자에게 공개되지 않아요</p>
      </div>

      <div className="rounded-2xl border border-cana-rule bg-white px-5 py-6">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-cana-ink3">
          인증 서류
        </p>
        <div className="flex flex-col gap-2">
          <FileStatus url={profile.photo_urls?.[0]} label="프로필 사진" />
          <FileStatus url={profile.job_cert_url}    label="직장 인증" />
          <FileStatus url={profile.bulletin_url}    label="교인 인증" />
        </div>
      </div>

      <Link
        href="/profile/create"
        className="block w-full rounded-xl border border-cana-rule py-3 text-center text-sm font-medium text-cana-ink3 transition hover:bg-cana-cream active:scale-[0.99]"
      >
        프로필 수정하기
      </Link>
    </div>
  );
}

function ProfileCardSection({ profile }: { profile: Profile | null | 'loading' }) {
  const LIVING_WITH: Record<string, string> = { family: '가족과', alone: '혼자', other: '기타' };

  if (profile === 'loading') return <Spinner />;
  if (!profile) return <NoProfileCard />;

  const birthYear = profile.birth_year < 100 ? 1900 + profile.birth_year : profile.birth_year;

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-cana-rule bg-white px-5 py-6">

      <Sec title="프로필" />
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
        <F label="닉네임"    value={profile.nickname} />
        <F label="성별"      value={profile.gender === 'male' ? '남성' : '여성'} />
        <F label="출생연도"  value={`${birthYear}년생`} />
        <F label="MBTI"      value={profile.mbti} />
        <F label="키"        value={profile.height ? `${profile.height} cm` : null} />
        <F label="학력"      value={profile.education} />
        <F label="직업"      value={profile.job} />
        <F label="회사"      value={profile.company_name} />
        <F label="근무지"    value={profile.workplace} />
        <F label="거주지"    value={profile.residence} />
        <F label="거주 형태" value={profile.living_with ? LIVING_WITH[profile.living_with] : null} />
      </div>
      <div className="flex flex-wrap gap-3">
        <div><p className="mb-1.5 text-xs text-cana-ink3">음주</p><Pill value={profile.drinking} /></div>
        <div><p className="mb-1.5 text-xs text-cana-ink3">흡연</p><Pill value={profile.smoking} /></div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 text-xs text-cana-ink3">취미 / 관심사</p>
          <Chips items={profile.hobbies} />
        </div>
        <div>
          <p className="mb-1.5 text-xs text-cana-ink3">성격 / 스타일</p>
          <Chips items={profile.personality} />
        </div>
      </div>

      <Sec title="라이프스타일" />
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
        {[
          ['연락 선호도', profile.contact_preference],
          ['데이트 빈도', profile.date_frequency],
          ['결혼관',      profile.marriage_view],
          ['갈등 해결',   profile.conflict_resolution],
          ['쉬는 날',     profile.day_off_style],
          ['이성 친구',   profile.opposite_friends],
          ['반려동물',    profile.pet],
          ['데이트 스타일', profile.date_style],
        ].map(([label, value]) => (
          <div key={label}>
            <p className="mb-1.5 text-xs text-cana-ink3">{label}</p>
            <Pill value={value as string} />
          </div>
        ))}
      </div>

      <Sec title="신앙" />
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
        <F label="교단"      value={profile.church_denomination} />
        <F label="신앙 연수" value={profile.faith_years ? `${profile.faith_years}년` : null} />
        <F label="교회명"    value={profile.church_name} />
        <F label="교회 위치" value={profile.church_location} />
      </div>
      {profile.faith_level && (
        <div>
          <p className="mb-1.5 text-xs text-cana-ink3">신앙 단계</p>
          <p className="text-sm text-cana-ink">{profile.faith_level}</p>
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        <div><p className="mb-1.5 text-xs text-cana-ink3">신앙 스타일</p><Pill value={profile.faith_style} /></div>
        <div><p className="mb-1.5 text-xs text-cana-ink3">주일 예배</p><Pill value={profile.worship_frequency} /></div>
        <div><p className="mb-1.5 text-xs text-cana-ink3">섬기는 사역</p><Pill value={profile.ministry} /></div>
      </div>

      <QnASection essays={profile.profile_essays as Record<string, string> | undefined} />

      <div className="pt-2">
        <Link
          href="/profile/create"
          className="block w-full rounded-xl border border-cana-rule py-3 text-center text-sm font-medium text-cana-ink3 transition hover:bg-cana-cream active:scale-[0.99]"
        >
          프로필 수정하기
        </Link>
      </div>
    </div>
  );
}

function ApplicationsSection({ applications }: { applications: ApplicationItem[] | 'loading' }) {
  if (applications === 'loading') return <Spinner />;

  if (!applications.length) {
    return (
      <div className="rounded-2xl border border-dashed border-cana-rule bg-white px-6 py-12 text-center">
        <p className="mb-1 text-base font-medium text-cana-ink">아직 신청 내역이 없어요</p>
        <p className="mb-6 text-sm text-cana-ink3">소개팅 일정을 확인하고 신청해보세요.</p>
        <Link
          href="/events"
          className="inline-block rounded-xl bg-cana px-6 py-3 text-sm font-medium text-white transition hover:bg-cana-dark"
        >
          일정 보기
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {applications.map((app) => (
        <div
          key={app.id}
          className="flex items-center justify-between rounded-2xl border border-cana-rule bg-white px-5 py-4"
        >
          <div className="flex flex-col gap-1">
            <p className="text-base font-semibold text-cana-ink">{app.event_title || '—'}</p>
            <p className="text-sm text-cana-ink3">
              {formatDate(app.event_date)}{app.event_location ? ` · ${app.event_location}` : ''}
            </p>
          </div>
          <StatusBadge status={app.status} />
        </div>
      ))}
    </div>
  );
}

// ─── Q&A 섹션 ─────────────────────────────────────────────────────────────────

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

function QnASection({ essays }: { essays: Record<string, string> | undefined }) {
  const answered = ESSAY_META.filter((m) => essays?.[m.field]?.trim());
  if (!answered.length) return null;

  return (
    <>
      <Sec title="Q&A" />
      <div className="flex flex-col gap-3">
        {answered.map(({ field, label }) => (
          <div key={field} className="rounded-xl bg-cana/5 px-4 py-3.5">
            <p className="mb-1.5 text-xs font-semibold text-cana">{label}</p>
            <p className="text-sm leading-relaxed text-cana-ink">{essays![field]}</p>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── 공통 UI ──────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-cana border-t-transparent" />
    </div>
  );
}

function NoProfile() {
  return (
    <div className="rounded-2xl border border-dashed border-cana-rule bg-white px-6 py-12 text-center">
      <p className="mb-1 text-base font-medium text-cana-ink">아직 프로필이 없어요</p>
      <p className="mb-6 text-sm text-cana-ink3">프로필을 작성하면 이벤트에 신청할 수 있어요.</p>
      <Link
        href="/profile/create"
        className="inline-block rounded-xl bg-cana px-6 py-3 text-sm font-medium text-white transition hover:bg-cana-dark"
      >
        프로필 작성하기
      </Link>
    </div>
  );
}

function NoProfileCard() {
  return (
    <div className="flex flex-col gap-4">
      {/* 안내 카드 */}
      <div className="rounded-2xl bg-cana/5 px-5 py-5">
        <p className="mb-4 text-base font-semibold text-cana">프로필 카드 작성 전 확인해주세요</p>
        <div className="flex flex-col gap-4">

          {/* 소요 시간 */}
          <div className="flex items-start gap-3">
            <img src="/icons/clock.svg" alt="" className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="text-base font-medium text-cana-ink">약 10분 소요돼요</p>
              <p className="text-sm text-cana-ink3">신앙, 가치관, 라이프스타일에 관한 질문들이 있어요</p>
            </div>
          </div>

          {/* 서류 안내 */}
          <div className="flex items-start gap-3">
            <img src="/icons/docs.svg" alt="" className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="text-base font-medium text-cana-ink">마지막 단계에서 서류 인증이 필요해요</p>
              <p className="mb-3 text-sm text-cana-ink3">아래 서류를 미리 준비해주세요</p>
              <div className="flex flex-col gap-2">
                {[
                  { icon: '/icons/profile.svg',   text: '프로필 사진 (본인이 잘 나온 사진)' },
                  { icon: '/icons/job.svg',        text: '직장 인증서류 — 명함, 사원증, 재직증명서, 4대보험 가입내역 중 하나' },
                  { icon: '/icons/christian.svg',  text: '교인 인증서류 — 최근 3개월 내 주보 또는 교인증명서' },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-start gap-2">
                    <img src={icon} alt="" className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <p className="text-sm text-cana-ink3">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* CTA */}
      <Link
        href="/profile/create"
        className="block w-full rounded-xl bg-cana py-3.5 text-center text-base font-semibold text-white transition hover:bg-cana-dark active:scale-[0.99]"
      >
        프로필 카드 작성하기
      </Link>
    </div>
  );
}

// ─── 메인 ─────────────────────────────────────────────────────────────────────

const TABS: Tab[] = ['내 정보', '프로필 카드', '신청 내역'];

export default function MyPage() {
  const [tab, setTab] = useState<Tab>('내 정보');
  const [profile, setProfile] = useState<Profile | null | 'loading'>('loading');
  const [applications, setApplications] = useState<ApplicationItem[] | 'loading'>('loading');

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then((data) => setProfile(data && !data.error ? (data as Profile) : null))
      .catch(() => setProfile(null));

    fetch('/api/my-applications')
      .then((r) => r.json())
      .then((data) => setApplications(Array.isArray(data) ? data : []))
      .catch(() => setApplications([]));
  }, []);

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-cana-cream">
        <div className="mx-auto max-w-2xl px-5 pb-20 pt-24">

          <BackButton />
          {/* 페이지 타이틀 */}
          <h1 className="mb-6 text-xl font-bold text-cana-ink">마이페이지</h1>

          {/* 탭 */}
          <div className="mb-8 flex gap-6 border-b border-cana-rule">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={[
                  'pb-3 text-sm font-medium transition',
                  tab === t
                    ? 'border-b-2 border-cana text-cana'
                    : 'text-cana-ink3 hover:text-cana-ink',
                ].join(' ')}
              >
                {t}
              </button>
            ))}
          </div>

          {/* 탭 콘텐츠 */}
          {tab === '내 정보'    && <InfoSection       profile={profile} />}
          {tab === '프로필 카드' && <ProfileCardSection profile={profile} />}
          {tab === '신청 내역'  && <ApplicationsSection applications={applications} />}

        </div>
      </main>
      <Footer />
    </>
  );
}
