
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