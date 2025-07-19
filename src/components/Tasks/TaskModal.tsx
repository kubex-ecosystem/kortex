import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '../../types/TaskTypes';
import { MCPServerType } from '../../types/MCP/Server';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  task?: Task | null;
  servers: MCPServerType[];
  title: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  task,
  servers,
  title
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 'Medium' as TaskPriority,
    serverId: servers[0]?.id || ''
  });

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.definition?.name || '',
        description: task.definition?.description || '',
        priority: task.definition?.priority || 'Medium',
        serverId: task.serverId || servers[0]?.id || ''
      });
    } else if (servers.length > 0) {
      setFormData((prev) => ({ ...prev, serverId: servers[0].id }));
    }
  }, [task, servers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTask: Task = {
      id: task?.id || Date.now().toString(),
      status: task?.status || ('Pending' as TaskStatus),
      serverId: formData.serverId,
      createdAt: task?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      definition: {
        id: task?.definition?.id || Date.now().toString(),
        name: formData.name,
        description: formData.description,
        priority: formData.priority,
        status: task?.status || ('Pending' as TaskStatus),
        serverId: formData.serverId,
        createdAt: task?.definition?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };

    onSave(newTask);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              title="Close modal"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Task Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  placeholder="Enter task name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Task details"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Server
                  </label>
                  <select
                    value={formData.serverId}
                    onChange={(e) => setFormData({ ...formData, serverId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {servers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              >
                {task ? 'Update Task' : 'Add Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
