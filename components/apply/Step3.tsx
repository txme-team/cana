'use client';

import { useEffect, useMemo } from 'react';
import { useFormContext, Controller, useWatch } from 'react-hook-form';
import type {
  ApplyFormData,
  FaithStyleOption,
  FaithLevelOption,
  SundayAttendanceOption,
  MinistryOption,
} from '@/lib/types';
import { CITIES, DISTRICTS, DENOMINATIONS } from '@/lib/locations';
import {
  TextInput,
  SelectInput,
  RadioGroup,
  SectionHeader,
  QuestionBlock,
  scrollToRef,
} from './ui';

const FAITH_LEVEL_OPTIONS: FaithLevelOption[] = [
  '초신자이거나 가나안 신도예요',
  '주일 성수는 지키려고 노력해요',
  '비정기적으로 교회활동과 봉사에 참여해요',
  '적극적으로 사역하며 삶의 중심이 신앙이에요',
];

const FAITH_STYLE_OPTIONS: FaithStyleOption[] = [
  '말씀 중심',
  '예배·찬양 중심',
  '봉사·섬김 중심',
  '균형형',
];

const SUNDAY_OPTIONS: SundayAttendanceOption[] = ['거의 매주', '2~3주에 1회', '상황에 따라'];
const MINISTRY_OPTIONS: MinistryOption[] = ['찬양팀', '교육부', '행정', '없음', '기타'];

export default function Step3() {
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = useFormContext<ApplyFormData>();

  const churchCity = useWatch({ name: 'churchCity' });

  useEffect(() => { setValue('churchDistrict', ''); }, [churchCity, setValue]);

  const refs = useMemo(
    () => Array.from({ length: 10 }, () => ({ current: null as HTMLDivElement | null })),
    []
  );
  const next = (i: number) => () => scrollToRef(refs[i + 1]);

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader>신앙</SectionHeader>

      {/* 교단 */}
      <QuestionBlock qRef={refs[0]}>
        <Controller
          name="denomination"
          control={control}
          rules={{ required: '교단을 선택해주세요' }}
          render={({ field }) => (
            <SelectInput
              label="교단"
              options={DENOMINATIONS}
              value={field.value ?? ''}
              onChange={(v) => { field.onChange(v); next(0)(); }}
              placeholder="교단 선택"
              error={errors.denomination?.message}
            />
          )}
        />
      </QuestionBlock>

      {/* 신앙 연수 */}
      <QuestionBlock qRef={refs[1]}>
        <TextInput
          label="신앙 연수"
          placeholder="12"
          suffix="년"
          inputMode="numeric"
          maxLength={2}
          error={errors.faithYears?.message}
          {...register('faithYears', {
            required: '신앙 연수를 입력해주세요',
            pattern: { value: /^\d+$/, message: '숫자만 입력해주세요' },
          })}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); next(1)(); } }}
        />
      </QuestionBlock>

      {/* 교회 이름 */}
      <QuestionBlock qRef={refs[2]}>
        <TextInput
          label="교회 이름"
          placeholder="카나교회"
          error={errors.churchName?.message}
          {...register('churchName', { required: '교회 이름을 입력해주세요' })}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); next(2)(); } }}
        />
      </QuestionBlock>

      {/* 교회 위치 */}
      <QuestionBlock qRef={refs[3]}>
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-500">교회 위치</span>
          <div className="grid grid-cols-2 gap-2">
            <Controller
              name="churchCity"
              control={control}
              rules={{ required: '시/도를 선택해주세요' }}
              render={({ field }) => (
                <SelectInput
                  label=""
                  options={CITIES}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  placeholder="시/도"
                  error={errors.churchCity?.message}
                />
              )}
            />
            <Controller
              name="churchDistrict"
              control={control}
              rules={{ required: '구/시를 선택해주세요' }}
              render={({ field }) => (
                <SelectInput
                  label=""
                  options={churchCity ? DISTRICTS[churchCity] ?? [] : []}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  placeholder="구/시"
                  disabled={!churchCity}
                  error={errors.churchDistrict?.message}
                />
              )}
            />
          </div>
        </div>
      </QuestionBlock>

      {/* 나의 신앙 단계 */}
      <QuestionBlock qRef={refs[4]}>
        <Controller
          name="faithLevel"
          control={control}
          rules={{ required: '신앙 단계를 선택해주세요' }}
          render={({ field }) => (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-500">나의 신앙 단계</span>
              {FAITH_LEVEL_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => { field.onChange(opt); next(4)(); }}
                  className={[
                    'flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition',
                    field.value === opt
                      ? 'border-cana bg-cana/5'
                      : 'border-gray-200 bg-white active:bg-gray-50',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 transition',
                      field.value === opt ? 'border-cana bg-cana' : 'border-gray-300',
                    ].join(' ')}
                  >
                    {field.value === opt && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </span>
                  <span className={`text-base ${field.value === opt ? 'font-medium text-cana' : 'text-gray-600'}`}>
                    {opt}
                  </span>
                </button>
              ))}
              {errors.faithLevel && (
                <p className="text-xs text-red-500">{errors.faithLevel.message}</p>
              )}
            </div>
          )}
        />
      </QuestionBlock>

      {/* 신앙 스타일 */}
      <QuestionBlock qRef={refs[5]}>
        <Controller
          name="faithStyle"
          control={control}
          rules={{ required: '선택해주세요' }}
          render={({ field }) => (
            <RadioGroup<FaithStyleOption>
              label="신앙 스타일"
              options={FAITH_STYLE_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              onNext={next(5)}
              error={errors.faithStyle?.message}
              cols={2}
            />
          )}
        />
      </QuestionBlock>

      {/* 주일 예배 */}
      <QuestionBlock qRef={refs[6]}>
        <Controller
          name="sundayAttendance"
          control={control}
          rules={{ required: '선택해주세요' }}
          render={({ field }) => (
            <RadioGroup<SundayAttendanceOption>
              label="주일 예배"
              options={SUNDAY_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              onNext={next(6)}
              error={errors.sundayAttendance?.message}
              cols={3}
            />
          )}
        />
      </QuestionBlock>

      {/* 섬기는 사역 */}
      <QuestionBlock qRef={refs[7]}>
        <Controller
          name="ministry"
          control={control}
          rules={{ required: '선택해주세요' }}
          render={({ field }) => (
            <RadioGroup<MinistryOption>
              label="섬기는 사역"
              options={MINISTRY_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              error={errors.ministry?.message}
              cols={3}
            />
          )}
        />
      </QuestionBlock>
    </div>
  );
}
