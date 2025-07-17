import React from 'react';
import { X, Play, Eye, Server } from 'lucide-react';
import { type Task, type TaskStatus } from '../../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { ProgressBar } from '../ui/ProgressBar';

interface TaskCardProps {
  task: Task;
  onAction?: (taskId: string, action: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onAction }) => {
  if (!task || !task.definition) {
    return null; // Handle case where task or definition is missing
  }

  const getActionButton = () => {
    const actions = {
      Running: { text: 'Cancel', color: 'red', icon: <X size={12} /> },
      Failed: { text: 'Retry', color: 'blue', icon: <Play size={12} /> },
      Pending: { text: 'Start', color: 'green', icon: <Play size={12} /> },
      Completed: { text: 'View', color: 'gray', icon: <Eye size={12} /> }
    };
    
    const action = actions[task.status as TaskStatus];
    if (!action) return null;
    
    return (
      <button
        onClick={() => onAction?.(task.id, action.text.toLowerCase())}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium 
          bg-${action.color}-50 dark:bg-${action.color}-900/20 
          text-${action.color}-700 dark:text-${action.color}-400 
          border border-${action.color}-200 dark:border-${action.color}-800 
          rounded-md hover:bg-${action.color}-100 dark:hover:bg-${action.color}-900/30 
          transition-colors`}
      >
        {action.icon}
        {action.text}
      </button>
    );
  };

  return (
    <div
      className="inline-block w-full max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all duration-200 transform hover:scale-105"
    >
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {new Date(task.createdAt || '').toLocaleDateString('pt-BR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })}
      </span>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all duration-200 transform hover:scale-105">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate pr-2">
              {task.definition?.name}
            </h3>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {task.estimatedTime}
              </p>
              {task.definition?.serverId && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <Server size={10} className="inline mr-1" />
                  {task.definition?.serverId}
                </p>
              )}
            </div>
          </div>
          <StatusBadge status={task.status || 'Unknown'} />
        </div>
        
        {task.status === 'Running' && typeof task.progress === 'number' && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
              <span>Progress</span>
              <span>{Math.round(task.progress * 100)}%</span>
            </div>
            <ProgressBar progress={task.progress} animated />
          </div>
        )}
        
        <div className="flex justify-end">
          {getActionButton()}
        </div>
      </div>
    </div>
  );
};
