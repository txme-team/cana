// A4 가로 비율(297:210)의 프로필 카드 스켈레톤

function Sk({ w = 'w-14' }: { w?: string }) {
  return <div className={`h-2 rounded-full bg-cana-rule ${w}`} />;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[9px] font-medium text-cana-ink3">{label}</p>
      <p className="text-[12px] text-cana-ink3/50">{value}</p>
    </div>
  );
}

function Chip({ label }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[9px] font-medium text-cana-ink3">{label}</p>
      <div className="h-[18px] w-16 rounded-md bg-cana-rule" />
    </div>
  );
}

function SecLabel({ children }: { children: string }) {
  return (
    <div className="mb-3 border-b border-cana-rule pb-2">
      <p className="text-[11px] font-bold uppercase tracking-widest text-cana-ink2">
        {children}
      </p>
    </div>
  );
}

export default function HeroCardSkeleton() {
  return (
    <div className="aspect-[297/210] w-full overflow-hidden rounded-t-xl border border-cana-rule bg-white shadow-2xl shadow-cana/15">
      <div className="flex h-full flex-col">

        {/* 헤더 */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-cana-rule px-6 py-3">
          <div className="flex items-center gap-2.5">
            <img src="/logos/logo_black.svg" alt="cana" className="h-[15px]" />
            <span className="h-3 w-px bg-cana-rule" />
            <span className="text-[9px] font-medium tracking-widest text-cana-ink3">CHRISTIAN ROTATION DATING</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-cana-ink3">오늘의 번호</span>
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-cana text-[9px] font-bold text-white">3</div>
          </div>
        </div>

        {/* 바디 — 2단 */}
        <div className="flex flex-1 divide-x divide-cana-rule overflow-hidden">

          {/* ── 좌: 프로필 카드 ── */}
          <div className="flex flex-1 flex-col gap-5 overflow-hidden px-5 py-4">

            <p className="text-[13px] font-bold text-cana-ink">프로필 카드</p>

            {/* 기본 정보 */}
            <div>
              <SecLabel>기본 정보</SecLabel>
              {/* 닉네임~근무지 */}
              <div className="grid grid-cols-6 gap-x-3 gap-y-3">
                <Field label="닉네임" value="지아" />
                <Field label="나이" value="92년생" />
                <Field label="MBTI" value="ENFJ" />
                <Field label="키" value="164 cm" />
                <Field label="학력" value="대졸" />
                <Field label="근무지" value="강남구" />
              </div>
              {/* 사는 곳 · 직업 */}
              <div className="mt-3 flex gap-8">
                <Chip label="사는 곳" value="서울 강남구" />
                <Field label="직업" value="기획자" />
              </div>
              {/* 음주 · 흡연 */}
              <div className="mt-3 flex gap-8">
                <Chip label="음주" value="안 마심" />
                <Chip label="흡연" value="비흡연" />
              </div>
              {/* 취미 · 성격 */}
              <div className="mt-3 flex flex-col gap-2">
                <div>
                  <p className="mb-1 text-[9px] font-medium text-cana-ink3">취미 / 관심사</p>
                  <div className="flex flex-wrap gap-1">
                    {['w-12', 'w-8', 'w-16', 'w-10'].map((w, i) => (
                      <div key={i} className={`h-[18px] rounded-full bg-cana-rule ${w}`} />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-[9px] font-medium text-cana-ink3">성격 / 스타일</p>
                  <div className="flex flex-wrap gap-1">
                    {['w-10', 'w-14', 'w-20'].map((w, i) => (
                      <div key={i} className={`h-[18px] rounded-full bg-cana-rule ${w}`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 사전 정보 */}
            <div>
              <SecLabel>사전 정보</SecLabel>
              <div className="grid grid-cols-4 gap-x-3 gap-y-3">
                <Chip label="결혼관" value="결혼 전제" />
                <Chip label="데이트 빈도" value="주 1회" />
                <Chip label="갈등 해결" value="바로 대화" />
                <Chip label="데이트 스타일" value="일상형" />
                <Chip label="연락 선호도" value="카카오톡" />
                <Chip label="쉬는 날" value="주말" />
                <Chip label="이성 친구" value="가능" />
                <Chip label="반려동물" value="없음" />
              </div>
            </div>

            {/* 신앙 */}
            <div>
              <SecLabel>신앙</SecLabel>
              <div className="grid grid-cols-3 gap-x-3 gap-y-2.5">
                <Field label="교단" value="장로교" />
                <Field label="신앙 연수" value="20년" />
                <Field label="교회 위치" value="서울 강동구" />
              </div>
              <div className="mt-3 flex gap-6">
                <Chip label="신앙 스타일" value="예배·찬양 중심" />
                <Chip label="주일 예배" value="주 1회" />
                <Chip label="섬기는 사역" value="찬양팀" />
              </div>
            </div>
          </div>

          {/* ── 우: 미팅 카드 + 추천 질문 ── */}
          <div className="flex w-[40%] flex-shrink-0 flex-col gap-4 overflow-hidden px-5 py-4">

            {/* 미팅 카드 */}
            <div>
              <p className="text-[13px] font-bold text-cana-ink">미팅 카드</p>
              <div className="mt-2 rounded bg-cana/5 px-2 py-3" />
            </div>

            {/* 메모 테이블 */}
            <div className="overflow-hidden rounded-lg border border-cana-rule">
              <div className="grid grid-cols-[26px_1fr] border-b border-cana-rule bg-cana-cream">
                <div className="border-r border-cana-rule py-1.5" />
                <div className="px-2 py-1.5" />
              </div>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="grid grid-cols-[26px_1fr] border-b border-cana-rule/50 last:border-0">
                  <div className="border-r border-cana-rule/50 py-2.5" />
                  <div className="py-2.5" />
                </div>
              ))}
            </div>

            {/* 추천 질문 */}
            <div className="flex flex-col gap-2">
              <p className="text-[13px] font-bold text-cana-ink">추천 질문</p>
              <div className="rounded bg-cana/5 px-2 py-3" />
              <div className="flex flex-col gap-4 pt-1">
                {[['처음 만났을 때', 2], ['일상', 2], ['신앙', 2], ['연애', 2]].map(([cat, n]) => (
                  <div key={cat as string} className="flex flex-col gap-2">
                    <Sk w="w-14" />
                    {Array.from({ length: n as number }).map((_, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-cana-rule" />
                        <Sk w={i % 2 === 0 ? 'w-full' : 'w-4/5'} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
