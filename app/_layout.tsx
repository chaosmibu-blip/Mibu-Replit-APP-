/**
 * 主應用層級佈局
 *
 * 這是整個 App 的根層級 Layout，負責：
 * - 全域 Provider 包裝（AppProvider、ThemeProvider）
 * - 字體載入
 * - Stack 導航結構定義
 * - StatusBar 設定
 * - 推播通知全域監聽（#042）
 *
 * 導航結構：
 * - login: 登入頁
 * - (tabs): 旅客主頁面（Tab 導航）
 * - economy/profile 等: 旅客功能頁面
 * - merchant-dashboard: 商家主控台
 * - specialist-dashboard: 專員主控台
 * - admin-dashboard: 管理員主控台
 * - pending-approval: 審核中等待頁
 */
import "../global.css";
import { useEffect, useState } from 'react';
import { Image, View, useWindowDimensions } from 'react-native';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// App 全程使用 MibuLightTheme，不支援 dark mode（所有元件顏色皆為品牌暖色系硬編碼）
import { AppProvider } from '../src/context/AppContext';
import { NetworkBanner } from '../src/modules/shared/components/ui/NetworkBanner';
import { useNotificationHandler } from '../hooks/useNotificationHandler';
import { MibuBrand } from '../constants/Colors';

// iPad 適配：螢幕寬度 > 600pt 視為平板，內容寬度取螢幕 85% 但最大 750pt
// iPad 13"(1024pt) → 750pt 內容 + 137pt×2 邊距
// iPad Air(834pt)  → 709pt 內容 + 62pt×2 邊距
// iPad Mini(744pt) → 632pt 內容 + 56pt×2 邊距
const TABLET_MAX_CONTENT_WIDTH = 750;
const TABLET_CONTENT_RATIO = 0.85;
const TABLET_BREAKPOINT = 600;

// 覆蓋 React Navigation 預設背景色，統一使用 Mibu warmWhite
const MibuLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: MibuBrand.warmWhite,
  },
};

// ============================================================
// 全域靜態圖片預載入
// 在 App 啟動時載入，避免用戶跳轉時才載入導致閃爍
// ============================================================
const PRELOAD_IMAGES = [
  require('../assets/images/icon.png'),
  require('../assets/images/coin-icon.png'),
  // 頭像改由 avatarService 從 Cloudinary URL 預載入（不再打包本地圖片）
];

/**
 * 預載入靜態圖片資源
 * 將 require() 的圖片解析為 URI 並呼叫 Image.prefetch
 */
function preloadImageAssets(): Promise<void> {
  const promises = PRELOAD_IMAGES.map((image) => {
    const resolved = Image.resolveAssetSource(image);
    if (resolved?.uri) {
      return Image.prefetch(resolved.uri);
    }
    return Promise.resolve();
  });
  return Promise.all(promises).then(() => {});
}

/**
 * 全域推播通知監聽器
 * 必須在 AppProvider 內部，才能使用 useAuth / useI18n / useGacha context
 */
function NotificationListener() {
  useNotificationHandler();
  return null;
}

export default function RootLayout() {
  const { width: screenWidth } = useWindowDimensions();
  const isTablet = screenWidth > TABLET_BREAKPOINT;
  const [assetsReady, setAssetsReady] = useState(false);
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // 啟動時預載入靜態圖片
  useEffect(() => {
    preloadImageAssets()
      .catch((e) => console.warn('資源預載入失敗，繼續啟動:', e))
      .finally(() => setAssetsReady(true));
  }, []);

  if (!loaded || !assetsReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={[
      { flex: 1 },
      isTablet && { backgroundColor: MibuBrand.creamLight },
    ]}>
      <AppProvider>
        <NotificationListener />
        <ThemeProvider value={MibuLightTheme}>
          <View style={[
            { flex: 1 },
            isTablet && {
              maxWidth: Math.min(screenWidth * TABLET_CONTENT_RATIO, TABLET_MAX_CONTENT_WIDTH),
              width: '100%',
              alignSelf: 'center',
              backgroundColor: MibuBrand.warmWhite,
              overflow: 'hidden',
              // 兩側陰影讓內容區有浮起感
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 8,
            },
          ]}>
            <Stack>
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="economy" options={{ headerShown: false }} />
              <Stack.Screen name="profile" options={{ headerShown: false }} />
              <Stack.Screen name="referral" options={{ headerShown: false }} />
              <Stack.Screen name="crowdfunding" options={{ headerShown: false }} />
              <Stack.Screen name="contribution" options={{ headerShown: false }} />
              <Stack.Screen name="favorites" options={{ headerShown: false }} />
              <Stack.Screen name="sos-contacts" options={{ headerShown: false }} />
              <Stack.Screen name="merchant-dashboard" options={{ headerShown: false }} />
              <Stack.Screen name="specialist-dashboard" options={{ headerShown: false }} />
              <Stack.Screen name="pending-approval" options={{ headerShown: false }} />
              <Stack.Screen name="admin-exclusions" options={{ headerShown: false }} />
              <Stack.Screen name="sos" options={{ headerShown: false }} />
              <Stack.Screen name="favorites-management" options={{ headerShown: false }} />
              <Stack.Screen name="partner-apply" options={{ headerShown: false }} />
              <Stack.Screen name="merchant-apply" options={{ headerShown: false }} />
              <Stack.Screen name="mailbox" options={{ headerShown: false }} />
              <Stack.Screen name="mailbox/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="notifications" options={{ headerShown: false }} />
              <Stack.Screen name="notification-preferences" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <NetworkBanner />
          </View>
          <StatusBar style="dark" />
        </ThemeProvider>
      </AppProvider>
    </GestureHandlerRootView>
  );
}
