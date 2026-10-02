'use client';

import { useState } from 'react';
import { genderWord, isValidVoteNo, VOTE_NO_MAX, VOTE_NO_MIN, type VoteGender } from '@/lib/first-impression';

interface Submitted {
  gender: VoteGender;
  voterNo: number;
  targetNo: number | null;
}

export default function VoteForm({ eventId, eventTitle }: { eventId: string; eventTitle: string }) {
  const [gender, setGender] = useState<VoteGender | null>(null);
  const [voterNo, setVoterNo] = useState('');
  const [targetNo, setTargetNo] = useState('');
  const [abstain, setAbstain] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState<Submitted | null>(null);

  const oppositeWord = gender ? genderWord(gender === 'male' ? 'female' : 'male') : '상대';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!gender) return setError('성별을 선택해주세요.');
    const myNo = Number(voterNo);
    if (!isValidVoteNo(myNo)) return setError(`내 번호를 ${VOTE_NO_MIN}~${VOTE_NO_MAX} 사이 숫자로 입력해주세요.`);
    const partnerNo = abstain ? null : Number(targetNo);
    if (!abstain && !isValidVoteNo(partnerNo)) {
      return setError('상대 번호를 입력하거나 기권을 선택해주세요.');
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/rotation/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, gender, voterNo: myNo, targetNo: partnerNo }),
      });
      const json = await res.json().catch(() => ({})) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? '투표에 실패했어요.');
      setSubmitted({ gender, voterNo: myNo, targetNo: partnerNo });
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했어요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-cana-cream px-4 pb-16 pt-10">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-6 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/txme-assets/logos/logo_black.svg" alt="CANA" className="mx-auto h-5" />
          <h1 className="mt-3 text-xl font-semibold text-cana-ink">첫인상 투표</h1>
          <p className="mt-1.5 text-sm text-cana-ink3">{eventTitle}</p>
        </div>

        {submitted ? (
          <div className="rounded-2xl border border-cana-rule bg-white p-6 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cana/10">
              <svg className="h-6 w-6 text-cana" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <p className="text-base font-semibold text-cana-ink">투표가 완료됐어요</p>
            <p className="mt-3 text-sm leading-relaxed text-cana-ink3">
              {genderWord(submitted.gender)} {submitted.voterNo}호 →{' '}
              {submitted.targetNo == null
                ? '기권'
                : `${genderWord(submitted.gender === 'male' ? 'female' : 'male')} ${submitted.targetNo}호`}
            </p>
            <p className="mt-1 text-xs text-cana-ink3/70">
              잘못 입력했다면 같은 번호로 다시 제출하세요. 마지막 투표만 반영돼요.
            </p>
            <button
              type="button"
              onClick={() => setSubmitted(null)}
              className="mt-5 w-full rounded-xl border border-cana-rule py-3 text-sm font-medium text-cana-ink3 transition hover:bg-cana-warm"
            >
              다시 투표하기
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-cana-rule bg-white p-6 shadow-sm">
            {/* 성별 */}
            <div>
              <label className="mb-2 block text-sm font-medium text-cana-ink">성별</label>
              <div className="grid grid-cols-2 gap-2">
                {(['male', 'female'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={[
                      'rounded-xl border py-3 text-sm font-medium transition',
                      gender === g
                        ? 'border-cana bg-cana text-white'
                        : 'border-cana-rule bg-white text-cana-ink3',
                    ].join(' ')}
                  >
                    {g === 'male' ? '남자' : '여자'}
                  </button>
                ))}
              </div>
            </div>

            {/* 내 번호 */}
            <div>
              <label htmlFor="voterNo" className="mb-2 block text-sm font-medium text-cana-ink">내 번호</label>
              <div className="flex items-center gap-2">
                <input
                  id="voterNo"
                  type="number"
                  inputMode="numeric"
                  min={VOTE_NO_MIN}
                  max={VOTE_NO_MAX}
                  value={voterNo}
                  onChange={(e) => setVoterNo(e.target.value)}
                  placeholder="예: 3"
                  className="w-full rounded-xl border border-cana-rule px-4 py-3 text-base text-cana-ink outline-none focus:border-cana"
                />
                <span className="shrink-0 text-sm text-cana-ink3">호</span>
              </div>
            </div>

            {/* 상대 번호 */}
            <div>
              <label htmlFor="targetNo" className="mb-2 block text-sm font-medium text-cana-ink">
                마음에 드는 {oppositeWord} 번호
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="targetNo"
                  type="number"
                  inputMode="numeric"
                  min={VOTE_NO_MIN}
                  max={VOTE_NO_MAX}
                  value={abstain ? '' : targetNo}
                  disabled={abstain}
                  onChange={(e) => setTargetNo(e.target.value)}
                  placeholder={abstain ? '기권' : '예: 5'}
                  className="w-full rounded-xl border border-cana-rule px-4 py-3 text-base text-cana-ink outline-none focus:border-cana disabled:bg-cana-warm disabled:text-cana-ink3"
                />
                <span className="shrink-0 text-sm text-cana-ink3">호</span>
              </div>
              <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-cana-ink3">
                <input
                  type="checkbox"
                  checked={abstain}
                  onChange={(e) => setAbstain(e.target.checked)}
                  className="h-4 w-4 accent-[#e05c52]"
                />
                투표 기권 (마음에 드는 분이 없어요)
              </label>
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-cana py-3.5 text-base font-semibold text-white transition hover:bg-cana-dark disabled:opacity-50"
            >
              {submitting ? '제출 중...' : '투표하기'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
