import React from 'react';
import { useNotification } from '@contexts/NotificationContext';

export default function NotificationContainer() {
  const { notifications, removeNotification } = useNotification();
  if (notifications.length === 0) return null;
  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`min-w-[280px] px-4 py-3 rounded-lg shadow border text-sm ${
            n.type === 'success'
              ? 'bg-green-900/40 border-green-700 text-green-200'
              : n.type === 'error'
              ? 'bg-red-900/40 border-red-700 text-red-200'
              : n.type === 'warning'
              ? 'bg-yellow-900/40 border-yellow-700 text-yellow-200'
              : 'bg-slate-800/70 border-slate-600 text-slate-200'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>{n.message}</div>
            <button onClick={() => removeNotification(n.id)} className="text-xs opacity-70 hover:opacity-100">
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

