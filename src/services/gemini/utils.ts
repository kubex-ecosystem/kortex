export const parseJsonResponse = <T>(responseText: string, schemaType: string): T => {
  try {
    const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedJson) as T;
  } catch (error) {
    console.error(`Error parsing ${schemaType} JSON:`, error);
    console.error('Invalid JSON string:', responseText);
    throw new Error('Failed to parse the analysis response. The format was invalid.');
  }
};

export const handleGeminiError = (error: any) => {
  console.error('Gemini API Error:', error);
  const message = error?.toString?.() ?? '';
  if (message.includes('API key not valid')) {
    throw new Error('Your Gemini API key is invalid.');
  }
  if (message.toLowerCase().includes('billing')) {
    throw new Error('Billing issue with Gemini API.');
  }
  if (message.includes('SAFETY')) {
    throw new Error('Response blocked due to safety settings.');
  }
  throw new Error('Unexpected error with the Gemini API.');
};

