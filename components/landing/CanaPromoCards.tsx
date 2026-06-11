'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import Icon from '../landing-new/Icon';

const profiles = [
  {
    age: 28, job: '대학병원 간호사',
    quote: '신앙 안에서 진지하게 함께 성장해 나갈 분을 만나고 싶어요.',
    info: '164cm · 마포구 · INFJ',
    image: '/images/여자1.png',
  },
  {
    age: 31, job: '대기업 연구원',
    quote: '완벽한 사람보다는, 함께 웃고 기도할 수 있는 사람이 좋습니다.',
    info: '178cm · 강남구 · INTJ',
    image: '/images/남자1.png',
  },
  {
    age: 27, job: '공무원 (5급)',
    quote: '소소한 일상도 함께라면 특별해진다고 믿어요.',
    info: '162cm · 서초구 · ENFP',
    image: '/images/여자2.png',
  },
  {
    age: 33, job: '스타트업 CTO',
    quote: '서로의 믿음을 존중하며 함께 나아가는 관계를 원합니다.',
    info: '180cm · 용산구 · ISTP',
    image: '/images/남자2.png',
  },
  {
    age: 30, job: '병원 의사',
    quote: '바쁜 일상 속에도 함께 예배드릴 수 있는 분을 찾고 있어요.',
    info: '175cm · 송파구 · ENTJ',
    image: '/images/남자3.png',
  },
  {
    age: 29, job: '공기업 재직',
    quote: '부족함도 은혜로 채워가며 동행할 수 있는 분이었으면 해요.',
    info: '165cm · 강동구 · ISFP',
    image: '/images/여자4.png',
  },
  {
    age: 32, job: '대기업 개발자',
    quote: '서로를 향한 배려와 믿음으로 든든한 관계를 만들고 싶습니다.',
    info: '177cm · 분당구 · INTP',
    image: '/images/남자4.png',
  },
];

const loopedProfiles = [...profiles, ...profiles];

function PromoCard({ p }: { p: (typeof profiles)[number] }) {
  return (
    <div className="relative aspect-[260/380] h-full shrink-0 overflow-hidden rounded-3xl">
      <Image
        src={p.image}
        alt={p.job}
        fill
        className="scale-105 object-cover object-top blur-sm"
        sizes="260px"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/10" />
      <div className="absolute inset-x-0 bottom-0 px-4 pb-[19px]">
        <h3 className="mb-1.5 text-[15.5px] font-bold leading-[1.2] text-white">
          {p.age}세, {p.job}
        </h3>
        <p className="mb-3 line-clamp-2 text-[10px] leading-[1.6] text-white/75">
          {p.quote}
        </p>
        <div className="flex items-center gap-1">
          <Icon name="profile" size={11} className="text-white/60" />
          <span className="text-[9.5px] text-white/60">{p.info}</span>
        </div>
      </div>
    </div>
  );
}

export default function CanaPromoCards() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="flex h-full gap-3 p-3"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        style={{ width: 'max-content' }}
      >
        {loopedProfiles.map((p, i) => (
          <PromoCard key={i} p={p} />
        ))}
      </motion.div>
    </div>
  );
}
