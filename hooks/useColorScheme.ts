/**
 * 色彩主題 Hook - 原生平台版本
 *
 * 直接使用 React Native 提供的 useColorScheme
 * 用於偵測系統的深色/淺色模式設定
 *
 * 使用方式：
 * import { useColorScheme } from '@/hooks/useColorScheme';
 *
 * @example
 * const colorScheme = useColorScheme();
 * // 回傳 'light' | 'dark' | null
 */

export { useColorScheme } from 'react-native';
