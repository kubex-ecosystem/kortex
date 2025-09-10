import { AnalysisType, ProjectAnalysis } from '@/types/analyzer';
import { useLanguage } from '@contexts/LanguageContext';
import { useNotification } from '@contexts/NotificationContext';
import { usePersistentState } from '@hooks/usePersistentState';
import { useTranslation } from '@hooks/useTranslation';

import { analyzeProject } from '@services/gemini/api';
import { useState } from 'react';

interface Props {
  onResult: (result: ProjectAnalysis) => void;
}

export default function ProjectInput({ onResult }: Props) {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const { addNotification } = useNotification();

  const [context, setContext] = useState('');
  const [type, setType] = useState<AnalysisType>(AnalysisType.General);
  const [apiKey, setApiKey] = usePersistentState<string>('geminiApiKey', '');
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!apiKey) {
      addNotification({ message: 'Please provide your Gemini API Key.', type: 'warning' });
      return;
    }
    if (!context.trim()) {
      addNotification({ message: 'Provide some project context to analyze.', type: 'warning' });
      return;
    }
    setLoading(true);
    try {
      const res = await analyzeProject(context, type, locale as 'en-US' | 'pt-BR', apiKey);
      onResult(res);
    } catch (e: any) {
      addNotification({ message: e?.message ?? 'Analysis failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="md:col-span-2">
          <label className="block text-sm text-slate-300 mb-1">{t('input.title')}</label>
          <textarea
            className="w-full h-48 p-3 rounded-lg bg-slate-900 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('input.placeholder')}
            value={context}
            onChange={(e) => setContext(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="space-y-3">
          <label className="block text-sm text-slate-300 mb-1">{t('common.apiKey')}</label>
          <input
            type="password"
            className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIza..."
          />
          <label className="block text-sm text-slate-300 mb-1">{t('actions.selectType')}</label>
          <select
            title={t('actions.selectType')}
            className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700"
            value={type}
            onChange={(e) => setType(e.target.value as AnalysisType)}
          >
            <option value={AnalysisType.General}>{t('analysisTypes.GENERAL.label')}</option>
            <option value={AnalysisType.Security}>{t('analysisTypes.SECURITY.label')}</option>
            <option value={AnalysisType.Scalability}>{t('analysisTypes.SCALABILITY.label')}</option>
            <option value={AnalysisType.CodeQuality}>{t('analysisTypes.CODE_QUALITY.label')}</option>
          </select>
          <button
            onClick={run}
            disabled={loading}
            className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition text-white font-medium disabled:opacity-60"
          >
            {loading ? t('common.loading') : t('actions.runAnalysis')}
          </button>
        </div>
      </div>
    </div>
  );
}

