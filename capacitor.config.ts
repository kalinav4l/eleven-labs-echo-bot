import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.6a8507ea63eb494bbe2b18e0885c57d5',
  appName: 'eleven-labs-echo-bot',
  webDir: 'dist',
  server: {
    url: 'https://6a8507ea-63eb-494b-be2b-18e0885c57d5.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;