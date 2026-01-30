/**
 * Card - 通用卡片元件
 *
 * 提供統一的卡片樣式，支援可點擊模式。
 * 符合 Mibu 品牌設計系統，使用溫暖的白色背景和陰影效果。
 *
 * @example
 * // 靜態卡片
 * <Card>
 *   <Text>卡片內容</Text>
 * </Card>
 *
 * // 可點擊卡片
 * <Card onPress={() => navigation.navigate('Detail')}>
 *   <Text>點擊查看詳情</Text>
 * </Card>
 *
 * // 自訂邊框顏色（用於強調）
 * <Card borderColor={MibuBrand.copper}>
 *   <Text>特殊卡片</Text>
 * </Card>
 */
import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { MibuBrand } from '../../../../../constants/Colors';
import { Spacing, Radius, Shadow } from '@/src/theme/designTokens';

// ============ Props 介面定義 ============

/**
 * Card 元件的 Props 介面
 */
interface CardProps {
  /** 卡片內容（子元件） */
  children: ReactNode;
  /** 自訂卡片樣式 */
  style?: ViewStyle;
  /** 點擊時觸發的回調函數，若提供則卡片變為可點擊 */
  onPress?: () => void;
  /** 自訂邊框顏色，設定後會顯示 2px 邊框 */
  borderColor?: string;
  /** 自訂背景顏色（預設使用 warmWhite） */
  backgroundColor?: string;
}

// ============ 主元件 ============

/**
 * 通用卡片元件
 *
 * 根據是否傳入 onPress 自動切換為可點擊或靜態模式。
 * 支援自訂邊框和背景顏色以滿足不同場景需求。
 */
export function Card({ children, style, onPress, borderColor, backgroundColor }: CardProps) {
  // 組合卡片樣式：基礎樣式 + 邊框（若有）+ 背景色（若有）+ 自訂樣式
  const cardStyle = [
    styles.card,
    borderColor && { borderColor, borderWidth: 2 },
    backgroundColor && { backgroundColor },
    style,
  ];

  // 有 onPress 時渲染可點擊的 TouchableOpacity
  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.8}>
        {children}
      </TouchableOpacity>
    );
  }

  // 否則渲染靜態的 View
  return <View style={cardStyle}>{children}</View>;
}

// ============ 樣式定義 ============

const styles = StyleSheet.create({
  /** 卡片基礎樣式：溫暖白背景、圓角、內距、陰影 */
  card: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    ...Shadow.md,
  },
});
