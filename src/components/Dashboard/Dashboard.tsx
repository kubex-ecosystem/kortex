import { useKortex } from '../../contexts/KortexContext';
import ActiveTasks from './ActiveTasks';
import MetricsCards from './MetricsCards';
import QuickActions from './QuickActions';
import ServersList from './ServersList';
import SystemHealth from './SystemHealth';

export default function Dashboard() {
  const { gobeConnection, metrics } = useKortex();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">
            Mission Control Center for Kubex Ecosystem
          </p>
        </div>

        {/* Connection Status Badge */}
        <div className={`px-4 py-2 rounded-lg border ${gobeConnection?.status === 'connected'
          ? 'bg-green-500/10 border-green-500/30 text-green-400'
          : gobeConnection?.status === 'connecting'
            ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
            : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${gobeConnection?.status === 'connected' ? 'bg-green-500' :
              gobeConnection?.status === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
            <span className="text-sm font-medium">
              {gobeConnection?.status === 'connected' ? 'GoBE Connected' :
                gobeConnection?.status === 'connecting' ? 'Connecting...' : 'GoBE Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Overview */}
      <MetricsCards />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - System Health & Quick Actions */}
        <div className="space-y-6">
          <SystemHealth />
          <QuickActions />
        </div>

        {/* Middle Column - Servers List */}
        <div>
          <ServersList />
        </div>

        {/* Right Column - Active Tasks */}
        <div>
          <ActiveTasks />
        </div>
      </div>

      {/* Welcome Message (when no GoBE connection) */}
      {!gobeConnection && (
        <div className="glass-effect rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">🚀</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Welcome to Kortex Mission Control
          </h2>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Connect to your GoBE backend to start managing your MCP servers and monitoring your Kubex ecosystem.
          </p>
          <button
            onClick={() => {
              // TODO: Open connection modal
              console.log('Open connection modal');
            }}
            className="btn btn-primary"
          >
            Connect to GoBE
          </button>
        </div>
      )}
    </div>
  );
}
