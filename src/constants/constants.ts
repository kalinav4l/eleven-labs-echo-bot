// Backend Configuration
export const BACKEND_CONFIG = {
  BASE_URL: 'https://eleven-labs-echo-bot-backend-production.up.railway.app',
  TIMEOUT: 30000,
} as const;

// Application Configuration  
export const API_CONFIG = {
  // Keep this for any remaining legacy code, but it won't be used
  ELEVENLABS_API_KEY: '',
  ELEVENLABS_BASE_URL: 'https://api.elevenlabs.io/v1',
  // This should be configured in your backend now
  AGENT_PHONE_NUMBER_ID: 'pn_c4fa062b1e2649d892c26cc32defd39e',
} as const;

// Messages
export const MESSAGES = {
  SUCCESS: {
    CALL_INITIATED: "Apelul a fost inițiat cu succes!",
    AGENT_CREATED: "Agentul a fost creat cu succes!",
    AGENT_UPDATED: "Agentul a fost actualizat cu succes!",
    PROMPT_GENERATED: "Prompt-ul a fost generat cu succes!",
  },
  ERRORS: {
    CALL_INITIATION_FAILED: "Nu s-a putut iniția apelul. Te rog încearcă din nou.",
    AGENT_CREATION_FAILED: "Nu s-a putut crea agentul. Te rog verifică setările.",
    AGENT_UPDATE_FAILED: "Nu s-a putut actualiza agentul.",
    PROMPT_GENERATION_FAILED: "Nu s-a putut genera prompt-ul.",
    MISSING_AGENT_ID_OR_PHONE: "Te rog introdu ID-ul agentului și numărul de telefon.",
    NETWORK_ERROR: "Eroare de rețea. Te rog verifică conexiunea.",
  },
  LOADING: {
    CREATING_AGENT: "Se creează agentul...",
    UPDATING_AGENT: "Se actualizează agentul...",
    GENERATING_PROMPT: "Se generează prompt-ul...",
    INITIATING_CALL: "Se inițiază apelul...",
  },
} as const;

// Voice Configuration
export const VOICE_CONFIG = {
  DEFAULT_VOICE_ID: 'pNInz6obpgDQGcFmaJgB', // Adam voice
  DEFAULT_MODEL_ID: 'eleven_turbo_v2_5',
  SUPPORTED_LANGUAGES: [
    { code: 'en', name: 'English' },
    { code: 'ro', name: 'Română' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'it', name: 'Italiano' },
    { code: 'pt', name: 'Português' },
    { code: 'pl', name: 'Polski' },
    { code: 'tr', name: 'Türkçe' },
    { code: 'ru', name: 'Русский' },
    { code: 'nl', name: 'Nederlands' },
    { code: 'cs', name: 'Čeština' },
    { code: 'ar', name: 'العربية' },
    { code: 'zh', name: '中文' },
    { code: 'ja', name: '日本語' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'ko', name: '한국어' },
  ],
} as const;

// UI Configuration
export const UI_CONFIG = {
  TOAST_DURATION: 5000,
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
} as const;
