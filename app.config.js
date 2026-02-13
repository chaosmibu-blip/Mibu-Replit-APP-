/**
 * Expo 應用程式設定檔
 *
 * 此檔案定義 App 的基本資訊、平台設定、權限宣告等
 * 會根據環境變數自動切換開發/正式模式
 *
 * @see https://docs.expo.dev/workflow/configuration/
 *
 * ============ 環境切換邏輯 ============
 * - EAS_BUILD=true     → EAS Build 雲端編譯時
 * - EAS_UPDATE=true    → EAS Update OTA 更新時
 * - APP_ENV=production → 手動指定正式環境
 */

// ============ 環境判斷 ============
const IS_EAS_BUILD = process.env.EAS_BUILD === 'true';
const IS_EAS_UPDATE = process.env.EAS_UPDATE === 'true';
const IS_PRODUCTION = IS_EAS_BUILD || IS_EAS_UPDATE || process.env.APP_ENV === 'production';

// ============ 基礎設定（開發/正式共用） ============
const baseConfig = {
  name: 'Mibu',                          // App 名稱（顯示在手機桌面）
  slug: 'mibu-travel',                   // Expo 專案識別碼（URL 用）
  version: '1.1.0',                      // App 版本號
  orientation: 'portrait',               // 螢幕方向：僅支援直向
  icon: './assets/images/icon.png',      // App 圖示（1024x1024）
  scheme: 'mibu',                        // Deep Link scheme（mibu://）
  userInterfaceStyle: 'automatic',       // 深色模式：跟隨系統
  newArchEnabled: true,                  // 啟用 React Native 新架構

  // Web 平台設定
  web: {
    bundler: 'metro',                    // 使用 Metro 打包（統一三平台）
    output: 'static',                    // 輸出靜態檔案
    favicon: './assets/images/favicon.png',
  },

  // Expo 插件
  plugins: [
    'expo-router',                       // 檔案式路由
    [
      'expo-splash-screen',              // 啟動畫面
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#F5E6D3',      // Mibu 品牌奶油色
      },
    ],
    [
      'expo-media-library',              // 相簿存取（儲存 Mini 頭像）
      {
        photosPermission: '允許 Mibu 儲存圖片到您的相簿',
        savePhotosPermission: '允許 Mibu 儲存圖片到您的相簿',
      },
    ],
  ],

  // 實驗性功能
  experiments: {
    typedRoutes: true,                   // 啟用 TypeScript 路由型別
  },

  // EAS Update OTA 更新設定（開發/正式共用）
  updates: {
    url: 'https://u.expo.dev/f1c74b9b-747d-450c-8c99-22a7729b4a31',
    fallbackToCacheTimeout: 0,           // 無網路時直接用快取
  },
  runtimeVersion: {
    policy: 'appVersion',                // 用 App 版本號作為 runtime 版本
  },

  // EAS 專案設定
  extra: {
    eas: {
      projectId: 'f1c74b9b-747d-450c-8c99-22a7729b4a31',
    },
  },
};

// ============ 開發環境設定 ============
// 用於本地開發和 Expo Go 測試
const developmentConfig = {
  ...baseConfig,
  ios: {
    supportsTablet: true,                // 支援 iPad（但會以 2x 模式運行）
    bundleIdentifier: 'com.chaos.mibu',  // iOS Bundle ID
    usesAppleSignIn: true,               // 啟用 Apple 登入
  },
  android: {
    package: 'com.chaos.mibu',           // Android 套件名稱
    adaptiveIcon: {                      // Android 自適應圖示
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#F5E6D3',
    },
    edgeToEdgeEnabled: true,             // 啟用全螢幕模式
  },
};

// ============ 正式環境設定 ============
// 用於 App Store / Google Play 上架
const productionConfig = {
  ...baseConfig,
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.chaos.mibu',
    buildNumber: '1',                    // iOS Build 號（每次提審要遞增）
    usesAppleSignIn: true,
    // iOS 權限說明文字（App Store 審核必填）
    infoPlist: {
      NSLocationWhenInUseUsageDescription: '我們需要您的位置來提供附近的旅遊景點推薦',
      NSLocationAlwaysAndWhenInUseUsageDescription: '我們需要您的位置來提供即時旅遊導航服務',
      NSCameraUsageDescription: '用於掃描 QR Code 兌換優惠券',
      NSPhotoLibraryUsageDescription: '用於儲存旅遊照片',
    },
  },
  android: {
    package: 'com.chaos.mibu',
    versionCode: 1,                      // Android 版本碼（每次上架要遞增）
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#F5E6D3',
    },
    edgeToEdgeEnabled: true,
    // Android 權限宣告
    permissions: [
      'ACCESS_FINE_LOCATION',            // 精確定位
      'ACCESS_COARSE_LOCATION',          // 粗略定位
      'CAMERA',                          // 相機（掃 QR Code）
      'READ_EXTERNAL_STORAGE',           // 讀取相簿
      'WRITE_EXTERNAL_STORAGE',          // 寫入相簿
    ],
  },
};

// ============ 匯出設定 ============
// 根據環境變數自動選擇設定
const config = IS_PRODUCTION ? productionConfig : developmentConfig;

// 啟動時顯示當前模式（方便除錯）
console.log(`📱 Expo Config Mode: ${IS_PRODUCTION ? '🚀 PRODUCTION' : '🔧 DEVELOPMENT'}`);

export default {
  expo: config,
};
