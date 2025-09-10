import { useKortex } from '@contexts/KortexContext';

export default function Logs() {
  const { logs } = useKortex();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Logs</h1>
        <p className="text-slate-400">Recent events and diagnostics</p>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/60 text-slate-300">
            <tr>
              <th className="text-left px-3 py-2">Time</th>
              <th className="text-left px-3 py-2">Level</th>
              <th className="text-left px-3 py-2">Source</th>
              <th className="text-left px-3 py-2">Message</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-t border-slate-700">
                <td className="px-3 py-2 text-slate-400 whitespace-nowrap">{l.timestamp}</td>
                <td className="px-3 py-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    l.level === 'error' ? 'bg-red-500/20 text-red-300' :
                    l.level === 'warn' ? 'bg-yellow-500/20 text-yellow-300' :
                    l.level === 'debug' ? 'bg-slate-500/20 text-slate-300' :
                    'bg-green-500/20 text-green-300'
                  }`}>{l.level}</span>
                </td>
                <td className="px-3 py-2 text-slate-300">{l.source}</td>
                <td className="px-3 py-2 text-slate-200">{l.message}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-4 text-slate-400">No logs available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

