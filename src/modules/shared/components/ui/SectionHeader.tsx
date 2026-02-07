/**
 * SectionHeader - 區段標題元件
 *
 * 頁面中各區塊的統一標題列。
 * 支援標題、副標題、右側動作按鈕。
 *
 * @example
 * // 基本用法
 * <SectionHeader title="每日任務" />
 *
 * // 帶副標題
 * <SectionHeader title="成就" subtitle="3/10 已完成" />
 *
 * // 帶右側動作
 * <SectionHeader
 *   title="我的優惠券"
 *   actionLabel="查看全部"
 *   onAction={() => router.push('/coupons')}
 * />
 *
 * // 帶圖示
 * <SectionHeader title="統計" icon="stats-chart" />
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MibuBrand } from '../../../../../constants/Colors';
import { Spacing, FontSize } from '@/src/theme/designTokens';

interface SectionHeaderProps {
  /** 區段標題 */
  title: string;
  /** 副標題（可選，顯示在標題右側或下方） */
  subtitle?: string;
  /** 標題前圖示（可選） */
  icon?: keyof typeof Ionicons.glyphMap;
  /** 圖示顏色（預設 copper） */
  iconColor?: string;
  /** 右側動作按鈕文字（可選） */
  actionLabel?: string;
  /** 右側動作回調 */
  onAction?: () => void;
  /** 自訂下方間距（預設 Spacing.md） */
  marginBottom?: number;
}

export function SectionHeader({
  title,
  subtitle,
  icon,
  iconColor = MibuBrand.copper,
  actionLabel,
  onAction,
  marginBottom = Spacing.md,
}: SectionHeaderProps) {
  return (
    <View style={[styles.container, { marginBottom }]}>
      <View style={styles.left}>
        {icon && (
          <Ionicons name={icon} size={18} color={iconColor} style={styles.icon} />
        )}
        <Text style={styles.title}>{title}</Text>
        {subtitle && (
          <Text style={styles.subtitle}>{subtitle}</Text>
        )}
      </View>
      {actionLabel && onAction && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onAction}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
          <Ionicons name="chevron-forward" size={14} color={MibuBrand.copper} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: Spacing.sm,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: MibuBrand.copper,
    marginLeft: Spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    // 確保觸控區域 ≥ 44pt
    minHeight: 44,
  },
  actionText: {
    fontSize: FontSize.md,
    color: MibuBrand.copper,
    marginRight: 2,
  },
});
