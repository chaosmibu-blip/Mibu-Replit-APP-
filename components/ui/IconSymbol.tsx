/**
 * 跨平台圖標元件 - Android/Web 版本
 *
 * 使用 Material Icons 作為 SF Symbols 的替代方案
 * 確保在 Android 和 Web 平台上也能顯示對應的圖標
 *
 * 注意：這是 Android/Web 的 fallback 版本
 * iOS 平台會使用 IconSymbol.ios.tsx 的原生 SF Symbols
 *
 * 使用方式：
 * import { IconSymbol } from '@/components/ui/IconSymbol';
 *
 * @example
 * <IconSymbol name="house.fill" size={24} color="#000" />
 *
 * @see https://icons.expo.fyi - Material Icons 目錄
 * @see https://developer.apple.com/sf-symbols/ - SF Symbols 目錄
 */

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

/** 圖標映射型別 - SF Symbols 名稱對應 Material Icons 名稱 */
type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;

/** 可用的圖標名稱型別 */
type IconSymbolName = keyof typeof MAPPING;

/**
 * SF Symbols 到 Material Icons 的映射表
 *
 * 新增圖標時：
 * 1. 在 SF Symbols App 中找到想要的圖標名稱
 * 2. 在 https://icons.expo.fyi 找到對應的 Material Icons
 * 3. 加入此映射表
 */
const MAPPING = {
  /** 首頁圖標 */
  'house.fill': 'home',
  /** 發送圖標 */
  'paperplane.fill': 'send',
  /** 程式碼圖標 */
  'chevron.left.forwardslash.chevron.right': 'code',
  /** 右箭頭圖標 */
  'chevron.right': 'chevron-right',
} as IconMapping;

/**
 * 跨平台圖標元件
 *
 * 在 iOS 使用原生 SF Symbols，在 Android/Web 使用 Material Icons
 * 圖標名稱基於 SF Symbols，會自動映射到對應的 Material Icons
 *
 * @param props.name - 圖標名稱（使用 SF Symbols 命名）
 * @param props.size - 圖標大小（預設 24）
 * @param props.color - 圖標顏色
 * @param props.style - 額外樣式
 * @param props.weight - 圖標粗細（iOS 專用，此版本忽略）
 *
 * @example
 * <IconSymbol
 *   name="house.fill"
 *   size={28}
 *   color={Colors.light.icon}
 * />
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight; // iOS 專用參數，此版本不使用
}) {
  // 使用映射表將 SF Symbols 名稱轉換為 Material Icons 名稱
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
