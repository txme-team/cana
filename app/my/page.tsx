'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Nav from '@/components/landing/Nav';
import Footer from '@/components/landing/Footer';
import BackButton from '@/components/landing/BackButton';
import type { Profile } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

// ─── 타입 ─────────────────────────────────────────────────────────────────────

interface ApplicationItem {
  id: string;
  event_id: string;
  status: string;
  created_at: string;
  event_title: string;
  event_date: string;
  event_location: string;
  // 결제 정보
  order_id:   string | null;
  paid_at:    string | null;
  amount:     number | null;
  pay_method: string | null;
}

type Tab = '내 정보' | '프로필 카드' | '신청 내역';

// ─── 공통 헬퍼 ────────────────────────────────────────────────────────────────

function F({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="mb-0.5 text-xs text-cana-ink3">{label}</p>
      <p className="text-base font-medium text-cana-ink">{value ?? '—'}</p>
    </div>
  );
}

function Pill({ value }: { value?: string | null }) {
  if (!value) return <span className="text-base text-cana-ink3/40">—</span>;
  return (
    <span className="inline-block rounded-lg bg-cana-cream px-2.5 py-1 text-base text-cana-ink2">
      {value}
    </span>
  );
}

function Chips({ items }: { items?: string[] }) {
  if (!items?.length) return <span className="text-base text-cana-ink3/40">—</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((i) => (
        <span key={i} className="rounded-full bg-cana/10 px-3 py-1 text-base text-cana">
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

interface UserInfo {
  email: string;
  createdAt: string;
}

function SectionLabel({ title }: { title: string }) {
  return (
    <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-cana-ink3">
      {title}
    </p>
  );
}

function CertRow({ label, url }: { label: string; url?: string | null }) {
  const ok = !!url;
  return (
    <div className="flex items-center justify-between">
      <p className="text-base text-cana-ink">{label}</p>
      <span className={`flex items-center gap-1.5 text-sm font-medium ${ok ? 'text-green-500' : 'text-cana-ink3/40'}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${ok ? 'bg-green-400' : 'bg-gray-200'}`} />
        {ok ? '완료' : '미완료'}
      </span>
    </div>
  );
}

function InfoSection({
  profile,
  userInfo,
}: {
  profile: Profile | null | 'loading';
  userInfo: UserInfo | null;
}) {
  if (profile === 'loading') return <Spinner />;

  const photoUrl = profile?.photo_urls?.[0];

  const joinDate = userInfo?.createdAt
    ? new Date(userInfo.createdAt).toLocaleDateString('ko-KR', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : '—';

  return (
    <div className="flex flex-col gap-4">

      {/* ── 계정 ── */}
      <div className="rounded-2xl border border-cana-rule bg-white px-5 py-6">
        <SectionLabel title="계정" />
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
            <svg viewBox="0 0 24 24" className="h-4 w-4">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-medium text-cana-ink">
              {userInfo?.email ?? '—'}
            </p>
            <p className="text-xs text-cana-ink3">Google 계정 · 가입일 {joinDate}</p>
          </div>
        </div>
      </div>

      {/* ── 프로필 ── */}
      <div className="rounded-2xl border border-cana-rule bg-white px-5 py-6">
        <SectionLabel title="프로필" />
        {!profile ? (
          <p className="text-sm text-cana-ink3">프로필을 아직 작성하지 않았어요.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {/* 사진 + 이름 */}
            <div className="flex items-center gap-4">
              {photoUrl ? (
                <img src={photoUrl} alt="프로필" className="h-16 w-16 flex-shrink-0 rounded-2xl object-cover" />
              ) : (
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-cana-cream">
                  <svg className="h-7 w-7 text-cana-ink3/30" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
              )}
              <div>
                <p className="text-lg font-semibold text-cana-ink">{profile.nickname ?? '—'}</p>
                <p className="text-sm text-cana-ink3">{profile.phone ?? '연락처 없음'}</p>
              </div>
            </div>
            {/* 상세 */}
            <div className="flex flex-col gap-2.5 border-t border-cana-rule pt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-cana-ink3">연락처</p>
                <p className="text-base font-medium text-cana-ink">{profile.phone ?? '—'}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-cana-ink3">가입일</p>
                <p className="text-base font-medium text-cana-ink">{joinDate}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── 인증 ── */}
      <div className="rounded-2xl border border-cana-rule bg-white px-5 py-6">
        <SectionLabel title="인증" />
        {!profile ? (
          <p className="text-sm text-cana-ink3">프로필을 아직 작성하지 않았어요.</p>
        ) : (
          <div className="flex flex-col divide-y divide-cana-rule">
            <div className="py-3 first:pt-0 last:pb-0">
              <CertRow label="사진 인증"  url={profile.photo_urls?.[0]} />
            </div>
            <div className="py-3 first:pt-0 last:pb-0">
              <CertRow label="교회 인증"  url={profile.bulletin_url} />
            </div>
            <div className="py-3 first:pt-0 last:pb-0">
              <CertRow label="직장 인증"  url={profile.job_cert_url} />
            </div>
          </div>
        )}
      </div>

      {profile && (
        <Link
          href="/profile/create"
          className="block w-full rounded-xl border border-cana-rule py-3 text-center text-sm font-medium text-cana-ink3 transition hover:bg-cana-cream active:scale-[0.99]"
        >
          프로필 수정하기
        </Link>
      )}
      {!profile && (
        <Link
          href="/profile/create"
          className="block w-full rounded-xl bg-cana py-3 text-center text-sm font-medium text-white transition hover:bg-cana-dark"
        >
          프로필 작성하기
        </Link>
      )}
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
          <p className="text-base font-medium text-cana-ink">{profile.faith_level}</p>
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

const CANCELLABLE_STATUSES = ['검토중', '대기'];

function ApplicationsSection({
  applications,
  onCancelRequest,
}: {
  applications: ApplicationItem[] | 'loading';
  onCancelRequest: (app: ApplicationItem) => void;
}) {
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
    <div className="overflow-hidden rounded-2xl border border-cana-rule bg-white">
      <table className="w-full text-base">
        <thead>
          <tr className="border-b border-cana-rule bg-cana-cream">
            <th className="px-4 py-3 text-left text-xs font-semibold text-cana-ink3">일정</th>
            <th className="w-20 whitespace-nowrap px-3 py-3 text-left text-xs font-semibold text-cana-ink3">결제일</th>
            <th className="w-28 whitespace-nowrap px-3 py-3 text-right text-xs font-semibold text-cana-ink3">금액</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-cana-ink3">상태</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app, i) => (
            <tr
              key={app.id}
              className={i !== applications.length - 1 ? 'border-b border-cana-rule' : ''}
            >
              {/* 일정 */}
              <td className="px-4 py-4">
                <p className="font-medium text-cana-ink">{app.event_title || '—'}</p>
                <p className="mt-0.5 text-xs text-cana-ink3">
                  {formatDate(app.event_date)}{app.event_location ? ` · ${app.event_location}` : ''}
                </p>
              </td>
              {/* 결제일 */}
              <td className="w-20 whitespace-nowrap px-3 py-4 text-base text-cana-ink">
                {app.paid_at
                  ? new Date(app.paid_at).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })
                  : '—'}
              </td>
              {/* 금액 */}
              <td className="w-28 whitespace-nowrap px-3 py-4 text-right">
                {app.amount != null
                  ? <span className="font-medium text-cana-ink">{app.amount.toLocaleString('ko-KR')}원</span>
                  : <span className="text-cana-ink3">—</span>}
              </td>
              {/* 상태 + 취소 */}
              <td className="px-4 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <StatusBadge status={app.status} />
                  {CANCELLABLE_STATUSES.includes(app.status) && (
                    <button
                      type="button"
                      onClick={() => onCancelRequest(app)}
                      className="text-xs text-cana-ink3/50 underline underline-offset-2 transition hover:text-red-400"
                    >
                      취소
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
            <p className="text-base leading-relaxed text-cana-ink">{essays![field]}</p>
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

      {/* 빈 상태 카드 */}
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

    </div>
  );
}

// ─── 메인 ─────────────────────────────────────────────────────────────────────

const TABS: Tab[] = ['내 정보', '프로필 카드', '신청 내역'];

export default function MyPage() {
  const [tab, setTab] = useState<Tab>('내 정보');
  const [profile, setProfile] = useState<Profile | null | 'loading'>('loading');
  const [applications, setApplications] = useState<ApplicationItem[] | 'loading'>('loading');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // ── 취소 모달 ──────────────────────────────────────────────────────────────
  const [cancelTarget, setCancelTarget] = useState<ApplicationItem | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const loadApplications = () => {
    fetch('/api/my-applications')
      .then((r) => r.json())
      .then((data) => setApplications(Array.isArray(data) ? data : []))
      .catch(() => setApplications([]));
  };

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then((data) => setProfile(data && !data.error ? (data as Profile) : null))
      .catch(() => setProfile(null));

    loadApplications();

    // 계정 정보 (이메일, 가입일)
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserInfo({ email: user.email ?? '', createdAt: user.created_at ?? '' });
      }
    });
  }, []);

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    setCancelError(null);
    try {
      const res = await fetch(`/api/my-applications/${cancelTarget.id}/cancel`, { method: 'POST' });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(error ?? '취소에 실패했어요.');
      }
      setCancelTarget(null);
      loadApplications();
    } catch (e) {
      setCancelError(e instanceof Error ? e.message : '오류가 발생했어요.');
    } finally {
      setCancelling(false);
    }
  };

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
          {tab === '내 정보'    && <InfoSection       profile={profile} userInfo={userInfo} />}
          {tab === '프로필 카드' && <ProfileCardSection profile={profile} />}
          {tab === '신청 내역'  && (
            <ApplicationsSection
              applications={applications}
              onCancelRequest={(app) => { setCancelTarget(app); setCancelError(null); }}
            />
          )}

        </div>
      </main>
      {/* 취소 확인 모달 */}
      {cancelTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
          onClick={() => !cancelling && setCancelTarget(null)}
        >
          <div
            className="w-full max-w-xs rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-1 text-[18px] font-semibold text-gray-800">신청을 취소할까요?</p>
            <p className="text-[15px] text-gray-500">{cancelTarget.event_title}</p>

            {cancelTarget.amount != null ? (
              <p className="mt-2 text-[15px] text-gray-500">
                결제하신 <span className="font-medium text-cana-ink">{cancelTarget.amount.toLocaleString('ko-KR')}원</span>이 전액 환불돼요.
              </p>
            ) : (
              <p className="mt-2 text-[15px] text-gray-500">취소 후 되돌릴 수 없어요.</p>
            )}

            {cancelError && (
              <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-500">{cancelError}</p>
            )}

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setCancelTarget(null)}
                disabled={cancelling}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
              >
                닫기
              </button>
              <button
                onClick={handleCancelConfirm}
                disabled={cancelling}
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-medium text-white transition hover:bg-red-600 disabled:opacity-40"
              >
                {cancelling ? '처리 중...' : '취소하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
