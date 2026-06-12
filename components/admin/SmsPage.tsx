'use client';

import { useEffect, useRef, useState } from 'react';
import { type SmsTemplate, substituteVars, buildEventVars, approxBytes, getSmsType } from '@/lib/sms-templates';

// ─── 타입 ──────────────────────────────────────────────────────────────────────

interface EventOption {
  id: string;
  title: string;
  event_date: string;
  location: string;
  venue_name?: string | null;
  venue_url?: string | null;
  venue_detail?: string | null;
}

// ─── 상수 ──────────────────────────────────────────────────────────────────────

const TRIGGER_STYLE: Record<string, { label: string; cls: string }> = {
  auto:      { label: '자동',  cls: 'bg-green-50  text-green-700' },
  manual:    { label: '수동',  cls: 'bg-blue-50   text-blue-700'  },
  scheduled: { label: '예약',  cls: 'bg-amber-50  text-amber-700' },
};

const MANUAL_SEND_VARS = ['profile_card_url', 'survey_url'] as const;

// ─── 유틸 ──────────────────────────────────────────────────────────────────────

function previewText(
  content: string,
  event: EventOption | null,
  extraVars: Record<string, string>,
): string {
  if (!event) return content;
  const eventVars = buildEventVars(event);
  return substituteVars(content, { name: '홍길동', ...eventVars, ...extraVars });
}

// ─── 메인 컴포넌트 ─────────────────────────────────────────────────────────────

export default function SmsPage() {
  const [templates, setTemplates]         = useState<SmsTemplate[]>([]);
  const [events, setEvents]               = useState<EventOption[]>([]);
  const [selectedKey, setSelectedKey]     = useState<string>('');
  const [editContent, setEditContent]     = useState('');
  const [saving, setSaving]               = useState(false);
  const [saveOk, setSaveOk]               = useState(false);
  const [toggling, setToggling]           = useState(false);

  // 수동 발송 폼
  const [sendEventId, setSendEventId]     = useState('');
  const [recipients, setRecipients]       = useState<'confirmed' | 'all_active'>('confirmed');
  const [extraVars, setExtraVars]         = useState<Record<string, string>>({});

  // 발송 모달
  const [sendModal, setSendModal]         = useState(false);
  const [sending, setSending]             = useState(false);
  const [sendResult, setSendResult]       = useState<{ sent: number } | null>(null);
  const [sendError, setSendError]         = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── 데이터 로드 ──────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/admin/sms-templates')
      .then((r) => r.json())
      .then((data: SmsTemplate[]) => {
        setTemplates(data);
        if (data.length > 0) selectTemplate(data[0]);
      });
    fetch('/api/admin/events')
      .then((r) => r.json())
      .then((data: EventOption[]) => setEvents(data));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function selectTemplate(t: SmsTemplate) {
    setSelectedKey(t.key);
    setEditContent(t.content);
    setSaveOk(false);
    setExtraVars({});
    setSendEventId('');
    setRecipients('confirmed');
    setSendResult(null);
    setSendError('');
  }

  const selected = templates.find((t) => t.key === selectedKey);

  // ── 저장 ─────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!selectedKey) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/sms-templates/${selectedKey}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      // 로컬 state 업데이트
      setTemplates((prev) =>
        prev.map((t) => t.key === selectedKey ? { ...t, content: editContent } : t),
      );
      setSaveOk(true);
      setTimeout(() => setSaveOk(false), 2000);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  // ── 자동/예약 발송 ON/OFF 토글 ───────────────────────────────────────────────
  const handleToggleEnabled = async (next: boolean) => {
    if (!selectedKey) return;
    setToggling(true);
    try {
      const res = await fetch(`/api/admin/sms-templates/${selectedKey}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: next }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setTemplates((prev) =>
        prev.map((t) => t.key === selectedKey ? { ...t, enabled: next } : t),
      );
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setToggling(false);
    }
  };

  // ── 변수 삽입 (커서 위치에 {{key}} 삽입) ────────────────────────────────────
  const insertVar = (varKey: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end   = ta.selectionEnd;
    const ins   = `{{${varKey}}}`;
    const next  = editContent.slice(0, start) + ins + editContent.slice(end);
    setEditContent(next);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + ins.length, start + ins.length);
    }, 0);
  };

  // ── 수동 발송 ────────────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!selectedKey || !sendEventId) return;
    setSending(true);
    setSendError('');
    try {
      const res = await fetch(`/api/admin/sms-templates/${selectedKey}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: sendEventId, recipients, extraVars }),
      });
      const json = await res.json() as { ok?: boolean; sent?: number; error?: string };
      if (!res.ok) throw new Error(json.error ?? '발송 실패');
      setSendResult({ sent: json.sent ?? 0 });
    } catch (err) {
      setSendError((err as Error).message);
    } finally {
      setSending(false);
    }
  };

  const selectedEvent = events.find((e) => e.id === sendEventId) ?? null;

  // ── 이 템플릿에서 입력 필요한 extraVar 목록 ──────────────────────────────────
  const neededExtraVars = selected
    ? MANUAL_SEND_VARS.filter((k) => selected.content.includes(`{{${k}}}`))
    : [];

  // ─── 렌더 ─────────────────────────────────────────────────────────────────────
  return (
    <main className="flex min-h-screen">

      {/* ── 좌측 템플릿 목록 ─────────────────────────────────────────────────── */}
      <aside className="w-64 flex-shrink-0 border-r border-gray-100 bg-white px-3 py-6">
        <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
          문자 종류
        </p>
        <ul className="flex flex-col gap-1">
          {templates.map((t) => {
            const badge = TRIGGER_STYLE[t.trigger_type];
            const isSelected = t.key === selectedKey;
            return (
              <li key={t.key}>
                <button
                  onClick={() => selectTemplate(t)}
                  className={[
                    'w-full rounded-xl px-3 py-2.5 text-left transition',
                    isSelected
                      ? 'bg-cana/8 text-cana'
                      : 'text-gray-600 hover:bg-gray-50',
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-sm font-medium ${isSelected ? 'text-cana' : ''}`}>
                      {t.name}
                    </span>
                    <div className="flex flex-shrink-0 items-center gap-1">
                      {t.trigger_type !== 'manual' && t.enabled === false && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-400">
                          꺼짐
                        </span>
                      )}
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </div>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-gray-400">{t.trigger_desc}</p>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* ── 우측 상세 ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto px-6 py-8">
        {!selected ? (
          <div className="flex h-64 items-center justify-center text-gray-400">
            좌측에서 문자 종류를 선택하세요
          </div>
        ) : (
          <div className="mx-auto max-w-2xl flex flex-col gap-6">

            {/* 헤더 */}
            <div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-gray-900">{selected.name}</h2>
                  <span className={`rounded-full px-2.5 py-1 text-sm font-medium ${TRIGGER_STYLE[selected.trigger_type].cls}`}>
                    {TRIGGER_STYLE[selected.trigger_type].label}
                  </span>
                </div>

                {/* 자동/예약 발송 ON/OFF — 수동 발송은 토글 불필요 */}
                {selected.trigger_type !== 'manual' && (
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{selected.enabled === false ? '발송 꺼짐' : '발송 켜짐'}</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={selected.enabled !== false}
                      disabled={toggling}
                      onClick={() => handleToggleEnabled(!(selected.enabled !== false))}
                      className={[
                        'relative h-6 w-11 flex-shrink-0 rounded-full transition disabled:opacity-50',
                        selected.enabled === false ? 'bg-gray-200' : 'bg-cana',
                      ].join(' ')}
                    >
                      <span
                        className={[
                          'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition',
                          selected.enabled === false ? 'left-0.5' : 'left-[1.375rem]',
                        ].join(' ')}
                      />
                    </button>
                  </label>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-500">{selected.trigger_desc}</p>
              {selected.enabled === false && selected.trigger_type !== 'manual' && (
                <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  현재 자동/예약 발송이 꺼져 있어요. 필요할 때 위 &apos;수동 발송&apos;으로 직접 보내주세요.
                </p>
              )}
            </div>

            {/* ── 문자 내용 편집 ────────────────────────────────────────────── */}
            <section className="rounded-2xl border border-gray-100 bg-white p-6">
              <h3 className="mb-4 text-base font-semibold text-gray-700">문자 내용</h3>

              {/* 변수 태그 */}
              <div className="mb-3 flex flex-wrap gap-1.5">
                {selected.variables.map((v) => (
                  <button
                    key={v.key}
                    title={v.desc}
                    onClick={() => insertVar(v.key)}
                    className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-600 transition hover:border-cana/40 hover:bg-cana/5 hover:text-cana"
                  >
                    {`{{${v.key}}}`}
                    <span className="ml-1 text-gray-400">{v.label}</span>
                  </button>
                ))}
              </div>

              {/* 텍스트에리어 */}
              <textarea
                ref={textareaRef}
                value={editContent}
                onChange={(e) => { setEditContent(e.target.value); setSaveOk(false); }}
                rows={6}
                className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm leading-relaxed text-gray-800 outline-none focus:border-cana focus:ring-1 focus:ring-cana/20"
              />

              {/* 바이트 카운터 */}
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>≈ {approxBytes(editContent)} bytes</span>
                  <span className={`rounded-full px-2 py-0.5 font-medium ${
                    getSmsType(editContent) === 'SMS'
                      ? 'bg-green-50 text-green-600'
                      : 'bg-amber-50 text-amber-600'
                  }`}>
                    {getSmsType(editContent)}
                  </span>
                  <span className="text-gray-300">· 변수 길이에 따라 달라질 수 있어요</span>
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving || editContent === selected.content}
                  className="rounded-xl bg-cana px-4 py-2 text-sm font-medium text-white transition hover:bg-cana-dark disabled:opacity-40"
                >
                  {saving ? '저장 중...' : saveOk ? '✓ 저장됨' : '저장'}
                </button>
              </div>

              {/* 변수 설명 */}
              {selected.variables.length > 0 && (
                <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3">
                  <p className="mb-2 text-xs font-semibold text-gray-500">사용 가능한 변수</p>
                  <ul className="flex flex-col gap-1">
                    {selected.variables.map((v) => (
                      <li key={v.key} className="flex items-baseline gap-2 text-xs">
                        <code className="font-mono text-cana">{`{{${v.key}}}`}</code>
                        <span className="font-medium text-gray-700">{v.label}</span>
                        <span className="text-gray-400">{v.desc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {/* ── 수동 발송 ─────────────────────────────────────────────────── */}
            <section className="rounded-2xl border border-gray-100 bg-white p-6">
              <h3 className="mb-4 text-base font-semibold text-gray-700">수동 발송</h3>

              <div className="flex flex-col gap-4">
                {/* 이벤트 선택 */}
                <div>
                  <label className="mb-1.5 block text-sm text-gray-500">이벤트 선택</label>
                  <select
                    value={sendEventId}
                    onChange={(e) => { setSendEventId(e.target.value); setSendResult(null); setSendError(''); }}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-cana focus:ring-1 focus:ring-cana/20"
                  >
                    <option value="">— 이벤트를 선택하세요 —</option>
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>{ev.title}</option>
                    ))}
                  </select>
                </div>

                {/* 수신 대상 */}
                <div>
                  <label className="mb-1.5 block text-sm text-gray-500">수신 대상</label>
                  <div className="flex gap-4">
                    {([
                      { value: 'confirmed',  label: '확정자만' },
                      { value: 'all_active', label: '전체 활성 신청자 (검토중+대기+확정)' },
                    ] as const).map(({ value, label }) => (
                      <label key={value} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                        <input
                          type="radio"
                          name="recipients"
                          value={value}
                          checked={recipients === value}
                          onChange={() => setRecipients(value)}
                          className="accent-cana"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* 추가 변수 입력 (profile_card_url, survey_url) */}
                {neededExtraVars.length > 0 && (
                  <div className="flex flex-col gap-3 rounded-xl bg-amber-50/60 px-4 py-3">
                    <p className="text-xs font-semibold text-amber-700">추가 입력 필요 (링크)</p>
                    {neededExtraVars.map((k) => {
                      const def = selected.variables.find((v) => v.key === k);
                      return (
                        <div key={k}>
                          <label className="mb-1 block text-xs text-gray-500">
                            {def?.label ?? k}
                          </label>
                          <input
                            value={extraVars[k] ?? ''}
                            onChange={(e) => setExtraVars((p) => ({ ...p, [k]: e.target.value }))}
                            placeholder="https://..."
                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-cana focus:ring-1 focus:ring-cana/20"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 미리보기 */}
                {sendEventId && (
                  <div>
                    <p className="mb-1.5 text-sm text-gray-500">
                      미리보기
                      <span className="ml-1.5 text-xs text-gray-400">(이름은 &apos;홍길동&apos;으로 표시)</span>
                    </p>
                    <div className="whitespace-pre-wrap rounded-xl bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-700">
                      {previewText(editContent, selectedEvent, extraVars)}
                    </div>
                  </div>
                )}

                {/* 에러 / 결과 */}
                {sendError && (
                  <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{sendError}</p>
                )}
                {sendResult && (
                  <p className="rounded-xl bg-green-50 px-4 py-2.5 text-sm text-green-700">
                    ✓ {sendResult.sent}명에게 발송 완료
                  </p>
                )}

                <button
                  onClick={() => { setSendModal(true); setSendResult(null); setSendError(''); }}
                  disabled={!sendEventId}
                  className="self-end rounded-xl bg-cana px-5 py-2.5 text-sm font-medium text-white transition hover:bg-cana-dark disabled:opacity-40"
                >
                  발송하기
                </button>
              </div>
            </section>

          </div>
        )}
      </div>

      {/* ── 발송 확인 모달 ──────────────────────────────────────────────────────── */}
      {sendModal && selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => { if (!sending) setSendModal(false); }}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {sendResult ? (
              <div className="flex flex-col items-center gap-4 py-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cana/10">
                  <svg className="h-6 w-6 text-cana" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-800">발송 완료</p>
                  <p className="mt-1 text-sm text-gray-500">
                    <span className="font-medium text-gray-700">{sendResult.sent}명</span>에게 문자를 발송했어요.
                  </p>
                </div>
                <button
                  onClick={() => setSendModal(false)}
                  className="w-full rounded-xl bg-cana py-2.5 text-base font-medium text-white"
                >
                  확인
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-50">
                    <svg className="h-5 w-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-gray-800">문자 발송 확인</h3>
                </div>

                <div className="mb-2 space-y-1.5 text-sm text-gray-600">
                  <p><span className="font-medium text-gray-700">템플릿:</span> {selected.name}</p>
                  <p><span className="font-medium text-gray-700">이벤트:</span> {events.find((e) => e.id === sendEventId)?.title ?? '-'}</p>
                  <p><span className="font-medium text-gray-700">수신 대상:</span> {recipients === 'confirmed' ? '확정자' : '전체 활성 신청자'}</p>
                </div>

                {/* 미리보기 */}
                <div className="my-4 max-h-32 overflow-auto whitespace-pre-wrap rounded-xl bg-gray-50 px-3 py-2.5 text-xs leading-relaxed text-gray-600">
                  {previewText(editContent, selectedEvent, extraVars)}
                </div>

                <p className="mb-5 text-xs text-gray-400">
                  발송 후 취소할 수 없어요. 내용을 다시 한 번 확인해 주세요.
                </p>

                {sendError && (
                  <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">{sendError}</p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setSendModal(false)}
                    disabled={sending}
                    className="flex-1 rounded-xl border border-gray-200 py-2.5 text-base text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={sending}
                    className="flex-1 rounded-xl bg-cana py-2.5 text-base font-medium text-white transition hover:bg-cana-dark disabled:opacity-50"
                  >
                    {sending ? '발송 중...' : '발송'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
