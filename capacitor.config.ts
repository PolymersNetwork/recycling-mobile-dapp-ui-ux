import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.60ce5f4f6cc74428b36221ffefa4b3b9',
  appName: 'eco-loop-chain',
  webDir: 'dist',
  server: {
    url: 'https://60ce5f4f-6cc7-4428-b362-21ffefa4b3b9.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      permissions: ['camera', 'photos']
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  }
};

export default config;