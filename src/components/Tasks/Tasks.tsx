import { useKortex } from '@contexts/KortexContext';
import { Plus, XCircle } from 'lucide-react';
import { useState } from 'react';

export default function Tasks() {
  const { tasks, createTask, cancelTask, clearCompletedTasks, gobeConnection } = useKortex();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'mcp-operation' | 'server-management' | 'system-check'>('mcp-operation');

  const onCreate = async () => {
    if (!title.trim()) return;
    await createTask({ title, type, description: '', result: undefined, error: undefined, progress: 0, createdAt: '', updatedAt: '' } as any);
    setTitle('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tasks</h1>
          <p className="text-slate-400">Operations and background jobs</p>
        </div>
        <button title="Clear completed tasks" onClick={clearCompletedTasks} className="px-3 py-2 rounded bg-slate-700 text-slate-200 border border-slate-600 hover:bg-slate-600">
          Clear Completed
        </button>
      </div>

      {gobeConnection?.status === 'connected' && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <input title="Task title" className="p-2 rounded bg-slate-900 border border-slate-700" placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <select title="Task type" className="p-2 rounded bg-slate-900 border border-slate-700" value={type} onChange={(e) => setType(e.target.value as any)}>
            <option value="mcp-operation">MCP Operation</option>
            <option value="server-management">Server Management</option>
            <option value="system-check">System Check</option>
          </select>
          <div className="md:col-span-2 flex items-center justify-end">
            <button title="Create task" onClick={onCreate} className="flex items-center gap-2 rounded bg-blue-600 text-white px-4 py-2 hover:bg-blue-500">
              <Plus size={16} /> Create Task
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {tasks.map((t) => (
          <div key={t.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-white font-medium">{t.title} <span className="text-xs text-slate-400">({t.type})</span></div>
              <div className="text-xs text-slate-400">{t.status} • {t.progress}%</div>
            </div>
            {gobeConnection?.status === 'connected' && (
              <button title="Cancel task" onClick={() => cancelTask(t.id)} className="p-2 rounded bg-slate-700 text-slate-200 hover:bg-slate-600">
                <XCircle size={16} />
              </button>
            )}
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="text-slate-400">No tasks yet.</div>
        )}
      </div>
    </div>
  );
}
