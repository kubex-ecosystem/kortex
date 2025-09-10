import { GoogleGenAI } from '@google/genai';
import { AnalysisType, EvolutionAnalysis, HistoryItem, ProjectAnalysis } from '@types/analyzer';
import { getAnalysisPrompt, getEvolutionPrompt } from './prompts';
import { evolutionAnalysisSchema, projectAnalysisSchema } from './schemas';
import { handleGeminiError, parseJsonResponse } from './utils';

export const analyzeProject = async (
  projectContext: string,
  analysisType: AnalysisType,
  locale: 'pt-BR' | 'en-US',
  apiKey: string,
): Promise<ProjectAnalysis> => {
  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = getAnalysisPrompt(projectContext, analysisType, locale);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: projectAnalysisSchema,
      },
    });

    const usageMetadata = response.usageMetadata;
    const analysisResult = parseJsonResponse<ProjectAnalysis>(response.text || '{}', 'ProjectAnalysis');

    if (usageMetadata) {
      analysisResult.usageMetadata = {
        promptTokenCount: usageMetadata.promptTokenCount || 0,
        candidatesTokenCount: usageMetadata.candidatesTokenCount || 0,
        totalTokenCount: usageMetadata.totalTokenCount || 0,
      };
    }

    return analysisResult;
  } catch (error) {
    handleGeminiError(error);
    throw error;
  }
};

export const compareAnalyses = async (
  item1: HistoryItem,
  item2: HistoryItem,
  locale: 'pt-BR' | 'en-US',
  apiKey: string,
): Promise<EvolutionAnalysis> => {
  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = getEvolutionPrompt(item1, item2, locale);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: evolutionAnalysisSchema,
      },
    });

    const usageMetadata = response.usageMetadata;
    const evolutionResult = parseJsonResponse<EvolutionAnalysis>(response.text || '{}', 'EvolutionAnalysis');

    if (usageMetadata) {
      evolutionResult.usageMetadata = {
        // @ts-ignore - evolution type does not require usage metadata
        promptTokenCount: usageMetadata.promptTokenCount || 0,
        // @ts-ignore
        candidatesTokenCount: usageMetadata.candidatesTokenCount || 0,
        // @ts-ignore
        totalTokenCount: usageMetadata.totalTokenCount || 0,
      } as any;
    }

    return evolutionResult;
  } catch (error) {
    handleGeminiError(error);
    throw error;
  }
};

