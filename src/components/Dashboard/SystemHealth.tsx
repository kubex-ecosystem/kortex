import { useKortex } from '@contexts/KortexContext';
import { Shield, Cpu, HardDrive, Wifi } from 'lucide-react';

export default function SystemHealth() {
  const { metrics } = useKortex();

  const healthItems = [
    {
      label: 'System Status',
      value: metrics.systemHealth,
      icon: Shield,
      status: metrics.systemHealth === 'healthy' ? 'good' : 
              metrics.systemHealth === 'warning' ? 'warning' : 'critical'
    },
    {
      label: 'Response Time',
      value: `${metrics.responseTime}ms`,
      icon: Wifi,
      status: metrics.responseTime < 100 ? 'good' : 
              metrics.responseTime < 500 ? 'warning' : 'critical'
    },
    {
      label: 'Uptime',
      value: `${Math.floor(metrics.uptime / 3600)}h`,
      icon: Cpu,
      status: 'good'
    }
  ];

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-white mb-4">System Health</h3>
      
      <div className="space-y-3">
        {healthItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  item.status === 'good' ? 'bg-green-500/20 text-green-400' :
                  item.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  <Icon size={16} />
                </div>
                <span className="text-slate-300 text-sm">{item.label}</span>
              </div>
              <span className={`text-sm font-medium ${
                item.status === 'good' ? 'text-green-400' :
                item.status === 'warning' ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {item.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
