'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Nav from '@/components/landing/Nav';
import type { Profile } from '@/lib/types';

// ─── 헬퍼 ─────────────────────────────────────────────────────────────────────

function F({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="mb-0.5 text-xs text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value ?? '—'}</p>
    </div>
  );
}

function Pill({ value }: { value?: string | null }) {
  if (!value) return <span className="text-sm text-gray-300">—</span>;
  return (
    <span className="inline-block rounded-lg bg-gray-100 px-2.5 py-1 text-sm text-gray-700">
      {value}
    </span>
  );
}

function Chips({ items }: { items?: string[] }) {
  if (!items?.length) return <span className="text-sm text-gray-300">—</span>;
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
      <span className="shrink-0 text-xs font-semibold uppercase tracking-widest text-gray-400">
        {title}
      </span>
      <div className="h-px flex-1 bg-gray-100" />
    </div>
  );
}

function FileStatus({ url, label }: { url?: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`h-2 w-2 rounded-full ${url ? 'bg-green-400' : 'bg-gray-200'}`}
      />
      <span className={`text-sm ${url ? 'text-gray-700' : 'text-gray-400'}`}>
        {label} {url ? '업로드됨' : '미업로드'}
      </span>
    </div>
  );
}

// ─── 메인 ─────────────────────────────────────────────────────────────────────

export default function MyProfilePage() {
  const [profile, setProfile] = useState<Profile | null | 'loading'>('loading');

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) setProfile(data as Profile);
        else setProfile(null);
      })
      .catch(() => setProfile(null));
  }, []);

  const LIVING_WITH: Record<string, string> = { family: '가족과', alone: '혼자', other: '기타' };

  return (
    <div className="min-h-screen bg-cana-cream">
      <Nav />

      <main className="mx-auto max-w-2xl px-5 pb-20 pt-24">

        {/* 타이틀 영역 */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">프로필 카드</h1>
          <p className="mt-0.5 text-sm text-gray-400">이벤트 신청 시 사용되는 내 프로필이에요.</p>
        </div>

        {/* 로딩 */}
        {profile === 'loading' && (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-cana border-t-transparent" />
          </div>
        )}

        {/* 프로필 없음 */}
        {profile === null && (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center">
            <p className="mb-1 text-base font-medium text-gray-700">아직 프로필이 없어요</p>
            <p className="mb-6 text-sm text-gray-400">
              프로필을 작성하면 이벤트에 신청할 수 있어요.
            </p>
            <Link
              href="/profile/create"
              className="inline-block rounded-xl bg-cana px-6 py-3 text-sm font-medium text-white transition hover:bg-cana-dark"
            >
              프로필 작성하기
            </Link>
          </div>
        )}

        {/* 프로필 있음 */}
        {profile !== 'loading' && profile !== null && (() => {
          const p = profile;
          const birthYear = p.birth_year < 100 ? 1900 + p.birth_year : p.birth_year;

          return (
            <div className="flex flex-col gap-5 rounded-2xl border border-gray-100 bg-white px-5 py-6 shadow-sm">

              {/* 기본 정보 */}
              <Sec title="기본 정보" />
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                <F label="닉네임"    value={p.nickname} />
                <F label="성별"      value={p.gender === 'male' ? '남성' : '여성'} />
                <F label="출생연도"  value={`${birthYear}년생`} />
                <F label="MBTI"      value={p.mbti} />
                <F label="키"        value={p.height ? `${p.height} cm` : null} />
                <F label="학력"      value={p.education} />
                <F label="직업"      value={p.job} />
                <F label="회사"      value={p.company_name} />
                <F label="근무지"    value={p.workplace} />
                <F label="거주지"    value={p.residence} />
                <F label="거주 형태" value={p.living_with ? LIVING_WITH[p.living_with] : null} />
                <F label="연락처"    value={p.phone} />
              </div>

              <div className="flex flex-wrap gap-3">
                <div>
                  <p className="mb-1.5 text-xs text-gray-400">음주</p>
                  <Pill value={p.drinking} />
                </div>
                <div>
                  <p className="mb-1.5 text-xs text-gray-400">흡연</p>
                  <Pill value={p.smoking} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-1.5 text-xs text-gray-400">취미 / 관심사</p>
                  <Chips items={p.hobbies} />
                </div>
                <div>
                  <p className="mb-1.5 text-xs text-gray-400">성격 / 스타일</p>
                  <Chips items={p.personality} />
                </div>
              </div>

              {/* 사전 정보 */}
              <Sec title="사전 정보" />
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                <div>
                  <p className="mb-1.5 text-xs text-gray-400">연락 선호도</p>
                  <Pill value={p.contact_preference} />
                </div>
                <div>
                  <p className="mb-1.5 text-xs text-gray-400">데이트 빈도</p>
                  <Pill value={p.date_frequency} />
                </div>
                <div>
                  <p className="mb-1.5 text-xs text-gray-400">결혼관</p>
                  <Pill value={p.marriage_view} />
                </div>
                <div>
                  <p className="mb-1.5 text-xs text-gray-400">갈등 해결</p>
                  <Pill value={p.conflict_resolution} />
                </div>
                <div>
                  <p className="mb-1.5 text-xs text-gray-400">쉬는 날</p>
                  <Pill value={p.day_off_style} />
                </div>
                <div>
                  <p className="mb-1.5 text-xs text-gray-400">이성 친구</p>
                  <Pill value={p.opposite_friends} />
                </div>
                <div>
                  <p className="mb-1.5 text-xs text-gray-400">반려동물</p>
                  <Pill value={p.pet} />
                </div>
                <div>
                  <p className="mb-1.5 text-xs text-gray-400">데이트 스타일</p>
                  <Pill value={p.date_style} />
                </div>
              </div>

              {/* 신앙 */}
              <Sec title="신앙" />
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                <F label="교단"      value={p.church_denomination} />
                <F label="신앙 연수" value={p.faith_years ? `${p.faith_years}년` : null} />
                <F label="교회명"    value={p.church_name} />
                <F label="교회 위치" value={p.church_location} />
              </div>
              {p.faith_level && (
                <div>
                  <p className="mb-1.5 text-xs text-gray-400">신앙 단계</p>
                  <p className="text-sm text-gray-700">{p.faith_level}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                <div>
                  <p className="mb-1.5 text-xs text-gray-400">신앙 스타일</p>
                  <Pill value={p.faith_style} />
                </div>
                <div>
                  <p className="mb-1.5 text-xs text-gray-400">주일 예배</p>
                  <Pill value={p.worship_frequency} />
                </div>
                <div>
                  <p className="mb-1.5 text-xs text-gray-400">섬기는 사역</p>
                  <Pill value={p.ministry} />
                </div>
              </div>

              {/* 인증 서류 */}
              <Sec title="인증 서류" />
              <div className="flex flex-col gap-2">
                <FileStatus url={p.photo_urls?.[0]}  label="프로필 사진" />
                <FileStatus url={p.job_cert_url}      label="직장 인증" />
                <FileStatus url={p.bulletin_url}      label="교인 인증" />
              </div>

              {/* 하단 수정 버튼 */}
              <div className="pt-2">
                <Link
                  href="/profile/create"
                  className="block w-full rounded-xl border border-gray-200 py-3 text-center text-sm font-medium text-gray-600 transition hover:bg-gray-50 active:scale-[0.99]"
                >
                  프로필 수정하기
                </Link>
              </div>

            </div>
          );
        })()}
      </main>
    </div>
  );
}
