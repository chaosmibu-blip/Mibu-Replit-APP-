/**
 * Tab Bar 背景元件 - iOS 原生版本
 *
 * 使用 iOS 原生的模糊效果（BlurView）作為 Tab Bar 背景
 * 提供類似系統 App 的半透明毛玻璃效果
 *
 * 注意：此檔案僅在 iOS 平台使用
 * Android/Web 會使用 TabBarBackground.tsx 的簡化版本
 *
 * 使用方式：
 * import TabBarBackground, { useBottomTabOverflow } from '@/components/ui/TabBarBackground';
 * // 在 iOS 上會自動使用此檔案
 */

import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';

/**
 * 模糊效果 Tab Bar 背景元件
 *
 * 使用 expo-blur 的 BlurView 實現 iOS 風格的毛玻璃效果
 * 固定使用淺色（light）風格以維持品牌一致性
 *
 * @example
 * // 在 Tab Navigator 中使用
 * <Tabs
 *   screenOptions={{
 *     tabBarBackground: () => <BlurTabBarBackground />,
 *   }}
 * />
 */
export default function BlurTabBarBackground() {
  return (
    <BlurView
      // 強制使用淺色模糊效果
      // 無論系統深色/淺色模式，都維持品牌一致性
      tint="light"
      intensity={100}
      style={StyleSheet.absoluteFill}
    />
  );
}

/**
 * 取得底部 Tab Bar 溢出高度
 *
 * 用於計算內容區域的 padding，避免被半透明 Tab Bar 遮擋
 * 在 iOS 上回傳實際的 Tab Bar 高度
 *
 * @returns Tab Bar 高度（像素）
 *
 * @example
 * const bottom = useBottomTabOverflow();
 *
 * // 在 ScrollView 中使用，確保內容不被 Tab Bar 遮擋
 * <ScrollView contentContainerStyle={{ paddingBottom: bottom }}>
 *   <View>內容...</View>
 * </ScrollView>
 *
 * // 在 FlatList 中使用
 * <FlatList
 *   contentContainerStyle={{ paddingBottom: bottom }}
 *   data={items}
 *   renderItem={renderItem}
 * />
 */
export function useBottomTabOverflow() {
  return useBottomTabBarHeight();
}
