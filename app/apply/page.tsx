'use client';

import { useState, useEffect } from 'react';
import { useForm, FormProvider, useFormContext, Controller } from 'react-hook-form';
import Script from 'next/script';
import Link from 'next/link';
import type { ApplyFormData } from '@/lib/types';
import type { Profile } from '@/lib/types';
import { PAYMENT_PENDING_KEY, type PendingPayload } from '@/lib/payment';
import Nav from '@/components/landing/Nav';
import BackButton from '@/components/landing/BackButton';
import Step0 from '@/components/apply/Step0';
import StepIndicator from '@/components/common/StepIndicator';


const STEPS = ['일정', '프로필 확인', '동의'];


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

      {/* 수정 링크 */}
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
  [], // 프로필 확인 — 폼 필드 없음
  ['agreePrivacy', 'agreeAttendance'],
];

const TOSS_AMOUNT = parseInt(process.env.NEXT_PUBLIC_TOSS_AMOUNT ?? '50000', 10);
const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;

export default function ApplyPage() {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [tossReady, setTossReady] = useState(false);

  // ── 대기 신청 모달 상태 ──────────────────────────────────────────────────────
  const [waitlistModal, setWaitlistModal] = useState<{
    open: boolean;
    event: { id: string; title: string } | null;
    loading: boolean;
    done: boolean;
    error: string | null;
  }>({ open: false, event: null, loading: false, done: false, error: null });

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

  // StepProfileReview에서 프로필 수정 전 eventId 보존용
  useEffect(() => {
    (window as unknown as { __applyFormMethods?: unknown }).__applyFormMethods = {
      getValues: methods.getValues,
    };
    return () => {
      delete (window as unknown as { __applyFormMethods?: unknown }).__applyFormMethods;
    };
  }, [methods]);

  // profile/create 에서 돌아온 경우 eventId 복원
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
    window.history.replaceState({}, '', '/apply');
    methods.setValue('eventId', eventId);
    if (profile) setStep(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileLoaded]);

  const handleNext = async () => {
    if (step === 2) {
      // 약관 검증
      const valid = await methods.trigger(STEP_FIELDS[2]);
      if (!valid) return;

      setSubmitting(true);
      setServerError(null);

      try {
        const values = methods.getValues();
        const { eventId } = values;

        // 적격 검사 (중복 신청 등 — 레코드 생성 없음)
        const checkRes = await fetch(`/api/apply?eventId=${eventId}`);
        if (!checkRes.ok) {
          const err = await checkRes.json().catch(() => ({})) as { error?: string };
          throw new Error(err.error ?? '신청 자격 확인에 실패했어요.');
        }

        // orderId 생성
        const orderId = crypto.randomUUID();

        // Toss 리다이렉트 후 /apply/success 에서 읽을 데이터 저장
        const pending: PendingPayload = {
          orderId,
          eventId,
          agreePrivacy:      values.agreePrivacy      ?? false,
          agreeAttendance:   values.agreeAttendance   ?? false,
          agreeProfileShare: values.agreeProfileShare ?? false,
          agreeInstagram:    values.agreeInstagram    ?? false,
        };
        sessionStorage.setItem(PAYMENT_PENDING_KEY, JSON.stringify(pending));

        // Toss Standard Payment Window 호출 — 성공 시 successUrl 로 리다이렉트
        const tossPayments = window.TossPayments!(TOSS_CLIENT_KEY);
        await tossPayments.payment({ customerKey: profile!.user_id })
          .requestPayment({
            method: 'CARD',
            amount: { value: TOSS_AMOUNT, currency: 'KRW' },
            orderId,
            orderName: 'cana 소개팅 참여비',
            successUrl: `${window.location.origin}/apply/success`,
            failUrl:    `${window.location.origin}/apply/fail`,
          });
        // 리다이렉트 발생 — 아래 코드는 실행 안 됨
      } catch (err) {
        sessionStorage.removeItem(PAYMENT_PENDING_KEY);
        setServerError(err instanceof Error ? err.message : '오류가 발생했어요.');
        setSubmitting(false);
      }
      return;
    }

    // step 0, 1: 기본 이동
    const valid = await methods.trigger(STEP_FIELDS[step]);
    if (!valid) return;

    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── 대기 신청 확정 ───────────────────────────────────────────────────────────
  const handleWaitlistConfirm = async () => {
    if (!waitlistModal.event) return;
    setWaitlistModal((m) => ({ ...m, loading: true, error: null }));
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: waitlistModal.event.id }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(err.error ?? '대기 신청에 실패했어요.');
      }
      setWaitlistModal((m) => ({ ...m, loading: false, done: true }));
    } catch (e) {
      setWaitlistModal((m) => ({
        ...m,
        loading: false,
        error: e instanceof Error ? e.message : '오류가 발생했어요.',
      }));
    }
  };

  const handlePrev = () => {
    setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSubmit = () => {};

  const formattedAmount = TOSS_AMOUNT.toLocaleString('ko-KR');

  return (
    <div className="min-h-screen bg-cana-cream">
      {/* Toss Payments V2 Standard SDK */}
      <Script
        src="https://js.tosspayments.com/v2/standard"
        strategy="afterInteractive"
        onReady={() => setTossReady(true)}
      />

      <Nav />

      {/* 진행 바 */}
      <div className="fixed left-0 right-0 top-[68px] z-40 h-0.5 bg-cana-rule">
        <div
          className="h-full bg-cana transition-all duration-500"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      <main className="mx-auto max-w-2xl px-5 pb-20 pt-24">
        <BackButton />
        <h1 className="mb-6 text-xl font-bold text-cana-ink">소개팅 신청</h1>

        {/* 스텝 인디케이터 */}
        <div className="mb-8">
          <StepIndicator steps={STEPS} current={step} />
        </div>

        {/* 프로필 없음 배너 (Step 0, 프로필 로드 완료 후) */}
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
              {step === 0 && (
                <Step0
                  onWaitlist={(event) =>
                    setWaitlistModal({ open: true, event, loading: false, done: false, error: null })
                  }
                />
              )}
              {step === 1 && <StepProfileReview profile={profile} />}
              {step === 2 && <StepAgreements />}
            </div>

            {serverError && (
              <p className="mt-4 text-center text-sm text-red-500">{serverError}</p>
            )}

            {/* 네비게이션 */}
            <div className="mt-5 flex items-center gap-3">
              {step > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={submitting}
                  className="flex-shrink-0 rounded-xl border border-cana-rule px-5 py-3 text-base text-cana-ink3 transition active:bg-cana-cream disabled:opacity-40"
                >
                  이전
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                disabled={
                  submitting ||
                  (step === 0 && profileLoaded && !profile) ||
                  (step === 2 && !tossReady)
                }
                className="flex-1 rounded-xl bg-cana py-3 text-base font-medium text-white transition active:bg-cana-dark disabled:opacity-40"
              >
                {step === 2
                  ? submitting
                    ? '결제 중...'
                    : !tossReady
                    ? '결제 준비 중...'
                    : `${formattedAmount}원 결제하기`
                  : '다음'}
              </button>
            </div>
          </form>
        </FormProvider>
      </main>

      {/* ── 대기 신청 확인 모달 ──────────────────────────────────────────────── */}
      {waitlistModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5"
          onClick={() => !waitlistModal.loading && setWaitlistModal((m) => ({ ...m, open: false }))}
        >
          <div
            className="w-full max-w-xs rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {waitlistModal.done ? (
              /* 완료 상태 */
              <div className="flex flex-col gap-2">
                <p className="text-base font-semibold text-cana-ink">대기 신청 완료! 🎉</p>
                <p className="mb-4 text-sm leading-relaxed text-cana-ink3">
                  빈자리가 생기면 문자로 알려드릴게요.<br />
                  마이페이지에서 대기 현황을 확인할 수 있어요.
                </p>
                <button
                  onClick={() => setWaitlistModal((m) => ({ ...m, open: false }))}
                  className="w-full rounded-xl bg-cana py-2.5 text-sm font-medium text-white transition active:bg-cana-dark"
                >
                  확인
                </button>
              </div>
            ) : (
              /* 확인 요청 상태 */
              <>
                <p className="mb-1 text-base font-semibold text-cana-ink">대기 신청할까요?</p>
                <p className="mb-1 text-sm font-medium text-cana">{waitlistModal.event?.title}</p>
                <p className="mb-5 text-sm leading-relaxed text-cana-ink3">
                  현재 정원이 마감됐어요.<br />
                  빈자리가 생기면 문자로 알려드리고,<br />
                  가장 먼저 결제하신 분이 자리를 확보해요.
                </p>

                {waitlistModal.error && (
                  <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-500">
                    {waitlistModal.error}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setWaitlistModal((m) => ({ ...m, open: false }))}
                    disabled={waitlistModal.loading}
                    className="flex-1 rounded-xl border border-cana-rule py-2.5 text-sm text-cana-ink3 transition hover:bg-cana-warm disabled:opacity-40"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleWaitlistConfirm}
                    disabled={waitlistModal.loading}
                    className="flex-1 rounded-xl bg-cana py-2.5 text-sm font-medium text-white transition active:bg-cana-dark disabled:opacity-40"
                  >
                    {waitlistModal.loading ? '신청 중...' : '대기 신청'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
