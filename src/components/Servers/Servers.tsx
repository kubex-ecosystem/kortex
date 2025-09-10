import { useKortex } from '@contexts/KortexContext';
import { Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function Servers() {
  const { mcpServers, refreshServers, addMCPServer, removeMCPServer, loading, gobeConnection } = useKortex();
  const [name, setName] = useState('');
  const [host, setHost] = useState('localhost');
  const [port, setPort] = useState(3001);

  const onAdd = async () => {
    if (!name.trim()) return;
    await addMCPServer({ name, host, port, version: undefined, description: '', capabilities: [], config: {} });
    setName('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">MCP Servers</h1>
          <p className="text-slate-400">Manage and monitor your MCP nodes</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            title="Refresh servers"
            onClick={refreshServers}
            disabled={gobeConnection?.status !== 'connected'}
            className={`px-3 py-2 rounded border ${gobeConnection?.status === 'connected' ? 'bg-slate-700 text-slate-200 border-slate-600 hover:bg-slate-600' : 'bg-slate-700/30 text-slate-500 border-slate-700 cursor-not-allowed'}`}
          >
            <RefreshCw size={16} className={loading.servers ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {gobeConnection?.status === 'connected' && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input title="Server name" className="p-2 rounded bg-slate-900 border border-slate-700" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <input title="Host" className="p-2 rounded bg-slate-900 border border-slate-700" placeholder="Host" value={host} onChange={(e) => setHost(e.target.value)} />
            <input title="Port" className="p-2 rounded bg-slate-900 border border-slate-700" placeholder="Port" type="number" value={port} onChange={(e) => setPort(parseInt(e.target.value || '0', 10))} />
            <button title="Add server" onClick={onAdd} className="flex items-center justify-center gap-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-500">
              <Plus size={16} /> Add Server
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mcpServers.map((s) => (
          <div key={s.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-semibold">{s.name}</div>
                <div className="text-xs text-slate-400">{s.host}:{s.port} • {s.status}</div>
              </div>
              {gobeConnection?.status === 'connected' && (
                <button title="Remove server" onClick={() => removeMCPServer(s.id)} className="p-2 rounded bg-slate-700 text-slate-200 hover:bg-slate-600">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            {s.description && <div className="text-sm text-slate-300 mt-2">{s.description}</div>}
          </div>
        ))}
        {mcpServers.length === 0 && (
          <div className="text-slate-400">No servers yet. Add one to get started.</div>
        )}
      </div>
    </div>
  );
}
