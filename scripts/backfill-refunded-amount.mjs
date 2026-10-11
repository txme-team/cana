// 취소/반려 건의 환불 금액을 Toss 결제 조회(balanceAmount)로 계산해 applications.refunded_amount에 백필
// 사용: node --env-file=.env.prod scripts/backfill-refunded-amount.mjs [--apply]
// (기본은 dry-run: 조회만 하고 DB는 수정하지 않음)
const apply = process.argv.includes('--apply');
const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const toss = Buffer.from(`${process.env.TOSS_SECRET_KEY}:`).toString('base64');

const rest = (path, init = {}) =>
  fetch(`${SUPA}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', ...init.headers },
  });

const res = await rest('applications?select=id,status,amount,payment_key&payment_key=not.is.null&status=in.(취소,반려)');
if (!res.ok) throw new Error(`조회 실패: ${res.status} ${await res.text()}`);
const rows = await res.json();
console.log(`대상 ${rows.length}건 (${apply ? 'APPLY' : 'DRY-RUN'})`);

let changed = 0;
for (const r of rows) {
  const t = await fetch(`https://api.tosspayments.com/v1/payments/${r.payment_key}`, { headers: { Authorization: `Basic ${toss}` } });
  if (!t.ok) { console.log(`- ${r.id} Toss 조회 실패 ${t.status}`); continue; }
  const p = await t.json();
  const refunded = (p.totalAmount ?? 0) - (p.balanceAmount ?? 0);
  console.log(`- ${r.id} [${r.status}] 결제 ${p.totalAmount} → 환불 ${refunded} (잔액 ${p.balanceAmount}, ${p.status})`);
  if (apply) {
    const u = await rest(`applications?id=eq.${r.id}`, { method: 'PATCH', body: JSON.stringify({ refunded_amount: refunded }) });
    if (!u.ok) console.log(`  ! 업데이트 실패 ${u.status} ${await u.text()}`);
    else changed++;
  }
}
console.log(apply ? `업데이트 ${changed}건` : 'dry-run 종료 — 반영하려면 --apply');
