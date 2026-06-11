'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

// ─── 전화번호 포맷 헬퍼 ──────────────────────────────────────────────────────

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3)  return digits;
  if (digits.length <= 7)  return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

// ─── Step 0: 환영 + 연락처 ────────────────────────────────────────────────────

function StepWelcome({ onNext }: { onNext: () => void }) {
  const [phone, setPhone]     = useState('');
  const [error, setError]     = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (!/^010-\d{4}-\d{4}$/.test(phone)) {
      setError('올바른 형식으로 입력해주세요 (예: 010-1234-5678)');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      if (!res.ok) {
        const { error: e } = await res.json().catch(() => ({}));
        throw new Error(e ?? '저장에 실패했어요.');
      }
      onNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했어요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* 헤더 */}
      <div className="flex flex-col gap-2">
        <p className="text-2xl font-bold text-cana-ink">
          반갑습니다 👋
        </p>
        <p className="text-sm leading-relaxed text-cana-ink3">
          cana에 오신 걸 환영해요.<br />
          소개팅 매칭 알림을 받기 위해 연락처를 먼저 등록해주세요.
        </p>
      </div>

      {/* 입력 */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-cana-ink">
          휴대폰 번호 <span className="text-cana">*</span>
        </label>
        <input
          type="tel"
          inputMode="tel"
          placeholder="010-1234-5678"
          value={phone}
          onChange={(e) => {
            setError(null);
            setPhone(formatPhone(e.target.value));
          }}
          className={[
            'w-full rounded-xl border px-4 py-3 text-base outline-none transition',
            'focus:border-cana focus:ring-1 focus:ring-cana/20',
            error ? 'border-red-400' : 'border-cana-rule',
          ].join(' ')}
        />
        {error ? (
          <p className="text-xs text-red-500">{error}</p>
        ) : (
          <p className="text-xs text-cana-ink3/60">
            🔒 연락처는 운영자만 확인할 수 있어요.
          </p>
        )}
      </div>

      <button
        onClick={handleNext}
        disabled={loading || phone.length < 13}
        className="w-full rounded-xl bg-cana py-3.5 text-base font-semibold text-white transition active:bg-cana-dark disabled:opacity-50"
      >
        {loading ? '저장 중...' : '다음'}
      </button>
    </div>
  );
}

// ─── Step 1: 프로필 카드 소개 ────────────────────────────────────────────────

function StepProfileIntro() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-8">
      {/* 헤더 */}
      <div className="flex flex-col gap-2">
        <p className="text-2xl font-bold text-cana-ink">
          프로필 카드가 뭔가요?
        </p>
        <p className="text-sm leading-relaxed text-cana-ink3">
          소개팅 전 상대방이 미리 확인하는 나만의 소개 카드예요.<br />
          신앙, 가치관, 라이프스타일을 솔직하게 담아요.
        </p>
      </div>

      {/* 안내 카드 */}
      <div className="rounded-2xl bg-cana/5 px-5 py-5">
        <p className="mb-4 text-base font-semibold text-cana">프로필 카드 작성 전 확인해주세요</p>
        <div className="flex flex-col gap-4">

          {/* 시간 */}
          <div className="flex items-start gap-3">
            <img src="/icons/clock.svg" alt="" className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="text-base font-medium text-cana-ink">약 10분 소요돼요</p>
              <p className="text-sm text-cana-ink3">신앙, 가치관, 라이프스타일에 관한 질문들이 있어요</p>
            </div>
          </div>

          {/* 서류 */}
          <div className="flex items-start gap-3">
            <img src="/icons/docs.svg" alt="" className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="text-base font-medium text-cana-ink">마지막 단계에서 서류 인증이 필요해요</p>
              <p className="mb-3 text-sm text-cana-ink3">아래 서류를 미리 준비해주세요</p>
              <div className="flex flex-col gap-2">
                {[
                  { icon: '/icons/profile.svg',  text: '프로필 사진 (본인이 잘 나온 사진)' },
                  { icon: '/icons/job.svg',       text: '직장 인증서류 — 명함, 사원증, 재직증명서, 4대보험 가입내역 중 하나' },
                  { icon: '/icons/christian.svg', text: '교인 인증서류 — 최근 3개월 내 주보 또는 교인증명서' },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-start gap-2">
                    <img src={icon} alt="" className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <p className="text-sm text-cana-ink3">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => router.push('/rotation/profile/create')}
          className="w-full rounded-xl bg-cana py-3.5 text-base font-semibold text-white transition active:bg-cana-dark"
        >
          프로필 카드 작성하기
        </button>
        <button
          onClick={() => router.push('/rotation')}
          className="w-full py-2 text-sm text-cana-ink3/60 underline underline-offset-2"
        >
          나중에 하기
        </button>
      </div>
    </div>
  );
}

// ─── 페이지 ──────────────────────────────────────────────────────────────────

export default function OnboardPage() {
  const [step, setStep] = useState<0 | 1>(0);

  return (
    <div className="flex min-h-screen flex-col bg-cana-cream">
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-5 py-16">
        {/* 로고 */}
        <div className="mb-10 flex items-center gap-2">
          <Image src="/logos/logo_black.svg" alt="cana" width={48} height={14} />
        </div>

        {/* 스텝 도트 */}
        <div className="mb-8 flex items-center gap-1.5">
          {([0, 1] as const).map((i) => (
            <div
              key={i}
              className={[
                'h-1.5 rounded-full transition-all duration-300',
                i === step
                  ? 'w-6 bg-cana'
                  : i < step
                  ? 'w-3 bg-cana/30'
                  : 'w-3 bg-cana-rule',
              ].join(' ')}
            />
          ))}
        </div>

        {step === 0 && <StepWelcome onNext={() => setStep(1)} />}
        {step === 1 && <StepProfileIntro />}
      </main>
    </div>
  );
}
