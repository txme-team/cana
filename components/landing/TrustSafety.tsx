const ITEMS = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
    title: '꼼꼼한 사전 심사',
    description: '신청서와 사진을 바탕으로 운영진이 직접 심사합니다. 자기 관리가 미흡하다고 판단되면 참석이 불가합니다.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: '제대로 된 교회 인증',
    description: '주보 또는 교인증명서로 인증합니다. 한국 교단에 등록된 교회 교인만 참석 가능합니다.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
      </svg>
    ),
    title: '불편한 상황은 원천 차단',
    description: '교회·직장 인증을 통해 아는 사람과 마주치는 상황을 사전에 방지합니다. 같은 교회·직장 동료가 포함될 경우 참석 전에 개별 연락드립니다.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    ),
    title: '프라이버시가 최우선',
    description: '이름, 연락처, 직장명, 교회명 등 신상이 특정될 수 있는 정보는 다른 참가자에게 공개되지 않습니다.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
      </svg>
    ),
    title: '장소 비공개',
    description: '소개팅 장소는 사전 심사와 결제를 모두 완료한 분들께만 별도로 안내됩니다. 불특정 다수에게 공개되지 않습니다.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    ),
    title: '사진·영상 촬영 금지',
    description: '참가자 보호를 위해 행사 중 사진·영상 촬영은 전면 금지됩니다. 운영진이 마케팅 목적으로 촬영하는 경우에도 참가자 얼굴은 반드시 식별 불가하도록 처리합니다.',
  },
];

export default function TrustSafety() {
  return (
    <section className="bg-white px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">

        {/* 헤더 */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-cana-ink sm:text-3xl">
            기대해도 좋은 사람들이,<br />안심할 수 있는 자리에서
          </h2>
          <p className="mx-auto max-w-lg text-base leading-relaxed text-cana-ink3">
            카나는 누구에게나 열려 있지 않습니다.<br className="hidden sm:block" />
            좋은 만남을 위한 꼼꼼한 기준을 지킵니다.
          </p>
        </div>

        {/* 카드 그리드 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((item) => (
            <div
              key={item.title}
              className="flex flex-col gap-3 rounded-2xl border border-cana-rule bg-cana-cream px-6 py-6"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cana/8 text-cana">
                {item.icon}
              </div>
              <div>
                <p className="mb-1 text-lg font-semibold text-cana-ink">{item.title}</p>
                <p className="text-base leading-relaxed text-cana-ink3">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
