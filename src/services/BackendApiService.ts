
import { BACKEND_CONFIG, getBackendHeaders } from '@/config/backendConfig';

export interface PromptGenerationRequest {
  websiteUrl: string;
  agentRole: string;
  additionalPrompt: string;
}

export interface PromptGenerationResponse {
  response: string;
}

export interface TranslationRequest {
  text: string;
  fromLanguage: string;
  toLanguage: string;
}

export interface TranslationResponse {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  sourcePronunciation: string;
  translatedPronunciation: string;
}

export class BackendApiService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = BACKEND_CONFIG.BASE_URL;
  }

  private getHeaders(): HeadersInit {
    return getBackendHeaders();
  }

  async generatePrompt(request: PromptGenerationRequest): Promise<PromptGenerationResponse> {
    try {
      console.log('Generating prompt via backend:', request);
      
      const response = await fetch(`${this.baseUrl}/api/prompt-generation`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Prompt generation error via backend:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as PromptGenerationResponse;
      console.log('Generated prompt via backend:', data);
      return data;
    } catch (error) {
      console.error('Error generating prompt via backend:', error);
      throw error;
    }
  }

  async translateText(request: TranslationRequest): Promise<TranslationResponse> {
    try {
      console.log('Translating text via backend:', request);
      
      const response = await fetch(`${this.baseUrl}/api/translate`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Translation error via backend:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as TranslationResponse;
      console.log('Translated text via backend:', data);
      return data;
    } catch (error) {
      console.error('Error translating text via backend:', error);
      throw error;
    }
  }
}

export const backendApiService = new BackendApiService();
