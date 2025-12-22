const IS_EAS_BUILD = process.env.EAS_BUILD === 'true';
const IS_EAS_UPDATE = process.env.EAS_UPDATE === 'true';
const IS_PRODUCTION = IS_EAS_BUILD || IS_EAS_UPDATE || process.env.APP_ENV === 'production';

const baseConfig = {
  name: 'Mibu',
  slug: 'mibu-travel',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'mibu',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#F5E6D3',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
};

const developmentConfig = {
  ...baseConfig,
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#F5E6D3',
    },
    edgeToEdgeEnabled: true,
  },
};

const productionConfig = {
  ...baseConfig,
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.mibu.travel',
    buildNumber: '1',
    infoPlist: {
      NSLocationWhenInUseUsageDescription: '我們需要您的位置來提供附近的旅遊景點推薦',
      NSLocationAlwaysAndWhenInUseUsageDescription: '我們需要您的位置來提供即時旅遊導航服務',
      NSCameraUsageDescription: '用於掃描 QR Code 兌換優惠券',
      NSPhotoLibraryUsageDescription: '用於儲存旅遊照片',
    },
  },
  android: {
    package: 'com.mibu.travel',
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#F5E6D3',
    },
    edgeToEdgeEnabled: true,
    permissions: [
      'ACCESS_FINE_LOCATION',
      'ACCESS_COARSE_LOCATION',
      'CAMERA',
      'READ_EXTERNAL_STORAGE',
      'WRITE_EXTERNAL_STORAGE',
    ],
  },
  updates: {
    url: 'https://u.expo.dev/f1c74b9b-747d-450c-8c99-22a7729b4a31',
    fallbackToCacheTimeout: 0,
  },
  runtimeVersion: {
    policy: 'appVersion',
  },
  extra: {
    eas: {
      projectId: 'f1c74b9b-747d-450c-8c99-22a7729b4a31',
    },
  },
};

const config = IS_PRODUCTION ? productionConfig : developmentConfig;

console.log(`📱 Expo Config Mode: ${IS_PRODUCTION ? '🚀 PRODUCTION' : '🔧 DEVELOPMENT'}`);

export default {
  expo: config,
};
