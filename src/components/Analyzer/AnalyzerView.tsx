import React, { useState } from 'react';
import ProjectInput from './ProjectInput';
import SimpleResults from './SimpleResults';
import { ProjectAnalysis } from '@types/analyzer';

export default function AnalyzerView() {
  const [result, setResult] = useState<ProjectAnalysis | null>(null);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analyzer</h1>
        <p className="text-slate-400">Run AI-assisted project analysis (Gemini)</p>
      </div>
      <ProjectInput onResult={setResult} />
      {result && <SimpleResults analysis={result} />}
    </div>
  );
}

