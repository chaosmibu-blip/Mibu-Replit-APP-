/**
 * SegmentedControl - 分段選擇器元件
 *
 * 提供類似 iOS 原生的分段控制元件，用於在多個選項間切換。
 * 適用於頁面內的檢視模式切換、篩選條件切換等場景。
 *
 * @example
 * <SegmentedControl
 *   segments={[
 *     { key: 'list', label: '列表' },
 *     { key: 'grid', label: '網格' },
 *   ]}
 *   selectedKey={viewMode}
 *   onSelect={setViewMode}
 * />
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MibuBrand } from '@/constants/Colors';
import { Spacing, Radius, FontSize, Shadow } from '@/src/theme/designTokens';

// ============ Props 介面定義 ============

/**
 * 分段選項資料結構
 */
interface Segment {
  /** 選項的唯一識別鍵值 */
  key: string;
  /** 顯示的文字標籤 */
  label: string;
}

/**
 * SegmentedControl 元件的 Props 介面
 */
interface SegmentedControlProps {
  /** 分段選項列表 */
  segments: Segment[];
  /** 目前選中的鍵值 */
  selectedKey: string;
  /** 選擇變更時的回調函數 */
  onSelect: (key: string) => void;
}

// ============ 主元件 ============

/**
 * 分段選擇器元件
 *
 * 所有分段會平均分配寬度。
 * 選中的分段會有白色背景和陰影效果突顯。
 */
export function SegmentedControl({ segments, selectedKey, onSelect }: SegmentedControlProps) {
  return (
    <View style={styles.container}>
      {segments.map((segment) => {
        const isSelected = segment.key === selectedKey;
        return (
          <TouchableOpacity
            key={segment.key}
            style={[styles.segment, isSelected && styles.segmentSelected]}
            onPress={() => onSelect(segment.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.label, isSelected && styles.labelSelected]}>
              {segment.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ============ 樣式定義 ============

const styles = StyleSheet.create({
  /** 容器：橫向排列、淺色背景、小圓角 */
  container: {
    flexDirection: 'row',
    backgroundColor: MibuBrand.creamLight,
    borderRadius: Radius.md,
    padding: Spacing.xs,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
  },
  /** 單一分段：平均分配寬度、居中對齊 */
  segment: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** 選中的分段：白色背景 + 陰影 */
  segmentSelected: {
    backgroundColor: MibuBrand.warmWhite,
    ...Shadow.sm,
  },
  /** 分段標籤文字 */
  label: {
    fontSize: FontSize.md,
    fontWeight: '500',
    color: MibuBrand.brownLight,
  },
  /** 選中的分段標籤：加深顏色、加粗 */
  labelSelected: {
    color: MibuBrand.brown,
    fontWeight: '600',
  },
});
