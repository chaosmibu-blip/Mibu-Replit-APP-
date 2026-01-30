/**
 * TierBadge - 稀有度徽章元件
 *
 * 顯示商家優惠券的稀有度等級（SP、SSR、SR、S、R）。
 * 根據等級自動套用對應的品牌配色。
 *
 * 稀有度說明：
 * - SP: 最稀有（金色）
 * - SSR: 超稀有（紫銅色）
 * - SR: 稀有（深銅色）
 * - S: 普通稀有（淺銅色）
 * - R: 一般（米黃色）
 *
 * @example
 * // 基本用法
 * <TierBadge tier="SSR" />
 *
 * // 顯示機率
 * <TierBadge tier="SP" showProbability />
 *
 * // 大尺寸
 * <TierBadge tier="SR" size="large" />
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MerchantCouponTier } from '../../../types';
import { getTierStyle } from '../../../constants/tierStyles';

// ============ Props 介面定義 ============

/**
 * TierBadge 元件的 Props 介面
 */
interface TierBadgeProps {
  /** 稀有度等級 */
  tier: MerchantCouponTier;
  /** 是否使用中文（預設 true，目前僅影響未來可能的文字） */
  isZh?: boolean;
  /** 徽章尺寸：small 小、medium 中、large 大（預設 medium） */
  size?: 'small' | 'medium' | 'large';
  /** 是否顯示抽中機率（預設 false） */
  showProbability?: boolean;
}

// ============ 主元件 ============

/**
 * 稀有度徽章元件
 *
 * 透過 getTierStyle 取得對應等級的配色，
 * 包含背景色、邊框色、文字色和機率數值。
 */
export function TierBadge({ tier, isZh = true, size = 'medium', showProbability = false }: TierBadgeProps) {
  // 取得該等級的樣式配置
  const style = getTierStyle(tier);

  // 各尺寸的樣式數值
  const sizeStyles = {
    small: { paddingHorizontal: 6, paddingVertical: 2, fontSize: 10 },
    medium: { paddingHorizontal: 10, paddingVertical: 4, fontSize: 12 },
    large: { paddingHorizontal: 14, paddingVertical: 6, fontSize: 14 },
  };

  const currentSize = sizeStyles[size];

  return (
    <View style={[
      styles.badge,
      {
        backgroundColor: style.backgroundColor,
        borderColor: style.borderColor,
        paddingHorizontal: currentSize.paddingHorizontal,
        paddingVertical: currentSize.paddingVertical,
      }
    ]}>
      {/* 等級文字（如 SSR、SR） */}
      <Text style={[styles.tierText, { color: style.textColor, fontSize: currentSize.fontSize }]}>
        {tier}
      </Text>
      {/* 機率文字（可選） */}
      {showProbability && (
        <Text style={[styles.probText, { color: style.textColor, fontSize: currentSize.fontSize - 2 }]}>
          {style.probability}%
        </Text>
      )}
    </View>
  );
}

// ============ 樣式定義 ============

const styles = StyleSheet.create({
  /** 徽章容器：橫向排列、圓角、帶邊框 */
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  /** 等級文字：粗體 */
  tierText: {
    fontWeight: '700',
  },
  /** 機率文字：稍細、半透明 */
  probText: {
    fontWeight: '500',
    opacity: 0.8,
  },
});
