import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vlad.weighttracker',
  appName: 'WeightTracker',
  webDir: 'www',
  // bundledWebRuntime: false,
  plugins: {
    AdMob: {
      iosAppId: 'ca-app-pub-XXXXXXXXXXXXXXXX~ZZZZZZZZZZ',
    },
  },
};

export default config;
