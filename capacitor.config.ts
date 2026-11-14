import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'se.skolintegratoren.game',
  appName: 'Skolintegratören',
  webDir: 'dist',
  // Matches --bg / theme-color so nothing flashes white behind the WebView.
  backgroundColor: '#0d1424',
  zoomEnabled: false,
  android: { allowMixedContent: false, zoomEnabled: false, backgroundColor: '#0d1424' },
  plugins: {
    // Edge-to-edge with light icons on the dark game background; the CSS pads with safe-area insets.
    SystemBars: { insetsHandling: 'css', style: 'DARK', initialViewportFitValueHint: 'cover' },
  },
};

export default config;
