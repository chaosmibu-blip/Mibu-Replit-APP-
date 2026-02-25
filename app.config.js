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

// ============ 版本常數（統一管理，避免兩邊不同步） ============
const IOS_BUILD_NUMBER = '4';            // iOS Build 號（每次提審要遞增）
const ANDROID_VERSION_CODE = 1;          // Android 版本碼（每次上架要遞增）

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
    // expo-media-library：權限描述統一在 infoPlist 區段設定，避免 plugin 覆蓋
    'expo-media-library',
    [
      'expo-notifications',              // 推播通知（Android 通知列 icon）
      {
        icon: './assets/images/icon.png',
        color: '#7A5230',                // MibuBrand.brown
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
    supportsTablet: true,                // 支援 iPad（已上架不可移除，以 2x 模式運行）
    requireFullScreen: true,             // 禁用 iPad 多工（Split View / Slide Over），避免窄視窗跑版
    bundleIdentifier: 'com.chaos.mibu',  // iOS Bundle ID
    buildNumber: IOS_BUILD_NUMBER,
    usesAppleSignIn: true,               // 啟用 Apple 登入
  },
  android: {
    package: 'com.chaos.mibu',           // Android 套件名稱
    versionCode: ANDROID_VERSION_CODE,
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
    supportsTablet: true,                // 已上架不可移除，iPad 以全螢幕模式運行
    requireFullScreen: true,             // 禁用 iPad 多工（Split View / Slide Over），避免窄視窗跑版
    bundleIdentifier: 'com.chaos.mibu',
    buildNumber: IOS_BUILD_NUMBER,
    usesAppleSignIn: true,
    // iOS 權限說明文字（App Store 審核必填）
    // 注意：只宣告實際有使用的權限，未使用的權限會被 Apple 退件（Guideline 5.1.1）
    infoPlist: {
      NSLocationWhenInUseUsageDescription: '允許 Mibu 取得您的位置，以便為您導航至想去的地點。例如：在圖鑑或行程頁面點擊景點的「導航」按鈕後，系統會根據您的所在位置開啟地圖並規劃前往該景點的路線。',
      NSPhotoLibraryUsageDescription: '允許 Mibu 存取您的相簿，讓您可以從相簿中選擇一張照片作為個人頭像。例如：在「設定 > 個人資料」頁面，點擊頭像後選擇「從相簿選擇」上傳自訂照片。',
      NSPhotoLibraryAddUsageDescription: '允許 Mibu 將圖片儲存到您的相簿。例如：在行程頁面中，您可以將 AI 旅伴 Mini 的頭像圖片儲存到相簿。',
      ITSAppUsesNonExemptEncryption: false,  // App 未使用非豁免加密，避免每次提審手動確認
      // Google OAuth redirect URI（expo-auth-session 回調用）
      CFBundleURLTypes: [
        {
          CFBundleURLSchemes: [
            'com.googleusercontent.apps.543517647590-3fpo4kl895apdp3tt2ditgj5leo034dv',
          ],
        },
      ],
    },
  },
  android: {
    package: 'com.chaos.mibu',
    versionCode: ANDROID_VERSION_CODE,
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#F5E6D3',
    },
    edgeToEdgeEnabled: true,
    // Android 權限宣告（只宣告實際有使用的權限）
    permissions: [
      'ACCESS_FINE_LOCATION',            // 精確定位
      'ACCESS_COARSE_LOCATION',          // 粗略定位
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
