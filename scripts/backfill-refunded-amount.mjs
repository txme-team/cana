// 결제키가 있는 모든 신청을 Toss 결제 조회와 대조해 applications.refunded_amount를 백필
// (Toss 대시보드에서 직접 전체/부분 취소한 건도 balanceAmount로 반영됨)
// 사용: node --env-file=.env.prod scripts/backfill-refunded-amount.mjs [--apply]
// 기본은 dry-run: Toss/DB 조회만 하고 DB는 수정하지 않음
const apply = process.argv.includes('--apply');
const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const toss = Buffer.from(`${process.env.TOSS_SECRET_KEY}:`).toString('base64');

const rest = (path, init = {}) =>
  fetch(`${SUPA}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', ...init.headers },
  });

const res = await rest('applications?select=id,status,amount,payment_key,paid_at&paid_at=not.is.null&limit=5000');
if (!res.ok) throw new Error(`조회 실패: ${res.status} ${await res.text()}`);
const rows = await res.json();

const noKey = rows.filter((r) => !r.payment_key);
const targets = rows.filter((r) => r.payment_key);
console.log(`결제완료 ${rows.length}건 (결제키 없음 ${noKey.length}건 / 대조 대상 ${targets.length}건) — ${apply ? 'APPLY' : 'DRY-RUN'}`);
noKey.forEach((r) => console.log(`  [결제키 없음] ${r.id} ${r.status} ${r.amount}`));

const refundedRows = [];
const statusMismatch = [];
const amountMismatch = [];
const failed = [];

for (const r of targets) {
  const t = await fetch(`https://api.tosspayments.com/v1/payments/${r.payment_key}`, { headers: { Authorization: `Basic ${toss}` } });
  if (!t.ok) { failed.push(`${r.id} ${t.status}`); continue; }
  const p = await t.json();
  const refunded = (p.totalAmount ?? 0) - (p.balanceAmount ?? 0);

  if (p.totalAmount !== r.amount) amountMismatch.push(`${r.id} DB ${r.amount} / Toss ${p.totalAmount}`);

  // DB 상태가 취소·반려가 아닌데 Toss에서는 전액 취소된 건 (대시보드 직접 취소 등)
  const dbCancelled = r.status === '취소' || r.status === '반려';
  if (p.status === 'CANCELED' && !dbCancelled) statusMismatch.push(`${r.id} DB [${r.status}] / Toss CANCELED (${p.totalAmount})`);
  if (p.status === 'DONE' && dbCancelled) statusMismatch.push(`${r.id} DB [${r.status}] / Toss DONE — 환불 안 됨`);

  if (refunded > 0) refundedRows.push({ id: r.id, status: r.status, total: p.totalAmount, refunded, balance: p.balanceAmount, tossStatus: p.status });
  if (apply) {
    const u = await rest(`applications?id=eq.${r.id}`, { method: 'PATCH', body: JSON.stringify({ refunded_amount: refunded }) });
    if (!u.ok) console.log(`  ! 업데이트 실패 ${r.id} ${u.status} ${await u.text()}`);
  }
}

const partial = refundedRows.filter((x) => x.tossStatus === 'PARTIAL_CANCELED');
console.log(`\n환불 발생 ${refundedRows.length}건 (전액 ${refundedRows.length - partial.length} / 부분 ${partial.length})`);
console.log(`부분취소 ${partial.length}건, 남는 매출 합계 ${partial.reduce((s, x) => s + x.balance, 0)}원`);
partial.forEach((x) => console.log(`  - ${x.id} [${x.status}] 결제 ${x.total} → 환불 ${x.refunded} / 잔액 ${x.balance}`));
console.log(`\nDB 상태 ↔ Toss 불일치 ${statusMismatch.length}건`); statusMismatch.forEach((x) => console.log('  -', x));
console.log(`\n금액 불일치 ${amountMismatch.length}건`); amountMismatch.forEach((x) => console.log('  -', x));
console.log(`\nToss 조회 실패 ${failed.length}건`); failed.forEach((x) => console.log('  -', x));
console.log(apply ? '\n--apply 완료' : '\ndry-run 종료 — 반영하려면 --apply');
