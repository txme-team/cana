'use client';

import React, { useState, useEffect } from 'react';
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
}

interface SectionDef {
  tag: string;
  title: string;
  required: QuestionDef;
  optional: QuestionDef[];
}

// ─── 섹션 데이터 ───────────────────────────────────────────────────────────────

const SECTIONS: SectionDef[] = [
  {
    tag: 'A', title: '신앙 (Faith)',
    required: { field: 'prayerRequest', label: '요즘 나의 기도제목은요', placeholder: '요즘 가장 마음을 쏟고 있는 기도 제목을 나눠주세요.' },
    optional: [
      { field: 'bibleVerse',        label: '가장 좋아하는 성경 구절과 그 이유는요', placeholder: '자유롭게 작성해주세요' },
      { field: 'ministryNote',      label: '교회에서 섬기고 있는 사역은요',          placeholder: '자유롭게 작성해주세요' },
      { field: 'faithGrowthMoment', label: '나의 신앙이 성장했던 순간은요',          placeholder: '자유롭게 작성해주세요' },
      { field: 'answeredPrayer',    label: '가장 크게 응답받았던 기도는요',           placeholder: '자유롭게 작성해주세요' },
      { field: 'communityRole',     label: '공동체 안에서 내 모습은요',              placeholder: '자유롭게 작성해주세요' },
    ],
  },
  {
    tag: 'B', title: '커리어 (Career)',
    required: { field: 'jobDescription', label: '이런 일을 하고 있어요', placeholder: '직무나 하는 일을 비전공자도 알기 쉽게 설명해 주세요.' },
    optional: [
      { field: 'careerGoal',       label: '설레는 커리어 목표가 있어요',          placeholder: '자유롭게 작성해주세요' },
      { field: 'coworkerOpinion',  label: "직장 동료들이 평가하는 '나'는요",       placeholder: '자유롭게 작성해주세요' },
      { field: 'careerMotivation', label: '지금의 직업을 선택한 계기는요',         placeholder: '자유롭게 작성해주세요' },
    ],
  },
  {
    tag: 'C', title: '연애관 & 라이프스타일',
    required: { field: 'relationshipPromise', label: "'이것' 하나만큼은 꼭 약속해 줄 수 있어요", placeholder: '연인이 된다면 이것만큼은 꼭 지키고 싶어요.' },
    optional: [
      { field: 'partnerStyle',      label: '이런 남자/여자친구이고 싶어요',          placeholder: '자유롭게 작성해주세요' },
      { field: 'feelingLoved',      label: '내가 사랑받고 있다고 느끼는 순간은요',   placeholder: '자유롭게 작성해주세요' },
      { field: 'humorStyle',        label: '나의 유머 코드나 웃음 포인트는요',       placeholder: '자유롭게 작성해주세요' },
      { field: 'weekendStyle',      label: '주말엔 이렇게 시간 보내는 걸 좋아해요', placeholder: '자유롭게 작성해주세요' },
      { field: 'spendingHabit',     label: '내 소비습관은요',                       placeholder: '자유롭게 작성해주세요' },
      { field: 'conflictApproach',  label: '갈등이 생기면 이렇게 해결해요',         placeholder: '자유롭게 작성해주세요' },
    ],
  },
];

// ─── Textarea 공통 컴포넌트 ────────────────────────────────────────────────────

function QuestionTextarea({
  q,
  required,
  onRemove,
}: {
  q: QuestionDef;
  required?: boolean;
  onRemove?: () => void;
}) {
  const { control, formState: { errors } } = useFormContext<ApplyFormData>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const error = (errors as any)[q.field] as { message?: string } | undefined;

  return (
    <Controller
      name={q.field}
      control={control}
      rules={
        required
          ? {
              required: '답변을 입력해주세요',
              validate: (v) => (v as string).trim().length < 30 ? '최소 30자 이상 입력해주세요' : true,
              maxLength: { value: 300, message: '최대 300자까지 입력 가능합니다' },
            }
          : {
              validate: (v) => {
                const s = (v as string) ?? '';
                if (!s.trim()) return true;
                if (s.trim().length < 30) return '최소 30자 이상 입력해주세요';
                return true;
              },
              maxLength: { value: 300, message: '최대 300자까지 입력 가능합니다' },
            }
      }
      render={({ field: f }) => {
        const val = (f.value as string) ?? '';
        return (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-start justify-between gap-2">
              <label className="text-sm font-medium leading-snug text-cana-ink">{q.label}</label>
              <div className="flex shrink-0 items-center gap-1.5">
                {required ? (
                  <span className="rounded-full bg-cana/10 px-2 py-0.5 text-[11px] font-semibold text-cana">필수</span>
                ) : (
                  onRemove && (
                    <button
                      type="button"
                      onClick={onRemove}
                      className="flex h-5 w-5 items-center justify-center rounded-full text-cana-ink3/40 transition hover:bg-cana-rule hover:text-cana-ink3"
                      aria-label="질문 삭제"
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )
                )}
              </div>
            </div>
            <textarea
              value={val}
              onChange={f.onChange}
              onBlur={f.onBlur}
              ref={f.ref}
              placeholder={q.placeholder}
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
              ) : <span />}
              <span className={`ml-auto text-xs tabular-nums ${val.length > 0 && val.length < 30 ? 'text-amber-500' : 'text-cana-ink3/40'}`}>
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
  section,
  activeOptionals,
  onAdd,
  onRemove,
}: {
  section: SectionDef;
  activeOptionals: Set<EssayField>;
  onAdd: (field: EssayField) => void;
  onRemove: (field: EssayField) => void;
}) {
  const active   = section.optional.filter((q) => activeOptionals.has(q.field));
  const inactive = section.optional.filter((q) => !activeOptionals.has(q.field));

  return (
    <div className="flex flex-col gap-5">
      {/* 섹션 헤더 */}
      <div className="flex items-center gap-2">
        <span className="rounded-xl bg-cana px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-white">
          {section.tag}
        </span>
        <span className="text-base font-bold text-cana-ink">{section.title}</span>
      </div>

      {/* 필수 질문 */}
      <QuestionTextarea q={section.required} required />

      {/* 활성화된 선택 질문 */}
      {active.map((q) => (
        <QuestionTextarea key={q.field} q={q} onRemove={() => onRemove(q.field)} />
      ))}

      {/* 비활성 선택 질문 — 추가 칩 */}
      {inactive.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[11px] text-cana-ink3/50">질문 추가하기</p>
          <div className="flex flex-wrap gap-1.5">
            {inactive.map((q) => (
              <button
                key={q.field}
                type="button"
                onClick={() => onAdd(q.field)}
                className="flex items-center gap-1 rounded-full border border-cana/25 bg-white px-3 py-1.5 text-xs text-cana-ink3 transition hover:border-cana/50 hover:text-cana"
              >
                <svg className="h-3 w-3 shrink-0 text-cana" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                {q.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 메인 컴포넌트 ─────────────────────────────────────────────────────────────

export default function StepQnA() {
  const { getValues, setValue } = useFormContext<ApplyFormData>();
  const [activeOptionals, setActiveOptionals] = useState<Set<EssayField>>(new Set());

  // 수정 시 이미 입력된 선택 질문 자동 활성화
  useEffect(() => {
    const vals = getValues();
    const filled = new Set<EssayField>();
    for (const section of SECTIONS) {
      for (const q of section.optional) {
        if ((vals[q.field] as string)?.trim()) filled.add(q.field);
      }
    }
    setActiveOptionals(filled);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addQuestion = (field: EssayField) =>
    setActiveOptionals((prev) => new Set(prev).add(field));

  const removeQuestion = (field: EssayField) => {
    setActiveOptionals((prev) => { const n = new Set(prev); n.delete(field); return n; });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (setValue as any)(field, '');
  };

  return (
    <div className="flex flex-col gap-8">
      {/* 안내 */}
      <div className="flex flex-col gap-1">
        <p className="text-sm text-cana-ink3">
          <span className="font-medium text-cana">필수 3가지</span>에 답하고, 원하는 질문을 추가해 나를 더 잘 표현해보세요.
        </p>
        <p className="mt-0.5 text-xs text-cana-ink3/60">각 답변은 최소 30자, 최대 300자로 작성해주세요.</p>
      </div>

      {SECTIONS.map((section, i) => (
        <React.Fragment key={section.tag}>
          {i > 0 && <div className="border-t border-cana-rule" />}
          <SectionBlock
            section={section}
            activeOptionals={activeOptionals}
            onAdd={addQuestion}
            onRemove={removeQuestion}
          />
        </React.Fragment>
      ))}
    </div>
  );
}
