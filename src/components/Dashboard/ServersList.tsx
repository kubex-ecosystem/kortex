import { Server, Wifi, WifiOff } from 'lucide-react';
import { useKortex } from '../../contexts/KortexContext';

export default function ServersList() {
  const { mcpServers } = useKortex();

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">MCP Servers</h3>
        <button className="btn btn-secondary text-sm" title="Add server">
          Add Server
        </button>
      </div>

      {mcpServers.length === 0 ? (
        <div className="text-center py-8">
          <Server className="mx-auto text-slate-500 mb-3" size={48} />
          <p className="text-slate-400">No MCP servers configured</p>
          <p className="text-sm text-slate-500">Connect to GoBE to manage servers</p>
        </div>
      ) : (
        <div className="space-y-3">
          {mcpServers.slice(0, 5).map((server) => (
            <div key={server.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${server.status === 'online' ? 'bg-green-500/20 text-green-400' :
                  server.status === 'connecting' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                  {server.status === 'online' ? <Wifi size={16} /> : <WifiOff size={16} />}
                </div>
                <div>
                  <p className="text-white font-medium">{server.name}</p>
                  <p className="text-sm text-slate-400">{server.host}:{server.port}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${server.status === 'online' ? 'bg-green-500/20 text-green-400' :
                server.status === 'connecting' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                {server.status}
              </span>
            </div>
          ))}

          {mcpServers.length > 5 && (
            <button className="w-full text-center text-sm text-slate-400 hover:text-white py-2" title="View all servers">
              View all {mcpServers.length} servers →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
