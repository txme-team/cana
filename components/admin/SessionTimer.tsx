'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const MAX_SESSION_SECS = 60 * 60; // 최대 60분

export default function SessionTimer() {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [extending, setExtending] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.expires_at) return;
      const secs = Math.floor((session.expires_at * 1000 - Date.now()) / 1000);
      setRemaining(Math.max(0, Math.min(secs, MAX_SESSION_SECS)));
    };

    init();

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          createClient().auth.signOut().then(() => {
            window.location.href = '/rotation/admin/login';
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleExtend = async () => {
    setExtending(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.refreshSession();
      if (!error && data.session?.expires_at) {
        const secs = Math.floor((data.session.expires_at * 1000 - Date.now()) / 1000);
        // 60분을 초과하지 않도록 cap
        setRemaining(Math.min(secs, MAX_SESSION_SECS));
      }
    } finally {
      setExtending(false);
    }
  };

  if (remaining === null) return null;

  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  const isWarning = remaining <= 300;

  const formatted = h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`;

  return (
    <div className="flex items-center gap-2">
      <span className={`font-mono text-xs ${isWarning ? 'text-red-400' : 'text-gray-400'}`}>
        세션 {formatted}
      </span>
      <button
        onClick={handleExtend}
        disabled={extending}
        className="rounded px-2 py-0.5 text-xs font-medium text-gray-500 border border-gray-200 hover:bg-gray-100 disabled:opacity-50 transition"
      >
        {extending ? '...' : '연장'}
      </button>
    </div>
  );
}
