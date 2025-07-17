import { NotificationType } from "../NotificationTypes";

export interface MCPNotificationType {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}