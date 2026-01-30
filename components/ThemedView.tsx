/**
 * 主題視圖元件
 *
 * 自動根據當前主題（淺色/深色）套用對應的背景顏色
 * 可作為頁面或區塊的容器使用
 *
 * 使用方式：
 * import { ThemedView } from '@/components/ThemedView';
 *
 * @example
 * // 使用預設主題背景色
 * <ThemedView style={{ flex: 1 }}>
 *   <Text>內容</Text>
 * </ThemedView>
 *
 * // 自訂背景色
 * <ThemedView lightColor="#fff" darkColor="#000">
 *   <Text>自訂背景</Text>
 * </ThemedView>
 */

import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

/**
 * ThemedView Props 型別定義
 * 擴展 React Native View 的所有 props
 */
export type ThemedViewProps = ViewProps & {
  /** 淺色模式自訂背景色 */
  lightColor?: string;
  /** 深色模式自訂背景色 */
  darkColor?: string;
};

/**
 * 主題視圖元件
 *
 * @param props.style - 額外的樣式覆寫
 * @param props.lightColor - 淺色模式自訂背景色（可選）
 * @param props.darkColor - 深色模式自訂背景色（可選）
 *
 * @example
 * // 作為頁面容器
 * <ThemedView style={{ flex: 1, padding: 16 }}>
 *   <ThemedText>頁面內容</ThemedText>
 * </ThemedView>
 *
 * // 作為卡片容器（自訂顏色）
 * <ThemedView
 *   lightColor="#f5f5f5"
 *   darkColor="#333"
 *   style={{ padding: 12, borderRadius: 8 }}
 * >
 *   <ThemedText>卡片內容</ThemedText>
 * </ThemedView>
 */
export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  // 根據主題取得背景顏色
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
