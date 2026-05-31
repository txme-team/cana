'use client';

import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { ApplyFormData } from '@/lib/types';
import Step1 from '@/components/apply/Step1';
import Step2 from '@/components/apply/Step2';
import Step3 from '@/components/apply/Step3';
import Step5 from '@/components/apply/Step5';
import StepQnA from '@/components/apply/StepQnA';
import Nav from '@/components/landing/Nav';
import BackButton from '@/components/landing/BackButton';
import { useFormContext, Controller } from 'react-hook-form';

// ─── Phone Step (연락처) ────────────────────────────────────────────────────────

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function StepPhone() {
  const { control, formState: { errors } } = useFormContext<ApplyFormData>();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-cana-ink">연락처</h2>
        <p className="text-sm text-cana-ink3">매칭 확정 시 상대방에게만 공개돼요.</p>
      </div>

      <Controller
        name="phone"
        control={control}
        rules={{
          required: '연락처를 입력해주세요',
          pattern: {
            value: /^010-\d{4}-\d{4}$/,
            message: '올바른 형식으로 입력해주세요 (예: 010-1234-5678)',
          },
        }}
        render={({ field }) => (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-cana-ink3">휴대폰 번호</label>
            <input
              type="tel"
              inputMode="tel"
              placeholder="010-1234-5678"
              value={field.value ?? ''}
              onChange={(e) => field.onChange(formatPhone(e.target.value))}
              className={[
                'w-full rounded-xl border px-4 py-3 text-base outline-none transition',
                'focus:border-cana focus:ring-1 focus:ring-cana',
                errors.phone ? 'border-red-400' : 'border-cana-rule',
              ].join(' ')}
            />
            {errors.phone && (
              <p className="text-xs text-red-500">{errors.phone.message}</p>
            )}
            <p className="text-xs text-cana-ink3/60">
              🔒 연락처는 안전하게 저장되며, 매칭 완료 전까지 누구에게도 공개되지 않아요.
            </p>
          </div>
        )}
      />
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

const STEPS = ['프로필', '라이프스타일', '신앙', 'Q&A', '인증', '연락처'];

const STEP_FIELDS: (keyof ApplyFormData)[][] = [
  [
    'gender', 'name', 'birthYear', 'mbti', 'heightCm',
    'workplaceCity', 'workplaceDistrict', 'job', 'companyName',
    'residenceCity', 'residenceDistrict', 'livingWith',
    'education', 'drinking', 'smoking', 'hobbies', 'personality',
  ],
  [
    'contactFrequency', 'dateFrequency', 'oppositeFriend',
    'marriageView', 'conflictStyle', 'restDay', 'pet', 'dateStyle',
  ],
  [
    'denomination', 'faithYears', 'churchName',
    'churchCity', 'churchDistrict', 'faithLevel',
    'faithStyle', 'sundayAttendance', 'ministry',
  ],
  [
    'prayerRequest', 'bibleVerse', 'ministryNote', 'faithGrowthMoment', 'answeredPrayer', 'communityRole',
    'jobDescription', 'careerGoal', 'coworkerOpinion', 'careerMotivation',
    'relationshipPromise', 'partnerStyle', 'feelingLoved', 'humorStyle', 'weekendStyle', 'spendingHabit', 'conflictApproach',
  ],
  ['photo', 'churchVerification'],
  ['phone'],
];

// Map DB profile fields → ApplyFormData fields
function prefillFromProfile(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profile: Record<string, any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: (field: keyof ApplyFormData, value: any) => void
) {
  if (profile.nickname)           setValue('name', profile.nickname);
  if (profile.birth_year)         setValue('birthYear', String(profile.birth_year));
  if (profile.height)             setValue('heightCm', String(profile.height));
  if (profile.gender)             setValue('gender', profile.gender === 'male' ? '남성' : '여성');
  if (profile.workplace) {
    const parts = String(profile.workplace).split(' ');
    setValue('workplaceCity', parts[0] ?? '');
    setValue('workplaceDistrict', parts.slice(1).join(' ') ?? '');
  }
  if (profile.residence) {
    const parts = String(profile.residence).split(' ');
    setValue('residenceCity', parts[0] ?? '');
    setValue('residenceDistrict', parts.slice(1).join(' ') ?? '');
  }
  if (profile.living_with) {
    const map: Record<string, string> = { family: '가족과', alone: '혼자', other: '기타' };
    setValue('livingWith', (map[profile.living_with] ?? '') as ApplyFormData['livingWith']);
  }
  if (profile.church_location) {
    const parts = String(profile.church_location).split(' ');
    setValue('churchCity', parts[0] ?? '');
    setValue('churchDistrict', parts.slice(1).join(' ') ?? '');
  }
  if (profile.church_denomination) setValue('denomination', profile.church_denomination);
  if (profile.faith_years)         setValue('faithYears', String(profile.faith_years));
  if (profile.contact_preference)  setValue('contactFrequency', profile.contact_preference);
  if (profile.opposite_friends)    setValue('oppositeFriend', profile.opposite_friends);
  if (profile.conflict_resolution) setValue('conflictStyle', profile.conflict_resolution);
  if (profile.day_off_style)       setValue('restDay', profile.day_off_style);
  if (profile.worship_frequency)   setValue('sundayAttendance', profile.worship_frequency);
  if (profile.date_frequency)      setValue('dateFrequency', profile.date_frequency);
  if (profile.marriage_view)       setValue('marriageView', profile.marriage_view);
  if (profile.pet)                 setValue('pet', profile.pet);
  if (profile.date_style)          setValue('dateStyle', profile.date_style);
  if (profile.faith_style)         setValue('faithStyle', profile.faith_style);
  if (profile.ministry)            setValue('ministry', profile.ministry);
  if (profile.church_name)         setValue('churchName', profile.church_name);
  if (profile.faith_level)         setValue('faithLevel', profile.faith_level);
  if (profile.phone)               setValue('phone', profile.phone);
  // 자기소개 에세이
  if (profile.profile_essays) {
    const e = profile.profile_essays as Record<string, string>;
    const essayKeys = [
      'prayerRequest', 'bibleVerse', 'ministryNote', 'faithGrowthMoment', 'answeredPrayer', 'communityRole',
      'jobDescription', 'careerGoal', 'coworkerOpinion', 'careerMotivation',
      'relationshipPromise', 'partnerStyle', 'feelingLoved', 'humorStyle', 'weekendStyle', 'spendingHabit', 'conflictApproach',
    ] as const;
    for (const k of essayKeys) {
      if (e[k]) setValue(k as keyof ApplyFormData, e[k]);
    }
  }
  // Direct mappings
  if (profile.mbti)                setValue('mbti', profile.mbti);
  if (profile.education)           setValue('education', profile.education);
  if (profile.job)                 setValue('job', profile.job);
  if (profile.company_name)        setValue('companyName', profile.company_name);
  if (profile.drinking)            setValue('drinking', profile.drinking);
  if (profile.smoking)             setValue('smoking', profile.smoking);
  if (profile.hobbies)             setValue('hobbies', profile.hobbies);
  if (profile.personality)         setValue('personality', profile.personality);
  // Photos/certs cannot be pre-filled as FileList — skip
}

export default function ProfileCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNudge = searchParams.get('nudge') === 'true';
  const returnTo = searchParams.get('return') ?? '/apply';

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

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
      // 자기소개
      prayerRequest: '',
      bibleVerse: '',
      ministryNote: '',
      faithGrowthMoment: '',
      answeredPrayer: '',
      communityRole: '',
      jobDescription: '',
      careerGoal: '',
      coworkerOpinion: '',
      careerMotivation: '',
      relationshipPromise: '',
      partnerStyle: '',
      feelingLoved: '',
      humorStyle: '',
      weekendStyle: '',
      spendingHabit: '',
      conflictApproach: '',
    },
    mode: 'onTouched',
  });

  // Pre-fill if existing profile
  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then((profile) => {
        if (profile && !profile.error) {
          prefillFromProfile(profile, methods.setValue);
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNext = async () => {
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

  const onSubmit = async (data: ApplyFormData) => {
    setSubmitting(true);
    setServerError(null);

    try {
      const fd = new FormData();

      const photoFile = data.photo?.[0];
      if (photoFile) fd.append('photo', photoFile);

      const wpFile = data.workplaceVerification?.[0];
      if (wpFile) fd.append('workplaceVerification', wpFile);

      const churchFile = data.churchVerification?.[0];
      if (churchFile) fd.append('churchVerification', churchFile);

      const payload = {
        gender:           data.gender,
        name:             data.name,
        birthYear:        data.birthYear,
        mbti:             data.mbti.toUpperCase(),
        heightCm:         data.heightCm,
        workplaceCity:    data.workplaceCity,
        workplaceDistrict: data.workplaceDistrict,
        job:              data.job,
        companyName:      data.companyName,
        residenceCity:    data.residenceCity,
        residenceDistrict: data.residenceDistrict,
        livingWith:       data.livingWith,
        education:        data.education,
        drinking:         data.drinking,
        smoking:          data.smoking,
        hobbies:          data.hobbies,
        personality:      data.personality,
        contactFrequency: data.contactFrequency,
        dateFrequency:    data.dateFrequency,
        oppositeFriend:   data.oppositeFriend,
        marriageView:     data.marriageView,
        conflictStyle:    data.conflictStyle,
        restDay:          data.restDay,
        pet:              data.pet,
        dateStyle:        data.dateStyle,
        denomination:     data.denomination,
        faithYears:       data.faithYears,
        churchName:       data.churchName,
        churchCity:       data.churchCity,
        churchDistrict:   data.churchDistrict,
        faithLevel:       data.faithLevel,
        faithStyle:       data.faithStyle,
        sundayAttendance: data.sundayAttendance,
        ministry:         data.ministry,
        phone:            data.phone,
        // 자기소개 에세이
        prayerRequest:       data.prayerRequest,
        bibleVerse:          data.bibleVerse,
        ministryNote:        data.ministryNote,
        faithGrowthMoment:   data.faithGrowthMoment,
        answeredPrayer:      data.answeredPrayer,
        communityRole:       data.communityRole,
        jobDescription:      data.jobDescription,
        careerGoal:          data.careerGoal,
        coworkerOpinion:     data.coworkerOpinion,
        careerMotivation:    data.careerMotivation,
        relationshipPromise: data.relationshipPromise,
        partnerStyle:        data.partnerStyle,
        feelingLoved:        data.feelingLoved,
        humorStyle:          data.humorStyle,
        weekendStyle:        data.weekendStyle,
        spendingHabit:       data.spendingHabit,
        conflictApproach:    data.conflictApproach,
      };
      fd.append('data', JSON.stringify(payload));

      const res = await fetch('/api/profile', { method: 'POST', body: fd });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? '저장에 실패했어요. 다시 시도해주세요.');
      }

      router.push(returnTo);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : '오류가 발생했어요.');
    } finally {
      setSubmitting(false);
    }
  };

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
        <h1 className="mb-6 text-xl font-bold text-cana-ink">프로필 카드 작성</h1>

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

        {/* 폼 */}
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <div className="rounded-2xl border border-cana-rule bg-white p-5 shadow-sm">
              {step === 0 && <Step1 />}
              {step === 1 && <Step2 />}
              {step === 2 && <Step3 />}
              {step === 3 && <StepQnA />}
              {step === 4 && <Step5 />}
              {step === 5 && <StepPhone />}
            </div>

            {serverError && (
              <p className="mt-4 text-center text-sm text-red-500">{serverError}</p>
            )}

            {/* 네비게이션 */}
            <div className="mt-5 flex items-center justify-between gap-3">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex-shrink-0 rounded-xl border border-cana-rule px-5 py-3 text-base text-cana-ink3 transition active:bg-cana-cream"
                >
                  이전
                </button>
              ) : (
                <div />
              )}

              <div className="flex flex-1 flex-col gap-2">
                {step < STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full rounded-xl bg-cana py-3 text-base font-medium text-white transition active:bg-cana-dark"
                  >
                    다음
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-xl bg-cana py-3 text-base font-medium text-white transition active:bg-cana-dark disabled:opacity-60"
                  >
                    {submitting ? '저장 중...' : '프로필 저장'}
                  </button>
                )}

                {/* 나중에 하기 — nudge 모드에서만 표시, 마지막 스텝 제외 */}
                {isNudge && step < STEPS.length - 1 && (
                  <Link
                    href="/apply"
                    className="text-center text-sm text-cana-ink3/60 underline underline-offset-2"
                  >
                    나중에 하기
                  </Link>
                )}
              </div>
            </div>
          </form>
        </FormProvider>
      </main>
    </div>
  );
}
