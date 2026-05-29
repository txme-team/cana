'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { MeetingNote } from '@/lib/types';

const QUESTIONS = {
  '처음 만났을 때': [
    '오늘 여기 오기 전에 뭐 하셨어요?',
    '여기 자주 오시는 동네예요?',
  ],
  '일상': [
    '퇴근 후에는 주로 뭐하세요?',
    '쉬는 날 주로 어떻게 보내세요?',
    '꾸준히 하는 운동이 있나요?',
    '어떤 음식 좋아하세요?',
  ],
  '연애': [
    '연애할 때 어떤 스타일인지 알아요?',
    '어떤 사람한테 끌리는 것 같아요?',
    '리드하는 편이에요, 따라가는 편이에요?',
    '데이트할 때 계획 세우는 편, 즉흥적인 편?',
    '어떤 데이트를 좋아하세요?',
    '첫 데이트로 가고 싶은 곳 있어요?',
  ],
  '신앙': [
    '어떻게 교회를 다니게 됐어요?',
    '예배 끝나면 보통 뭐하세요?',
    '신앙 스타일이 어떤 편이에요?',
  ],
};

const INITIAL_NOTES: MeetingNote[] = Array.from({ length: 10 }, (_, i) => ({
  number: i + 1,
  memo: '',
}));

interface MeetingCardProps {
  profileId: string;
  initialNotes?: MeetingNote[];
  meetingId?: string;
}

export default function MeetingCard({ profileId, initialNotes, meetingId }: MeetingCardProps) {
  const [notes, setNotes] = useState<MeetingNote[]>(
    initialNotes?.length ? initialNotes : INITIAL_NOTES
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const updateMemo = (number: number, memo: string) => {
    setNotes((prev) => prev.map((n) => (n.number === number ? { ...n, memo } : n)));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();

    if (meetingId) {
      await supabase.from('meetings').update({ notes } as never).eq('id', meetingId);
    } else {
      await supabase.from('meetings').insert({ profile_id: profileId, notes } as never);
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 미팅 카드 */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-cana">미팅 카드</span>
            <div className="h-px w-16 bg-cana/20" />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-md bg-cana px-3 py-1 text-sm font-medium text-white transition hover:bg-cana-dark disabled:opacity-60"
          >
            {saving ? '저장 중...' : saved ? '저장됨 ✓' : '저장'}
          </button>
        </div>

        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="w-10 py-1.5 text-left font-medium text-gray-400">번호</th>
              <th className="py-1.5 text-left font-medium text-gray-400">메모</th>
            </tr>
          </thead>
          <tbody>
            {notes.map((note) => (
              <tr key={note.number} className="border-b border-gray-50">
                <td className="py-1.5 pr-3 text-gray-400">{note.number}</td>
                <td className="py-1">
                  <input
                    type="text"
                    value={note.memo}
                    onChange={(e) => updateMemo(note.number, e.target.value)}
                    placeholder="메모"
                    className="w-full rounded border-0 bg-transparent px-1 py-0.5 text-sm text-gray-700 outline-none placeholder:text-gray-200 focus:bg-gray-50 focus:ring-0"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 추천 질문 */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <span className="text-[11px] font-medium text-cana">추천 질문</span>
          <div className="h-px flex-1 bg-cana/20" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Object.entries(QUESTIONS).map(([category, questions]) => (
            <div key={category}>
              <p className="mb-1.5 text-[10px] font-medium text-gray-400">{category}</p>
              <ul className="flex flex-col gap-1">
                {questions.map((q) => (
                  <li key={q} className="flex items-start gap-1.5 text-sm text-gray-600">
                    <span className="mt-0.5 shrink-0 text-cana/60">•</span>
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-4 rounded-lg bg-cana/5 px-3 py-2 text-[10px] leading-relaxed text-cana/70">
          상대방 카드의 사역·신앙 스타일 항목을 먼저 확인하면 훨씬 자연스러운 대화가 돼요.
        </p>
      </div>
    </div>
  );
}
