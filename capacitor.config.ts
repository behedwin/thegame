import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'se.skolintegratoren.game',
  appName: 'Skolintegratören',
  webDir: 'dist',
  android: { allowMixedContent: false },
};

export default config;
