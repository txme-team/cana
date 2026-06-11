import type { Profile } from '@/lib/types';

// ─── 에세이 메타 ───────────────────────────────────────────────────────────────

const ESSAY_META: { field: string; label: string }[] = [
  { field: 'prayerRequest',       label: '요즘 나의 기도제목은요' },
  { field: 'bibleVerse',          label: '가장 좋아하는 성경 구절과 그 이유는요' },
  { field: 'ministryNote',        label: '교회에서 섬기고 있는 사역은요' },
  { field: 'faithGrowthMoment',   label: '나의 신앙이 성장했던 순간은요' },
  { field: 'answeredPrayer',      label: '가장 크게 응답받았던 기도는요' },
  { field: 'communityRole',       label: '공동체 안에서 내 모습은요' },
  { field: 'jobDescription',      label: '이런 일을 하고 있어요' },
  { field: 'careerGoal',          label: '설레는 커리어 목표가 있어요' },
  { field: 'coworkerOpinion',     label: "직장 동료들이 평가하는 '나'는요" },
  { field: 'careerMotivation',    label: '지금의 직업을 선택한 계기는요' },
  { field: 'relationshipPromise', label: "'이것' 하나만큼은 꼭 약속해 줄 수 있어요" },
  { field: 'partnerStyle',        label: '이런 남자/여자친구이고 싶어요' },
  { field: 'feelingLoved',        label: '내가 사랑받고 있다고 느끼는 순간은요' },
  { field: 'humorStyle',          label: '나의 유머 코드나 웃음 포인트는요' },
  { field: 'weekendStyle',        label: '주말엔 이렇게 시간 보내는 걸 좋아해요' },
  { field: 'spendingHabit',       label: '내 소비습관은요' },
  { field: 'conflictApproach',    label: '갈등이 생기면 이렇게 해결해요' },
];

// ─── 서브 컴포넌트 ─────────────────────────────────────────────────────────────

function Chk({ label, on }: { label: string; on: boolean }) {
  return (
    <span className="chk">
      <span className={`chk-box${on ? ' on' : ''}`} />
      {label}
    </span>
  );
}

function CheckRow({ options, selected }: { options: string[]; selected?: string }) {
  return (
    <div className="check-row">
      {options.map((opt) => (
        <Chk key={opt} label={opt} on={selected === opt} />
      ))}
    </div>
  );
}

function PItems({ options, selected }: { options: string[]; selected?: string }) {
  return (
    <div className="p-items">
      {options.map((opt) => (
        <Chk key={opt} label={opt} on={selected === opt} />
      ))}
    </div>
  );
}

function FaItems({ options, selected }: { options: string[]; selected?: string }) {
  return (
    <div className="fa-items">
      {options.map((opt) => (
        <Chk key={opt} label={opt} on={selected === opt} />
      ))}
    </div>
  );
}

// ─── 메인 ─────────────────────────────────────────────────────────────────────

export default function ProfileCardTemplate({ profile: p }: { profile: Profile }) {
  const essays = (p.profile_essays ?? {}) as Record<string, string>;
  const answeredEssays = ESSAY_META.filter((m) => essays[m.field]?.trim());

  const birthYear = p.birth_year < 100 ? 1900 + p.birth_year : p.birth_year;
  const displayYear = `${String(birthYear).slice(2)}년생`;

  const LIVING_WITH_MAP: Record<string, string> = {
    family: '가족과', alone: '혼자', other: '기타',
  };
  const livingWithDisplay = p.living_with ? LIVING_WITH_MAP[p.living_with] ?? p.living_with : '';

  return (
    <div className="card-wrap">
      <div className="card">

        {/* 헤더 */}
        <div className="pc-header">
          <div className="brand-row">
            <span className="brand-name">cana</span>
            <div className="brand-divider" />
            <span className="brand-sub">Christian Rotation Dating</span>
          </div>
          <div className="header-right">
            <span className="cross-mark">✝</span>
            <div className="num-wrap">
              <span className="num-label">오늘의 번호</span>
              <div className="num-pill" />
            </div>
          </div>
        </div>

        {/* 바디 */}
        <div className="pc-body">

          {/* ── 왼쪽 ── */}
          <div className="left">

            <div className="panel-title-wrap">
              <div className="panel-title">프로필 카드</div>
            </div>

            {/* 기본 정보 */}
            <div className="section-basic">
              <div className="sec-label">기본 정보</div>
              <div className="info-grid">

                {/* 1행: 이름 · 나이 · MBTI · 키 · 학력 · 근무지 */}
                <div className="i-cell">
                  <div className="i-label">이름</div>
                  <div className="i-val">{p.nickname}</div>
                </div>
                <div className="i-cell">
                  <div className="i-label">나이</div>
                  <div className="i-val">{displayYear}</div>
                </div>
                <div className="i-cell">
                  <div className="i-label">MBTI</div>
                  <div className="i-val">{p.mbti}</div>
                </div>
                <div className="i-cell">
                  <div className="i-label">키</div>
                  <div className="i-val">{p.height} cm</div>
                </div>
                <div className="i-cell">
                  <div className="i-label">학력</div>
                  <div className="i-val">{p.education}</div>
                </div>
                <div className="i-cell">
                  <div className="i-label">근무지</div>
                  <div className="i-val">{p.workplace}</div>
                </div>

                {/* 2행: 사는 곳 · 직업 */}
                <div className="i-cell w3">
                  <div className="i-label">사는 곳</div>
                  <div className="live-row">
                    <span className="live-val">{p.residence}</span>
                    <div className="live-checks">
                      {(['가족과', '혼자', '기타'] as const).map((opt) => (
                        <span key={opt} className="live-chk">
                          <span className={`chk-box${livingWithDisplay === opt ? ' on' : ''}`} />
                          {opt}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="i-cell w3">
                  <div className="i-label">직업</div>
                  <div className="i-val">{p.job}</div>
                </div>

                {/* 3행: 음주 · 흡연 */}
                <div className="i-cell w3">
                  <div className="i-label">음주</div>
                  <CheckRow
                    options={['안 마심', '분위기 따라', '월 1~2회', '주 1회 이상']}
                    selected={p.drinking}
                  />
                </div>
                <div className="i-cell w3">
                  <div className="i-label">흡연</div>
                  <CheckRow
                    options={['비흡연', '흡연(전자담배)', '흡연(연초)', '금연 중']}
                    selected={p.smoking}
                  />
                </div>

                {/* 4행: 취미 */}
                <div className="i-cell w6">
                  <div className="i-label">취미 / 관심사</div>
                  <div className="tag-wrap">
                    {(p.hobbies ?? []).map((h) => <span key={h} className="tag">{h}</span>)}
                  </div>
                </div>

                {/* 5행: 성격 */}
                <div className="i-cell w6">
                  <div className="i-label">성격 / 스타일</div>
                  <div className="tag-wrap">
                    {(p.personality ?? []).map((t) => <span key={t} className="tag">{t}</span>)}
                  </div>
                </div>

              </div>
            </div>

            {/* 사전 정보 */}
            <div className="section-pre">
              <div className="sec-label">사전 정보</div>
              <div className="pre-grid">

                <div className="p-cell">
                  <div className="p-label">연락 선호도</div>
                  <PItems options={['자주', '적당히', '필요할 때만']} selected={p.contact_preference} />
                </div>
                <div className="p-cell">
                  <div className="p-label">데이트 빈도</div>
                  <PItems options={['주 2회+', '주 1회', '격주', '월 1~2회']} selected={p.date_frequency} />
                </div>
                <div className="p-cell">
                  <div className="p-label">이성 친구</div>
                  <PItems
                    options={['친구로 지낼 수 없다', '가끔 연락은 괜찮다', '자주 만나도 괜찮다', '본인이 알아서 조율']}
                    selected={p.opposite_friends}
                  />
                </div>
                <div className="p-cell">
                  <div className="p-label">결혼관</div>
                  <PItems
                    options={['결혼 전제로 만남', '결혼보다 연애', '비혼주의', '딩크족']}
                    selected={p.marriage_view}
                  />
                </div>
                <div className="p-cell">
                  <div className="p-label">갈등 해결</div>
                  <PItems options={['바로 대화', '감정 식힌 후', '상황에 따라']} selected={p.conflict_resolution} />
                </div>
                <div className="p-cell">
                  <div className="p-label">쉬는 날</div>
                  <PItems options={['집에서 충전', '밖에서 활동', '상관없음']} selected={p.day_off_style} />
                </div>
                <div className="p-cell">
                  <div className="p-label">반려동물</div>
                  <PItems
                    options={['키우고 있음', '좋아하지만 키우진 않음', '좋아하지 않음']}
                    selected={p.pet}
                  />
                </div>
                <div className="p-cell">
                  <div className="p-label">데이트 스타일</div>
                  <PItems
                    options={['활동(액티비티·여행·운동)', '일상(카페·산책·맛집)', '문화(전시·공연·영화)', '집콕(집에서 영화·게임)']}
                    selected={p.date_style}
                  />
                </div>

              </div>
            </div>

            {/* 신앙 */}
            <div className="section-faith">
              <div className="sec-label">신앙</div>
              <div className="faith-grid">

                <div className="fa-cell w3">
                  <div className="fa-label">신앙 연수</div>
                  <div className="fa-val">{p.faith_years}년</div>
                </div>
                {p.faith_level && (
                  <div className="fa-cell w3">
                    <div className="fa-label">신앙 단계</div>
                    <div className="fa-val">{p.faith_level}</div>
                  </div>
                )}
                <div className="fa-cell w3">
                  <div className="fa-label">주일 예배</div>
                  <FaItems
                    options={['거의 매주', '2~3주에 1회', '상황에 따라']}
                    selected={p.worship_frequency}
                  />
                </div>
                <div className="fa-cell w3">
                  <div className="fa-label">섬기는 사역</div>
                  <FaItems
                    options={['찬양팀', '교육부', '행정', '없음', '기타']}
                    selected={p.ministry}
                  />
                </div>

              </div>
            </div>

          </div>

          <div className="vdivider" />

          {/* ── 오른쪽 ── */}
          <div className="right">

            {/* Q&A */}
            <div className="panel-title-wrap">
              <div className="panel-title">Q&amp;A</div>
            </div>

            <div className="section-qa">
              {answeredEssays.length === 0 ? (
                <div className="qa-empty">작성된 Q&amp;A가 없어요</div>
              ) : (
                <div className="qa-grid">
                  {answeredEssays.map((e) => (
                    <div key={e.field} className="qa-item">
                      <div className="qa-q">{e.label}</div>
                      <div className="qa-a">{essays[e.field]}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 추천 질문 */}
            <div className="section-gap" />
            <div className="panel-title-wrap">
              <div className="panel-title">추천 질문</div>
            </div>

            <div className="q-cols">
              <div>
                <div className="q-group">
                  <div className="q-group-label">처음 만났을 때</div>
                  <div className="q-row"><div className="q-dot" /><div className="q-txt">오늘 여기 오기 전에 뭐 하셨어요?</div></div>
                  <div className="q-row"><div className="q-dot" /><div className="q-txt">여기 자주 오시는 동네예요?</div></div>
                </div>
                <div className="q-group">
                  <div className="q-group-label">일상</div>
                  <div className="q-row"><div className="q-dot" /><div className="q-txt">퇴근 후에는 주로 뭐하세요?</div></div>
                  <div className="q-row"><div className="q-dot" /><div className="q-txt">쉬는 날 주로 어떻게 보내세요?</div></div>
                  <div className="q-row"><div className="q-dot" /><div className="q-txt">꾸준히 하는 운동이 있나요?</div></div>
                  <div className="q-row"><div className="q-dot" /><div className="q-txt">어떤 음식 좋아하세요?</div></div>
                </div>
                <div className="q-group">
                  <div className="q-group-label">신앙</div>
                  <div className="q-row"><div className="q-dot" /><div className="q-txt">어떻게 교회를 다니게 됐어요?</div></div>
                  <div className="q-row"><div className="q-dot" /><div className="q-txt">예배 끝나면 보통 뭐하세요?</div></div>
                  <div className="q-row"><div className="q-dot" /><div className="q-txt">신앙 스타일이 어떤 편이에요?</div></div>
                </div>
              </div>

              <div>
                <div className="q-group">
                  <div className="q-group-label">연애</div>
                  <div className="q-row"><div className="q-dot" /><div className="q-txt">연애할 때 어떤 스타일인지 알아요?</div></div>
                  <div className="q-row"><div className="q-dot" /><div className="q-txt">어떤 사람한테 끌리는 것 같아요?</div></div>
                  <div className="q-row"><div className="q-dot" /><div className="q-txt">리드하는 편이에요, 따라가는 편이에요?</div></div>
                  <div className="q-row"><div className="q-dot" /><div className="q-txt">데이트할 때 계획 세우는 편, 즉흥적인 편?</div></div>
                  <div className="q-row"><div className="q-dot" /><div className="q-txt">어떤 데이트를 좋아하세요?</div></div>
                  <div className="q-row"><div className="q-dot" /><div className="q-txt">첫 데이트로 가고 싶은 곳 있어요?</div></div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
