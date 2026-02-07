/**
 * CoinReward - 金幣獎勵顯示元件
 *
 * 統一顯示金幣 icon + 數量的元件，確保全域金幣顯示一致。
 * 使用自訂台灣幸運幣圖示。
 *
 * @example
 * // 基本用法（任務獎勵）
 * <CoinReward amount={5} />
 *
 * // 較大尺寸（標題區域）
 * <CoinReward amount={100} size="lg" />
 *
 * // 顯示 + 號前綴
 * <CoinReward amount={30} showPlus />
 */
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { MibuBrand } from '../../../../../constants/Colors';
import { Spacing, FontSize } from '@/src/theme/designTokens';

// 預先 require，避免每次渲染都重新解析
const COIN_ICON = require('../../../../../assets/images/coin-icon.png');

type CoinSize = 'sm' | 'md' | 'lg';

const SIZE_CONFIG: Record<CoinSize, { icon: number; font: number }> = {
  sm: { icon: 14, font: FontSize.sm },
  md: { icon: 18, font: FontSize.md },
  lg: { icon: 24, font: FontSize.xl },
};

interface CoinRewardProps {
  /** 金幣數量 */
  amount: number;
  /** 尺寸（預設 md） */
  size?: CoinSize;
  /** 是否顯示 + 號前綴（預設 true） */
  showPlus?: boolean;
  /** 文字顏色（預設 warning） */
  textColor?: string;
}

export function CoinReward({
  amount,
  size = 'md',
  showPlus = true,
  textColor = MibuBrand.warning,
}: CoinRewardProps) {
  const config = SIZE_CONFIG[size];
  const prefix = showPlus ? '+' : '';

  return (
    <View style={styles.container}>
      <Image
        source={COIN_ICON}
        style={{ width: config.icon, height: config.icon }}
      />
      <Text style={[styles.text, { fontSize: config.font, color: textColor }]}>
        {prefix}{amount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  text: {
    fontWeight: '600',
  },
});
