/**
 * 專員模組 Stack 導航佈局
 *
 * 導航結構：
 * - history: 服務歷史
 * - profile: 專員資料
 * - tracking: 旅客追蹤
 * - travelers: 旅客列表
 */
import { Stack } from 'expo-router';

export default function SpecialistLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
