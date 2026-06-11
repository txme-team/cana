'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function SessionTimer() {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.expires_at) return;
      const secs = Math.floor((session.expires_at * 1000 - Date.now()) / 1000);
      setRemaining(Math.max(0, secs));
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

  if (remaining === null) return null;

  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  const isWarning = remaining <= 300; // 5분 이하 경고

  const formatted = h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`;

  return (
    <span className={`font-mono text-xs ${isWarning ? 'text-red-400' : 'text-gray-400'}`}>
      세션 {formatted}
    </span>
  );
}
