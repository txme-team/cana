// ─── 기본 정보 ───────────────────────────────────────────────────────────────

export type GenderOption = '남성' | '여성';
export type DrinkingOption = '안 마심' | '분위기 따라' | '월 1~2회' | '주 1회 이상';
export type SmokingOption = '비흡연' | '흡연(전자담배)' | '흡연(연초)' | '금연 중';
export type LivingWithOption = '가족과' | '혼자' | '기타';
export type EducationOption = '고졸' | '대졸' | '대학원졸' | '기타';

// ─── 사전 정보 ───────────────────────────────────────────────────────────────

export type ContactFrequencyOption = '자주' | '적당히' | '필요할 때만';
export type DateFrequencyOption = '주 2회+' | '주 1회' | '격주' | '월 1~2회';
export type OppositeFriendOption =
  | '친구로 지낼 수 없다'
  | '가끔 연락은 괜찮다'
  | '자주 만나도 괜찮다'
  | '본인이 알아서 조율';
export type MarriageViewOption =
  | '결혼 전제로 만남'
  | '결혼보다 연애'
  | '비혼주의'
  | '딩크족';
export type ConflictStyleOption = '바로 대화' | '감정 식힌 후' | '상황에 따라';
export type RestDayOption = '집에서 충전' | '밖에서 활동' | '상관없음';
export type PetOption = '키우고 있음' | '좋아하지만 키우진 않음' | '좋아하지 않음';
export type DateStyleOption =
  | '활동(액티비티·여행·운동)'
  | '일상(카페·산책·맛집)'
  | '문화(전시·공연·영화)'
  | '집콕(집에서 영화·게임)';

// ─── 신앙 ─────────────────────────────────────────────────────────────────────

export type FaithStyleOption =
  | '말씀 중심'
  | '예배·찬양 중심'
  | '봉사·섬김 중심'
  | '균형형';
export type SundayAttendanceOption = '거의 매주' | '2~3주에 1회' | '상황에 따라';
export type MinistryOption = '찬양팀' | '교육부' | '행정' | '없음' | '기타';
export type FaithLevelOption =
  | '초신자이거나 가나안 신도예요'
  | '주일 성수는 지키려고 노력해요'
  | '비정기적으로 교회활동과 봉사에 참여해요'
  | '적극적으로 사역하며 삶의 중심이 신앙이에요';

// ─── 신청 폼 데이터 ──────────────────────────────────────────────────────────

export interface ApplyFormData {
  // Step 0: 일정
  eventId: string;

  // Step 1: 기본 정보
  gender: GenderOption | '';
  name: string;
  birthYear: string;
  mbti: string;
  heightCm: string;
  workplaceCity: string;
  workplaceDistrict: string;
  job: string;
  companyName: string;
  residenceCity: string;
  residenceDistrict: string;
  livingWith: LivingWithOption;
  education: EducationOption;
  drinking: DrinkingOption;
  smoking: SmokingOption;
  hobbies: string[];
  personality: string[];

  // Step 2: 사전 정보
  contactFrequency: ContactFrequencyOption;
  dateFrequency: DateFrequencyOption;
  oppositeFriend: OppositeFriendOption;
  marriageView: MarriageViewOption;
  conflictStyle: ConflictStyleOption;
  restDay: RestDayOption;
  pet: PetOption;
  dateStyle: DateStyleOption;

  // Step 3: 신앙
  denomination: string;
  faithYears: string;
  churchName: string;
  churchCity: string;
  churchDistrict: string;
  faithLevel: FaithLevelOption | '';
  faithStyle: FaithStyleOption;
  sundayAttendance: SundayAttendanceOption;
  ministry: MinistryOption;

  // Step 4: 연락처 & 동의
  phone: string;
  agreePrivacy: boolean;
  agreeAttendance: boolean;
  agreeProfileShare: boolean;
  agreeInstagram: boolean;

  // Step 5: 인증
  photo: FileList;
  workplaceVerification: FileList | null;
  churchVerification: FileList | null;

  // Step QnA: 자기소개
  prayerRequest: string;
  bibleVerse: string;
  ministryNote: string;
  faithGrowthMoment: string;
  answeredPrayer: string;
  communityRole: string;
  jobDescription: string;
  careerGoal: string;
  coworkerOpinion: string;
  careerMotivation: string;
  relationshipPromise: string;
  partnerStyle: string;
  feelingLoved: string;
  humorStyle: string;
  weekendStyle: string;
  spendingHabit: string;
  conflictApproach: string;
}

// ─── 미팅 ─────────────────────────────────────────────────────────────────────

export interface MeetingNote {
  number: number;
  memo: string;
}

export interface Meeting {
  id: string;
  createdAt: string;
  profileId: string;
  notes: MeetingNote[];
}

// ─── 어드민 ───────────────────────────────────────────────────────────────────

export type ProfileStatus = '검토중' | '대기' | '확정' | '반려' | '취소';

// ─── DB Row 타입 ──────────────────────────────────────────────────────────────

/** profiles 테이블 — 1인 1행 */
export interface Profile {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  // 기본 정보
  nickname: string;
  gender: 'male' | 'female';
  birth_year: number;
  height?: number;
  mbti?: string;
  education?: string;
  workplace?: string;
  residence?: string;
  living_with?: 'family' | 'alone' | 'other';
  job?: string;
  company_name?: string;
  drinking?: string;
  smoking?: string;
  hobbies?: string[];
  personality?: string[];
  // 사전 정보
  contact_preference?: string;
  date_frequency?: string;
  opposite_friends?: string;
  marriage_view?: string;
  conflict_resolution?: string;
  day_off_style?: string;
  pet?: string;
  date_style?: string;
  // 신앙
  church_denomination?: string;
  faith_years?: number;
  church_location?: string;
  church_name?: string;
  church_pastor?: string;
  faith_style?: string;
  worship_frequency?: string;
  ministry?: string;
  faith_level?: string;
  // 인증
  photo_urls?: string[];
  job_cert_url?: string;
  bulletin_url?: string;
  // 자기소개 에세이
  profile_essays?: Record<string, string>;
  // 연락처 & 동의
  phone?: string;
  agree_privacy?: boolean;
  agree_attendance?: boolean;
  agree_profile_share?: boolean;
  agree_instagram?: boolean;
}

/** applications 테이블 — 신청 1건 (사람 × 이벤트) */
export interface Application {
  id: string;
  profile_id: string;
  event_id: string;
  status: ProfileStatus;
  admin_memo?: string;
  created_at: string;
}

/** 어드민 조회용 JOIN 타입 (applications + profiles) */
export interface ApplicationWithProfile extends Application {
  profiles: Profile;
}

/** @deprecated ProfileRow → ApplicationWithProfile 으로 교체됨 */
export type ProfileRow = ApplicationWithProfile;
