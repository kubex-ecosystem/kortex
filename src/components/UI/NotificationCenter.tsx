import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { X, XCircle, CheckCircle, Bell } from 'lucide-react';
import { LogEntry, Task } from '../../types';
import { Notification } from '../../types/NotificationTypes';
import { useApp } from '../../context/AppContext';
import { Server } from 'http';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead, removeNotification } = useApp();
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);

  const filterNotifications = useCallback(() => {
    const unreadNotifications = (notifications || []).filter(n => !n.read) as Notification[];
    setFilteredNotifications(unreadNotifications);
  }, [notifications]);

  useEffect(() => {
    if (isOpen) {
      filterNotifications();
    }
  }, [isOpen, filterNotifications]);

  const handleMarkRead = (id: string) => {
    markNotificationRead(id);
    filterNotifications();
  };

  const handleRemove = (id: string) => {
    removeNotification(id);
    filterNotifications();
  };

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'} bg-gray-800 bg-opacity-75`}>
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Notifications</h2>
            <button title="Close" onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
          {filteredNotifications.length === 0 ? (
            <p className="text-gray-500">No new notifications</p>
          ) : (
            <ul className="space-y-4">
              {filteredNotifications.map(notification => (
                <li key={notification.id} className={`p-4 rounded-lg ${notification.read ? 'bg-gray-100' : 'bg-blue-50'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-gray-200">{notification.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{notification.message}</p>
                    </div>
                    <button onClick={() => handleMarkRead(notification.id)} className="text-blue-500 hover:text-blue-700">
                      Mark as Read
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(notification.timestamp).toLocaleString()}
                    </span>
                    <button title="Remove Notification" onClick={() => handleRemove(notification.id)} className="text-red-500 hover:text-red-700">
                      <XCircle size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4">
            <button onClick={onClose} className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}