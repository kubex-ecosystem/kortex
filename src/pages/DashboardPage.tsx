import React, { JSX } from 'react';
import { LayoutDashboard, Play, CheckCircle, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TaskCard } from '../components/Dashboard/TaskCard';
import { Task } from '../types';

export const DashboardPage = (): JSX.Element => {
  const { tasks } = useApp();
  
  const statusCounts = tasks.reduce((acc, task:Task) => {
    acc[task.status || 'Unknown'] = (acc[task.status || 'Unknown'] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statsCards = [
    { 
      label: 'Total Tasks', 
      value: tasks.length, 
      icon: <LayoutDashboard className="h-8 w-8 text-blue-600" />, 
      color: 'gray' 
    },
    { 
      label: 'Running', 
      value: statusCounts.Running || 0, 
      icon: <Play className="h-8 w-8 text-blue-600" />, 
      color: 'blue' 
    },
    { 
      label: 'Completed', 
      value: statusCounts.Completed || 0, 
      icon: <CheckCircle className="h-8 w-8 text-green-600" />, 
      color: 'green' 
    },
    { 
      label: 'Failed', 
      value: statusCounts.Failed || 0, 
      icon: <XCircle className="h-8 w-8 text-red-600" />, 
      color: 'red' 
    }
  ];

  const handleTaskAction = (taskId: string, action: string) => {
    console.log(`Action '${action}' executed on task ${taskId}`);
  };

  return <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Dashboard
      </h1>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
                <p className={`text-2xl font-bold ${
                  stat.color === 'gray' 
                    ? 'text-gray-900 dark:text-white' 
                    : `text-${stat.color}-600`
                }`}>
                  {stat.value}
                </p>
              </div>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Tasks */}
      < >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Recent Tasks
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tasks.slice(0, 6).map((task: Task) => {
            const completeTask: Task = {
              ...task,
              definitionId: task.definitionId || '',
              createdAt: task.createdAt || new Date().toISOString(),
              updatedAt: task.updatedAt || new Date().toISOString(),
            };
            return (
              <TaskCard
                key={completeTask.id}
                task={completeTask}
                onAction={handleTaskAction} />
            );
          })}
        </div>
      </>
    </div>
  ;
};

export default DashboardPage;
