/**
 * 主題文字元件
 *
 * 自動根據當前主題（淺色/深色）套用對應的文字顏色
 * 提供多種預設文字樣式類型
 *
 * 使用方式：
 * import { ThemedText } from '@/components/ThemedText';
 *
 * @example
 * // 預設文字
 * <ThemedText>一般文字</ThemedText>
 *
 * // 標題文字
 * <ThemedText type="title">標題</ThemedText>
 *
 * // 自訂顏色覆寫
 * <ThemedText lightColor="#000" darkColor="#fff">自訂顏色</ThemedText>
 */

import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

/**
 * ThemedText Props 型別定義
 * 擴展 React Native Text 的所有 props
 */
export type ThemedTextProps = TextProps & {
  /** 淺色模式自訂顏色 */
  lightColor?: string;
  /** 深色模式自訂顏色 */
  darkColor?: string;
  /** 文字樣式類型 */
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

/**
 * 主題文字元件
 *
 * @param props.style - 額外的樣式覆寫
 * @param props.lightColor - 淺色模式自訂顏色（可選）
 * @param props.darkColor - 深色模式自訂顏色（可選）
 * @param props.type - 預設樣式類型（預設為 'default'）
 *
 * 樣式類型說明：
 * - default: 16px 正常字重，行高 24
 * - title: 32px 粗體，用於頁面標題
 * - defaultSemiBold: 16px 半粗體，用於強調文字
 * - subtitle: 20px 粗體，用於區塊標題
 * - link: 16px 藍色，用於可點擊連結
 *
 * @example
 * <ThemedText type="title">歡迎使用 Mibu</ThemedText>
 * <ThemedText type="subtitle">精選推薦</ThemedText>
 * <ThemedText>這是一段說明文字</ThemedText>
 * <ThemedText type="link">點擊查看更多</ThemedText>
 */
export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  // 根據主題取得文字顏色
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        // 根據類型套用對應樣式
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

/**
 * 預設文字樣式定義
 */
const styles = StyleSheet.create({
  /** 預設文字樣式 - 16px 正常 */
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  /** 半粗體文字樣式 - 16px 600 */
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  /** 標題樣式 - 32px 粗體 */
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  /** 副標題樣式 - 20px 粗體 */
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  /** 連結樣式 - 16px 藍色 */
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});
