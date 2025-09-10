import { Plus, RefreshCw, Settings, Zap } from 'lucide-react';
import { useKortex } from '../../contexts/KortexContext';

export default function QuickActions() {
  const { addMCPServer, refreshServers, connectToGobe, gobeConnection } = useKortex();

  const actions = [
    {
      label: 'Add MCP Server',
      icon: Plus,
      action: () => {
        // TODO: Open add server modal
        addMCPServer({
          name: `Server ${Date.now()}`,
          host: 'localhost',
          port: 3001,
          capabilities: ['read', 'write'],
          config: {},
          description: 'Test server'
        });
      },
      disabled: !gobeConnection
    },
    {
      label: 'Refresh Servers',
      icon: RefreshCw,
      action: refreshServers,
      disabled: !gobeConnection
    },
    {
      label: 'Connect GoBE',
      icon: Zap,
      action: () => connectToGobe('http://localhost:8080'),
      disabled: gobeConnection?.status === 'connected'
    },
    {
      label: 'Settings',
      icon: Settings,
      action: () => {
        // TODO: Open settings
        console.log('Open settings');
      },
      disabled: false
    }
  ];

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>

      <div className="space-y-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={action.action}
              disabled={action.disabled}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${action.disabled
                ? 'bg-slate-700/30 text-slate-500 cursor-not-allowed'
                : 'bg-slate-700/50 hover:bg-slate-600 text-white'
                }`}
            >
              <Icon size={16} />
              <span className="text-sm font-medium">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
