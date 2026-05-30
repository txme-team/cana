'use client';

import { useState } from 'react';
import Link from 'next/link';

type Category = '신청·참여' | '프로필 카드' | '당일 진행' | '취소·환불';

interface FaqItem {
  q: string;
  a: string;
  category: Category;
}

const FAQS: FaqItem[] = [
  // ── 신청·참여 ──────────────────────────────────────────────────────────────
  {
    category: '신청·참여',
    q: '신청 및 참여 조건이 있나요?',
    a: '아래 조건을 모두 충족하셔야 신청 가능합니다.\n\n• 솔로\n• 한국교회 교단에 등록된 교인\n• 운영진 사전 심사 통과 (신청서 + 사진 검토)\n\n신청 시, 운영진 심사 후 참석 확정 문자를 별도로 발송드립니다.',
  },
  {
    category: '신청·참여',
    q: '사전 심사는 어떻게 진행되나요?',
    a: '신청서와 사진을 바탕으로 자기 관리 상태 등을 운영진이 직접 검토합니다. 심사 결과는 영업일 기준 1~2일 내에 안내드립니다.',
  },
  {
    category: '신청·참여',
    q: '같은 교회나 직장 동료가 올 수도 있나요?',
    a: '교회 인증 및 직장 인증을 통해 사전에 방지합니다. 동일 교회 교인 또는 직장 동료가 같은 회차에 포함될 경우, 행사 전에 개별 연락드려 참석 의사를 확인합니다.',
  },
  {
    category: '신청·참여',
    q: '비신자도 신청할 수 있나요?',
    a: '아닙니다. 카나 로테이션은 한국교회 교단에 등록된 교인만 참석 가능합니다. 비기독교인은 참석이 불가합니다.',
  },
  {
    category: '신청·참여',
    q: '참가 비용이 있나요?',
    a: '네, 참가비가 있습니다. 정확한 금액은 회차별 신청 페이지에서 확인하실 수 있습니다. 참가비는 신청 시 청구되며, 사전 심사에서 탈락 시 전액 환불됩니다.',
  },

  // ── 프로필 카드 ────────────────────────────────────────────────────────────
  {
    category: '프로필 카드',
    q: '프로필 카드가 뭔가요?',
    a: '소개팅 전날, 같은 회차에 참가하는 분들의 정보를 담은 카드를 미리 전달해 드립니다. 상대를 미리 파악하고 오실 수 있어, 당일엔 자기소개 없이 바로 깊은 대화를 나누실 수 있습니다.',
  },
  {
    category: '프로필 카드',
    q: '프로필 카드에 어떤 정보가 담기나요?',
    a: 'MBTI, 취미, 가치관, 신앙 스타일, 이상형 등 신상이 특정되지 않는 정보가 담깁니다. 이름, 연락처, 직장명, 교회명은 포함되지 않습니다.',
  },
  {
    category: '프로필 카드',
    q: '프로필 카드는 언제 받을 수 있나요?',
    a: '소개팅 전날에 문자를 통해 전달해 드립니다.',
  },

  // ── 당일 진행 ──────────────────────────────────────────────────────────────
  {
    category: '당일 진행',
    q: '당일 어떻게 진행되나요?',
    a: '입장 후 본인 확인을 거쳐 번호와 봉투를 받으십니다. 진행 방식 안내 후, 1:1로 약 10분씩 대화를 나눕니다. 마음에 드시는 분께는 쪽지에 연락처를 적어 봉투에 넣으시면 됩니다. 모든 대화가 끝난 후 귀가하셔서 봉투 속 쪽지를 확인하시면 됩니다.',
  },
  {
    category: '당일 진행',
    q: '몇 명의 이성과 대화하게 되나요?',
    a: '회차별로 다르며, 6~10명의 이성과 1:1로 대화를 나눌 수 있습니다.',
  },
  {
    category: '당일 진행',
    q: '대화 시간은 얼마나 되나요?',
    a: '1:1 대화는 약 10분이며, 전체 소개팅 진행 시간은 약 100분입니다.',
  },
  {
    category: '당일 진행',
    q: '몇 시에 도착해야 하나요?',
    a: '시작 10분 전부터 입장 가능합니다. 늦지 않게 오시는 것을 권장드립니다.',
  },
  {
    category: '당일 진행',
    q: '신분증을 꼭 가져가야 하나요?',
    a: '반드시 지참하셔야 합니다. 신분증 미지참으로 본인 확인이 불가할 경우 입장이 제한되며, 이 경우 환불되지 않습니다.',
  },
  {
    category: '당일 진행',
    q: '장소는 어떻게 알 수 있나요?',
    a: '사전 심사와 결제를 모두 완료하신 분들께만 별도로 안내드립니다. 참가자 프라이버시 보호를 위해 사전에 공개되지 않습니다.',
  },
  {
    category: '당일 진행',
    q: '대화가 어색할 것 같아서 걱정됩니다.',
    a: '걱정하지 않으셔도 됩니다. 추천 질문 리스트를 제공해 드리며, 소개팅 전날 프로필 카드를 미리 받으시기 때문에 대화 소재가 충분히 준비됩니다.',
  },
  {
    category: '당일 진행',
    q: '매칭 결과를 운영진이 알려주나요?',
    a: '별도 안내는 없습니다. 귀가 후 봉투 속 쪽지를 직접 확인하시고, 연락처가 있다면 자유롭게 연락해보시면 됩니다.',
  },
  {
    category: '당일 진행',
    q: '연락처는 어떻게 교환하나요?',
    a: '대화 중 마음에 드시는 분이 계시면, 쪽지에 연락처를 적어 본인 봉투에 넣으시면 됩니다. 상대방도 동일하게 진행하며, 귀가 후 봉투를 열어 쪽지를 확인하시면 됩니다. 운영진이 개입하거나 매칭 결과를 알리는 방식이 아닌, 쌍방이 직접 확인하는 방식입니다.',
  },

  // ── 취소·환불 ──────────────────────────────────────────────────────────────
  {
    category: '취소·환불',
    q: '환불 규정이 어떻게 되나요?',
    a: '결제 후 규정에 따라 취소 수수료가 발생합니다. 다른 참여자들의 시간을 보장드리기 위한 최소한의 장치이오니 양해 부탁드립니다.\n\n• 결제 후 ~ 행사 7일 전: 전액 환불\n• 행사 6일 전 ~ 행사 2일 전: 50% 환불\n• 행사 1일 전 ~ 당일: 환불 불가',
  },
  {
    category: '취소·환불',
    q: '일정 변경이 가능한가요?',
    a: '행사 7일 전까지 1회 무료로 변경 가능합니다. 취소 시 위약금이 발생할 수 있으므로, 취소보다는 일정 변경을 권장드립니다.',
  },
  {
    category: '취소·환불',
    q: '신청 후 취소가 가능한가요?',
    a: '행사 7일 전까지 취소 시 전액 환불됩니다. 이후 취소는 위약금이 부과되거나 환불이 어려우니 신중하게 신청해주세요.',
  },
  {
    category: '취소·환불',
    q: '인원이 부족하면 어떻게 되나요?',
    a: '행사 전일 15시 기준 최소 인원 미달 시 소개팅이 취소되며, 결제 금액은 전액 환불됩니다.',
  },
  {
    category: '취소·환불',
    q: '남녀 성비는 어떻게 되나요?',
    a: '회차별로 다를 수 있습니다. 가급적 균형 있게 구성하려 하지만, 신청 현황에 따라 성비가 맞지 않을 수 있습니다. 이 경우 대화를 쉬어가는 타임이 있을 수 있으며, 이에 따른 별도 추가 환불은 제공되지 않습니다.',
  },
  {
    category: '취소·환불',
    q: '현장에서 사진이나 영상을 찍어도 되나요?',
    a: '참가자의 사진·영상 촬영은 금지됩니다. 운영진이 마케팅 목적으로 제한적으로 촬영할 수 있으나, 참가자 얼굴은 식별 불가하도록 블라인드 처리됩니다.',
  },
];

const CATEGORIES: Category[] = ['신청·참여', '프로필 카드', '당일 진행', '취소·환불'];

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
        <p className="whitespace-pre-line text-base leading-relaxed text-cana-ink3">{a}</p>
      </div>
    </div>
  );
}

interface Props {
  preview?:    boolean;
  standalone?: boolean;
}

export default function FAQ({ preview = false, standalone = false }: Props) {
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  const displayed = preview
    ? FAQS.slice(0, 3)
    : activeCategory
    ? FAQS.filter((f) => f.category === activeCategory)
    : FAQS;

  // ─── 콘텐츠 ────────────────────────────────────────────────────────────────────
  const content = (
    <>
      {/* 카테고리 필터 — standalone 전용 */}
      {standalone && (
        <div className="mb-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={[
              'rounded-full px-4 py-1.5 text-sm font-medium transition',
              activeCategory === null
                ? 'bg-cana text-white'
                : 'border border-cana bg-white text-cana-ink3 hover:bg-cana/5 hover:text-cana',
            ].join(' ')}
          >
            전체
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={[
                'rounded-full px-4 py-1.5 text-sm font-medium transition',
                activeCategory === cat
                  ? 'bg-cana text-white'
                  : 'border border-cana bg-white text-cana-ink3 hover:bg-cana/5 hover:text-cana',
              ].join(' ')}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-cana-rule bg-white px-6 py-2">
        {displayed.map((item) => (
          <FAQItem key={item.q} q={item.q} a={item.a} />
        ))}
      </div>

      {preview && (
        <div className="mt-6 flex justify-center">
          <Link href="/faq" className="text-sm font-medium text-cana transition hover:opacity-70">
            질문 더 보기 →
          </Link>
        </div>
      )}
    </>
  );

  // ─── standalone: 콘텐츠만 반환 ────────────────────────────────────────────────
  if (standalone) return <>{content}</>;

  // ─── 홈 섹션: 래퍼 + 헤더 포함 ───────────────────────────────────────────────
  return (
    <section className="bg-cana-cream px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-2xl">
        <div className="mb-12 text-center">
          <span className="mb-3 inline-block rounded-xl border border-cana-rule bg-white px-3 py-1 text-[11px] font-semibold tracking-widest text-cana">
            FAQ
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-cana-ink sm:text-3xl">
            자주 묻는 질문
          </h2>
        </div>
        {content}
      </div>
    </section>
  );
}
