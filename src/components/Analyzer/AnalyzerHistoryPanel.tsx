import React, { useMemo, useState } from 'react';
import { HistoryItem } from '@types/analyzer';

interface Props {
  history: HistoryItem[];
  onSelectForCompare: (ids: number[]) => void;
  onLoad: (item: HistoryItem) => void;
}

export default function AnalyzerHistoryPanel({ history, onSelectForCompare, onLoad }: Props) {
  const [selected, setSelected] = useState<number[]>([]);

  const sorted = useMemo(() => [...history].sort((a, b) => b.id - a.id), [history]);

  const toggle = (id: number) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]).slice(0, 2));
  };

  return (
    <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-4 h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold">History</h3>
        <button
          className="text-xs px-3 py-1 rounded bg-blue-600 text-white disabled:opacity-60"
          onClick={() => onSelectForCompare(selected)}
          disabled={selected.length !== 2}
        >
          Compare (2)
        </button>
      </div>
      <div className="space-y-2 max-h-[520px] overflow-auto pr-1">
        {sorted.length === 0 && (
          <div className="text-slate-400 text-sm">No analyses yet.</div>
        )}
        {sorted.map((item) => (
          <div key={item.id} className="border border-slate-700 rounded p-3 flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-white font-medium truncate" title={item.projectName}>{item.projectName}</div>
              <div className="text-xs text-slate-400">{item.analysisType} • {item.timestamp}</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onLoad(item)}
                className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-200 hover:bg-slate-600"
              >
                Open
              </button>
              <label className="text-xs flex items-center gap-1 cursor-pointer">
                <input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggle(item.id)} />
                Pick
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

