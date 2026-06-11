'use client';

import { useState } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import type { ApplyFormData } from '@/lib/types';
import { SectionHeader, QuestionBlock, TextInput } from './ui';

// ─── 전화번호 포맷 ──────────────────────────────────────────────────────────────

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

// ─── 동의 블록 ─────────────────────────────────────────────────────────────────

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
      checked ? 'border-cana bg-cana/5' : 'border-gray-200 bg-white',
    ].join(' ')}>
      {/* 헤더 */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-medium text-gray-800">{label}</span>
            <span className={`rounded-full px-1.5 py-0.5 text-xs font-medium ${required ? 'bg-cana/10 text-cana' : 'bg-gray-100 text-gray-400'}`}>
              {required ? '필수' : '선택'}
            </span>
          </div>
          {description && <p className="text-sm text-gray-400">{description}</p>}
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex-shrink-0 text-sm text-gray-400 underline underline-offset-2"
        >
          {expanded ? '접기' : '내용 보기'}
        </button>
      </div>

      {/* 펼침 내용 */}
      {expanded && (
        <div className="mt-3 rounded-xl bg-gray-50 px-3 py-3 text-sm leading-relaxed text-gray-500">
          {content}
        </div>
      )}

      {/* 체크박스 */}
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className="mt-3 flex items-center gap-2"
      >
        <span className={[
          'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition',
          checked ? 'border-cana bg-cana' : 'border-gray-300 bg-white',
        ].join(' ')}>
          {checked && (
            <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </span>
        <span className={`text-base ${checked ? 'font-medium text-cana' : 'text-gray-500'}`}>
          동의합니다
        </span>
      </button>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── Step4 메인 ───────────────────────────────────────────────────────────────

export default function Step4() {
  const { control, formState: { errors } } = useFormContext<ApplyFormData>();

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader>연락처 및 동의</SectionHeader>

      {/* 전화번호 */}
      <QuestionBlock>
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
            <TextInput
              label="휴대폰 번호"
              placeholder="010-1234-5678"
              inputMode="tel"
              description="매칭 확정 시 상대방에게만 공개돼요."
              value={field.value ?? ''}
              onChange={(e) => field.onChange(formatPhone(e.target.value))}
              error={errors.phone?.message}
            />
          )}
        />
      </QuestionBlock>

      <div className="rounded-xl bg-gray-50 px-4 py-3">
        <p className="text-sm text-gray-500">
          🔒 연락처는 안전하게 저장되며, 매칭 완료 전까지 누구에게도 공개되지 않아요.
        </p>
      </div>

      {/* 필수 동의 항목 */}
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-gray-500">필수 동의</p>

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
                  <p className="font-medium text-gray-600">수집 항목</p>
                  <p>이름, 생년, 성별, 키, 직업, 거주지, 근무지, 연락처, 신앙 정보, 프로필 사진, 직장/교인 인증 서류</p>
                  <p className="font-medium text-gray-600">수집 목적</p>
                  <p>매칭 서비스 운영 및 참여자 심사, 행사 진행</p>
                  <p className="font-medium text-gray-600">보유 기간</p>
                  <p>서비스 종료 후 즉시 파기 (최대 1년)</p>
                  <p className="font-medium text-gray-600">제3자 제공</p>
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

        {/* 3. 자기소개 파일 전달 동의 (필수) */}
        <Controller
          name="agreeProfileShare"
          control={control}
          rules={{ validate: (v) => v === true || '필수 동의 항목이에요' }}
          render={({ field }) => (
            <ConsentBlock
              required
              label="자기소개 파일 전달 동의"
              content={
                <div className="flex flex-col gap-1.5">
                  <p>소개팅 전날, 참여자들에게 상대방의 자기소개 파일이 전달될 예정이에요.</p>
                  <p>• 전달 항목: MBTI, 취미, 성격, 신앙 스타일 등 비식별 정보</p>
                  <p>• 미전달 항목: 연락처, 직장명, 거주지 등 개인정보</p>
                </div>
              }
              checked={field.value ?? false}
              onChange={field.onChange}
              error={errors.agreeProfileShare?.message}
            />
          )}
        />
      </div>

      {/* 선택 동의 항목 */}
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-gray-500">선택 동의</p>

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
