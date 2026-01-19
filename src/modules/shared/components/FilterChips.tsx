/**
 * FilterChips - 篩選晶片元件
 * 用於頁面內的分類篩選，符合 Lovable 設計系統
 *
 * @example
 * <FilterChips
 *   options={[
 *     { key: 'all', label: '全部' },
 *     { key: 'coffee', label: '咖啡' },
 *     { key: 'tea', label: '茶飲' },
 *   ]}
 *   selected="all"
 *   onSelect={(key) => setFilter(key)}
 * />
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MibuBrand } from '../../../../constants/Colors';

export interface FilterOption {
  key: string;
  label: string;
  count?: number;
}

interface FilterChipsProps {
  options: FilterOption[];
  selected: string;
  onSelect: (key: string) => void;
  /** 是否允許水平滾動（當選項過多時） */
  scrollable?: boolean;
  /** 元件樣式變體 */
  variant?: 'filled' | 'outline';
}

export function FilterChips({
  options,
  selected,
  onSelect,
  scrollable = false,
  variant = 'filled',
}: FilterChipsProps) {
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
        <Text
          style={[
            styles.chipText,
            variant === 'outline' && styles.chipTextOutline,
            isSelected && styles.chipTextSelected,
          ]}
        >
          {option.label}
        </Text>
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

  return <View style={styles.container}>{options.map(renderChip)}</View>;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  scrollContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  chipFilled: {
    backgroundColor: MibuBrand.warmWhite,
  },
  chipOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
  },
  chipSelected: {
    backgroundColor: MibuBrand.brown,
    borderColor: MibuBrand.brown,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: MibuBrand.copper,
  },
  chipTextOutline: {
    color: MibuBrand.brownDark,
  },
  chipTextSelected: {
    color: MibuBrand.warmWhite,
    fontWeight: '600',
  },
  countBadge: {
    marginLeft: 6,
    backgroundColor: MibuBrand.tanLight,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  countBadgeSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  countText: {
    fontSize: 11,
    fontWeight: '600',
    color: MibuBrand.copper,
  },
  countTextSelected: {
    color: MibuBrand.warmWhite,
  },
});
