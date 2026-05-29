'use client';

import { useState } from 'react';
import type { Profile } from '@/lib/types';

// ─── 헬퍼 ─────────────────────────────────────────────────────────────────────

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-800">{value ?? '—'}</span>
    </div>
  );
}

function CheckRow({ options, selected }: { options: string[]; selected: string | string[] }) {
  const sel = Array.isArray(selected) ? selected : [selected];
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1">
      {options.map((opt) => (
        <span key={opt} className="flex items-center gap-1 text-sm text-gray-600">
          <span className={[
            'flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border text-[8px]',
            sel.includes(opt) ? 'border-cana bg-cana text-white' : 'border-gray-300 bg-white text-transparent',
          ].join(' ')}>✓</span>
          {opt}
        </span>
      ))}
    </div>
  );
}

function LabeledCheck({ label, options, selected }: { label: string; options: string[]; selected: string | string[] }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] text-gray-400">{label}</span>
      <CheckRow options={options} selected={selected} />
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0 text-[11px] font-medium text-cana">{children}</span>
      <div className="h-px flex-1 bg-cana/20" />
    </div>
  );
}

function ChipList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {(items ?? []).map((item) => (
        <span key={item} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-sm text-gray-600">
          {item}
        </span>
      ))}
    </div>
  );
}

function FileLink({ url, label }: { url?: string; label: string }) {
  const [loading, setLoading] = useState(false);

  if (!url) return <span className="text-sm text-gray-400">미제출</span>;

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

function ConsentBadge({ agreed, label }: { agreed?: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={[
        'flex h-4 w-4 items-center justify-center rounded-sm text-[9px]',
        agreed ? 'bg-cana text-white' : 'bg-gray-100 text-gray-300',
      ].join(' ')}>✓</span>
      <span className="text-sm text-gray-600">{label}</span>
    </div>
  );
}

const LIVING_WITH_MAP: Record<string, string> = {
  family: '가족과', alone: '혼자', other: '기타',
};

// ─── 메인 ─────────────────────────────────────────────────────────────────────

export default function ProfileDetail({ profile: p }: { profile: Profile }) {
  const birthYear = p.birth_year < 100 ? 1900 + p.birth_year : p.birth_year;
  const displayYear = String(birthYear).slice(2) + '년생';
  const photoUrl = p.photo_urls?.[0];

  return (
    <div className="flex flex-col gap-5 text-sm">

      {/* 기본 정보 */}
      <SectionHeader>기본 정보</SectionHeader>

      <div className="grid grid-cols-3 gap-x-4 gap-y-3 sm:grid-cols-6">
        <Field label="이름"   value={p.nickname} />
        <Field label="성별"   value={p.gender === 'male' ? '남성' : '여성'} />
        <Field label="나이"   value={displayYear} />
        <Field label="MBTI"   value={p.mbti ?? '—'} />
        <Field label="키"     value={`${p.height} cm`} />
        <Field label="학력"   value={p.education} />
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <Field label="근무지"  value={p.workplace} />
        <Field label="회사명"  value={p.company_name ?? '—'} />
        <Field label="직업"    value={p.job} />
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-gray-400">사는 곳</span>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-800">{p.residence}</span>
            <CheckRow
              options={['가족과', '혼자', '기타']}
              selected={p.living_with ? (LIVING_WITH_MAP[p.living_with] ?? p.living_with) : ''}
            />
          </div>
        </div>
      </div>

      <LabeledCheck label="음주" options={['안 마심', '분위기 따라', '월 1~2회', '주 1회 이상']} selected={p.drinking ?? ''} />
      <LabeledCheck label="흡연" options={['비흡연', '흡연(전자담배)', '흡연(연초)', '금연 중']}  selected={p.smoking ?? ''} />

      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-gray-400">취미 / 관심사</span>
        <ChipList items={p.hobbies ?? []} />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-gray-400">성격 / 스타일</span>
        <ChipList items={p.personality ?? []} />
      </div>

      {/* 사전 정보 */}
      <SectionHeader>사전 정보</SectionHeader>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <LabeledCheck label="연락 선호도"  options={['자주', '적당히', '필요할 때만']}                                                   selected={p.contact_preference ?? ''} />
        <LabeledCheck label="데이트 빈도"  options={['주 2회+', '주 1회', '격주', '월 1~2회']}                                          selected={p.date_frequency ?? ''} />
        <LabeledCheck label="이성 친구"    options={['친구로 지낼 수 없다', '가끔 연락은 괜찮다', '자주 만나도 괜찮다', '본인이 알아서 조율']} selected={p.opposite_friends ?? ''} />
        <LabeledCheck label="결혼관"       options={['결혼 전제로 만남', '결혼보다 연애', '비혼주의', '딩크족']}                           selected={p.marriage_view ?? ''} />
        <LabeledCheck label="갈등 해결"    options={['바로 대화', '감정 식힌 후', '상황에 따라']}                                          selected={p.conflict_resolution ?? ''} />
        <LabeledCheck label="쉬는 날"      options={['집에서 충전', '밖에서 활동', '상관없음']}                                            selected={p.day_off_style ?? ''} />
        <LabeledCheck label="반려동물"     options={['키우고 있음', '좋아하지만 키우진 않음', '좋아하지 않음']}                              selected={p.pet ?? ''} />
      </div>
      <LabeledCheck
        label="데이트 스타일"
        options={['활동(액티비티·여행·운동)', '일상(카페·산책·맛집)', '문화(전시·공연·영화)', '집콕(집에서 영화·게임)']}
        selected={p.date_style ?? ''}
      />

      {/* 신앙 */}
      <SectionHeader>신앙</SectionHeader>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
        <Field label="교단"      value={p.church_denomination} />
        <Field label="신앙 연수" value={`${p.faith_years}년`} />
        <Field label="교회명"    value={p.church_name} />
        <Field label="교회 위치" value={p.church_location} />
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-gray-400">나의 신앙 단계</span>
        <span className="text-sm font-medium text-gray-800">{p.faith_level ?? '—'}</span>
      </div>

      <LabeledCheck label="신앙 스타일" options={['말씀 중심', '예배·찬양 중심', '봉사·섬김 중심', '균형형']} selected={p.faith_style ?? ''} />
      <LabeledCheck label="주일 예배"   options={['거의 매주', '2~3주에 1회', '상황에 따라']}                  selected={p.worship_frequency ?? ''} />
      <LabeledCheck label="섬기는 사역" options={['찬양팀', '교육부', '행정', '없음', '기타']}                 selected={p.ministry ?? ''} />

      {/* 인증 서류 */}
      <SectionHeader>인증 서류</SectionHeader>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-gray-400">프로필 사진</span>
          <FileLink url={photoUrl} label="사진 보기" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-gray-400">직장 인증</span>
          <FileLink url={p.job_cert_url} label="파일 보기" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-gray-400">교인 인증</span>
          <FileLink url={p.bulletin_url} label="파일 보기" />
        </div>
      </div>

      {/* 연락처 & 동의 */}
      <SectionHeader>연락처 & 동의</SectionHeader>

      <Field label="휴대폰 번호" value={p.phone ?? '—'} />

      <div className="flex flex-col gap-2">
        <span className="text-[10px] text-gray-400">동의 항목</span>
        <ConsentBadge agreed={p.agree_privacy}       label="개인정보 수집 및 이용 동의 (필수)" />
        <ConsentBadge agreed={p.agree_attendance}    label="참여 시 주의 사항 확인 (필수)" />
        <ConsentBadge agreed={p.agree_profile_share} label="자기소개 파일 전달 동의 (선택)" />
        <ConsentBadge agreed={p.agree_instagram}     label="카나 인스타그램 자기 PR 동의 (선택)" />
      </div>
    </div>
  );
}
