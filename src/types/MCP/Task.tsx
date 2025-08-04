import { LogEntry } from "../";
import { MCPAPIProvider } from "./MCPTypes";

export type MCPTaskType = 'analysis' | 'processing' | 'training' | 'inference';
export type MCPTaskStatus = 'pending' | 'running' | 'completed' | 'failed';
export type MCPTaskState = 'idle' | 'active' | 'paused' | 'stopped';

export interface MCPTask {
  id: string;
  type: MCPTaskType;
  title: string;
  serverId: string;

  description?: string;
  priority?: number; // 1-5 scale, 1 being highest priority

  assignedTo?: string; // user ID of the assignee
  assignedAt?: string; // ISO date string when the task was assigned
  completedAt?: string; // ISO date string when the task was completed

  tags?: string[]; // array of tags for categorization
  dueDate?: string; // ISO date string for task deadline
  apiProvider?: MCPAPIProvider; // API provider used for the task
  apiModel?: string; // specific model used for the task

  parameters?: Record<string, any>; // additional parameters for the task
  inputData?: string; // JSON string of input data for the task
  outputData?: string; // JSON string of output data from the task

  createdBy: string; // user ID of the creator
  createdAt: string;
  updatedAt: string;
  progress?: number; // percentage of completion
  reasons?: string[]; // reasons for task state changes

  logs?: LogEntry[]; // array of log entries related to the task
  state: MCPTaskState; // current state of the task
  status: MCPTaskStatus;
  error?: string; // error message if the task failed
}
