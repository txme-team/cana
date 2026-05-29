'use client';

import { useMemo } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import type {
  ApplyFormData,
  ContactFrequencyOption,
  DateFrequencyOption,
  OppositeFriendOption,
  MarriageViewOption,
  ConflictStyleOption,
  RestDayOption,
  PetOption,
  DateStyleOption,
} from '@/lib/types';
import { RadioGroup, SectionHeader, QuestionBlock, scrollToRef } from './ui';

const CONTACT_OPTIONS: ContactFrequencyOption[] = ['자주', '적당히', '필요할 때만'];
const DATE_FREQ_OPTIONS: DateFrequencyOption[] = ['주 2회+', '주 1회', '격주', '월 1~2회'];
const OPPOSITE_FRIEND_OPTIONS: OppositeFriendOption[] = [
  '친구로 지낼 수 없다',
  '가끔 연락은 괜찮다',
  '자주 만나도 괜찮다',
  '본인이 알아서 조율',
];
const MARRIAGE_VIEW_OPTIONS: MarriageViewOption[] = [
  '결혼 전제로 만남',
  '결혼보다 연애',
  '비혼주의',
  '딩크족',
];
const CONFLICT_OPTIONS: ConflictStyleOption[] = ['바로 대화', '감정 식힌 후', '상황에 따라'];
const REST_DAY_OPTIONS: RestDayOption[] = ['집에서 충전', '밖에서 활동', '상관없음'];
const PET_OPTIONS: PetOption[] = ['키우고 있음', '좋아하지만 키우진 않음', '좋아하지 않음'];
const DATE_STYLE_OPTIONS: DateStyleOption[] = [
  '활동(액티비티·여행·운동)',
  '일상(카페·산책·맛집)',
  '문화(전시·공연·영화)',
  '집콕(집에서 영화·게임)',
];

export default function Step2() {
  const { control, formState: { errors } } = useFormContext<ApplyFormData>();

  const refs = useMemo(
    () => Array.from({ length: 8 }, () => ({ current: null as HTMLDivElement | null })),
    []
  );
  const next = (i: number) => () => scrollToRef(refs[i + 1]);

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader>사전 정보</SectionHeader>

      <QuestionBlock qRef={refs[0]}>
        <Controller
          name="contactFrequency"
          control={control}
          rules={{ required: '선택해주세요' }}
          render={({ field }) => (
            <RadioGroup<ContactFrequencyOption>
              label="연락 선호도"
              options={CONTACT_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              onNext={next(0)}
              error={errors.contactFrequency?.message}
              cols={3}
            />
          )}
        />
      </QuestionBlock>

      <QuestionBlock qRef={refs[1]}>
        <Controller
          name="dateFrequency"
          control={control}
          rules={{ required: '선택해주세요' }}
          render={({ field }) => (
            <RadioGroup<DateFrequencyOption>
              label="데이트 빈도"
              options={DATE_FREQ_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              onNext={next(1)}
              error={errors.dateFrequency?.message}
              cols={4}
            />
          )}
        />
      </QuestionBlock>

      <QuestionBlock qRef={refs[2]}>
        <Controller
          name="oppositeFriend"
          control={control}
          rules={{ required: '선택해주세요' }}
          render={({ field }) => (
            <RadioGroup<OppositeFriendOption>
              label="이성 친구"
              options={OPPOSITE_FRIEND_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              onNext={next(2)}
              error={errors.oppositeFriend?.message}
              cols={2}
            />
          )}
        />
      </QuestionBlock>

      <QuestionBlock qRef={refs[3]}>
        <Controller
          name="marriageView"
          control={control}
          rules={{ required: '선택해주세요' }}
          render={({ field }) => (
            <RadioGroup<MarriageViewOption>
              label="결혼관"
              options={MARRIAGE_VIEW_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              onNext={next(3)}
              error={errors.marriageView?.message}
              cols={2}
            />
          )}
        />
      </QuestionBlock>

      <QuestionBlock qRef={refs[4]}>
        <Controller
          name="conflictStyle"
          control={control}
          rules={{ required: '선택해주세요' }}
          render={({ field }) => (
            <RadioGroup<ConflictStyleOption>
              label="갈등 해결 방식"
              options={CONFLICT_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              onNext={next(4)}
              error={errors.conflictStyle?.message}
              cols={3}
            />
          )}
        />
      </QuestionBlock>

      <QuestionBlock qRef={refs[5]}>
        <Controller
          name="restDay"
          control={control}
          rules={{ required: '선택해주세요' }}
          render={({ field }) => (
            <RadioGroup<RestDayOption>
              label="쉬는 날"
              options={REST_DAY_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              onNext={next(5)}
              error={errors.restDay?.message}
              cols={3}
            />
          )}
        />
      </QuestionBlock>

      <QuestionBlock qRef={refs[6]}>
        <Controller
          name="pet"
          control={control}
          rules={{ required: '선택해주세요' }}
          render={({ field }) => (
            <RadioGroup<PetOption>
              label="반려동물"
              options={PET_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              onNext={next(6)}
              error={errors.pet?.message}
              cols={3}
            />
          )}
        />
      </QuestionBlock>

      <QuestionBlock qRef={refs[7]}>
        <Controller
          name="dateStyle"
          control={control}
          rules={{ required: '선택해주세요' }}
          render={({ field }) => (
            <RadioGroup<DateStyleOption>
              label="데이트 스타일"
              options={DATE_STYLE_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              error={errors.dateStyle?.message}
              cols={2}
            />
          )}
        />
      </QuestionBlock>
    </div>
  );
}
