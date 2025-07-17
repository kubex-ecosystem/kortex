
export type NotificationType = 'info' | 'warning' | 'error' | 'success';
export type NotificationStatus = 'read' | 'unread';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface NotificationOptions {
  type?: NotificationType;
  title?: string;
  message?: string;
  autoDismiss?: boolean;
  duration?: number; // in milliseconds
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}