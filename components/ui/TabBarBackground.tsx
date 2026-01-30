/**
 * Tab Bar 背景元件 - Android/Web 版本
 *
 * 這是 Android 和 Web 平台的 shim（替代品）
 * 這些平台的 Tab Bar 通常是不透明的，不需要特殊背景處理
 *
 * 注意：iOS 平台會使用 TabBarBackground.ios.tsx 的模糊效果版本
 *
 * 使用方式：
 * import TabBarBackground, { useBottomTabOverflow } from '@/components/ui/TabBarBackground';
 */

/**
 * Tab Bar 背景元件
 * Android/Web 不需要特殊背景，回傳 undefined
 */
export default undefined;

/**
 * 取得底部 Tab Bar 溢出高度
 *
 * 用於計算內容區域的 padding，避免被 Tab Bar 遮擋
 *
 * Android/Web 版本：回傳 0（不需要額外 padding）
 * iOS 版本：回傳實際的 Tab Bar 高度
 *
 * @returns Tab Bar 溢出高度（此版本固定回傳 0）
 *
 * @example
 * const bottom = useBottomTabOverflow();
 * // 在 ScrollView 中使用
 * <ScrollView contentContainerStyle={{ paddingBottom: bottom }}>
 *   ...
 * </ScrollView>
 */
export function useBottomTabOverflow() {
  return 0;
}
