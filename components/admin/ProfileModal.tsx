'use client';

import { useEffect, useState } from 'react';
import type { ApplicationWithProfile, ProfileStatus } from '@/lib/types';
import AdminProfileDetail from './AdminProfileDetail';
import StatusBadge from './StatusBadge';

interface EventOption {
  id: string;
  title: string;
  event_date: string;
}

interface ProfileModalProps {
  profile: ApplicationWithProfile;
  onClose: () => void;
  onStatusChange: (id: string, status: ProfileStatus) => void;
  onUpdate?: () => void;
}

const STATUS_OPTIONS: { value: ProfileStatus; label: string }[] = [
  { value: '검토중', label: '검토중' },
  { value: '대기',   label: '대기'   },
  { value: '확정',   label: '확정'   },
  { value: '반려',   label: '반려'   },
  { value: '취소',   label: '취소'   },
];

function formatEventDate(dateStr: string) {
  const d = new Date(dateStr);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getMonth() + 1}/${d.getDate()}(${days[d.getDay()]})`;
}

export default function ProfileModal({ profile, onClose, onStatusChange, onUpdate }: ProfileModalProps) {
  const pr = profile.profiles;

  const [status, setStatus]               = useState<ProfileStatus>(profile.status ?? '검토중');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [requestAction, setRequestAction]   = useState<'cancel' | 'reschedule' | null>(null);
  const [events, setEvents]               = useState<EventOption[]>([]);
  const [targetEventId, setTargetEventId] = useState('');
  const [processing, setProcessing]       = useState(false);

  // ESC 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // body 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // 일정 변경 패널 열릴 때 이벤트 목록 로드
  useEffect(() => {
    if (requestAction !== 'reschedule') return;
    fetch('/api/admin/events')
      .then((r) => r.json())
      .then((data: EventOption[]) => {
        setEvents(Array.isArray(data) ? data.filter((e) => e.id !== profile.event_id) : []);
      });
  }, [requestAction, profile.event_id]);

  if (!pr) return null;

  const handleStatusChange = async (next: ProfileStatus) => {
    setUpdatingStatus(true);
    const res = await fetch('/api/admin/update-status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: profile.id, status: next }),
    });
    if (res.ok) {
      setStatus(next);
      onStatusChange(profile.id, next);
    }
    setUpdatingStatus(false);
  };

  const handleCancel = async () => {
    setProcessing(true);
    const res = await fetch('/api/admin/update-status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: profile.id, status: '취소' }),
    });
    if (res.ok) {
      setStatus('취소');
      onStatusChange(profile.id, '취소');
      onUpdate?.();
      setRequestAction(null);
    }
    setProcessing(false);
  };

  const handleReschedule = async () => {
    if (!targetEventId) return;
    setProcessing(true);
    const res = await fetch(`/api/admin/applications/${profile.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_id: targetEventId }),
    });
    if (res.ok) {
      onUpdate?.();
      onClose();
    }
    setProcessing(false);
  };

  const hasEventContext = !!profile.event_id;
  const birthYear = pr.birth_year < 100 ? 1900 + pr.birth_year : pr.birth_year;
  const displayYear = String(birthYear).slice(2) + '년생';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 backdrop-blur-sm">
      <div className="relative my-6 w-full max-w-3xl rounded-2xl bg-white shadow-2xl mx-4">

        {/* ── 헤더 ── */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-semibold text-gray-900">{pr.nickname}</span>
            <span className="text-sm text-gray-400">
              {pr.gender === 'male' ? '남' : '여'} · {displayYear} · {pr.job ?? '—'}
            </span>
            <StatusBadge status={status} />
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── 액션 바 ── */}
        <div className="border-b border-gray-100 bg-gray-50 px-6 py-3">
          {requestAction === null && (
            <div className="flex items-center gap-3">
              {/* 상태 변경 */}
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value as ProfileStatus)}
                disabled={updatingStatus}
                className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-700 outline-none focus:border-cana disabled:opacity-60"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              {/* 취소·일정변경 버튼 (이벤트 연결된 경우만) */}
              {hasEventContext && (
                <div className="ml-auto flex items-center gap-2">
                  <button
                    onClick={() => setRequestAction('reschedule')}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-100"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 3M21 7.5H7.5" />
                    </svg>
                    일정 변경
                  </button>
                  <button
                    onClick={() => setRequestAction('cancel')}
                    className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm text-red-500 transition hover:bg-red-50"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    취소 처리
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 취소 확인 */}
          {requestAction === 'cancel' && (
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-800">취소 처리하시겠어요?</p>
                <p className="text-xs text-gray-400 mt-0.5">상태가 <span className="font-medium text-gray-600">취소</span>로 변경되며 해당 이벤트 명단에서 제외돼요.</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => setRequestAction(null)}
                  disabled={processing}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-100 disabled:opacity-50"
                >
                  돌아가기
                </button>
                <button
                  onClick={handleCancel}
                  disabled={processing}
                  className="rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-600 disabled:opacity-50"
                >
                  {processing ? '처리 중...' : '취소 확정'}
                </button>
              </div>
            </div>
          )}

          {/* 일정 변경 */}
          {requestAction === 'reschedule' && (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium text-gray-800">
                이동할 이벤트를 선택해주세요
                <span className="ml-2 text-xs font-normal text-gray-400">현재 상태({status})가 그대로 유지돼요.</span>
              </p>
              {events.length === 0 ? (
                <p className="text-sm text-gray-400">이동 가능한 이벤트가 없어요.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {events.map((ev) => (
                    <label
                      key={ev.id}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                        targetEventId === ev.id
                          ? 'border-cana bg-cana/5 text-cana'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="target-event"
                        value={ev.id}
                        checked={targetEventId === ev.id}
                        onChange={() => setTargetEventId(ev.id)}
                        className="sr-only"
                      />
                      <span className="font-medium">{ev.title}</span>
                      <span className="text-xs text-gray-400">{formatEventDate(ev.event_date)}</span>
                    </label>
                  ))}
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => { setRequestAction(null); setTargetEventId(''); }}
                  disabled={processing}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-100 disabled:opacity-50"
                >
                  돌아가기
                </button>
                <button
                  onClick={handleReschedule}
                  disabled={processing || !targetEventId}
                  className="rounded-lg bg-cana px-3 py-1.5 text-sm font-medium text-white transition hover:bg-cana-dark disabled:opacity-50"
                >
                  {processing ? '처리 중...' : '이동 확정'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── 프로필 본문 ── */}
        <div className="overflow-y-auto px-6 py-5" style={{ maxHeight: 'calc(80vh - 120px)' }}>
          <AdminProfileDetail profile={pr} />
        </div>

      </div>
    </div>
  );
}
