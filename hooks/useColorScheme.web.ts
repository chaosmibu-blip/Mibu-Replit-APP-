/**
 * 色彩主題 Hook - Web 平台版本
 *
 * 專為 Web 靜態渲染設計的 useColorScheme Hook
 * 解決 SSR/SSG 時的 hydration 問題
 *
 * 問題說明：
 * 在靜態渲染時，伺服器端無法知道使用者的系統主題偏好，
 * 因此需要在客戶端 hydration 後重新計算色彩主題
 *
 * 使用方式：
 * import { useColorScheme } from '@/hooks/useColorScheme';
 * // 在 Web 平台會自動使用此檔案
 *
 * @example
 * const colorScheme = useColorScheme();
 * // 初始回傳 'light'（避免 hydration 不一致）
 * // hydration 完成後回傳實際的系統主題
 */

import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * Web 平台專用的色彩主題 Hook
 *
 * @returns 色彩主題 ('light' | 'dark' | null)
 * - 在 hydration 完成前回傳 'light' 作為預設值
 * - hydration 完成後回傳系統實際的主題設定
 */
export function useColorScheme() {
  // 追蹤是否已完成 hydration
  const [hasHydrated, setHasHydrated] = useState(false);

  // 在元件掛載後標記 hydration 完成
  useEffect(() => {
    setHasHydrated(true);
  }, []);

  // 取得系統色彩主題
  const colorScheme = useRNColorScheme();

  // hydration 完成後回傳實際主題，否則回傳預設的 'light'
  if (hasHydrated) {
    return colorScheme;
  }

  return 'light';
}
