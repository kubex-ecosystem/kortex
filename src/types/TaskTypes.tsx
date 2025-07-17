import { ModelType } from "./MCP/Model";

export type TaskStatus = 'Running' | 'Completed' | 'Failed' | 'Pending';
export type TaskPriority = 'Low' | 'Medium' | 'High';
export type TaskType = 'Training' | 'Inference' | 'Evaluation' | 'Deployment';
export type TaskCategory = 'Model' | 'Data' | 'System' | 'User';
export type TaskAction = 'Start' | 'Stop' | 'Pause' | 'Resume';
export type TaskResult = 'Success' | 'Error' | 'Cancelled' | 'Timeout' | 'Unknown';

export interface TaskDef {
  id: string;
  name: string;
  description: string;
  priority?: TaskPriority;
  status: TaskStatus;
  serverId?: string;
  type?: TaskType;
  category?: TaskCategory;
  action?: TaskAction;
  result?: TaskResult;
  createdAt?: string;
  updatedAt?: string;
}

export interface Task {
  id: string;
  definitionId?: string; // Reference to TaskDef
  definition?: TaskDef; // Full definition object
  model?: ModelType; // Model used for the task
  assignedTo?: string; // User ID
  createdAt?: string;
  updatedAt?: string;
  status?: TaskStatus;
  progress?: number; // Percentage of completion
  estimatedTime?: string; // Estimated time to complete
  startedAt?: string; // When the task started
  serverId?: string; // ID of the server processing the task
  result?: TaskResult; // Result message or error
  duration?: number; // Duration in milliseconds
}

export interface TaskState {
  tasks: Task[];
  isConnected: boolean;
  error: string | null;
  lastUpdate: Date;
}

export interface TaskActionRequest {
  taskId: string;
  action: TaskAction;
}
