import React from 'react';
import { X, XCircle, CheckCircle, Bell } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead } = useApp();
  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Notifications ({unreadCount} unread)
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            No notifications
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${!notif.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
              onClick={() => markNotificationRead(notif.id)}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-1 ${notif.type === 'error' ? 'text-red-500' : notif.type === 'success' ? 'text-green-500' : 'text-blue-500'}`}>
                  {notif.type === 'error' ? <XCircle size={16} /> : 
                   notif.type === 'success' ? <CheckCircle size={16} /> : 
                   <Bell size={16} />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{notif.title}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">{notif.message}</p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                    {new Date(notif.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                {!notif.read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};