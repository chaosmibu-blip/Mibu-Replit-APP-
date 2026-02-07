/**
 * 主應用層級佈局
 *
 * 這是整個 App 的根層級 Layout，負責：
 * - 全域 Provider 包裝（AppProvider、ThemeProvider）
 * - 字體載入
 * - Stack 導航結構定義
 * - StatusBar 設定
 *
 * 導航結構：
 * - login: 登入頁
 * - (tabs): 旅客主頁面（Tab 導航）
 * - economy/profile/account 等: 旅客功能頁面
 * - merchant-dashboard: 商家主控台
 * - specialist-dashboard: 專員主控台
 * - admin-dashboard: 管理員主控台
 * - pending-approval: 審核中等待頁
 */
import "../global.css";
import { useEffect, useState } from 'react';
import { Image } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AppProvider } from '../src/context/AppContext';
import { NetworkBanner } from '../src/modules/shared/components/ui/NetworkBanner';
import { MibuBrand } from '../constants/Colors';

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

export default function RootLayout() {
  const colorScheme = useColorScheme();
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : MibuLightTheme}>
          <Stack>
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="economy" options={{ headerShown: false }} />
            <Stack.Screen name="profile" options={{ headerShown: false }} />
            <Stack.Screen name="account" options={{ headerShown: false }} />
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
            <Stack.Screen name="+not-found" />
          </Stack>
          <NetworkBanner />
          <StatusBar style="auto" />
        </ThemeProvider>
      </AppProvider>
    </GestureHandlerRootView>
  );
}
