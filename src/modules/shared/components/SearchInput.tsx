/**
 * SearchInput - 搜尋框元件
 *
 * 符合 Lovable 設計系統的搜尋輸入框。
 * 提供搜尋圖示、清除按鈕等常見搜尋功能。
 *
 * 特點：
 * - 左側搜尋圖示
 * - 有輸入內容時顯示清除按鈕
 * - 支援自動聚焦
 * - 禁用自動大寫和自動校正（適合搜尋場景）
 *
 * @example
 * // 基本用法
 * <SearchInput
 *   value={searchText}
 *   onChangeText={setSearchText}
 * />
 *
 * // 自訂 placeholder 和自動聚焦
 * <SearchInput
 *   value={keyword}
 *   onChangeText={setKeyword}
 *   placeholder="搜尋景點..."
 *   autoFocus
 * />
 */
import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MibuBrand } from '../../../../constants/Colors';

// ============ Props 介面定義 ============

/**
 * SearchInput 元件的 Props 介面
 */
interface SearchInputProps {
  /** 輸入框的值 */
  value: string;
  /** 輸入變更時的回調函數 */
  onChangeText: (text: string) => void;
  /** 輸入框提示文字（預設「搜尋...」） */
  placeholder?: string;
  /** 是否自動聚焦（預設 false） */
  autoFocus?: boolean;
  /** 清除按鈕點擊後的額外回調（可選） */
  onClear?: () => void;
}

// ============ 主元件 ============

/**
 * 搜尋框元件
 *
 * 當輸入框有內容時，會在右側顯示清除按鈕。
 * 點擊清除按鈕會清空輸入並觸發 onClear 回調（如果有）。
 */
export default function SearchInput({
  value,
  onChangeText,
  placeholder = '搜尋...',
  autoFocus = false,
  onClear,
}: SearchInputProps) {
  /**
   * 處理清除按鈕點擊
   * 清空輸入並呼叫 onClear 回調
   */
  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };

  return (
    <View style={styles.container}>
      {/* 左側搜尋圖示 */}
      <Ionicons name="search-outline" size={20} color={MibuBrand.tan} style={styles.icon} />

      {/* 輸入框 */}
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={MibuBrand.tan}
        autoFocus={autoFocus}
        autoCapitalize="none"  // 禁用自動大寫（搜尋場景通常不需要）
        autoCorrect={false}    // 禁用自動校正
      />

      {/* 清除按鈕（有內容時才顯示） */}
      {value.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <Ionicons name="close-circle" size={18} color={MibuBrand.tan} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ============ 樣式定義 ============

const styles = StyleSheet.create({
  /** 容器：橫向排列、白色背景、圓角邊框 */
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
    paddingHorizontal: 14,
    height: 48,
  },
  /** 搜尋圖示：右側間距 */
  icon: {
    marginRight: 10,
  },
  /** 輸入框：填滿剩餘空間 */
  input: {
    flex: 1,
    fontSize: 15,
    color: MibuBrand.brownDark,
    paddingVertical: 0,  // 移除預設垂直 padding
  },
  /** 清除按鈕：左側間距、增加點擊區域 */
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
});
