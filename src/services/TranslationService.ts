
import { backendApiService, TranslationRequest } from './BackendApiService';

export interface TranslationResult {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  sourcePronunciation?: string;
  translatedPronunciation?: string;
}

export class TranslationService {
  async translateText(
    text: string, 
    fromLanguage: string, 
    toLanguage: string
  ): Promise<TranslationResult> {
    try {
      const request: TranslationRequest = {
        text,
        fromLanguage,
        toLanguage
      };

      const response = await backendApiService.translateText(request);
      
      return {
        translatedText: response.translatedText,
        sourceLanguage: response.sourceLanguage,
        targetLanguage: response.targetLanguage,
        sourcePronunciation: response.sourcePronunciation,
        translatedPronunciation: response.translatedPronunciation
      };
    } catch (error) {
      console.error('Translation service error:', error);
      throw new Error('Failed to translate text');
    }
  }
}

export const translationService = new TranslationService();
