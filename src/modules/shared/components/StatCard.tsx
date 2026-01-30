/**
 * StatCard - 統計卡片元件
 *
 * 用於數據分析頁面顯示統計數值。
 * 適合展示 KPI、總數、變化量等數據指標。
 *
 * 特點：
 * - 支援左上角圖示
 * - 自動格式化數字（千分位）
 * - 顯示變化量（正數綠色、負數紅色）
 *
 * @example
 * // 基本用法
 * <StatCard label="總營收" value={125000} />
 *
 * // 帶圖示和變化量
 * <StatCard
 *   label="本月訂單"
 *   value={42}
 *   icon="cart-outline"
 *   change={+5}
 * />
 *
 * // 顯示字串值
 * <StatCard label="狀態" value="營運中" formatNumber={false} />
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MibuBrand, SemanticColors } from '../../../../constants/Colors';

// ============ Props 介面定義 ============

/**
 * StatCard 元件的 Props 介面
 */
interface StatCardProps {
  /** 統計項目標籤 */
  label: string;
  /** 統計數值（數字或字串） */
  value: number | string;
  /** 變化量（正數顯示綠色 +N，負數顯示紅色 -N） */
  change?: number;
  /** 左上角圖示（Ionicons 名稱） */
  icon?: keyof typeof Ionicons.glyphMap;
  /** 圖示顏色（預設 copper） */
  iconColor?: string;
  /** 是否格式化數字（加入千分位）（預設 true） */
  formatNumber?: boolean;
}

// ============ 主元件 ============

/**
 * 統計卡片元件
 *
 * 設計為 flex: 1，方便在水平排列中平均分配寬度。
 * 通常會多個 StatCard 並排使用。
 */
export function StatCard({
  label,
  value,
  change,
  icon,
  iconColor = MibuBrand.copper,
  formatNumber = true,
}: StatCardProps) {
  // 格式化顯示值：數字加入千分位，字串直接顯示
  const displayValue = formatNumber && typeof value === 'number'
    ? value.toLocaleString()
    : value;

  // 格式化變化量文字：正數加 + 號
  const changeText = change !== undefined
    ? (change >= 0 ? `+${change}` : `${change}`)
    : null;

  // 變化量顏色：正數綠色、負數紅色
  const changeColor = change !== undefined
    ? (change >= 0 ? SemanticColors.successMain : SemanticColors.errorMain)
    : undefined;

  return (
    <View style={styles.card}>
      {/* 圖示（可選） */}
      {icon && (
        <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>
      )}

      {/* 標籤 */}
      <Text style={styles.label}>{label}</Text>

      {/* 數值 */}
      <Text style={styles.value}>{displayValue}</Text>

      {/* 變化量（可選） */}
      {changeText && (
        <Text style={[styles.change, { color: changeColor }]}>{changeText}</Text>
      )}
    </View>
  );
}

// ============ 樣式定義 ============

const styles = StyleSheet.create({
  /** 卡片容器：flex:1 平均分配、白色背景、圓角 */
  card: {
    flex: 1,
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16,
    padding: 16,
    minHeight: 100,
  },
  /** 圖示容器：圓形、半透明背景 */
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  /** 標籤文字：小字、銅色 */
  label: {
    fontSize: 13,
    color: MibuBrand.copper,
    marginBottom: 4,
  },
  /** 數值文字：大字、粗體、深色 */
  value: {
    fontSize: 28,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  /** 變化量文字 */
  change: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
});
