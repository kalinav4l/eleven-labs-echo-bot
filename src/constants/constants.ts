// Constants for the Agent Consultant application

export const API_CONFIG = {
  ELEVENLABS_API_KEY: 'sk_2685ed11d030a3f3befffd09cb2602ac8a19a26458df4873',
  ELEVENLABS_BASE_URL: 'https://api.elevenlabs.io/v1',
  DEFAULT_MODEL_ID: 'eleven_flash_v2_5',
  AGENT_PHONE_NUMBER_ID: 'phnum_01jxaeyg3feh3tmx39d4ky63rd',
} as const;

export const VOICES = [
  { id: 'cjVigY5qzO86Huf0OWal', name: 'Eric' },
  { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah' },
  { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura' },
  { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie' },
] as const;

export const LANGUAGES = [
  { value: 'ro', label: 'Română' },
  { value: 'ru', label: 'Русский' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
] as const;

export const DEFAULT_VALUES = {
  VOICE_ID: 'cjVigY5qzO86Huf0OWal',
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

