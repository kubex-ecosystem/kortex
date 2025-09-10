import React from 'react';
import { ProjectAnalysis } from '@types/analyzer';
import { useTranslation } from '@hooks/useTranslation';

interface Props {
  analysis: ProjectAnalysis;
}

export default function SimpleResults({ analysis }: Props) {
  const { t } = useTranslation();
  return (
    <div className="mt-6 space-y-6">
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
        <h2 className="text-xl font-semibold text-white mb-2">
          {t('results.title', { projectName: analysis.projectName })}
        </h2>
        <div className="text-slate-300 whitespace-pre-line">{analysis.summary}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-3">{t('results.strengths')}</h3>
          <ul className="list-disc pl-5 space-y-2 text-slate-300">
            {analysis.strengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-3">{t('results.improvements.title')}</h3>
          <ul className="space-y-3 text-slate-300">
            {analysis.improvements.map((i, idx) => (
              <li key={idx} className="border border-slate-700 rounded p-3">
                <div className="font-medium text-white">{i.title}</div>
                <div className="text-sm opacity-80">{i.description}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-white mb-3">{t('results.nextSteps.title')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-slate-400 mb-2">{t('results.nextSteps.shortTerm')}</div>
            <ul className="list-disc pl-5 space-y-2 text-slate-300">
              {analysis.nextSteps.shortTerm.map((s, i) => (
                <li key={i}>{s.title} — {s.description}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-slate-400 mb-2">{t('results.nextSteps.longTerm')}</div>
            <ul className="list-disc pl-5 space-y-2 text-slate-300">
              {analysis.nextSteps.longTerm.map((s, i) => (
                <li key={i}>{s.title} — {s.description}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

