import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { buildPublicUrl } from '@/lib/public-url';
import {
  computeMatches,
  genderWord,
  type FirstImpressionVote,
  type VoteGender,
} from '@/lib/first-impression';
import VoteLinkCard from '@/components/admin/VoteLinkCard';

export const dynamic = 'force-dynamic';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function AdminVoteResultPage({ params }: { params: { eventId: string } }) {
  if (!UUID_RE.test(params.eventId)) notFound();

  // 인증/권한 확인은 middleware에서 이미 끝났음
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supa = createServiceClient() as any;

  const { data: event } = await supa
    .from('events')
    .select('id, title')
    .eq('id', params.eventId)
    .maybeSingle() as { data: { id: string; title: string } | null };
  if (!event) notFound();

  const [{ data: voteRows }, { data: confirmedRows }] = await Promise.all([
    supa
      .from('first_impression_votes')
      .select('voter_gender, voter_no, target_no, updated_at')
      .eq('event_id', event.id) as Promise<{ data: FirstImpressionVote[] | null }>,
    // 확정자 번호(= 인쇄 카드의 '오늘의 번호') — 아직 투표 안 한 번호를 보여주기 위함
    supa
      .from('applications')
      .select('display_no, profiles!inner ( gender )')
      .eq('event_id', event.id)
      .eq('status', '확정')
      .not('display_no', 'is', null) as Promise<{
        data: { display_no: number; profiles: { gender: VoteGender } }[] | null;
      }>,
  ]);

  const votes = voteRows ?? [];
  const matches = computeMatches(votes);
  const matchedMale = new Set(matches.map((m) => m.maleNo));
  const matchedFemale = new Set(matches.map((m) => m.femaleNo));

  const byGender = (g: VoteGender) =>
    votes.filter((v) => v.voter_gender === g).sort((a, b) => a.voter_no - b.voter_no);

  const columns: { gender: VoteGender; votes: FirstImpressionVote[]; matched: Set<number> }[] = [
    { gender: 'male', votes: byGender('male'), matched: matchedMale },
    { gender: 'female', votes: byGender('female'), matched: matchedFemale },
  ];

  const abstainCount = votes.filter((v) => v.target_no == null).length;

  const notVoted = (g: VoteGender) => {
    const voted = new Set(votes.filter((v) => v.voter_gender === g).map((v) => v.voter_no));
    return (confirmedRows ?? [])
      .filter((r) => r.profiles?.gender === g && !voted.has(r.display_no))
      .map((r) => r.display_no)
      .sort((a, b) => a - b);
  };

  const voteUrl = buildPublicUrl(`/rotation/vote/${event.id}`);

  return (
    <main className="space-y-5 px-6 py-8">
      <div>
        <Link href="/rotation/admin/vote" className="text-xs text-gray-400 hover:text-gray-600">
          ← 회차 목록
        </Link>
        <h1 className="mt-1 text-lg font-semibold text-gray-900">첫인상 투표 · {event.title}</h1>
      </div>

      <VoteLinkCard url={voteUrl} eventTitle={event.title} />

      {/* 요약 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: '남자 투표', value: `${columns[0].votes.length}명` },
          { label: '여자 투표', value: `${columns[1].votes.length}명` },
          { label: '기권', value: `${abstainCount}명` },
          { label: '매칭 성공', value: `${matches.length}쌍` },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-gray-400">{s.label}</p>
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* 매칭 결과 */}
      <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-gray-400">매칭 결과</p>
        {matches.length === 0 ? (
          <p className="text-sm text-gray-400">아직 서로 선택한 쌍이 없어요</p>
        ) : (
          <ul className="space-y-2">
            {matches.map((m) => (
              <li key={`${m.maleNo}-${m.femaleNo}`} className="text-base font-semibold text-gray-900">
                남자 {m.maleNo}호 🩷 여자 {m.femaleNo}호
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 투표 현황 */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {columns.map(({ gender, votes: list, matched }) => {
          const missing = notVoted(gender);
          const targetWord = genderWord(gender === 'male' ? 'female' : 'male');
          return (
            <div key={gender} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                {genderWord(gender)} 투표 현황
              </p>

              {list.length === 0 ? (
                <p className="text-sm text-gray-400">아직 투표가 없어요</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs text-gray-400">
                      <th className="py-2 text-left font-medium">번호</th>
                      <th className="py-2 text-left font-medium">선택한 {targetWord}</th>
                      <th className="py-2 text-right font-medium" />
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((v) => (
                      <tr key={v.voter_no} className="border-b border-gray-50 last:border-0">
                        <td className="py-2.5 font-medium text-gray-800">{v.voter_no}호</td>
                        <td className="py-2.5 text-gray-600">
                          {v.target_no == null ? <span className="text-gray-400">기권</span> : `${v.target_no}호`}
                        </td>
                        <td className="py-2.5 text-right">
                          {matched.has(v.voter_no) && (
                            <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                              매칭
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {missing.length > 0 && (
                <p className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-400">
                  미투표 (확정자 번호 기준): {missing.map((n) => `${n}호`).join(', ')}
                </p>
              )}
            </div>
          );
        })}
      </section>
    </main>
  );
}
