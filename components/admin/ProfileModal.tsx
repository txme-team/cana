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

function formatEventDate(dateStr: string) {
  const d = new Date(dateStr);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getMonth() + 1}/${d.getDate()}(${days[d.getDay()]})`;
}

export default function ProfileModal({ profile, onClose, onStatusChange, onUpdate }: ProfileModalProps) {
  const pr = profile.profiles;

  const [status, setStatus]                 = useState<ProfileStatus>(profile.status ?? '검토중');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [requestAction, setRequestAction]   = useState<'cancel' | 'reschedule' | null>(null);
  const [events, setEvents]                 = useState<EventOption[]>([]);
  const [targetEventId, setTargetEventId]   = useState('');
  const [processing, setProcessing]         = useState(false);
  const [photoUrl, setPhotoUrl]             = useState<string | null>(null);
  const [showFullPhoto, setShowFullPhoto]   = useState(false);

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

  // 프로필 사진
  useEffect(() => {
    const raw = pr?.photo_urls?.[0];
    if (!raw) return;
    fetch(`/api/admin/signed-url?url=${encodeURIComponent(raw)}`)
      .then((r) => r.json())
      .then(({ signedUrl }) => { if (signedUrl) setPhotoUrl(signedUrl); })
      .catch(() => {});
  }, [pr?.photo_urls]);

  // 일정 변경 이벤트 목록
  useEffect(() => {
    if (requestAction !== 'reschedule') return;
    fetch('/api/admin/events')
      .then((r) => r.json())
      .then((data: EventOption[]) => {
        setEvents(Array.isArray(data) ? data.filter((e) => e.id !== profile.event_id) : []);
      });
  }, [requestAction, profile.event_id]);

  if (!pr) return null;

  const birthYear = pr.birth_year < 100 ? 1900 + pr.birth_year : pr.birth_year;
  const hasEventContext = !!profile.event_id;
  const isConfirmed = status === '확정';
  const isRejected  = status === '반려';

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm p-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-5xl rounded-2xl bg-white shadow-2xl flex overflow-hidden"
        style={{ maxHeight: 'calc(100vh - 48px)' }}
      >

        {/* 닫기 버튼 (모달 전체 우측 상단) */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* ── 좌 패널 ── */}
        <div className="w-80 flex-shrink-0 border-r border-gray-100 flex flex-col overflow-y-auto bg-gray-50/40">

          {/* 사진 + 신원 */}
          <div className="flex flex-col items-center gap-4 px-5 pt-10 pb-5 flex-shrink-0">
            {/* 사진 */}
            {photoUrl ? (
              <button
                type="button"
                onClick={() => setShowFullPhoto(true)}
                className="block h-[280px] w-[280px] overflow-hidden rounded-2xl border border-gray-200 shadow-sm"
              >
                <img
                  src={photoUrl}
                  alt={pr.nickname}
                  className="h-full w-full object-cover"
                />
              </button>
            ) : (
              <div className="h-[280px] w-[280px] rounded-2xl bg-gray-100 flex items-center justify-center text-gray-300 text-3xl border border-gray-200">
                👤
              </div>
            )}

            {/* 이름 - 년생 - 상태 뱃지 */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex items-center gap-2">
                <p className="text-base font-semibold text-gray-900">{pr.nickname}</p>
                <span className="text-sm text-gray-400">{birthYear}년생</span>
              </div>
              <StatusBadge status={status} />
            </div>

            {/* 핵심 정보 */}
            <div className="w-full space-y-2.5">
              <div>
                <p className="mb-0.5 text-[10px] text-gray-400">성별</p>
                <p className="text-sm text-gray-800">{pr.gender === 'male' ? '남성' : '여성'}</p>
              </div>
              <div>
                <p className="mb-0.5 text-[10px] text-gray-400">MBTI</p>
                <p className="text-sm text-gray-800">{pr.mbti ?? '—'}</p>
              </div>
              {pr.phone && (
                <div>
                  <p className="mb-0.5 text-[10px] text-gray-400">연락처</p>
                  <p className="font-mono text-sm text-gray-800">{pr.phone}</p>
                </div>
              )}
              {pr.church_name && (
                <div>
                  <p className="mb-0.5 text-[10px] text-gray-400">교회</p>
                  <p className="text-sm text-gray-800">{pr.church_name}</p>
                </div>
              )}
            </div>
          </div>

          {/* 구분선 */}
          <div className="mx-4 border-t border-gray-200 flex-shrink-0" />

          {/* ── CTA 영역 ── */}
          <div className="flex flex-col gap-2 p-4 flex-shrink-0">

            {requestAction === null && (
              <>
                {/* Primary: 확정 / 반려 */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusChange('확정')}
                    disabled={updatingStatus || isConfirmed}
                    className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${
                      isConfirmed
                        ? 'bg-gray-100 text-gray-300 cursor-default'
                        : 'bg-cana text-white hover:opacity-90 active:scale-[0.98]'
                    }`}
                  >
                    확정
                  </button>
                  <button
                    onClick={() => handleStatusChange('반려')}
                    disabled={updatingStatus || isRejected}
                    className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${
                      isRejected
                        ? 'bg-gray-100 text-gray-300 cursor-default'
                        : 'border border-red-200 bg-white text-red-500 hover:bg-red-50 active:scale-[0.98]'
                    }`}
                  >
                    반려
                  </button>
                </div>

                {/* Secondary: 부가 액션 */}
                {hasEventContext && (
                  <div className="mt-1 flex flex-col gap-0.5">
                    <div className="mb-1 border-t border-gray-100" />
                    <button
                      onClick={() => handleStatusChange('대기')}
                      disabled={updatingStatus || status === '대기'}
                      className="w-full rounded-lg px-2 py-1.5 text-left text-xs text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:opacity-40"
                    >
                      대기 처리
                    </button>
                    <button
                      onClick={() => setRequestAction('reschedule')}
                      className="w-full rounded-lg px-2 py-1.5 text-left text-xs text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                    >
                      일정 변경
                    </button>
                    <button
                      onClick={() => setRequestAction('cancel')}
                      className="w-full rounded-lg px-2 py-1.5 text-left text-xs text-red-300 transition hover:bg-red-50 hover:text-red-500"
                    >
                      취소 처리
                    </button>
                  </div>
                )}
              </>
            )}

            {/* 취소 확인 */}
            {requestAction === 'cancel' && (
              <div className="flex flex-col gap-3">
                <p className="text-xs font-medium text-gray-700">취소 처리하시겠어요?</p>
                <p className="text-[11px] leading-relaxed text-gray-400">
                  상태가 <span className="font-medium text-gray-600">취소</span>로 변경되며 이벤트 명단에서 제외돼요.
                </p>
                <button
                  onClick={handleCancel}
                  disabled={processing}
                  className="w-full rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
                >
                  {processing ? '처리 중...' : '취소 확정'}
                </button>
                <button
                  onClick={() => setRequestAction(null)}
                  disabled={processing}
                  className="w-full text-xs text-gray-400 transition hover:text-gray-600"
                >
                  돌아가기
                </button>
              </div>
            )}

            {/* 일정 변경 */}
            {requestAction === 'reschedule' && (
              <div className="flex flex-col gap-3">
                <p className="text-xs font-medium text-gray-700">이동할 이벤트 선택</p>
                {events.length === 0 ? (
                  <p className="text-xs text-gray-400">이동 가능한 이벤트가 없어요.</p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {events.map((ev) => (
                      <label
                        key={ev.id}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 text-xs transition ${
                          targetEventId === ev.id
                            ? 'border-cana bg-cana/5 text-cana'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
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
                        <span className="ml-auto text-gray-400">{formatEventDate(ev.event_date)}</span>
                      </label>
                    ))}
                  </div>
                )}
                <button
                  onClick={handleReschedule}
                  disabled={processing || !targetEventId}
                  className="w-full rounded-xl bg-cana py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  {processing ? '처리 중...' : '이동 확정'}
                </button>
                <button
                  onClick={() => { setRequestAction(null); setTargetEventId(''); }}
                  className="w-full text-xs text-gray-400 transition hover:text-gray-600"
                >
                  돌아가기
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── 우 패널 ── */}
        <div className="flex-1 overflow-y-auto px-7 py-6">
          <AdminProfileDetail profile={pr} />
        </div>

      </div>

      {/* 프로필 사진 전체보기 */}
      {showFullPhoto && photoUrl && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-6"
          onClick={() => setShowFullPhoto(false)}
        >
          <img
            src={photoUrl}
            alt={pr.nickname}
            className="max-h-full max-w-full rounded-lg object-contain"
          />
        </div>
      )}
    </div>
  );
}
