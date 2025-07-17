
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
  lastLogin: string;
}

export interface UserState {
  users: User[];
  isAuthenticated: boolean;
  currentUser: User | null;
  error: string | null;
  lastUpdate: Date;
}

export interface UserActionRequest {
  userId: string;
  action: 'activate' | 'deactivate' | 'delete';
}