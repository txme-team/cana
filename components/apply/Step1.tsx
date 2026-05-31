'use client';

import { useEffect, useMemo } from 'react';
import { useFormContext, Controller, useWatch } from 'react-hook-form';
import type {
  ApplyFormData,
  GenderOption,
  EducationOption,
  LivingWithOption,
  DrinkingOption,
  SmokingOption,
} from '@/lib/types';
import { CITIES, DISTRICTS } from '@/lib/locations';
import {
  TextInput,
  SelectInput,
  RadioGroup,
  ChipGroup,
  QuestionBlock,
  scrollToRef,
} from './ui';

const GENDER_OPTIONS: GenderOption[] = ['남성', '여성'];
const EDUCATION_OPTIONS: EducationOption[] = ['고졸', '대졸', '대학원졸', '기타'];
const LIVING_WITH_OPTIONS: LivingWithOption[] = ['가족과', '혼자', '기타'];
const DRINKING_OPTIONS: DrinkingOption[] = ['안 마심', '분위기 따라', '월 1~2회', '주 1회 이상'];
const SMOKING_OPTIONS: SmokingOption[] = ['비흡연', '흡연(전자담배)', '흡연(연초)', '금연 중'];

const HOBBY_OPTIONS = [
  '독서', '필라테스', '요리', '카페 투어', '영화 감상',
  '운동', '등산', '여행', '음악 감상', '게임',
  '그림·공예', '사진·영상', '드라이브', '봉사활동', '맛집 탐방',
];

const PERSONALITY_OPTIONS = [
  '따뜻한', '공감 잘하는', '계획적인', '조용한 편',
  '활발한', '유머있는', '솔직한', '배려심 있는',
  '리더십 있는', '신중한', '낙천적인', '성실한',
];

export default function Step1() {
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = useFormContext<ApplyFormData>();

  const workplaceCity = useWatch({ name: 'workplaceCity' });
  const residenceCity = useWatch({ name: 'residenceCity' });

  // 시 바뀌면 구 초기화
  useEffect(() => { setValue('workplaceDistrict', ''); }, [workplaceCity, setValue]);
  useEffect(() => { setValue('residenceDistrict', ''); }, [residenceCity, setValue]);

  // 자동 스크롤 refs (마운트 시 1회 생성)
  const refs = useMemo(
    () => Array.from({ length: 16 }, () => ({ current: null as HTMLDivElement | null })),
    []
  );
  const next = (i: number) => () => scrollToRef(refs[i + 1]);

  return (
    <div className="flex flex-col gap-6">
      {/* 성별 */}
      <QuestionBlock qRef={refs[0]}>
        <Controller
          name="gender"
          control={control}
          rules={{ required: '성별을 선택해주세요' }}
          render={({ field }) => (
            <RadioGroup<GenderOption>
              label="성별"
              options={GENDER_OPTIONS}
              value={field.value as GenderOption}
              onChange={field.onChange}
              onNext={next(0)}
              error={errors.gender?.message}
              cols={2}
            />
          )}
        />
      </QuestionBlock>

      {/* 이름 */}
      <QuestionBlock qRef={refs[1]}>
        <TextInput
          label="이름"
          placeholder="김카나"
          error={errors.name?.message}
          {...register('name', { required: '이름을 입력해주세요' })}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); next(1)(); } }}
        />
      </QuestionBlock>

      {/* 출생연도 */}
      <QuestionBlock qRef={refs[2]}>
        <TextInput
          label="출생연도"
          placeholder="1993"
          inputMode="numeric"
          maxLength={4}
          error={errors.birthYear?.message}
          {...register('birthYear', {
            required: '출생연도를 입력해주세요',
            pattern: { value: /^\d{4}$/, message: '4자리 연도를 입력해주세요 (예: 1993)' },
          })}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); next(2)(); } }}
        />
      </QuestionBlock>

      {/* MBTI */}
      <QuestionBlock qRef={refs[3]}>
        <TextInput
          label="MBTI"
          placeholder="INFP"
          maxLength={4}
          className="uppercase"
          error={errors.mbti?.message}
          {...register('mbti', {
            required: 'MBTI를 입력해주세요',
            pattern: { value: /^[A-Za-z]{4}$/, message: '4글자로 입력해주세요' },
          })}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); next(3)(); } }}
        />
      </QuestionBlock>

      {/* 키 */}
      <QuestionBlock qRef={refs[4]}>
        <TextInput
          label="키"
          placeholder="163"
          suffix="cm"
          inputMode="numeric"
          maxLength={3}
          error={errors.heightCm?.message}
          {...register('heightCm', { required: '키를 입력해주세요' })}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); next(4)(); } }}
        />
      </QuestionBlock>

      {/* 근무 지역 */}
      <QuestionBlock qRef={refs[5]}>
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-500">근무 지역</span>
          <div className="grid grid-cols-2 gap-2">
            <Controller
              name="workplaceCity"
              control={control}
              rules={{ required: '시/도를 선택해주세요' }}
              render={({ field }) => (
                <SelectInput
                  label=""
                  options={CITIES}
                  value={field.value ?? ''}
                  onChange={(v) => { field.onChange(v); }}
                  placeholder="시/도"
                  error={errors.workplaceCity?.message}
                />
              )}
            />
            <Controller
              name="workplaceDistrict"
              control={control}
              rules={{ required: '구/시를 선택해주세요' }}
              render={({ field }) => (
                <SelectInput
                  label=""
                  options={workplaceCity ? DISTRICTS[workplaceCity] ?? [] : []}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  placeholder="구/시"
                  disabled={!workplaceCity}
                  error={errors.workplaceDistrict?.message}
                />
              )}
            />
          </div>
        </div>
      </QuestionBlock>

      {/* 직업 */}
      <QuestionBlock qRef={refs[6]}>
        <TextInput
          label="직업"
          placeholder="마케터"
          error={errors.job?.message}
          {...register('job', { required: '직업을 입력해주세요' })}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); next(6)(); } }}
        />
      </QuestionBlock>

      {/* 회사명 */}
      <QuestionBlock qRef={refs[7]}>
        <TextInput
          label="회사명"
          placeholder="(주)카나코퍼레이션"
          description="사전 심사에만 사용되며 타인에게 공개되지 않아요."
          error={errors.companyName?.message}
          {...register('companyName', { required: '회사명을 입력해주세요' })}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); next(7)(); } }}
        />
      </QuestionBlock>

      {/* 거주 지역 */}
      <QuestionBlock qRef={refs[8]}>
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-500">사는 곳</span>
          <div className="grid grid-cols-2 gap-2">
            <Controller
              name="residenceCity"
              control={control}
              rules={{ required: '시/도를 선택해주세요' }}
              render={({ field }) => (
                <SelectInput
                  label=""
                  options={CITIES}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  placeholder="시/도"
                  error={errors.residenceCity?.message}
                />
              )}
            />
            <Controller
              name="residenceDistrict"
              control={control}
              rules={{ required: '구/시를 선택해주세요' }}
              render={({ field }) => (
                <SelectInput
                  label=""
                  options={residenceCity ? DISTRICTS[residenceCity] ?? [] : []}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  placeholder="구/시"
                  disabled={!residenceCity}
                  error={errors.residenceDistrict?.message}
                />
              )}
            />
          </div>
        </div>
      </QuestionBlock>

      {/* 거주 형태 */}
      <QuestionBlock qRef={refs[9]}>
        <Controller
          name="livingWith"
          control={control}
          rules={{ required: '거주 형태를 선택해주세요' }}
          render={({ field }) => (
            <RadioGroup<LivingWithOption>
              label="거주 형태"
              options={LIVING_WITH_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              onNext={next(9)}
              error={errors.livingWith?.message}
              cols={3}
            />
          )}
        />
      </QuestionBlock>

      {/* 학력 */}
      <QuestionBlock qRef={refs[10]}>
        <Controller
          name="education"
          control={control}
          rules={{ required: '학력을 선택해주세요' }}
          render={({ field }) => (
            <RadioGroup<EducationOption>
              label="학력"
              options={EDUCATION_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              onNext={next(10)}
              error={errors.education?.message}
              cols={4}
            />
          )}
        />
      </QuestionBlock>

      {/* 음주 */}
      <QuestionBlock qRef={refs[11]}>
        <Controller
          name="drinking"
          control={control}
          rules={{ required: '음주 여부를 선택해주세요' }}
          render={({ field }) => (
            <RadioGroup<DrinkingOption>
              label="음주"
              options={DRINKING_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              onNext={next(11)}
              error={errors.drinking?.message}
              cols={2}
            />
          )}
        />
      </QuestionBlock>

      {/* 흡연 */}
      <QuestionBlock qRef={refs[12]}>
        <Controller
          name="smoking"
          control={control}
          rules={{ required: '흡연 여부를 선택해주세요' }}
          render={({ field }) => (
            <RadioGroup<SmokingOption>
              label="흡연"
              options={SMOKING_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              onNext={next(12)}
              error={errors.smoking?.message}
              cols={2}
            />
          )}
        />
      </QuestionBlock>

      {/* 취미 / 관심사 */}
      <QuestionBlock qRef={refs[13]}>
        <Controller
          name="hobbies"
          control={control}
          rules={{
            validate: (v) => (v?.length >= 1 ? true : '취미를 1개 이상 선택해주세요'),
          }}
          render={({ field }) => (
            <ChipGroup
              label="취미 / 관심사 (최대 5개)"
              options={HOBBY_OPTIONS}
              value={field.value ?? []}
              onChange={field.onChange}
              max={5}
              error={errors.hobbies?.message}
            />
          )}
        />
      </QuestionBlock>

      {/* 성격 / 스타일 */}
      <QuestionBlock qRef={refs[14]}>
        <Controller
          name="personality"
          control={control}
          rules={{
            validate: (v) => (v?.length >= 1 ? true : '성격을 1개 이상 선택해주세요'),
          }}
          render={({ field }) => (
            <ChipGroup
              label="성격 / 스타일 (최대 5개)"
              options={PERSONALITY_OPTIONS}
              value={field.value ?? []}
              onChange={field.onChange}
              max={5}
              error={errors.personality?.message}
            />
          )}
        />
      </QuestionBlock>
    </div>
  );
}
