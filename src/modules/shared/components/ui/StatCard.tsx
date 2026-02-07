/**
 * StatCard - 統計數據卡片元件
 *
 * 用於 Dashboard 顯示統計指標。
 * 支援數值、標籤、圖示、趨勢指示。
 *
 * @example
 * // 基本用法
 * <StatCard value={125} label="金幣" />
 *
 * // 帶圖示
 * <StatCard value={30} label="景點" icon="location" />
 *
 * // 帶趨勢
 * <StatCard value={85} label="完成率" suffix="%" trend="up" />
 *
 * // 水平排列
 * <View style={{ flexDirection: 'row', gap: 12 }}>
 *   <StatCard value={10} label="待處理" style={{ flex: 1 }} />
 *   <StatCard value={42} label="已完成" style={{ flex: 1 }} />
 * </View>
 */
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MibuBrand } from '../../../../../constants/Colors';
import { Spacing, Radius, FontSize, Shadow } from '@/src/theme/designTokens';

interface StatCardProps {
  /** 數值 */
  value: number | string;
  /** 標籤文字 */
  label: string;
  /** 圖示（可選） */
  icon?: keyof typeof Ionicons.glyphMap;
  /** 圖示顏色（預設 copper） */
  iconColor?: string;
  /** 數值後綴（如 %、元） */
  suffix?: string;
  /** 趨勢方向（可選） */
  trend?: 'up' | 'down' | 'neutral';
  /** 自訂容器樣式 */
  style?: ViewStyle;
}

export function StatCard({
  value,
  label,
  icon,
  iconColor = MibuBrand.copper,
  suffix,
  trend,
  style,
}: StatCardProps) {
  return (
    <View style={[styles.container, style]}>
      {icon && (
        <Ionicons name={icon} size={20} color={iconColor} style={styles.icon} />
      )}
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        {suffix && <Text style={styles.suffix}>{suffix}</Text>}
        {trend && trend !== 'neutral' && (
          <Ionicons
            name={trend === 'up' ? 'trending-up' : 'trending-down'}
            size={16}
            color={trend === 'up' ? MibuBrand.success : MibuBrand.error}
            style={styles.trendIcon}
          />
        )}
      </View>
      <Text style={styles.label} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadow.sm,
  },
  icon: {
    marginBottom: Spacing.sm,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  suffix: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: MibuBrand.copper,
    marginLeft: 2,
  },
  trendIcon: {
    marginLeft: Spacing.xs,
  },
  label: {
    fontSize: FontSize.sm,
    color: MibuBrand.copper,
    marginTop: Spacing.xs,
  },
});
