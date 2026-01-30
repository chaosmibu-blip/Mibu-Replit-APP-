/**
 * FilterChips - 篩選晶片元件
 *
 * 用於頁面內的分類篩選，符合 Lovable 設計系統。
 * 提供多個篩選選項讓用戶快速切換類別。
 *
 * 特點：
 * - 支援兩種樣式變體（filled / outline）
 * - 可選擇是否水平滾動（選項過多時）
 * - 可顯示選項數量徽章
 *
 * @example
 * // 基本用法
 * <FilterChips
 *   options={[
 *     { key: 'all', label: '全部' },
 *     { key: 'coffee', label: '咖啡' },
 *     { key: 'tea', label: '茶飲' },
 *   ]}
 *   selected="all"
 *   onSelect={(key) => setFilter(key)}
 * />
 *
 * // 帶數量的篩選
 * <FilterChips
 *   options={[
 *     { key: 'all', label: '全部', count: 25 },
 *     { key: 'active', label: '使用中', count: 10 },
 *   ]}
 *   selected={filter}
 *   onSelect={setFilter}
 *   scrollable
 * />
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MibuBrand } from '../../../../constants/Colors';

// ============ Props 介面定義 ============

/**
 * 篩選選項資料結構
 */
export interface FilterOption {
  /** 選項唯一識別鍵值 */
  key: string;
  /** 顯示的文字標籤 */
  label: string;
  /** 選項數量（可選，顯示在標籤旁） */
  count?: number;
}

/**
 * FilterChips 元件的 Props 介面
 */
interface FilterChipsProps {
  /** 篩選選項列表 */
  options: FilterOption[];
  /** 目前選中的鍵值 */
  selected: string;
  /** 選擇變更時的回調函數 */
  onSelect: (key: string) => void;
  /** 是否允許水平滾動（當選項過多時）（預設 false） */
  scrollable?: boolean;
  /** 元件樣式變體：filled 實心、outline 邊框（預設 filled） */
  variant?: 'filled' | 'outline';
}

// ============ 主元件 ============

/**
 * 篩選晶片元件
 *
 * 根據 scrollable 參數決定使用 ScrollView 還是普通 View 作為容器。
 * 選中的晶片會變成棕色背景突顯。
 */
export function FilterChips({
  options,
  selected,
  onSelect,
  scrollable = false,
  variant = 'filled',
}: FilterChipsProps) {
  /**
   * 渲染單一晶片
   */
  const renderChip = (option: FilterOption) => {
    const isSelected = option.key === selected;

    return (
      <TouchableOpacity
        key={option.key}
        style={[
          styles.chip,
          variant === 'filled' && styles.chipFilled,
          variant === 'outline' && styles.chipOutline,
          isSelected && styles.chipSelected,
        ]}
        onPress={() => onSelect(option.key)}
        activeOpacity={0.7}
      >
        {/* 選項標籤文字 */}
        <Text
          style={[
            styles.chipText,
            variant === 'outline' && styles.chipTextOutline,
            isSelected && styles.chipTextSelected,
          ]}
        >
          {option.label}
        </Text>
        {/* 數量徽章（可選） */}
        {option.count !== undefined && (
          <View style={[styles.countBadge, isSelected && styles.countBadgeSelected]}>
            <Text style={[styles.countText, isSelected && styles.countTextSelected]}>
              {option.count}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // 可滾動模式：使用水平 ScrollView
  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {options.map(renderChip)}
      </ScrollView>
    );
  }

  // 一般模式：使用 View + flexWrap
  return <View style={styles.container}>{options.map(renderChip)}</View>;
}

// ============ 樣式定義 ============

const styles = StyleSheet.create({
  /** 容器：橫向排列、自動換行 */
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  /** 可滾動容器：橫向排列、加側邊間距 */
  scrollContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  /** 晶片基礎樣式：橫向排列、藥丸形圓角 */
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  /** 實心樣式：溫暖白背景 */
  chipFilled: {
    backgroundColor: MibuBrand.warmWhite,
  },
  /** 邊框樣式：透明背景 + 淡邊框 */
  chipOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
  },
  /** 選中狀態：棕色背景 */
  chipSelected: {
    backgroundColor: MibuBrand.brown,
    borderColor: MibuBrand.brown,
  },
  /** 晶片文字：銅色 */
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: MibuBrand.copper,
  },
  /** 邊框樣式的晶片文字：深棕色 */
  chipTextOutline: {
    color: MibuBrand.brownDark,
  },
  /** 選中狀態的文字：白色、加粗 */
  chipTextSelected: {
    color: MibuBrand.warmWhite,
    fontWeight: '600',
  },
  /** 數量徽章容器 */
  countBadge: {
    marginLeft: 6,
    backgroundColor: MibuBrand.tanLight,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  /** 選中狀態的數量徽章：半透明白色背景 */
  countBadgeSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  /** 數量文字 */
  countText: {
    fontSize: 11,
    fontWeight: '600',
    color: MibuBrand.copper,
  },
  /** 選中狀態的數量文字：白色 */
  countTextSelected: {
    color: MibuBrand.warmWhite,
  },
});
