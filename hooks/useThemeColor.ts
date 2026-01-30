/**
 * 主題色彩 Hook
 *
 * 根據當前主題（淺色/深色）自動選擇對應的顏色
 * 支援自訂覆寫和從 Colors 配置取得預設值
 *
 * 使用方式：
 * import { useThemeColor } from '@/hooks/useThemeColor';
 *
 * @see https://docs.expo.dev/guides/color-schemes/
 *
 * @example
 * // 使用預設主題色彩
 * const backgroundColor = useThemeColor({}, 'background');
 *
 * // 自訂淺色/深色模式的顏色
 * const textColor = useThemeColor(
 *   { light: '#000', dark: '#fff' },
 *   'text'
 * );
 */

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

/**
 * 取得主題對應的顏色
 *
 * @param props - 自訂的淺色/深色顏色覆寫
 * @param props.light - 淺色模式自訂顏色（可選）
 * @param props.dark - 深色模式自訂顏色（可選）
 * @param colorName - Colors 配置中的顏色名稱
 * @returns 根據當前主題選擇的顏色值
 *
 * @example
 * // 取得主題的背景色
 * const bg = useThemeColor({}, 'background');
 *
 * // 覆寫特定情境的顏色
 * const customBg = useThemeColor({ light: '#fff', dark: '#000' }, 'background');
 */
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  // 取得當前主題，預設為淺色模式
  const theme = useColorScheme() ?? 'light';

  // 優先使用 props 中的自訂顏色
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    // 若無自訂顏色，從 Colors 配置取得
    return Colors[theme][colorName];
  }
}
