'use client';

import { forwardRef, useState } from 'react';

// ─── 자동 스크롤 헬퍼 ────────────────────────────────────────────────────────

export function scrollToRef(ref: React.RefObject<HTMLElement>) {
  setTimeout(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 120);
}

// ─── TextInput ────────────────────────────────────────────────────────────────

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  suffix?: string;
  description?: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, suffix, description, className, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-500">{label}</label>
      {description && <p className="text-sm text-gray-400">{description}</p>}
      <div className="relative flex items-center">
        <input
          ref={ref}
          className={[
            'w-full rounded-xl border px-4 py-3 text-base outline-none transition',
            'border-gray-200 bg-white placeholder:text-gray-300',
            'focus:border-cana focus:ring-2 focus:ring-cana/15',
            error ? 'border-red-400' : '',
            suffix ? 'pr-12' : '',
            className ?? '',
          ].join(' ')}
          {...props}
        />
        {suffix && (
          <span className="absolute right-4 text-xs text-gray-400">{suffix}</span>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
);
TextInput.displayName = 'TextInput';

// ─── SelectInput ──────────────────────────────────────────────────────────────

interface SelectInputProps {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

export function SelectInput({
  label, options, value, onChange, placeholder = '선택', error, disabled,
}: SelectInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-500">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={[
            'w-full appearance-none rounded-xl border px-4 py-3 pr-10 text-base outline-none transition',
            'border-gray-200 bg-white',
            value ? 'text-gray-700' : 'text-gray-300',
            'focus:border-cana focus:ring-2 focus:ring-cana/15',
            error ? 'border-red-400' : '',
            disabled ? 'cursor-not-allowed bg-gray-50 text-gray-300' : '',
          ].join(' ')}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── RadioGroup ───────────────────────────────────────────────────────────────

interface RadioGroupProps<T extends string> {
  label: string;
  options: T[];
  value: T | undefined;
  onChange: (v: T) => void;
  onNext?: () => void;
  error?: string;
  cols?: 2 | 3 | 4;
}

export function RadioGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  onNext,
  error,
  cols = 2,
}: RadioGroupProps<T>) {
  const gridCols =
    { 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-2' }[cols];

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <div className={`grid ${gridCols} gap-2`}>
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => {
              onChange(opt);
              onNext?.();
            }}
            className={[
              'rounded-xl border px-3 py-3 text-base transition',
              value === opt
                ? 'border-cana bg-cana font-medium text-white'
                : 'border-gray-200 bg-white text-gray-600 active:bg-gray-50',
            ].join(' ')}
          >
            {opt}
          </button>
        ))}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── ChipGroup ────────────────────────────────────────────────────────────────

interface ChipGroupProps {
  label: string;
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  max?: number;
  error?: string;
}

export function ChipGroup({ label, options, value, onChange, max, error }: ChipGroupProps) {
  const [customInput, setCustomInput] = useState('');

  const toggle = (opt: string) => {
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt));
    } else if (!max || value.length < max) {
      onChange([...value, opt]);
    }
  };

  const addCustom = () => {
    const trimmed = customInput.trim();
    if (!trimmed || value.includes(trimmed)) return;
    if (max && value.length >= max) return;
    onChange([...value, trimmed]);
    setCustomInput('');
  };

  const isMaxReached = max ? value.length >= max : false;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        {max && (
          <span className={`text-xs ${isMaxReached ? 'font-medium text-cana' : 'text-gray-400'}`}>
            {value.length}/{max}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            disabled={isMaxReached && !value.includes(opt)}
            className={[
              'rounded-full border px-3 py-1.5 text-sm transition',
              value.includes(opt)
                ? 'border-cana bg-cana text-white'
                : isMaxReached
                ? 'cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300'
                : 'border-gray-200 bg-white text-gray-600 active:bg-gray-50',
            ].join(' ')}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* 직접 입력 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addCustom();
            }
          }}
          placeholder="직접 입력"
          maxLength={12}
          disabled={isMaxReached}
          className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-cana focus:ring-2 focus:ring-cana/15 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:placeholder:text-gray-200"
        />
        <button
          type="button"
          onClick={addCustom}
          disabled={isMaxReached || !customInput.trim()}
          className="rounded-xl border border-cana px-4 py-2 text-sm text-cana transition active:bg-cana/5 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-300"
        >
          추가
        </button>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────

export function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 pb-1">
      <span className="text-base font-semibold text-cana">{children}</span>
      <div className="h-px flex-1 bg-cana/20" />
    </div>
  );
}

// ─── QuestionBlock ────────────────────────────────────────────────────────────

export function QuestionBlock({
  children,
  qRef,
}: {
  children: React.ReactNode;
  qRef?: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div ref={qRef} data-question className="scroll-mt-6">
      {children}
    </div>
  );
}
