// Types extracted for Analyzer feature

export enum Priority {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

export enum Difficulty {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

export enum Effort {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

export enum AnalysisType {
  General = 'General',
  Security = 'Security',
  Scalability = 'Scalability',
  CodeQuality = 'CodeQuality',
}

export enum MaturityLevel {
  Prototype = 'Prototype',
  MVP = 'MVP',
  Production = 'Production',
  Optimized = 'Optimized',
}

export interface Improvement {
  title: string;
  description: string;
  priority: Priority;
  difficulty: Difficulty;
  businessImpact: string;
}

export interface NextStep {
  title: string;
  description: string;
  difficulty: Difficulty;
}

export interface ProjectAnalysis {
  projectName: string;
  analysisType: AnalysisType;
  summary: string;
  strengths: string[];
  improvements: Improvement[];
  nextSteps: {
    shortTerm: NextStep[];
    longTerm: NextStep[];
  };
  viability: {
    score: number;
    assessment: string;
  };
  roiAnalysis: {
    assessment: string;
    potentialGains: string[];
    estimatedEffort: Effort;
  };
  maturity: {
    level: MaturityLevel;
    assessment: string;
  };
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export interface HistoryItem {
  id: number;
  projectName: string;
  analysisType: AnalysisType;
  timestamp: string;
  projectContext: string;
  analysis: ProjectAnalysis;
}

export interface EvolutionAnalysis {
  projectName: string;
  analysisType: AnalysisType;
  evolutionSummary: string;
  keyMetrics: {
    previousScore: number;
    currentScore: number;
    scoreChange: number;
    previousStrengths: number;
    currentStrengths: number;
    previousImprovements: number;
    currentImprovements: number;
  };
  resolvedImprovements: Improvement[];
  newImprovements: Improvement[];
  persistentImprovements: Improvement[];
}

