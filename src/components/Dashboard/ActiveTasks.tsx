import { Activity, Clock } from 'lucide-react';
import { useKortex } from '../../contexts/KortexContext';

export default function ActiveTasks() {
  const { tasks } = useKortex();
  const activeTasks = tasks.filter(task => task.status === 'running' || task.status === 'pending');

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Active Tasks</h3>
        <button className="btn btn-secondary text-sm">
          View All
        </button>
      </div>

      {activeTasks.length === 0 ? (
        <div className="text-center py-8">
          <Activity className="mx-auto text-slate-500 mb-3" size={48} />
          <p className="text-slate-400">No active tasks</p>
          <p className="text-sm text-slate-500">Tasks will appear here when running</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeTasks.slice(0, 5).map((task) => (
            <div key={task.id} className="p-3 bg-slate-700/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {task.status === 'running' ? (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  ) : (
                    <Clock size={12} className="text-yellow-400" />
                  )}
                  <span className="text-white font-medium text-sm">{task.title}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${task.status === 'running' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-yellow-500/20 text-yellow-400'
                  }`}>
                  {task.status}
                </span>
              </div>

              {task.description && (
                <p className="text-sm text-slate-400 mb-2">{task.description}</p>
              )}

              {task.status === 'running' && (
                <div className="w-full bg-slate-600 rounded-full h-1.5">
                  <div
                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
