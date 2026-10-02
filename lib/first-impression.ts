// 첫인상 투표 공통 로직 (서버/클라이언트 어디서든 import 가능 — 서버 전용 의존성 없음)

export type VoteGender = 'male' | 'female';

export interface FirstImpressionVote {
  voter_gender: VoteGender;
  voter_no: number;
  target_no: number | null; // null = 기권
  updated_at: string;
}

export interface VoteMatch {
  maleNo: number;
  femaleNo: number;
}

export const VOTE_NO_MIN = 1;
export const VOTE_NO_MAX = 99;

export function isValidVoteNo(n: unknown): n is number {
  return Number.isInteger(n) && (n as number) >= VOTE_NO_MIN && (n as number) <= VOTE_NO_MAX;
}

export function genderWord(g: VoteGender): string {
  return g === 'male' ? '남자' : '여자';
}

/** 서로 상대를 지목한 쌍만 매칭 성공. 한쪽이라도 기권이거나 투표 안 했으면 제외. */
export function computeMatches(votes: FirstImpressionVote[]): VoteMatch[] {
  const femaleTargets = new Map<number, number | null>();
  for (const v of votes) {
    if (v.voter_gender === 'female') femaleTargets.set(v.voter_no, v.target_no);
  }

  const matches: VoteMatch[] = [];
  for (const v of votes) {
    if (v.voter_gender !== 'male' || v.target_no == null) continue;
    if (femaleTargets.get(v.target_no) === v.voter_no) {
      matches.push({ maleNo: v.voter_no, femaleNo: v.target_no });
    }
  }
  return matches.sort((a, b) => a.maleNo - b.maleNo);
}
