// 결제 내역 더미 데이터 시드 스크립트
// 실행: node scripts/seed-payments.mjs

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// .env.local 파싱
const envPath = resolve(__dirname, '../.env.local');
const env = Object.fromEntries(
  readFileSync(envPath, 'utf-8').split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const [k, ...v] = l.split('='); return [k.trim(), v.join('=').trim()]; })
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysAgo));
  d.setHours(Math.floor(Math.random() * 14) + 9);
  d.setMinutes(Math.floor(Math.random() * 60));
  return d.toISOString();
}

// ─── 1. 기존 applications 전체 삭제 (중복 방지) ───────────────────────────────
await supabase.from('applications').delete().gte('created_at', '2000-01-01');

// ─── 2. 테스트용 이벤트 생성 (없으면) ─────────────────────────────────────────
const { data: existingEvents } = await supabase.from('events').select('id, title');
let eventIds = (existingEvents ?? []).map(e => e.id);

if (eventIds.length < 3) {
  const newEvents = [
    { title: 'cana 소개팅 1회차', event_date: '2026-04-12T14:00:00', location: '강남구', age_range_male: '28~34', age_range_female: '26~32', capacity: 10, confirmed_count: 0 },
    { title: 'cana 소개팅 2회차', event_date: '2026-05-10T14:00:00', location: '마포구', age_range_male: '29~35', age_range_female: '27~33', capacity: 10, confirmed_count: 0 },
    { title: 'cana 소개팅 3회차', event_date: '2026-06-07T14:00:00', location: '성동구', age_range_male: '28~35', age_range_female: '26~33', capacity: 12, confirmed_count: 0 },
  ];
  const { data: created } = await supabase.from('events').insert(newEvents).select('id');
  eventIds = [...eventIds, ...(created ?? []).map(e => e.id)];
  console.log(`이벤트 ${created?.length ?? 0}개 생성`);
}

// ─── 3. 테스트용 더미 프로필 생성 ─────────────────────────────────────────────
const DUMMY_NAMES = [
  '김지우', '이서연', '박민준', '최하은', '정도윤',
  '강지현', '윤세준', '임나연', '오태양', '한소희',
  '신재원', '류다은', '황민서', '장서준', '전지원',
];
const GENDERS = ['male', 'female'];

const dummyProfiles = DUMMY_NAMES.map((nickname, i) => ({
  user_id:    uuid(),   // 테스트용 fake UUID (FK 없음)
  nickname,
  gender:     i % 2 === 0 ? 'male' : 'female',
  birth_year: 1990 + (i % 10),
  phone:      `010-${String(1000 + i).padStart(4,'0')}-${String(5000 + i).padStart(4,'0')}`,
}));

const { data: createdProfiles, error: profileErr } = await supabase
  .from('profiles').insert(dummyProfiles).select('id, nickname');

if (profileErr) {
  console.error('프로필 생성 실패:', profileErr.message);
  console.log('기존 프로필로만 진행합니다.');
}

const { data: allProfiles } = await supabase.from('profiles').select('id, nickname').limit(30);
const profileIds = (allProfiles ?? []).map(p => ({ id: p.id, nickname: p.nickname }));
console.log(`사용 가능한 프로필: ${profileIds.length}명`);

// ─── 4. 더미 결제 데이터 생성 ─────────────────────────────────────────────────
const STATUSES    = ['검토중', '검토중', '검토중', '대기', '확정', '확정', '확정', '확정', '반려', '취소', '취소'];
const PAY_METHODS = ['카드', '카드', '카드', '카드', '간편결제', '가상계좌'];
const AMOUNT      = 50000;

const rows = [];
const used = new Set();

// 각 프로필에 1~2개 이벤트 신청
for (const profile of profileIds) {
  const eventCount = Math.random() > 0.4 ? 1 : 2;
  const shuffled = [...eventIds].sort(() => Math.random() - 0.5);

  for (let i = 0; i < Math.min(eventCount, shuffled.length); i++) {
    const key = `${profile.id}_${shuffled[i]}`;
    if (used.has(key)) continue;
    used.add(key);

    const status = pick(STATUSES);
    rows.push({
      profile_id:  profile.id,
      event_id:    shuffled[i],
      status,
      order_id:    `order_${uuid().replace(/-/g,'').slice(0,20)}`,
      payment_key: `payKey_${uuid().replace(/-/g,'')}`,
      paid_at:     randomDate(120),
      amount:      AMOUNT,
      pay_method:  pick(PAY_METHODS),
    });
  }
}

if (!rows.length) { console.error('생성할 행이 없어요.'); process.exit(1); }

const { error: insertErr } = await supabase.from('applications').insert(rows);
if (insertErr) {
  console.error('삽입 실패:', insertErr.message);
  process.exit(1);
}

// 요약
const byStatus = rows.reduce((a, r) => { a[r.status] = (a[r.status]||0)+1; return a; }, {});
const total = rows.filter(r => r.status !== '취소' && r.status !== '반려').reduce((s, r) => s + r.amount, 0);
console.log(`✓ 더미 결제 데이터 ${rows.length}건 생성 완료`);
console.log('  상태별:', byStatus);
console.log('  예상 매출:', total.toLocaleString('ko-KR') + '원');
