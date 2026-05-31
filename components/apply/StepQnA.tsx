'use client';

import { useFormContext, Controller } from 'react-hook-form';
import type { ApplyFormData } from '@/lib/types';

// ─── 타입 ──────────────────────────────────────────────────────────────────────

type EssayField =
  | 'prayerRequest' | 'bibleVerse' | 'ministryNote' | 'faithGrowthMoment' | 'answeredPrayer' | 'communityRole'
  | 'jobDescription' | 'careerGoal' | 'coworkerOpinion' | 'careerMotivation'
  | 'relationshipPromise' | 'partnerStyle' | 'feelingLoved' | 'humorStyle' | 'weekendStyle' | 'spendingHabit' | 'conflictApproach';

interface QuestionDef {
  field: EssayField;
  label: string;
  placeholder: string;
  required: boolean;
}

// ─── 질문 목록 ─────────────────────────────────────────────────────────────────

const FAITH_QS: QuestionDef[] = [
  { field: 'prayerRequest',    label: '요즘 나의 기도제목은요',                    placeholder: '요즘 가장 마음을 쏟고 있는 기도 제목을 나눠주세요.',  required: true  },
  { field: 'bibleVerse',       label: '가장 좋아하는 성경 구절과 그 이유는요',      placeholder: '자유롭게 작성해주세요',                                required: false },
  { field: 'ministryNote',     label: '교회에서 섬기고 있는 사역은요',              placeholder: '자유롭게 작성해주세요',                                required: false },
  { field: 'faithGrowthMoment',label: '나의 신앙이 성장했던 순간은요',             placeholder: '자유롭게 작성해주세요',                                required: false },
  { field: 'answeredPrayer',   label: '가장 크게 응답받았던 기도는요',              placeholder: '자유롭게 작성해주세요',                                required: false },
  { field: 'communityRole',    label: '공동체 안에서 내 모습은요',                  placeholder: '자유롭게 작성해주세요',                                required: false },
];

const CAREER_QS: QuestionDef[] = [
  { field: 'jobDescription',   label: '이런 일을 하고 있어요',                     placeholder: '직무나 하는 일을 비전공자도 알기 쉽게 설명해 주세요.', required: true  },
  { field: 'careerGoal',       label: '설레는 커리어 목표가 있어요',               placeholder: '자유롭게 작성해주세요',                                required: false },
  { field: 'coworkerOpinion',  label: "직장 동료들이 평가하는 '나'는요",            placeholder: '자유롭게 작성해주세요',                                required: false },
  { field: 'careerMotivation', label: '지금의 직업을 선택한 계기는요',              placeholder: '자유롭게 작성해주세요',                                required: false },
];

const LIFE_QS: QuestionDef[] = [
  { field: 'relationshipPromise', label: "'이것' 하나만큼은 꼭 약속해 줄 수 있어요", placeholder: '연인이 된다면 이것만큼은 꼭 지키고 싶어요.',          required: true  },
  { field: 'partnerStyle',     label: '이런 남자/여자친구이고 싶어요',              placeholder: '자유롭게 작성해주세요',                                required: false },
  { field: 'feelingLoved',     label: '내가 사랑받고 있다고 느끼는 순간은요',      placeholder: '자유롭게 작성해주세요',                                required: false },
  { field: 'humorStyle',       label: '나의 유머 코드나 웃음 포인트는요',           placeholder: '자유롭게 작성해주세요',                                required: false },
  { field: 'weekendStyle',     label: '주말엔 이렇게 시간 보내는 걸 좋아해요',     placeholder: '자유롭게 작성해주세요',                                required: false },
  { field: 'spendingHabit',    label: '내 소비습관은요',                            placeholder: '자유롭게 작성해주세요',                                required: false },
  { field: 'conflictApproach', label: '갈등이 생기면 이렇게 해결해요',             placeholder: '자유롭게 작성해주세요',                                required: false },
];

// ─── 질문 아이템 ───────────────────────────────────────────────────────────────

function QuestionItem({ field, label, placeholder, required }: QuestionDef) {
  const { control, formState: { errors } } = useFormContext<ApplyFormData>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const error = (errors as any)[field] as { message?: string } | undefined;

  return (
    <Controller
      name={field}
      control={control}
      rules={
        required
          ? {
              required: '답변을 입력해주세요',
              validate: (v) =>
                (v as string).trim().length < 30
                  ? '최소 30자 이상 입력해주세요'
                  : true,
              maxLength: { value: 300, message: '최대 300자까지 입력 가능합니다' },
            }
          : {
              validate: (v) => {
                const str = (v as string) ?? '';
                if (!str || str.trim() === '') return true;
                if (str.trim().length < 30) return '최소 30자 이상 입력해주세요';
                return true;
              },
              maxLength: { value: 300, message: '최대 300자까지 입력 가능합니다' },
            }
      }
      render={({ field: f }) => {
        const val = (f.value as string) ?? '';
        return (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <label className="text-sm font-medium text-cana-ink">{label}</label>
              {required ? (
                <span className="rounded-full bg-cana/10 px-2 py-0.5 text-[11px] font-semibold text-cana">
                  필수
                </span>
              ) : (
                <span className="text-[11px] text-cana-ink3/50">선택</span>
              )}
            </div>
            <textarea
              value={val}
              onChange={f.onChange}
              onBlur={f.onBlur}
              ref={f.ref}
              placeholder={placeholder}
              maxLength={300}
              rows={3}
              className={[
                'w-full resize-none rounded-xl border px-4 py-3 text-base leading-relaxed outline-none transition',
                'placeholder:text-cana-ink3/40',
                'focus:border-cana focus:ring-1 focus:ring-cana',
                error ? 'border-red-400' : 'border-cana-rule',
              ].join(' ')}
            />
            <div className="flex items-center justify-between">
              {error?.message ? (
                <p className="text-xs text-red-500">{error.message}</p>
              ) : (
                <span />
              )}
              <span
                className={`ml-auto text-xs tabular-nums ${
                  val.length > 0 && val.length < 30 ? 'text-amber-500' : 'text-cana-ink3/40'
                }`}
              >
                {val.length} / 300
              </span>
            </div>
          </div>
        );
      }}
    />
  );
}

// ─── 섹션 블록 ─────────────────────────────────────────────────────────────────

function SectionBlock({
  tag,
  title,
  questions,
}: {
  tag: string;
  title: string;
  questions: QuestionDef[];
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <span className="rounded-xl bg-cana px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-white">
          {tag}
        </span>
        <span className="text-base font-bold text-cana-ink">{title}</span>
      </div>
      {questions.map((q) => (
        <QuestionItem key={q.field} {...q} />
      ))}
    </div>
  );
}

// ─── 메인 컴포넌트 ─────────────────────────────────────────────────────────────

export default function StepQnA() {
  return (
    <div className="flex flex-col gap-8">
      {/* 안내 */}
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-cana-ink">자기소개</h2>
        <p className="text-sm text-cana-ink3">
          <span className="font-medium text-cana">필수 3개</span>를 포함해 원하는 질문에 자유롭게 답해주세요.
          답변은 프로필 카드에 포함됩니다.
        </p>
        <p className="mt-0.5 text-xs text-cana-ink3/60">각 답변은 최소 30자, 최대 300자로 작성해주세요.</p>
      </div>

      <SectionBlock tag="A" title="신앙 (Faith)"              questions={FAITH_QS}  />
      <div className="border-t border-cana-rule" />
      <SectionBlock tag="B" title="커리어 (Career)"           questions={CAREER_QS} />
      <div className="border-t border-cana-rule" />
      <SectionBlock tag="C" title="연애관 & 라이프스타일"      questions={LIFE_QS}   />
    </div>
  );
}
