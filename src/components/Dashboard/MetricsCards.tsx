import { useKortex } from '@contexts/KortexContext';
import { Server, Activity, CheckCircle, AlertTriangle } from 'lucide-react';

export default function MetricsCards() {
  const { metrics } = useKortex();

  const cards = [
    {
      title: 'Total Servers',
      value: metrics.totalServers,
      icon: Server,
      color: 'blue',
    },
    {
      title: 'Online Servers',
      value: metrics.onlineServers,
      icon: CheckCircle,
      color: 'green',
    },
    {
      title: 'Active Tasks',
      value: metrics.activeTasks,
      icon: Activity,
      color: 'purple',
    },
    {
      title: 'System Health',
      value: metrics.systemHealth,
      icon: metrics.systemHealth === 'healthy' ? CheckCircle : AlertTriangle,
      color: metrics.systemHealth === 'healthy' ? 'green' : 'yellow',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.title} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">{card.title}</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {typeof card.value === 'string' ? card.value : card.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${
                card.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                card.color === 'green' ? 'bg-green-500/20 text-green-400' :
                card.color === 'purple' ? 'bg-purple-500/20 text-purple-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                <Icon size={20} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
