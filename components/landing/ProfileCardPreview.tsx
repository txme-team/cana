'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import ProfileCardTemplate from '@/components/print/ProfileCardTemplate';
import { PRINT_CARD_STYLES } from '@/components/print/printStyles';
import type { Profile } from '@/lib/types';

// 297mm × 210mm → CSS px (96dpi 기준, mm 1 = 3.7795275591px)
const CARD_WIDTH = 1122.52;
const CARD_HEIGHT = 793.7;

const SAMPLE_PROFILE: Profile = {
  id: 'sample',
  user_id: 'sample',
  created_at: '',
  updated_at: '',
  nickname: '지아',
  gender: 'female',
  birth_year: 1996,
  height: 164,
  mbti: 'ENFJ',
  education: '대졸',
  workplace: '서울 강남구',
  residence: '서울 강남구',
  living_with: 'family',
  job: '브랜드 마케터',
  drinking: '분위기 따라',
  smoking: '비흡연',
  hobbies: ['독서', '러닝', '카페 탐방', '요리'],
  personality: ['차분함', '계획적', '공감 잘함'],
  contact_preference: '적당히',
  date_frequency: '주 1회',
  opposite_friends: '가끔 연락은 괜찮다',
  marriage_view: '결혼 전제로 만남',
  conflict_resolution: '바로 대화',
  day_off_style: '집에서 충전',
  pet: '좋아하지만 키우진 않음',
  date_style: '일상(카페·산책·맛집)',
  faith_years: 20,
  faith_level: '성장 중',
  worship_frequency: '거의 매주',
  ministry: '찬양팀',
  profile_essays: {
    prayerRequest: '걱정과 근심을 하나님께 맡기게 하소서. 마음이 하나님의 성전이 되어 은혜로 충만하게 하소서. 무릇 지킬 만한 것보다 더욱 마음을 지키게 하소서. 요즘은 걱정과 근심을 제 힘으로 붙잡고 있으려 하기보다 하나님께 맡기는 사람이 되기를 기도하고 있습니다.',
    faithGrowthMoment: '잘 풀리지 않는 시기를 지나면서, 상황이 아니라 하나님을 믿는다는 게 어떤 의미인지 조금씩 알게 되었던 것 같아요. 그때부터 신앙이 ‘습관’이 아니라 제 삶의 기준이 되기 시작했습니다.',
    jobDescription: 'IT 스타트업에서 브랜드 마케팅 업무를 하고 있어요. 에이전시 창업 경험을 살려 현재는 팀장으로 재직하고 있습니다. 책임감이 필요한 자리인만큼 성실히 일에 임하고 있습니다.',
    relationshipPromise: '진실된 태도요. 서로 간 신뢰가 무엇보다도 중요하다고 생각합니다. 거짓없이 늘 진심을 다하는 태도는 잃지 않겠다고 약속할 수 있어요. 서로 다른 생각이 있을 때도 대화로 풀어가는 관계가 좋다고 생각합니다.',
    weekendStyle: '집에 있기보다는 외출해서 어디든 가는 걸 좋아해요. 카페에서 책을 읽거나 산책하면서 머리를 정리하는 시간을 갖기도 합니다.',
  },
};

export default function ProfileCardPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setScale(el.offsetWidth / CARD_WIDTH);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 마우스 위치에 따른 3D 틸트 + 글레어 인터랙션
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [6, -6]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(px, [0, 1], [-6, 6]), { stiffness: 200, damping: 20 });
  const glareOpacity = useSpring(0, { stiffness: 200, damping: 25 });
  const glareBackground = useTransform([px, py], (latest) => {
    const [gx, gy] = latest as [number, number];
    return `radial-gradient(circle at ${gx * 100}% ${gy * 100}%, rgba(255,255,255,0.35), transparent 45%)`;
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
    glareOpacity.set(1);
  };

  const handleMouseLeave = () => {
    px.set(0.5);
    py.set(0.5);
    glareOpacity.set(0);
  };

  return (
    <motion.div
      ref={containerRef}
      className="w-full"
      style={{
        height: scale ? scale * CARD_HEIGHT : undefined,
        aspectRatio: scale ? undefined : `${CARD_WIDTH} / ${CARD_HEIGHT}`,
      }}
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <style dangerouslySetInnerHTML={{ __html: PRINT_CARD_STYLES }} />
      {scale > 0 && (
        <div
          style={{
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            perspective: 1800,
          }}
        >
          <motion.div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ width: '100%', height: '100%', rotateX, rotateY, transformStyle: 'preserve-3d' }}
            className="relative overflow-hidden rounded-2xl shadow-2xl shadow-cana/20"
          >
            <ProfileCardTemplate profile={SAMPLE_PROFILE} />
            <motion.div
              className="pointer-events-none absolute inset-0"
              style={{ opacity: glareOpacity, background: glareBackground }}
            />
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
