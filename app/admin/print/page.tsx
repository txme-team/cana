import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { ProfileStatus } from '@/lib/types';
import ProfileCardTemplate from '@/components/print/ProfileCardTemplate';
import PrintControls from '@/components/print/PrintControls';

export const dynamic = 'force-dynamic';

const PRINT_STYLES = `
  :root {
    --rose:     #e05c52;
    --rose-lt:  #f2c4c0;
    --rose-bg:  #faf8f5;
    --rose-mid: #ee9088;
    --ink:      #1c1410;
    --ink-2:    #4a3328;
    --ink-3:    #a08878;
    --cream:    #f4f0ec;
    --warm:     #ede8e2;
    --rule:     #ddd4c8;
  }

  .card-wrap {
    width: 297mm;
    height: 210mm;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #e8ddd8;
    page-break-after: always;
  }

  .card {
    width: 287mm;
    height: 200mm;
    background: var(--cream);
    border-radius: 10px;
    display: grid;
    grid-template-rows: 34px 1fr;
    overflow: hidden;
    position: relative;
    box-shadow: 0 4px 40px rgba(120,40,60,0.12), 0 1px 4px rgba(120,40,60,0.06);
    font-family: 'Pretendard Variable', 'Pretendard', -apple-system, sans-serif;
  }

  .card::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 10;
    border-radius: 10px;
  }

  /* 헤더 */
  .pc-header {
    background: var(--rose);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    position: relative;
    overflow: hidden;
  }
  .pc-header::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, rgba(255,255,255,0) 60%, rgba(255,255,255,0.06) 100%);
    pointer-events: none;
  }
  .brand-row { display: flex; align-items: baseline; gap: 10px; }
  .brand-name { font-size: 14px; font-weight: 700; color: #fff; letter-spacing: 0.08em; }
  .brand-divider { width: 1px; height: 10px; background: rgba(255,255,255,0.35); }
  .brand-sub { font-size: 7.5px; color: rgba(255,255,255,0.65); letter-spacing: 0.22em; text-transform: uppercase; }
  .header-right { display: flex; align-items: center; gap: 16px; }
  .cross-mark { font-size: 13px; color: rgba(255,255,255,0.45); }
  .num-wrap { display: flex; align-items: center; gap: 7px; }
  .num-label { font-size: 7.5px; color: rgba(255,255,255,0.6); letter-spacing: 0.14em; text-transform: uppercase; }
  .num-pill { width: 38px; height: 20px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.4); border-radius: 4px; box-shadow: inset 0 1px 0 rgba(255,255,255,0.15); }

  /* 바디 */
  .pc-body { display: grid; grid-template-columns: 140mm 0.5px 1fr; height: 100%; }
  .vdivider { background: var(--rule); }

  /* 왼쪽 */
  .left {
    padding: 12px 16px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    background: var(--cream);
    overflow: hidden;
  }

  /* 섹션 라벨 */
  .sec-label {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.2em;
    color: var(--rose);
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 7px;
    margin-bottom: 6px;
  }
  .sec-label::after { content: ''; flex: 1; height: 0.5px; background: var(--rose-lt); }

  .section-basic, .section-pre, .section-faith { display: flex; flex-direction: column; flex-shrink: 0; }

  /* 기본 정보 그리드 */
  .info-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 1px;
    background: var(--rule);
    border: 1px solid var(--rule);
    border-radius: 6px;
    overflow: hidden;
  }

  .i-cell { background: var(--cream); padding: 6px 8px; }
  .i-cell.w3 { grid-column: span 3; }
  .i-cell.w6 { grid-column: span 6; }

  .i-label { font-size: 8px; font-weight: 500; color: var(--ink-3); letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 3px; }
  .i-val { font-size: 12px; font-weight: 500; color: var(--ink); line-height: 1.2; word-break: keep-all; }

  .tag-wrap { display: flex; flex-wrap: wrap; gap: 3px 4px; }
  .tag { font-size: 9.5px; color: var(--ink-2); background: var(--rose-bg); border: 0.5px solid var(--rose-lt); border-radius: 20px; padding: 1px 7px; white-space: nowrap; line-height: 1.5; }

  .check-row { display: flex; flex-wrap: wrap; gap: 3px 7px; align-items: center; }
  .chk { display: flex; align-items: center; gap: 3px; font-size: 10px; color: var(--ink); white-space: nowrap; }
  .chk-box {
    width: 9px; height: 9px;
    border: 1px solid var(--ink-3);
    border-radius: 1.5px;
    display: inline-flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    background: var(--cream);
  }
  .chk-box.on { background: var(--rose); border-color: var(--rose); }
  .chk-box.on::after {
    content: '';
    width: 5px; height: 3px;
    border-left: 1.5px solid #fff;
    border-bottom: 1.5px solid #fff;
    transform: rotate(-45deg) translateY(-0.5px);
    display: block;
  }

  .live-row { display: flex; align-items: center; gap: 6px; }
  .live-val { font-size: 12px; font-weight: 500; color: var(--ink); white-space: nowrap; }
  .live-checks { display: flex; gap: 5px; }
  .live-chk { display: flex; align-items: center; gap: 2.5px; font-size: 9.5px; color: var(--ink-3); white-space: nowrap; }

  /* 신앙 그리드 */
  .faith-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 1px;
    background: var(--rule);
    border: 1px solid var(--rule);
    border-radius: 6px;
    overflow: hidden;
  }
  .fa-cell { background: var(--cream); padding: 6px 8px; }
  .fa-cell.w2 { grid-column: span 2; }
  .fa-cell.w3 { grid-column: span 3; }
  .fa-cell.w6 { grid-column: span 6; }
  .fa-label { font-size: 8px; font-weight: 500; color: var(--ink-3); letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 3px; }
  .fa-val { font-size: 12px; font-weight: 500; color: var(--ink); line-height: 1.2; word-break: keep-all; }
  .fa-items { display: flex; flex-wrap: wrap; gap: 3px 7px; }

  /* 사전 정보 그리드 */
  .pre-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1px;
    background: var(--rule);
    border: 1px solid var(--rule);
    border-radius: 6px;
    overflow: hidden;
  }
  .p-cell { background: var(--cream); padding: 6px 8px; }
  .p-label { font-size: 8px; font-weight: 500; color: var(--ink-3); letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 4px; }
  .p-items { display: flex; flex-wrap: wrap; gap: 3px 7px; }

  /* 오른쪽 */
  .right {
    padding: 12px 18px;
    background: var(--cream);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .q-banner {
    background: var(--warm);
    border: 0.5px solid var(--rose-lt);
    border-left: 2px solid var(--rose-mid);
    border-radius: 0 5px 5px 0;
    padding: 6px 10px;
    flex-shrink: 0;
  }
  .q-banner-txt { font-size: 10px; color: var(--ink-3); line-height: 1.6; word-break: keep-all; }

  .q-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 0 20px; flex: 1; }
  .q-group { margin-bottom: 10px; }
  .q-group-label {
    font-size: 8px; font-weight: 600; letter-spacing: 0.2em; color: var(--rose);
    text-transform: uppercase; margin-bottom: 5px;
    display: flex; align-items: center; gap: 5px;
  }
  .q-group-label::after { content: ''; flex: 1; height: 0.5px; background: var(--rose-lt); }
  .q-row { display: flex; align-items: flex-start; gap: 7px; padding: 4.5px 0; border-bottom: 0.5px solid #f2e6ea; }
  .q-row:last-child { border-bottom: none; }
  .q-dot { width: 3.5px; height: 3.5px; background: var(--rose-mid); border-radius: 50%; flex-shrink: 0; margin-top: 6px; }
  .q-txt { font-size: 11px; color: var(--ink); line-height: 1.5; letter-spacing: -0.01em; word-break: keep-all; }
  .q-hint { display: block; font-size: 9px; color: var(--rose-mid); margin-top: 1px; font-weight: 300; }

  .tip-row { margin-top: auto; padding-top: 6px; border-top: 0.5px dashed var(--rule); display: flex; align-items: flex-start; gap: 5px; }
  .tip-icon { font-size: 10px; color: var(--rose-mid); flex-shrink: 0; margin-top: 1px; }
  .tip-txt { font-size: 9px; color: var(--ink-3); line-height: 1.6; word-break: keep-all; }

  /* 메모 테이블 */
  .memo-section { flex-shrink: 0; display: flex; flex-direction: column; gap: 5px; }
  .memo-table { width: 100%; border-collapse: collapse; border: 1px solid var(--rule); border-radius: 6px; overflow: hidden; }
  .memo-table thead tr { background: var(--rose-bg); }
  .memo-table th { font-size: 8px; font-weight: 600; letter-spacing: 0.14em; color: var(--rose); text-transform: uppercase; padding: 5px 10px; text-align: left; border-bottom: 1px solid var(--rule); }
  .memo-table th.col-num { width: 40px; text-align: center; border-right: 1px solid var(--rule); }
  .memo-table td { padding: 0; border-bottom: 0.5px solid var(--rule); background: var(--cream); height: 22px; }
  .memo-table tr:last-child td { border-bottom: none; }
  .memo-table td.col-num { font-size: 10px; font-weight: 600; color: var(--rose-mid); text-align: center; width: 40px; border-right: 1px solid var(--rule); }

  .section-gap { height: 12px; flex-shrink: 0; }

  .panel-title-wrap { display: flex; flex-direction: column; gap: 6px; flex-shrink: 0; }
  .panel-title { font-size: 15px; font-weight: 700; color: var(--ink); letter-spacing: -0.02em; line-height: 1; word-break: keep-all; }

  /* Q&A */
  .section-qa { flex: 1; overflow: hidden; }
  .qa-grid { columns: 2; column-gap: 8px; }
  .qa-item { break-inside: avoid; margin-bottom: 6px; background: var(--warm); border: 0.5px solid var(--rose-lt); border-radius: 5px; padding: 6px 9px; }
  .qa-q { font-size: 7.5px; font-weight: 600; color: var(--rose-mid); margin-bottom: 3px; word-break: keep-all; line-height: 1.3; }
  .qa-a { font-size: 9.5px; color: var(--ink); line-height: 1.55; word-break: keep-all; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; }
  .qa-empty { font-size: 11px; color: var(--ink-3); padding: 16px 0; }

  /* 인쇄 */
  @page { size: A4 landscape; margin: 0; }

  @media print {
    .no-print { display: none !important; }
    html, body { background: white !important; }
    .card-wrap { background: white !important; }
    .card { box-shadow: none !important; width: 297mm !important; height: 210mm !important; border-radius: 0 !important; }
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    color-adjust: exact;
  }
`;

const VALID_STATUSES: ProfileStatus[] = ['검토중', '대기', '확정', '반려', '취소'];

interface PageProps {
  searchParams: { status?: string };
}

export default async function PrintPage({ searchParams }: PageProps) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  const rawStatus = searchParams.status;
  const statusFilter: ProfileStatus | null =
    rawStatus && VALID_STATUSES.includes(rawStatus as ProfileStatus)
      ? (rawStatus as ProfileStatus)
      : null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from('applications')
    .select('*, profiles(*)')
    .order('created_at', { ascending: true });

  if (statusFilter) {
    query = query.eq('status', statusFilter);
  } else {
    query = query.eq('status', '확정');
  }

  const { data: applications } = await query;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const list = ((applications as any[]) ?? []).filter((a) => a.profiles);

  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: PRINT_STYLES }} />

      {/* 컨트롤 바 (인쇄 시 숨김) */}
      <PrintControls total={list.length} currentStatus={statusFilter} />

      {/* 카드 목록 */}
      {list.length === 0 ? (
        <div className="no-print flex min-h-screen items-center justify-center text-sm text-gray-400">
          출력할 프로필이 없어요.
        </div>
      ) : (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        list.map((app: any) => (
          <ProfileCardTemplate key={app.id} profile={app.profiles} />
        ))
      )}
    </>
  );
}
