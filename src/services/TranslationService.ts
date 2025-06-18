import { LANGUAGES } from '@/constants/constants';

export interface TranslationRequest {
  text: string;
  fromLanguage: string;
  toLanguage: string;
}

export interface TranslationResult {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export class TranslationService {
  private readonly apiUrl = 'https://api.mymemory.translated.net/get';

  async translateText(request: TranslationRequest): Promise<TranslationResult> {
    try {
      const { text, fromLanguage, toLanguage } = request;
      
      if (!text.trim()) {
        throw new Error('Text to translate cannot be empty');
      }

      if (fromLanguage === toLanguage) {
        return {
          translatedText: text,
          sourceLanguage: fromLanguage,
          targetLanguage: toLanguage
        };
      }

      const url = new URL(this.apiUrl);
      url.searchParams.append('q', text);
      url.searchParams.append('langpair', `${fromLanguage}|${toLanguage}`);

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Translation API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.responseStatus !== 200) {
        throw new Error(`Translation failed: ${data.responseDetails || 'Unknown error'}`);
      }

      return {
        translatedText: data.responseData.translatedText,
        sourceLanguage: fromLanguage,
        targetLanguage: toLanguage
      };
    } catch (error) {
      console.error('Translation error:', error);
      throw new Error(`Failed to translate text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async translateToMultipleLanguages(
    text: string,
    sourceLanguage: string,
    targetLanguages: string[]
  ): Promise<Record<string, string>> {
    const translations: Record<string, string> = {};
    
    // Keep the original text for the source language
    translations[sourceLanguage] = text;

    // Translate to each target language
    const translationPromises = targetLanguages.map(async (targetLang) => {
      if (targetLang === sourceLanguage) return;
      
      try {
        const result = await this.translateText({
          text,
          fromLanguage: sourceLanguage,
          toLanguage: targetLang
        });
        translations[targetLang] = result.translatedText;
      } catch (error) {
        console.error(`Failed to translate to ${targetLang}:`, error);
        // Keep original text as fallback
        translations[targetLang] = text;
      }
    });

    await Promise.all(translationPromises);
    return translations;
  }

  getLanguageLabel(languageCode: string): string {
    return LANGUAGES.find(lang => lang.value === languageCode)?.label || languageCode;
  }

  // Convert language codes to MyMemory format if needed
  private normalizeLanguageCode(code: string): string {
    const mapping: Record<string, string> = {
      'en': 'en',
      'ro': 'ro',
      'es': 'es',
      'fr': 'fr',
      'de': 'de',
      'it': 'it',
      'pt': 'pt',
      'ru': 'ru',
      'zh': 'zh',
      'ja': 'ja',
      'ko': 'ko',
      'ar': 'ar',
      'hi': 'hi',
      'nl': 'nl',
      'sv': 'sv',
      'da': 'da',
      'no': 'no',
      'fi': 'fi',
      'pl': 'pl',
      'cs': 'cs',
      'hu': 'hu',
      'tr': 'tr',
      'el': 'el',
      'he': 'he',
      'th': 'th',
      'vi': 'vi',
      'uk': 'uk',
      'bg': 'bg'
    };
    
    return mapping[code] || code;
  }
}

export const translationService = new TranslationService();
