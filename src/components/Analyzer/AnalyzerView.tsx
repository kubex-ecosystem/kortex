import React, { useMemo, useState } from 'react';
import ProjectInput from './ProjectInput';
import SimpleResults from './SimpleResults';
import { HistoryItem, ProjectAnalysis } from '@types/analyzer';
import AnalyzerHistoryPanel from './AnalyzerHistoryPanel';
import ScoreTrend from './ScoreTrend';
import { usePersistentState } from '@hooks/usePersistentState';
import { useLanguage } from '@contexts/LanguageContext';
import { compareAnalyses } from '@services/gemini/api';
import { useNotification } from '@contexts/NotificationContext';

export default function AnalyzerView() {
  const [result, setResult] = useState<ProjectAnalysis | null>(null);
  const [history, setHistory] = usePersistentState<HistoryItem[]>('analysisHistory', []);
  const [apiKey] = usePersistentState<string>('geminiApiKey', '');
  const { locale } = useLanguage();
  const { addNotification } = useNotification();
  const [evolution, setEvolution] = useState<any | null>(null);

  const handleResult = (res: ProjectAnalysis) => {
    setResult(res);
    const item: HistoryItem = {
      id: Date.now(),
      projectName: res.projectName,
      analysisType: res.analysisType,
      timestamp: new Date().toLocaleString(locale),
      analysis: res,
      projectContext: '',
    };
    setHistory((prev) => [item, ...prev]);
    setEvolution(null);
  };

  const onSelectForCompare = async (ids: number[]) => {
    if (!apiKey) {
      addNotification({ message: 'Please provide your Gemini API Key.', type: 'warning' });
      return;
    }
    const items = history.filter((h) => ids.includes(h.id));
    if (items.length !== 2) return;
    try {
      const ev = await compareAnalyses(items[0], items[1], locale as 'en-US' | 'pt-BR', apiKey);
      setEvolution(ev);
    } catch (e: any) {
      addNotification({ message: e?.message ?? 'Compare failed', type: 'error' });
    }
  };

  const onLoadFromHistory = (item: HistoryItem) => {
    setResult(item.analysis);
    setEvolution(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analyzer</h1>
        <p className="text-slate-400">Run AI-assisted project analysis (Gemini)</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ScoreTrend history={history} />
          <ProjectInput onResult={handleResult} />
          {result && <SimpleResults analysis={result} />}
          {evolution && (
            <div className="mt-6 bg-slate-800/50 border border-slate-700 rounded-xl p-5">
              <h2 className="text-xl font-semibold text-white mb-2">Evolution</h2>
              <p className="text-slate-300 mb-3 whitespace-pre-line">{evolution.evolutionSummary}</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div className="bg-slate-900/40 border border-slate-700 rounded p-3">
                  <div className="text-slate-400">Previous score</div>
                  <div className="text-white text-lg">{evolution.keyMetrics.previousScore}</div>
                </div>
                <div className="bg-slate-900/40 border border-slate-700 rounded p-3">
                  <div className="text-slate-400">Current score</div>
                  <div className="text-white text-lg">{evolution.keyMetrics.currentScore}</div>
                </div>
                <div className="bg-slate-900/40 border border-slate-700 rounded p-3">
                  <div className="text-slate-400">Score change</div>
                  <div className="text-white text-lg">{evolution.keyMetrics.scoreChange}</div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div>
          <AnalyzerHistoryPanel history={history} onSelectForCompare={onSelectForCompare} onLoad={onLoadFromHistory} />
        </div>
      </div>
    </div>
  );
}
