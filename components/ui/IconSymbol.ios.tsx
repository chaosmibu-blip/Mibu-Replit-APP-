/**
 * 跨平台圖標元件 - iOS 原生版本
 *
 * 使用 iOS 原生的 SF Symbols 系統圖標
 * 提供最佳的視覺效果和系統一致性
 *
 * 注意：此檔案僅在 iOS 平台使用
 * Android/Web 會使用 IconSymbol.tsx 的 Material Icons 版本
 *
 * 使用方式：
 * import { IconSymbol } from '@/components/ui/IconSymbol';
 * // 在 iOS 上會自動使用此檔案
 *
 * @example
 * <IconSymbol
 *   name="house.fill"
 *   size={24}
 *   color="#000"
 *   weight="medium"
 * />
 *
 * @see https://developer.apple.com/sf-symbols/ - SF Symbols 目錄
 */

import { SymbolView, SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { StyleProp, ViewStyle } from 'react-native';

/**
 * iOS 原生圖標元件
 *
 * 使用 expo-symbols 套件渲染 iOS 原生 SF Symbols
 * 支援圖標粗細（weight）設定
 *
 * @param props.name - SF Symbols 圖標名稱
 * @param props.size - 圖標大小（預設 24）
 * @param props.color - 圖標顏色
 * @param props.style - 額外樣式
 * @param props.weight - 圖標粗細（預設 'regular'）
 *
 * 可用的 weight 值：
 * - ultraLight
 * - thin
 * - light
 * - regular（預設）
 * - medium
 * - semibold
 * - bold
 * - heavy
 * - black
 *
 * @example
 * // 一般使用
 * <IconSymbol name="star.fill" size={20} color="#FFD700" />
 *
 * // 設定粗細
 * <IconSymbol name="heart.fill" size={24} color="red" weight="bold" />
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight = 'regular',
}: {
  name: SymbolViewProps['name'];
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  return (
    <SymbolView
      weight={weight}
      tintColor={color}
      resizeMode="scaleAspectFit"
      name={name}
      style={[
        {
          width: size,
          height: size,
        },
        style,
      ]}
    />
  );
}
