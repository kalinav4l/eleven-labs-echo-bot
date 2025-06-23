
export const BACKEND_CONFIG = {
  BASE_URL: 'https://eleven-labs-echo-bot-backend-production.up.railway.app',
  TIMEOUT: 30000,
} as const;

export const getBackendHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
});
