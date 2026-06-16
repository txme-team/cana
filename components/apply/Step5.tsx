'use client';

import { useFormContext } from 'react-hook-form';
import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import type { ApplyFormData } from '@/lib/types';
import { compressImage } from '@/lib/image';
import { SectionHeader } from './ui';

// ─── 파일 업로드 블록 ──────────────────────────────────────────────────────────

interface FileUploadBlockProps {
  label: string;
  description?: string;
  warning?: string;
  accept?: string;
  required?: boolean;
  fieldName: 'workplaceVerification' | 'churchVerification';
}

function FileUploadBlock({
  label,
  description,
  warning,
  accept = 'image/*,.pdf',
  required,
  fieldName,
}: FileUploadBlockProps) {
  const { register, setValue, formState: { errors } } = useFormContext<ApplyFormData>();
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    register(fieldName, {
      validate: required
        ? (v: FileList | null | undefined) =>
            (v instanceof FileList && v.length > 0) || `${label}을 업로드해주세요`
        : undefined,
    });
  }, [register, fieldName, required, label]);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file);
    setFileName(file.name);
    const dt = new DataTransfer();
    dt.items.add(compressed);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue(fieldName, dt.files as any, { shouldValidate: true });
  };

  const error = errors[fieldName];

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1">
        <span className="text-base font-medium text-gray-700">{label}</span>
        {required && <span className="text-xs text-cana">*</span>}
      </div>
      {description && <p className="text-sm text-gray-400">{description}</p>}
      {warning && (
        <div className="flex items-start gap-1.5 rounded-lg bg-amber-50 px-3 py-2">
          <span className="text-xs">⚠️</span>
          <p className="text-sm text-amber-700">{warning}</p>
        </div>
      )}
      <label
        className={[
          'flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed px-4 py-4 transition',
          fileName ? 'border-cana bg-cana/5' : 'border-gray-200 bg-gray-50 active:bg-gray-100',
        ].join(' ')}
      >
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleChange}
        />
        <svg
          className={`h-5 w-5 flex-shrink-0 ${fileName ? 'text-cana' : 'text-gray-400'}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13"
          />
        </svg>
        <span className={`text-base ${fileName ? 'font-medium text-cana' : 'text-gray-400'}`}>
          {fileName || '파일 선택하기 (이미지 또는 PDF)'}
        </span>
      </label>
      {error && <p className="text-xs text-red-500">{error.message?.toString()}</p>}
    </div>
  );
}

// ─── Step4 메인 ───────────────────────────────────────────────────────────────

export default function Step4() {
  const { register, setValue, formState: { errors } } = useFormContext<ApplyFormData>();
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  // 사진 필드를 validate로 등록 (required 대신)
  useEffect(() => {
    register('photo', {
      validate: (v: FileList | null | undefined) =>
        (v instanceof FileList && v.length > 0) || '사진을 업로드해주세요',
    });
  }, [register]);

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      if (!file.type.startsWith('image/')) return;

      const compressed = await compressImage(file);

      const dt = new DataTransfer();
      dt.items.add(compressed);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setValue('photo', dt.files as any, { shouldValidate: true });

      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(compressed);
    },
    [setValue]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader>인증</SectionHeader>

      {/* 프로필 사진 */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1">
            <span className="text-base font-medium text-gray-700">프로필 사진</span>
            <span className="text-xs text-cana">*</span>
          </div>
          <p className="text-sm text-gray-400">사전 심사에만 사용되며 타인에게 공개되지 않아요.</p>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={[
            'relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed',
            'min-h-[220px] cursor-pointer transition',
            dragging ? 'border-cana bg-cana/5' : 'border-gray-200 bg-gray-50',
          ].join(' ')}
        >
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />

          {preview ? (
            <div className="relative h-40 w-40 overflow-hidden rounded-full">
              <Image src={preview} alt="프로필 미리보기" fill className="object-cover" />
            </div>
          ) : (
            <div className="pointer-events-none flex flex-col items-center gap-3 text-gray-400">
              <svg className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              </svg>
              <p className="text-base">사진을 드래그하거나 탭해서 업로드</p>
              <p className="text-sm">JPG, PNG, WEBP · 최대 5MB</p>
            </div>
          )}
        </div>

        {preview && (
          <button
            type="button"
            onClick={() => {
              setPreview(null);
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              setValue('photo', undefined as any, { shouldValidate: false });
            }}
            className="self-center text-xs text-gray-400 underline"
          >
            다시 선택
          </button>
        )}

        {errors.photo && (
          <p className="text-center text-xs text-red-500">{errors.photo.message?.toString()}</p>
        )}
      </div>

      {/* 직장 인증 */}
      <FileUploadBlock
        fieldName="workplaceVerification"
        label="직장 인증"
        description="명함, 사원증, 재직증명서, 4대보험 가입 내역 중 하나를 업로드해주세요."
      />

      {/* 교인 인증 */}
      <FileUploadBlock
        fieldName="churchVerification"
        label="교인 인증"
        description="최근 3개월 내 발행된 교회명이 기재된 주보 또는 교인증명서를 업로드해주세요."
        warning="허위 서류 제출 시 가입 심사에서 반려돼요."
        required
      />
    </div>
  );
}
