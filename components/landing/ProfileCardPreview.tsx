export default function ProfileCardPreview() {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-cana-rule bg-white shadow-xl shadow-cana/10">

      {/* 카드 헤더 */}
      <div className="flex items-center justify-between border-b border-cana-rule px-5 py-3.5">
        <div className="flex items-center gap-2">
          <img src="/logos/logo_black.svg" alt="cana" className="h-[14px]" />
          <span className="h-3 w-px bg-cana-rule" />
          <span className="text-[10px] font-medium tracking-widest text-cana-ink3">PROFILE CARD</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-cana/10 px-2.5 py-1">
          <span className="text-[10px] font-semibold text-cana">오늘의 번호</span>
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-cana text-[9px] font-bold text-white">3</span>
        </div>
      </div>

      {/* 기본 정보 */}
      <div className="px-5 py-4">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-cana-ink3">기본 정보</p>
        <div className="grid grid-cols-3 gap-x-3 gap-y-3">
          {[
            ['닉네임', '지아'],
            ['나이', '92년생'],
            ['MBTI', 'ENFJ'],
            ['키', '164 cm'],
            ['학력', '대졸'],
            ['근무지', '서울 강남구'],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-[9px] text-cana-ink3">{label}</p>
              <p className="text-xs font-medium text-cana-ink">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {['독서', '러닝', '카페 탐방', '요리'].map((h) => (
            <span key={h} className="rounded-full bg-cana/8 px-2 py-0.5 text-[10px] font-medium text-cana">
              {h}
            </span>
          ))}
        </div>
      </div>

      <div className="mx-5 border-t border-cana-rule" />

      {/* 신앙 */}
      <div className="px-5 py-4">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-cana-ink3">신앙</p>
        <div className="grid grid-cols-3 gap-x-3 gap-y-3">
          {[
            ['교단', '장로교'],
            ['신앙 연수', '20년'],
            ['교회 위치', '서울 강동구'],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-[9px] text-cana-ink3">{label}</p>
              <p className="text-xs font-medium text-cana-ink">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <p className="text-[9px] text-cana-ink3">신앙 스타일</p>
          <p className="text-xs font-medium text-cana-ink">예배·찬양 중심</p>
        </div>
      </div>

      <div className="mx-5 border-t border-cana-rule" />

      {/* 사전 정보 */}
      <div className="px-5 py-4">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-cana-ink3">사전 정보</p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
          {[
            ['결혼관', '결혼 전제로 만남'],
            ['데이트 빈도', '주 1회'],
            ['갈등 해결', '바로 대화'],
            ['데이트 스타일', '일상(카페·산책·맛집)'],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-[9px] text-cana-ink3">{label}</p>
              <span className="inline-block rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] text-cana-ink">
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-5 border-t border-cana-rule" />

      {/* Q&A */}
      <div className="px-5 py-4">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-cana-ink3">Q&amp;A</p>
        <div className="flex flex-col gap-2">
          {[
            { q: '요즘 나의 기도제목은요', a: '새로운 시작 앞에 하나님의 인도하심을 구하고 있어요. 매일 아침 기도 시간을 챙기려 노력 중이에요.' },
            { q: '이런 일을 하고 있어요', a: 'UX 디자이너로 일하고 있어요. 사람들이 서비스를 더 쉽고 즐겁게 쓸 수 있도록 고민하는 일이에요.' },
            { q: "'이것' 하나만큼은 꼭 약속해 줄 수 있어요", a: '힘든 날엔 꼭 먼저 연락할게요. 먼저 물어봐 주는 사람이 되고 싶어요.' },
          ].map(({ q, a }) => (
            <div key={q} className="rounded-lg bg-cana/5 px-3 py-2.5">
              <p className="mb-1 text-[9px] font-semibold text-cana">{q}</p>
              <p className="text-[10px] leading-relaxed text-cana-ink">{a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 하단 페이드 */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
    </div>
  );
}
