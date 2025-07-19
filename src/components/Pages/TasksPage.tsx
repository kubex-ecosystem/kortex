import React, { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2 } from 'lucide-react';
import { Task, TaskStatus } from '../../types/TaskTypes';
import { useApp } from '../../context/AppContext';
import { TaskModal } from '../Tasks/TaskModal';

export const TasksPage: React.FC = () => {
  const { tasks, servers, addTask, updateTask, removeTask } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const filteredTasks = tasks.filter((task: Task) => {
    const matchesSearch =
      task.definition?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.definition?.description
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    running: tasks.filter((t) => t.status === 'Running').length,
    completed: tasks.filter((t) => t.status === 'Completed').length,
    failed: tasks.filter((t) => t.status === 'Failed').length
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsEditOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Tem certeza que deseja remover esta task?')) {
      removeTask(taskId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Tasks
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Cadastro e monitoramento de tarefas
          </p>
          <div className="mt-3 flex items-center space-x-6">
            <div className="flex items-center space-x-1 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">
                Running: {stats.running}
              </span>
            </div>
            <div className="flex items-center space-x-1 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">
                Completed: {stats.completed}
              </span>
            </div>
            <div className="flex items-center space-x-1 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">
                Failed: {stats.failed}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Task
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            title="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="Running">Running</option>
            <option value="Completed">Completed</option>
            <option value="Failed">Failed</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhuma task encontrada
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm || statusFilter !== 'all'
              ? 'Tente ajustar os filtros de busca'
              : 'Comece adicionando sua primeira task'}
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <button
              onClick={() => setIsAddOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Task
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task: Task) => (
            <div
              key={task.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-4 space-y-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {task.definition?.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {task.definition?.description}
                </p>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {task.status}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditTask(task)}
                      className="inline-flex items-center px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-xs text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="inline-flex items-center px-2 py-1 border border-red-300 dark:border-red-600 rounded-md text-xs text-red-700 dark:text-red-200 bg-white dark:bg-red-900/20 hover:bg-red-50 dark:hover:bg-red-900/30"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <TaskModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={addTask}
        servers={servers}
        title="Add New Task"
      />

      <TaskModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={updateTask}
        task={selectedTask}
        servers={servers}
        title="Edit Task"
      />
    </div>
  );
};

export default TasksPage;
