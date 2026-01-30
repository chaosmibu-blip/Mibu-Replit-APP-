/**
 * 規劃模組 Stack 導航佈局
 *
 * 導航結構：
 * - index: 規劃主頁面（含定位、行程、聊天分頁）
 *
 * 注意：此 Tab 在父層 _layout.tsx 中設為 href: null（隱藏）
 */
import { Stack } from 'expo-router';
import React from 'react';

export default function PlannerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
