/**
 * 扭蛋模組 Stack 導航佈局
 *
 * 導航結構：
 * - index: 扭蛋主頁面
 * - items: 扭蛋道具頁面（以 modal 方式呈現）
 */
import { Stack } from 'expo-router';
import React from 'react';

export default function GachaLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="items" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
