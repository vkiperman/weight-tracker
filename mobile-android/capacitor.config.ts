import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vlad.weighttracker',
  appName: 'WeightTracker',
  webDir: 'www',
  // bundledWebRuntime: false,
  plugins: {
    AdMob: {
      androidAppId: 'ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY',
    },
  },
  server: {
    androidScheme: 'https',
  },
};

export default config;
