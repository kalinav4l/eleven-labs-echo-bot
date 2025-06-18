
// Environment configuration that works both in development and Docker
interface EnvironmentConfig {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  ELEVENLABS_API_KEY: string;
  ELEVENLABS_BASE_URL: string;
  DEFAULT_MODEL_ID: string;
  AGENT_PHONE_NUMBER_ID: string;
  APP_URL: string;
  NODE_ENV: string;
}

// Function to get environment variables from window.ENV (injected by Docker) or import.meta.env
const getEnvironmentConfig = (): EnvironmentConfig => {
  // Check if running in Docker (window.ENV is injected by docker-entrypoint.sh)
  if (typeof window !== 'undefined' && (window as any).ENV) {
    return (window as any).ENV;
  }

  // Fallback to Vite environment variables for development
  return {
    SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://pwfczzxwjfxomqzhhwvj.supabase.co',
    SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3ZmN6enh3amZ4b21xemhod3ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NDI5NDYsImV4cCI6MjA2NDAxODk0Nn0.IgOvpvhe3fW4OnRLN39eVfP5E1hq4lHat0lZH_1jQfs',
    ELEVENLABS_API_KEY: import.meta.env.VITE_ELEVENLABS_API_KEY || 'sk_2685ed11d030a3f3befffd09cb2602ac8a19a26458df4873',
    ELEVENLABS_BASE_URL: import.meta.env.VITE_ELEVENLABS_BASE_URL || 'https://api.elevenlabs.io/v1',
    DEFAULT_MODEL_ID: import.meta.env.VITE_DEFAULT_MODEL_ID || 'eleven_flash_v2_5',
    AGENT_PHONE_NUMBER_ID: import.meta.env.VITE_AGENT_PHONE_NUMBER_ID || 'phnum_01jxaeyg3feh3tmx39d4ky63rd',
    APP_URL: import.meta.env.VITE_APP_URL || 'http://localhost:8080',
    NODE_ENV: import.meta.env.NODE_ENV || 'development',
  };
};

export const ENV = getEnvironmentConfig();

// Export individual environment variables for convenience
export const {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  ELEVENLABS_API_KEY,
  ELEVENLABS_BASE_URL,
  DEFAULT_MODEL_ID,
  AGENT_PHONE_NUMBER_ID,
  APP_URL,
  NODE_ENV,
} = ENV;

// Helper functions
export const isProduction = () => NODE_ENV === 'production';
export const isDevelopment = () => NODE_ENV === 'development';
export const isTest = () => NODE_ENV === 'test';
