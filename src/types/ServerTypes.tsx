
export type ServerStatus = 'Online' | 'Offline' | 'Warning';
export type ServerType = 'GPU' | 'CPU' | 'TPU';
export type ServerRole = 'Primary' | 'Secondary' | 'Backup';
export type ServerHealth = 'Healthy' | 'Unhealthy' | 'Degraded' | 'Critical';
export type ServerLoad = 'Low' | 'Medium' | 'High';
export type ServerConnectionStatus = 'Connected' | 'Disconnected' | 'Connecting';
export type ServerAction = 'Start' | 'Stop' | 'Restart' | 'Update';

export interface Server {
  id: string;
  name: string;
  type: ServerType;
  role: ServerRole;
  status: ServerStatus;
  health: ServerHealth;
  load: ServerLoad;
  ipAddress: string;
  location: string;
  lastChecked: string;
  connectionStatus: ServerConnectionStatus;
}

export interface ServerState {
  servers: Server[];
  isConnected: boolean;
  error: string | null;
  lastUpdate: Date;
}

export interface ServerActionRequest {
  serverId: string;
  action: ServerAction;
}

export interface ServerHealthCheck {
  serverId: string;
  status: ServerHealth;
  responseTime: number;
  lastChecked: string;
}