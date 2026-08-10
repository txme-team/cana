import type { ApplicationWithProfile } from '@/lib/types';

interface BackTemplateProps {
  oppositeApps: ApplicationWithProfile[];
}

const SUGGESTED_QUESTIONS = {
  '처음 만났을 때': [
    '오늘 여기 오기 전에 뭐 하셨어요?',
    '여기 자주 오시는 동네예요?',
    '오늘 참석하게 된 계기가 있어요?',
  ],
  '일상': [
    '퇴근 후에는 주로 뭐하세요?',
    '쉬는 날 주로 어떻게 보내세요?',
    '꾸준히 하는 운동이 있나요?',
    '요즘 빠져있는 게 있어요?',
    '어떤 음식 좋아하세요?',
  ],
  '신앙': [
    '어떻게 교회를 다니게 됐어요?',
    '예배 끝나면 보통 뭐하세요?',
    '신앙 스타일이 어떤 편이에요?',
    '요즘 기도 제목이 있어요?',
  ],
  '연애': [
    '연애할 때 어떤 스타일인지 알아요?',
    '어떤 사람한테 끌리는 것 같아요?',
    '리드하는 편이에요, 따라가는 편이에요?',
    '데이트할 때 계획 세우는 편, 즉흥적인 편?',
    '어떤 데이트를 좋아하세요?',
    '첫 데이트로 가고 싶은 곳 있어요?',
  ],
};

export default function ProfileCardBackTemplate({ oppositeApps }: BackTemplateProps) {
  const shown = oppositeApps.slice(0, 10);

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

          {/* ── 왼쪽: 이성 참석자 ── */}
          <div className="left" style={{ padding: '10px 14px' }}>
            <div className="panel-title-wrap">
              <div className="panel-title">참석자 프로필</div>
            </div>

            <div className="opp-list">
              {shown.map((app, i) => {
                const p = app.profiles;
                if (!p) return null;
                const birthYear = p.birth_year < 100 ? 1900 + p.birth_year : p.birth_year;
                const displayYear = `${String(birthYear).slice(2)}년생`;
                const no = app.display_no ?? i + 1;

                return (
                  <div key={app.id} className="opp-row">
                    <div className="opp-line1">
                      <span className="opp-no">No.{no}</span>
                      <span className="opp-dot-sep" />
                      <span className="opp-chip">{displayYear}</span>
                      {p.mbti      && <span className="opp-chip">{p.mbti}</span>}
                      {p.height    && <span className="opp-chip">{p.height}cm</span>}
                      {p.education && <span className="opp-chip">{p.education}</span>}
                      {p.residence && <span className="opp-chip">{p.residence}</span>}
                    </div>
                    <div className="opp-line2">
                      {p.job         && <span className="opp-detail">{p.job}</span>}
                      {p.faith_years && <span className="opp-detail">신앙 {p.faith_years}년</span>}
                      {(p.hobbies ?? []).slice(0, 4).map((h) => (
                        <span key={h} className="opp-tag">{h}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="vdivider" />

          {/* ── 오른쪽: 추천 질문 ── */}
          <div className="right">
            <div className="panel-title-wrap">
              <div className="panel-title">추천 질문</div>
            </div>

            <div className="q-cols">
              <div>
                {(['처음 만났을 때', '일상', '신앙'] as const).map((cat) => (
                  <div key={cat} className="q-group">
                    <div className="q-group-label">{cat}</div>
                    {SUGGESTED_QUESTIONS[cat].map((q) => (
                      <div key={q} className="q-row">
                        <div className="q-dot" />
                        <div className="q-txt">{q}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div>
                {(['연애'] as const).map((cat) => (
                  <div key={cat} className="q-group">
                    <div className="q-group-label">{cat}</div>
                    {SUGGESTED_QUESTIONS[cat].map((q) => (
                      <div key={q} className="q-row">
                        <div className="q-dot" />
                        <div className="q-txt">{q}</div>
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
