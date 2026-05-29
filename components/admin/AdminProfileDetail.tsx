'use client';

import { useState } from 'react';
import type { Profile } from '@/lib/types';

// ─── 헬퍼 ─────────────────────────────────────────────────────────────────────

function F({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="mb-0.5 text-[10px] text-gray-400">{label}</p>
      <p className="text-sm text-gray-800">{value ?? '—'}</p>
    </div>
  );
}

function FBadge({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="mb-1 text-[10px] text-gray-400">{label}</p>
      {value
        ? <span className="inline-block rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-700">{value}</span>
        : <span className="text-sm text-gray-300">—</span>
      }
    </div>
  );
}

function Chips({ label, items }: { label: string; items?: string[] }) {
  return (
    <div>
      <p className="mb-1.5 text-[10px] text-gray-400">{label}</p>
      {items?.length
        ? <div className="flex flex-wrap gap-1">
            {items.map((i) => (
              <span key={i} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-700">{i}</span>
            ))}
          </div>
        : <span className="text-sm text-gray-300">—</span>
      }
    </div>
  );
}

function Sec({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0 text-[11px] font-semibold uppercase tracking-widest text-gray-400">{title}</span>
      <div className="h-px flex-1 bg-gray-100" />
    </div>
  );
}

function FileLink({ url, label }: { url?: string; label: string }) {
  const [loading, setLoading] = useState(false);
  if (!url) return <span className="text-sm text-gray-300">미제출</span>;
  const handleOpen = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/signed-url?url=${encodeURIComponent(url)}`);
      const { signedUrl, error } = await res.json();
      if (error) throw new Error(error);
      window.open(signedUrl, '_blank', 'noopener,noreferrer');
    } catch {
      alert('파일을 불러올 수 없어요.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <button
      onClick={handleOpen}
      disabled={loading}
      className="text-sm font-medium text-cana underline underline-offset-2 disabled:opacity-50"
    >
      {loading ? '불러오는 중...' : `${label} →`}
    </button>
  );
}

function Consent({ agreed, label }: { agreed?: boolean; label: string }) {
  return (
    <span className={`flex items-center gap-1 text-xs ${agreed ? 'text-gray-700' : 'text-gray-300'}`}>
      <span className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm text-[8px] ${agreed ? 'bg-cana text-white' : 'bg-gray-100 text-gray-300'}`}>✓</span>
      {label}
    </span>
  );
}

// ─── 메인 ─────────────────────────────────────────────────────────────────────

export default function AdminProfileDetail({ profile: p }: { profile: Profile }) {
  const birthYear = p.birth_year < 100 ? 1900 + p.birth_year : p.birth_year;
  const LIVING_WITH: Record<string, string> = { family: '가족과', alone: '혼자', other: '기타' };

  return (
    <div className="flex flex-col gap-5">

      {/* 기본 정보 */}
      <Sec title="기본 정보" />
      <div className="grid grid-cols-3 gap-x-5 gap-y-3 sm:grid-cols-4">
        <F label="이름"      value={p.nickname} />
        <F label="성별"      value={p.gender === 'male' ? '남성' : '여성'} />
        <F label="출생연도"  value={`${birthYear}년`} />
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

      <div className="grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-4">
        <FBadge label="음주" value={p.drinking} />
        <FBadge label="흡연" value={p.smoking} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Chips label="취미 / 관심사" items={p.hobbies} />
        <Chips label="성격 / 스타일" items={p.personality} />
      </div>

      {/* 사전 정보 */}
      <Sec title="사전 정보" />
      <div className="grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-4">
        <FBadge label="연락 선호도"   value={p.contact_preference} />
        <FBadge label="데이트 빈도"   value={p.date_frequency} />
        <FBadge label="결혼관"        value={p.marriage_view} />
        <FBadge label="갈등 해결"     value={p.conflict_resolution} />
        <FBadge label="쉬는 날"       value={p.day_off_style} />
        <FBadge label="반려동물"      value={p.pet} />
        <FBadge label="이성 친구"     value={p.opposite_friends} />
        <FBadge label="데이트 스타일" value={p.date_style} />
      </div>

      {/* 신앙 */}
      <Sec title="신앙" />
      <div className="grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-4">
        <F label="교단"      value={p.church_denomination} />
        <F label="신앙 연수" value={p.faith_years ? `${p.faith_years}년` : null} />
        <F label="교회명"    value={p.church_name} />
        <F label="교회 위치" value={p.church_location} />
      </div>
      <F label="신앙 단계" value={p.faith_level} />
      <div className="grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-3">
        <FBadge label="신앙 스타일" value={p.faith_style} />
        <FBadge label="주일 예배"   value={p.worship_frequency} />
        <FBadge label="섬기는 사역" value={p.ministry} />
      </div>

      {/* 인증 서류 */}
      <Sec title="인증 서류" />
      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="mb-1 text-[10px] text-gray-400">프로필 사진</p>
          <FileLink url={p.photo_urls?.[0]} label="사진 보기" />
        </div>
        <div>
          <p className="mb-1 text-[10px] text-gray-400">직장 인증</p>
          <FileLink url={p.job_cert_url} label="파일 보기" />
        </div>
        <div>
          <p className="mb-1 text-[10px] text-gray-400">교인 인증</p>
          <FileLink url={p.bulletin_url} label="파일 보기" />
        </div>
      </div>

      {/* 동의 항목 */}
      <Sec title="동의 항목" />
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        <Consent agreed={p.agree_privacy}       label="개인정보 수집 및 이용 (필수)" />
        <Consent agreed={p.agree_attendance}    label="참여 시 주의 사항 확인 (필수)" />
        <Consent agreed={p.agree_profile_share} label="자기소개 파일 전달 (선택)" />
        <Consent agreed={p.agree_instagram}     label="인스타그램 자기 PR (선택)" />
      </div>

    </div>
  );
}
