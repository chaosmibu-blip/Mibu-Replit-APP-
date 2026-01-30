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
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AppProvider } from '../src/context/AppContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <AppProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
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
        <StatusBar style="auto" />
      </ThemeProvider>
    </AppProvider>
  );
}
