import { ENV } from '@/config/environment';

// Constants for the Agent Consultant application

export const API_CONFIG = {
  BACKEND_URL: ENV.BACKEND_URL,
  BACKEND_API_KEY: ENV.BACKEND_API_KEY,
  // Note: ElevenLabs API key is now managed through Supabase Secrets
  ELEVENLABS_BASE_URL: 'https://api.elevenlabs.io/v1',
  DEFAULT_MODEL_ID: 'eleven_turbo_v2_5',
} as const;

export const VOICES = [
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Lili' },
  { id: 'cjVigY5qzO86Huf0OWal', name: 'Eric' },
  { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Kalina' },
  { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Andreea' },
  { id: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alexandra' },
  { id: 'GRHbHyXbUO8nF4YexVTa', name: 'Anca' },
  { id: 'bIHbv24MWmeRgasZH58o', name: 'Cristi' },
  { id: 'bIHbv24MWmeRgasZH58o', name: 'Oleg' },
  { id: 'pqHfZKP75CvOlQylNhV4', name: 'Marius' },
] as const;

// Complete language map with language IDs as keys
export const LANGUAGE_MAP = {
  'af': 'Afrikaans',
  'ar': 'العربية',
  'bg': 'Български',
  'bn': 'বাংলা',
  'bs': 'Bosanski',
  'ca': 'Català',
  'cs': 'Čeština',
  'da': 'Dansk',
  'de': 'Deutsch',
  'el': 'Ελληνικά',
  'en': 'English',
  'es': 'Español',
  'et': 'Eesti',
  'fi': 'Suomi',
  'fr': 'Français',
  'hi': 'हिन्दी',
  'hr': 'Hrvatski',
  'hu': 'Magyar',
  'id': 'Bahasa Indonesia',
  'it': 'Italiano',
  'ja': '日本語',
  'ko': '한국어',
  'lt': 'Lietuvių',
  'lv': 'Latviešu',
  'ms': 'Bahasa Melayu',
  'nl': 'Nederlands',
  'no': 'Norsk',
  'pl': 'Polski',
  'pt': 'Português',
  'ro': 'Română',
  'ru': 'Русский',
  'sk': 'Slovenčina',
  'sl': 'Slovenščina',
  'sv': 'Svenska',
  'ta': 'தமிழ்',
  'th': 'ไทย',
  'tr': 'Türkçe',
  'uk': 'Українська',
  'ur': 'اردو',
  'vi': 'Tiếng Việt',
  'zh': '中文',
} as const;

export const LANGUAGES = [
  { value: 'ro', label: 'Română' },
  { value: 'ru', label: 'Русский' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
] as const;

export const DEFAULT_VALUES = {
  VOICE_ID: 'vrlYThSLKW8zkmzKp6HB',
  LANGUAGE: 'ro',
} as const;

export const MESSAGES = {
  ERRORS: {
    INVALID_URL: 'Te rog introdu un URL valid',
    MISSING_AGENT_NAME: 'Te rog completează numele agentului.',
    MISSING_AGENT_ID_OR_PHONE: 'Te rog introdu ID-ul agentului și numărul de telefon',
    PROMPT_GENERATION_FAILED: 'Nu am putut genera promptul',
    AGENT_CREATION_FAILED: 'Nu am putut crea agentul',
    CALL_INITIATION_FAILED: 'Nu am putut iniția apelul',
    CLIPBOARD_COPY_FAILED: 'Nu am putut copia ID-ul agentului',
  },
  SUCCESS: {
    PROMPT_GENERATED: 'Promptul a fost generat cu succes',
    AGENT_CREATED: 'a fost creat cu succes și a fost copiat în clipboard',
    CALL_INITIATED: 'Apelul a fost inițiat cu succes',
    CLIPBOARD_COPIED: 'ID-ul agentului a fost copiat în clipboard',
  },
  LOADING: {
    GENERATING_PROMPT: 'Se Generează Prompt',
    GENERATING_AGENT: 'Se Generează Agent',
  },
} as const;
