'use client';

import { useState, useEffect } from 'react';
import { useForm, FormProvider, useFormContext, Controller } from 'react-hook-form';
import Link from 'next/link';
import type { ApplyFormData } from '@/lib/types';
import type { Profile } from '@/lib/types';
import Nav from '@/components/landing/Nav';
import BackButton from '@/components/landing/BackButton';
import Step0 from '@/components/apply/Step0';
import StepPayment from '@/components/apply/StepPayment';

const STEPS = ['일정', '프로필 확인', '동의', '결제'];

// ─── Step 1: Profile Review ────────────────────────────────────────────────────

function StepProfileReview({ profile }: { profile: Profile | null }) {
  const handleEdit = () => {
    const methods = (window as unknown as { __applyFormMethods?: { getValues: () => ApplyFormData } }).__applyFormMethods;
    if (methods) {
      const eventId = methods.getValues().eventId;
      if (eventId) sessionStorage.setItem('cana_apply_eventId', eventId);
    }
    window.location.href = '/profile/create?return=/apply';
  };

  if (!profile) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <p className="text-base text-cana-ink3">프로필 정보를 불러오는 중...</p>
      </div>
    );
  }

  const age = profile.birth_year ? new Date().getFullYear() - profile.birth_year : null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-cana-ink">프로필 확인</h2>
        <p className="text-sm text-cana-ink3">이 프로필로 이벤트에 신청할게요.</p>
      </div>

      <div className="rounded-2xl border border-cana-rule bg-cana-cream px-5 py-5">
        <div className="grid grid-cols-2 gap-y-3 gap-x-4">
          <div>
            <p className="text-xs text-cana-ink3">닉네임</p>
            <p className="text-base font-medium text-cana-ink">{profile.nickname ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-cana-ink3">성별</p>
            <p className="text-base font-medium text-cana-ink">
              {profile.gender === 'male' ? '남성' : profile.gender === 'female' ? '여성' : '—'}
            </p>
          </div>
          {age !== null && (
            <div>
              <p className="text-xs text-cana-ink3">나이</p>
              <p className="text-base font-medium text-cana-ink">{age}세</p>
            </div>
          )}
          <div>
            <p className="text-xs text-cana-ink3">직업</p>
            <p className="text-base font-medium text-cana-ink">{profile.job ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-cana-ink3">교회</p>
            <p className="text-base font-medium text-cana-ink">{profile.church_name ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-cana-ink3">MBTI</p>
            <p className="text-base font-medium text-cana-ink">{profile.mbti ?? '—'}</p>
          </div>
        </div>
      </div>

      {/* 수정 링크만 카드 안에 */}
      <button
        type="button"
        onClick={handleEdit}
        className="self-center text-sm text-cana-ink3 underline underline-offset-2 transition hover:text-cana-ink"
      >
        프로필 수정하러 가기
      </button>
    </div>
  );
}

// ─── Step 2: Agreements ────────────────────────────────────────────────────────

interface ConsentBlockProps {
  required?: boolean;
  label: string;
  description?: string;
  content: React.ReactNode;
  checked: boolean;
  onChange: (v: boolean) => void;
  error?: string;
}

function ConsentBlock({ required, label, description, content, checked, onChange, error }: ConsentBlockProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={[
      'rounded-2xl border px-4 py-4 transition',
      checked ? 'border-cana bg-cana/5' : 'border-cana-rule bg-white',
    ].join(' ')}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-medium text-cana-ink">{label}</span>
            <span className={`rounded-full px-1.5 py-0.5 text-xs font-medium ${required ? 'bg-cana/10 text-cana' : 'bg-cana-rule text-cana-ink3'}`}>
              {required ? '필수' : '선택'}
            </span>
          </div>
          {description && <p className="text-sm text-cana-ink3">{description}</p>}
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex-shrink-0 text-sm text-cana-ink3 underline underline-offset-2"
        >
          {expanded ? '접기' : '내용 보기'}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 rounded-xl bg-cana-cream px-3 py-3 text-sm leading-relaxed text-cana-ink3">
          {content}
        </div>
      )}

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className="mt-3 flex items-center gap-2"
      >
        <span className={[
          'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition',
          checked ? 'border-cana bg-cana' : 'border-cana-rule bg-white',
        ].join(' ')}>
          {checked && (
            <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </span>
        <span className={`text-base ${checked ? 'font-medium text-cana' : 'text-cana-ink3'}`}>
          동의합니다
        </span>
      </button>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function StepAgreements() {
  const { control, formState: { errors } } = useFormContext<ApplyFormData>();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-cana-ink">약관 동의</h2>
        <p className="text-sm text-cana-ink3">이벤트 참여에 필요한 동의 항목이에요.</p>
      </div>

      <div className="flex flex-col gap-3">
        {/* 1. 개인정보 수집 및 이용 동의 (필수) */}
        <Controller
          name="agreePrivacy"
          control={control}
          rules={{ validate: (v) => v === true || '필수 동의 항목이에요' }}
          render={({ field }) => (
            <ConsentBlock
              required
              label="개인정보 수집 및 이용 동의"
              content={
                <div className="flex flex-col gap-2">
                  <p className="font-medium text-cana-ink2">수집 항목</p>
                  <p>이름, 생년, 성별, 키, 직업, 거주지, 근무지, 연락처, 신앙 정보, 프로필 사진, 직장/교인 인증 서류</p>
                  <p className="font-medium text-cana-ink2">수집 목적</p>
                  <p>매칭 서비스 운영 및 참여자 심사, 행사 진행</p>
                  <p className="font-medium text-cana-ink2">보유 기간</p>
                  <p>서비스 종료 후 즉시 파기 (최대 1년)</p>
                  <p className="font-medium text-cana-ink2">제3자 제공</p>
                  <p>매칭 확정 시 상대방에게 연락처만 제공. 그 외 제3자 제공 없음.</p>
                </div>
              }
              checked={field.value ?? false}
              onChange={field.onChange}
              error={errors.agreePrivacy?.message}
            />
          )}
        />

        {/* 2. 참여 시 주의 사항 동의 (필수) */}
        <Controller
          name="agreeAttendance"
          control={control}
          rules={{ validate: (v) => v === true || '필수 동의 항목이에요' }}
          render={({ field }) => (
            <ConsentBlock
              required
              label="참여 시 주의 사항 확인"
              content={
                <div className="flex flex-col gap-1.5">
                  <p>• 행사 당일 노쇼(무단 불참) 시 향후 참여가 제한될 수 있어요.</p>
                  <p>• 불참 시 행사 3일 전까지 반드시 운영팀에 연락해주세요.</p>
                  <p>• 타 참여자에 대한 무례한 언행은 퇴장 조치될 수 있어요.</p>
                  <p>• 행사 중 촬영된 사진·영상은 개인 SNS에 무단 게재할 수 없어요.</p>
                  <p>• 매칭 후 연락처 공유 외의 개인정보 요구는 거절할 권리가 있어요.</p>
                </div>
              }
              checked={field.value ?? false}
              onChange={field.onChange}
              error={errors.agreeAttendance?.message}
            />
          )}
        />

        {/* 3. 자기소개 파일 전달 동의 (선택) */}
        <Controller
          name="agreeProfileShare"
          control={control}
          render={({ field }) => (
            <ConsentBlock
              label="자기소개 파일 전달 동의"
              description="비동의 시 해당 항목이 빈칸으로 전달돼요."
              content={
                <div className="flex flex-col gap-1.5">
                  <p>소개팅 전날, 참여자들에게 상대방의 자기소개 파일이 전달될 예정이에요.</p>
                  <p>• 전달 항목: MBTI, 취미, 성격, 신앙 스타일 등 비식별 정보</p>
                  <p>• 미전달 항목: 연락처, 직장명, 거주지 등 개인정보</p>
                  <p>동의하지 않으시면 해당 항목이 빈칸으로 처리돼요.</p>
                </div>
              }
              checked={field.value ?? false}
              onChange={field.onChange}
            />
          )}
        />

        {/* 4. 카나 인스타그램 자기 PR 동의 (선택) */}
        <Controller
          name="agreeInstagram"
          control={control}
          render={({ field }) => (
            <ConsentBlock
              label="카나 인스타그램 자기 PR 콘텐츠 동의"
              description="개인정보는 절대 공개되지 않아요."
              content={
                <div className="flex flex-col gap-1.5">
                  <p>카나 인스타그램에서 참여자들의 자기 PR 콘텐츠를 게시할 예정이에요.</p>
                  <p>• 공개 항목: MBTI, 취미, 한 줄 소개 등 본인이 동의한 비식별 정보</p>
                  <p>• 비공개 항목: 이름, 연락처, 직장명, 사진 등 모든 개인정보</p>
                  <p>동의하지 않으셔도 서비스 이용에 불이익이 없어요.</p>
                </div>
              }
              checked={field.value ?? false}
              onChange={field.onChange}
            />
          )}
        />
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

const STEP_FIELDS: (keyof ApplyFormData)[][] = [
  ['eventId'],
  [], // profile review — no form fields to validate
  ['agreePrivacy', 'agreeAttendance'],
  [], // payment — handled by StepPayment
];

export default function ApplyPage() {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [eventTitle, setEventTitle] = useState('cana 소개팅');

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) setProfile(data as Profile);
      })
      .catch(() => {})
      .finally(() => setProfileLoaded(true));
  }, []);

  const methods = useForm<ApplyFormData>({
    defaultValues: {
      eventId: '',
      hobbies: [],
      personality: [],
      workplaceVerification: null,
      churchVerification: null,
      agreePrivacy: false,
      agreeAttendance: false,
      agreeProfileShare: false,
      agreeInstagram: false,
    },
    mode: 'onTouched',
  });

  // Expose getValues to window so StepProfileReview can save eventId before navigation
  useEffect(() => {
    (window as unknown as { __applyFormMethods?: unknown }).__applyFormMethods = {
      getValues: methods.getValues,
    };
    return () => {
      delete (window as unknown as { __applyFormMethods?: unknown }).__applyFormMethods;
    };
  }, [methods]);

  // sessionStorage 복원 (profile/create 에서 돌아온 경우)
  useEffect(() => {
    const savedEventId = sessionStorage.getItem('cana_apply_eventId');
    if (savedEventId) {
      methods.setValue('eventId', savedEventId);
      sessionStorage.removeItem('cana_apply_eventId');
      setStep(1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // URL ?eventId= 파라미터로 진입 시 일정 선택 스킵 (프로필 있을 때만)
  useEffect(() => {
    if (!profileLoaded) return;
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('eventId');
    if (!eventId) return;
    // URL 정리
    window.history.replaceState({}, '', '/apply');
    methods.setValue('eventId', eventId);
    // 프로필이 있어야 step 1로 이동, 없으면 step 0에서 배너 표시
    if (profile) setStep(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileLoaded]);

  const handleNext = async () => {
    if (step === 2) {
      // Step 2 → 3: 약관 검증 후 서버 적격 검사 (레코드 생성 없음)
      const valid = await methods.trigger(STEP_FIELDS[2]);
      if (!valid) return;

      setSubmitting(true);
      setServerError(null);

      try {
        const eventId = methods.getValues().eventId;

        // 적격 검사 (중복 신청 등)
        const checkRes = await fetch(`/api/apply?eventId=${eventId}`);
        if (!checkRes.ok) {
          const err = await checkRes.json().catch(() => ({})) as { error?: string };
          throw new Error(err.error ?? '신청 자격 확인에 실패했어요.');
        }

        // 이벤트 제목 조회
        const evRes = await fetch('/api/events');
        const evList = await evRes.json() as { id: string; title: string }[];
        const selectedEv = Array.isArray(evList) ? evList.find((e) => e.id === eventId) : null;
        if (selectedEv) setEventTitle(selectedEv.title);

        setStep(3);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err) {
        setServerError(err instanceof Error ? err.message : '오류가 발생했어요.');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // 기본 이동
    const valid = await methods.trigger(STEP_FIELDS[step]);
    if (valid) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 폼 submit은 결제 스텝(3)이 자체 버튼으로 처리하므로 기본 방지만
  const onSubmit = () => {};

  return (
    <div className="min-h-screen bg-cana-cream">
      <Nav />

      {/* 진행 바 — Nav 아래 고정 */}
      <div className="fixed left-0 right-0 top-[68px] z-40 h-0.5 bg-cana-rule">
        <div
          className="h-full bg-cana transition-all duration-500"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      <main className="mx-auto max-w-2xl px-5 pb-20 pt-24">
        <BackButton />
        <h1 className="mb-6 text-xl font-bold text-cana-ink">소개팅 신청</h1>

        {/* 스텝 레이블 */}
        <div className="mb-6 flex gap-1.5 overflow-x-auto pb-1">
          {STEPS.map((label, i) => (
            <span
              key={label}
              className={[
                'flex-shrink-0 rounded-full px-3 py-1 text-sm transition',
                i === step
                  ? 'bg-cana font-medium text-white'
                  : i < step
                  ? 'bg-cana/10 text-cana'
                  : 'bg-cana-rule text-cana-ink3',
              ].join(' ')}
            >
              {i < step ? '✓ ' : ''}{label}
            </span>
          ))}
        </div>

        {/* 프로필 없음 배너 (Step 0에서만, 프로필 로드 완료 후) */}
        {step === 0 && profileLoaded && !profile && (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
            <p className="text-sm font-medium text-amber-800">
              작성된 프로필카드가 없어요. 참여하기 위해서는 프로필 카드 작성이 필요해요.
            </p>
            <Link
              href="/profile/create?return=/apply"
              className="mt-2 inline-block text-sm font-medium text-cana underline underline-offset-2"
            >
              지금 작성하기
            </Link>
          </div>
        )}

        {/* 폼 */}
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <div className="rounded-2xl border border-cana-rule bg-white p-5 shadow-sm">
              {step === 0 && <Step0 />}
              {step === 1 && <StepProfileReview profile={profile} />}
              {step === 2 && <StepAgreements />}
              {step === 3 && profile && (
                <StepPayment
                  eventId={methods.getValues().eventId}
                  eventTitle={eventTitle}
                  amount={parseInt(process.env.NEXT_PUBLIC_TOSS_AMOUNT ?? '39000', 10)}
                  customerKey={profile.user_id}
                  agreePrivacy={methods.getValues().agreePrivacy ?? false}
                  agreeAttendance={methods.getValues().agreeAttendance ?? false}
                  agreeProfileShare={methods.getValues().agreeProfileShare ?? false}
                  agreeInstagram={methods.getValues().agreeInstagram ?? false}
                />
              )}
            </div>

            {serverError && (
              <p className="mt-4 text-center text-sm text-red-500">{serverError}</p>
            )}

            {/* 네비게이션 — 모든 스텝 동일 구조 */}
            <div className="mt-5 flex items-center gap-3">
              {step > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex-shrink-0 rounded-xl border border-cana-rule px-5 py-3 text-base text-cana-ink3 transition active:bg-cana-cream"
                >
                  이전
                </button>
              )}
              {/* step 3: StepPayment 내부에 결제 버튼이 있으므로 다음 버튼 없음 */}
              {step < 3 && (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={submitting || (step === 0 && profileLoaded && !profile)}
                  className="flex-1 rounded-xl bg-cana py-3 text-base font-medium text-white transition active:bg-cana-dark disabled:opacity-40"
                >
                  {submitting && step === 2 ? '확인 중...' : '다음'}
                </button>
              )}
            </div>
          </form>
        </FormProvider>
      </main>
    </div>
  );
}
