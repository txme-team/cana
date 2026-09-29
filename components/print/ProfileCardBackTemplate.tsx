import type { ApplicationWithProfile, Profile } from '@/lib/types';
import { SUGGESTED_QUESTIONS, type SuggestedQuestionCategory } from '@/lib/suggested-questions';

interface BackTemplateProps {
  oppositeApps: ApplicationWithProfile[];
  ownApp: ApplicationWithProfile;
}

// lib/profile-card.ts는 최상단에서 'crypto'(Node 전용)를 임포트해 클라이언트 번들에 넣을 수 없다.
// 표기는 그쪽 genderLabel()과 동일한 포맷("남자1"/"여자1")을 유지한다.
function genderLabel(gender: Profile['gender'], no: number): string {
  return `${gender === 'male' ? '남자' : '여자'}${no}`;
}

const Q_COLUMNS: SuggestedQuestionCategory[][] = [
  ['처음 만났을 때', '일상', '연애'],
  ['신앙', '결혼', '가족', '가치관'],
];

export default function ProfileCardBackTemplate({ oppositeApps, ownApp }: BackTemplateProps) {
  const shown = oppositeApps.slice(0, 10);
  const ownDisplayNo = ownApp.display_no;
  const ownGender = ownApp.profiles?.gender;

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
              <div className="num-pill">
                {ownDisplayNo != null && ownGender && (
                  <span className="num-pill-text">{genderLabel(ownGender, ownDisplayNo)}</span>
                )}
              </div>
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
                const essays = (p.profile_essays ?? {}) as Record<string, string>;
                const promise = essays.relationshipPromise?.trim();

                return (
                  <div key={app.id} className="opp-row">
                    <div className="opp-no-badge">{no}</div>
                    <div className="opp-content">
                      <div className="opp-line1">
                        {p.job       && <span className="opp-chip">{p.job}</span>}
                        <span className="opp-chip">{displayYear}</span>
                        {p.mbti      && <span className="opp-chip">{p.mbti}</span>}
                        {p.height    && <span className="opp-chip">{p.height}cm</span>}
                        {p.education && <span className="opp-chip">{p.education}</span>}
                        {p.residence && <span className="opp-chip">{p.residence}</span>}
                      </div>
                      <div className="opp-line2-text">
                        {[
                          p.faith_years ? `신앙 ${p.faith_years}년` : null,
                          ...(p.personality ?? []).slice(0, 3),
                          ...(p.hobbies ?? []).slice(0, 4),
                        ].filter(Boolean).join(' · ')}
                      </div>
                      {promise && <div className="opp-promise">&ldquo;{promise}&rdquo;</div>}
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
              {Q_COLUMNS.map((cats, i) => (
                <div key={i}>
                  {cats.map((cat) => (
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
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
