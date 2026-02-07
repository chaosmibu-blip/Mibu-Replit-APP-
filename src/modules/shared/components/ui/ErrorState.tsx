/**
 * ErrorState - 錯誤狀態提示元件
 *
 * 當 API 失敗或載入錯誤時顯示的統一錯誤狀態。
 * 支援自訂訊息、重試按鈕。
 *
 * @example
 * // 基本用法
 * <ErrorState message="載入失敗" onRetry={loadData} />
 *
 * // 自訂圖示
 * <ErrorState
 *   icon="cloud-offline-outline"
 *   message="網路連線中斷"
 *   retryLabel="重新連線"
 *   onRetry={reconnect}
 * />
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MibuBrand, SemanticColors } from '../../../../../constants/Colors';
import { Spacing, Radius, FontSize } from '@/src/theme/designTokens';

interface ErrorStateProps {
  /** 圖示名稱（Ionicons，預設 alert-circle-outline） */
  icon?: keyof typeof Ionicons.glyphMap;
  /** 圖示大小（預設 48） */
  iconSize?: number;
  /** 錯誤訊息 */
  message: string;
  /** 詳細說明（可選） */
  detail?: string;
  /** 重試按鈕文字（預設「重試」） */
  retryLabel?: string;
  /** 重試回調（可選，有傳才顯示按鈕） */
  onRetry?: () => void;
}

export function ErrorState({
  icon = 'alert-circle-outline',
  iconSize = 48,
  message,
  detail,
  retryLabel = '重試',
  onRetry,
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={iconSize} color={SemanticColors.errorMain} />
      <Text style={styles.message}>{message}</Text>
      {detail && (
        <Text style={styles.detail}>{detail}</Text>
      )}
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Ionicons name="refresh" size={16} color={MibuBrand.warmWhite} />
          <Text style={styles.retryText}>{retryLabel}</Text>
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
  message: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: MibuBrand.brownDark,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  detail: {
    fontSize: FontSize.md,
    color: MibuBrand.copper,
    marginTop: Spacing.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    backgroundColor: MibuBrand.brown,
    borderRadius: Radius.sm,
  },
  retryText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: MibuBrand.warmWhite,
  },
});
