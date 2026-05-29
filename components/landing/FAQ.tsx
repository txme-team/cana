'use client';

import { useState } from 'react';
import Link from 'next/link';
import BackButton from './BackButton';

const FAQS = [
  {
    q: '비신자도 신청할 수 있나요?',
    a: 'cana는 크리스천 전용 데이팅 서비스예요. 현재 교회에 출석 중인 분만 신청 가능합니다.',
  },
  {
    q: '참가 비용이 있나요?',
    a: '회차마다 참가비가 책정됩니다. 신청 완료 후 안내 문자로 금액과 납부 방법을 알려드려요.',
  },
  {
    q: '사진은 어떻게 활용되나요?',
    a: '프로필 사진은 운영팀의 매칭 검토 목적으로만 사용되며, 참가자에게는 공개되지 않아요. 행사 종료 후 즉시 삭제됩니다.',
  },
  {
    q: '로테이션은 어떻게 진행되나요?',
    a: '한 분당 10~15분 대화 후 신호에 맞춰 자리를 이동해요. 한 번의 행사에서 보통 5~8분을 만나게 됩니다.',
  },
  {
    q: '연락처는 어떻게 교환하나요?',
    a: '행사 후 마음에 드는 분의 번호를 운영팀에 알려주시면, 상대방도 동의한 경우에만 연락처를 전달드려요.',
  },
  {
    q: '신청 후 취소가 가능한가요?',
    a: '행사 3일 전까지 취소 시 전액 환불됩니다. 이후 취소는 환불이 어려우니 신중하게 신청해주세요.',
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-cana-rule last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="text-base font-medium text-cana-ink">{q}</span>
        <span
          className={[
            'flex h-6 w-6 shrink-0 items-center justify-center rounded-xl border border-cana-rule text-cana transition-transform duration-200',
            open ? 'rotate-45 border-cana bg-cana text-white' : '',
          ].join(' ')}
        >
          <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </span>
      </button>
      <div
        className={[
          'overflow-hidden transition-all duration-200',
          open ? 'max-h-40 pb-5' : 'max-h-0',
        ].join(' ')}
      >
        <p className="text-base leading-relaxed text-cana-ink3">{a}</p>
      </div>
    </div>
  );
}

interface Props {
  preview?: boolean;
  showBack?: boolean;
}

export default function FAQ({ preview = false, showBack = false }: Props) {
  const displayedFaqs = preview ? FAQS.slice(0, 3) : FAQS;

  return (
    <section className="bg-cana-cream px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-2xl">

        {showBack && <BackButton />}

        <div className="mb-12 text-center">
          <span className="mb-3 inline-block rounded-xl border border-cana-rule bg-white px-3 py-1 text-[11px] font-semibold tracking-widest text-cana">
            FAQ
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-cana-ink sm:text-3xl">
            자주 묻는 질문
          </h2>
        </div>

        <div className="rounded-2xl border border-cana-rule bg-white px-6 py-2">
          {displayedFaqs.map((item) => (
            <FAQItem key={item.q} {...item} />
          ))}
        </div>

        {/* 더보기 — preview 모드일 때 항상 표시 */}
        {preview && (
          <div className="mt-6 flex justify-center">
            <Link href="/faq" className="text-sm font-medium text-cana transition hover:opacity-70">
              질문 더 보기 →
            </Link>
          </div>
        )}

      </div>
    </section>
  );
}
