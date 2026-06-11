'use client';

import { useState } from 'react';
import type { ProfileRow } from '@/lib/types';
import AdminDashboard from './AdminDashboard';
import EventsManager from './EventsManager';

type Tab = 'applicants' | 'events';

export default function AdminTabs({
  eventMap,
}: {
  profiles: ProfileRow[];
  eventMap: Record<string, string>;
}) {
  const [tab, setTab] = useState<Tab>('applicants');

  return (
    <div>
      {/* 탭 */}
      <div className="mb-6 flex gap-1 rounded-xl border border-gray-100 bg-white p-1 w-fit">
        <button
          onClick={() => setTab('applicants')}
          className={[
            'rounded-lg px-4 py-2 text-sm font-medium transition',
            tab === 'applicants' ? 'bg-cana text-white' : 'text-gray-500 hover:text-gray-700',
          ].join(' ')}
        >
          신청자 명단
        </button>
        <button
          onClick={() => setTab('events')}
          className={[
            'rounded-lg px-4 py-2 text-sm font-medium transition',
            tab === 'events' ? 'bg-cana text-white' : 'text-gray-500 hover:text-gray-700',
          ].join(' ')}
        >
          이벤트 관리
        </button>
      </div>

      {tab === 'applicants' && (
        <AdminDashboard
          maleApps={[]}
          femaleApps={[]}
          maleCount={0}
          femaleCount={0}
          malePage={1}
          femalePage={1}
          pageSize={10}
          eventMap={eventMap}
          eventOptions={[]}
          filters={{ q: '', status: 'all', eventId: 'all' }}
        />
      )}
      {tab === 'events' && (
        <EventsManager />
      )}
    </div>
  );
}
