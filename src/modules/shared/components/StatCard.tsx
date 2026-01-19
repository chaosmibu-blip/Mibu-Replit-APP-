/**
 * StatCard - 統計卡片元件
 * 用於數據分析頁面顯示統計數值
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MibuBrand, SemanticColors } from '../../../../constants/Colors';

interface StatCardProps {
  label: string;
  value: number | string;
  /** 變化量（正數顯示綠色，負數顯示紅色） */
  change?: number;
  /** 左上角圖標 */
  icon?: keyof typeof Ionicons.glyphMap;
  /** 圖標顏色 */
  iconColor?: string;
  /** 是否格式化數字（加入千分位） */
  formatNumber?: boolean;
}

export function StatCard({
  label,
  value,
  change,
  icon,
  iconColor = MibuBrand.copper,
  formatNumber = true,
}: StatCardProps) {
  const displayValue = formatNumber && typeof value === 'number'
    ? value.toLocaleString()
    : value;

  const changeText = change !== undefined
    ? (change >= 0 ? `+${change}` : `${change}`)
    : null;

  const changeColor = change !== undefined
    ? (change >= 0 ? SemanticColors.successMain : SemanticColors.errorMain)
    : undefined;

  return (
    <View style={styles.card}>
      {icon && (
        <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>
      )}
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{displayValue}</Text>
      {changeText && (
        <Text style={[styles.change, { color: changeColor }]}>{changeText}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16,
    padding: 16,
    minHeight: 100,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    color: MibuBrand.copper,
    marginBottom: 4,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  change: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
});
