import "../global.css";
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { PaperProvider } from 'react-native-paper';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AppProvider } from '../src/context/AppContext';
import { mibuLightTheme, mibuDarkTheme } from '../src/theme/paperTheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  const paperTheme = colorScheme === 'dark' ? mibuDarkTheme : mibuLightTheme;

  return (
    <PaperProvider theme={paperTheme}>
      <AppProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
    </PaperProvider>
  );
}
