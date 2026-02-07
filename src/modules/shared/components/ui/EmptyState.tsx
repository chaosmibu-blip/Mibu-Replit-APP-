/**
 * EmptyState - 空狀態提示元件
 *
 * 當列表、頁面無資料時顯示的統一空狀態。
 * 支援自訂圖示、標題、描述、行動按鈕。
 *
 * @example
 * // 基本用法
 * <EmptyState
 *   icon="cube-outline"
 *   title="還沒有資料"
 *   description="試試看新增一筆吧"
 * />
 *
 * // 帶行動按鈕
 * <EmptyState
 *   icon="add-circle-outline"
 *   title="尚無優惠券"
 *   description="建立你的第一張優惠券"
 *   actionLabel="新增"
 *   onAction={() => setShowModal(true)}
 * />
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MibuBrand } from '../../../../../constants/Colors';
import { Spacing, Radius, FontSize } from '@/src/theme/designTokens';

interface EmptyStateProps {
  /** 圖示名稱（Ionicons） */
  icon?: keyof typeof Ionicons.glyphMap;
  /** 圖示大小（預設 48） */
  iconSize?: number;
  /** 圖示顏色（預設 tan） */
  iconColor?: string;
  /** 標題文字 */
  title: string;
  /** 描述文字（可選） */
  description?: string;
  /** 行動按鈕文字（可選，需搭配 onAction） */
  actionLabel?: string;
  /** 行動按鈕回調 */
  onAction?: () => void;
}

export function EmptyState({
  icon = 'file-tray-outline',
  iconSize = 48,
  iconColor = MibuBrand.tan,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={iconSize} color={iconColor} />
      <Text style={styles.title}>{title}</Text>
      {description && (
        <Text style={styles.description}>{description}</Text>
      )}
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.actionButton} onPress={onAction}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: MibuBrand.brownDark,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  description: {
    fontSize: FontSize.md,
    color: MibuBrand.copper,
    marginTop: Spacing.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionButton: {
    marginTop: Spacing.lg,
    minHeight: 44,
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    backgroundColor: MibuBrand.brown,
    borderRadius: Radius.sm,
  },
  actionText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: MibuBrand.warmWhite,
  },
});
