import React, { useMemo } from 'react';
import Sparkline from '@components/Common/Sparkline';
import { HistoryItem } from '@types/analyzer';

interface Props {
  history: HistoryItem[];
}

export default function ScoreTrend({ history }: Props) {
  const scores = useMemo(() => {
    return [...history]
      .sort((a, b) => a.id - b.id)
      .map((h) => h.analysis.viability.score);
  }, [history]);

  if (scores.length < 2) return null;

  return (
    <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-4">
      <div className="text-sm text-slate-300 mb-2">Score Trend</div>
      <Sparkline data={scores} width={400} height={80} className="w-full h-20" />
    </div>
  );
}

