/**
 * TagInput - 標籤輸入元件
 *
 * 用於輸入多個標籤/關鍵字的元件。
 * 適合用於商品標籤、搜尋關鍵字、分類標籤等場景。
 *
 * 特點：
 * - 顯示已新增的標籤列表
 * - 支援刪除單一標籤
 * - 按 Enter 或點擊 + 按鈕新增標籤
 * - 自動過濾重複標籤
 *
 * @example
 * const [tags, setTags] = useState<string[]>(['咖啡', '甜點']);
 *
 * <TagInput
 *   value={tags}
 *   onChange={setTags}
 *   placeholder="新增標籤..."
 * />
 */
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MibuBrand } from '@/constants/Colors';
import { Spacing, Radius, FontSize } from '@/src/theme/designTokens';

// ============ Props 介面定義 ============

/**
 * TagInput 元件的 Props 介面
 */
interface TagInputProps {
  /** 目前的標籤陣列 */
  value: string[];
  /** 標籤變更時的回調函數 */
  onChange: (tags: string[]) => void;
  /** 輸入框提示文字 */
  placeholder?: string;
}

// ============ 主元件 ============

/**
 * 標籤輸入元件
 *
 * 用戶可以在輸入框中輸入標籤，按 Enter 或點擊 + 按鈕新增。
 * 重複的標籤會被自動過濾。
 */
export function TagInput({ value, onChange, placeholder }: TagInputProps) {
  // 輸入框目前的文字
  const [inputValue, setInputValue] = useState('');

  /**
   * 新增標籤
   * 會去除前後空白，並檢查是否重複
   */
  const addTag = () => {
    const trimmed = inputValue.trim();
    // 有內容且不重複才新增
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setInputValue('');
    }
  };

  /**
   * 移除指定索引的標籤
   */
  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
      {/* 標籤列表 */}
      <View style={styles.tagList}>
        {value.map((tag, idx) => (
          <View key={idx} style={styles.tag}>
            {/* 標籤文字 */}
            <Text style={styles.tagText}>{tag}</Text>
            {/* 刪除按鈕 */}
            <TouchableOpacity onPress={() => removeTag(idx)} style={styles.removeButton}>
              <Ionicons name="close-circle" size={16} color={MibuBrand.brownLight} />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* 輸入區域 */}
      <View style={styles.inputRow}>
        {/* 輸入框 */}
        <TextInput
          value={inputValue}
          onChangeText={setInputValue}
          placeholder={placeholder}
          placeholderTextColor={MibuBrand.brownLight}
          onSubmitEditing={addTag}  // 按 Enter 新增標籤
          style={styles.input}
          returnKeyType="done"
        />
        {/* 新增按鈕 */}
        <TouchableOpacity onPress={addTag} style={styles.addButton}>
          <Ionicons name="add" size={20} color={MibuBrand.warmWhite} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ============ 樣式定義 ============

const styles = StyleSheet.create({
  /** 容器：白色背景、圓角、邊框 */
  container: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
  },
  /** 標籤列表：橫向排列、自動換行 */
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  /** 單一標籤：橫向排列、圓角背景 */
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MibuBrand.cream,
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    gap: Spacing.xs,
  },
  /** 標籤文字 */
  tagText: {
    fontSize: FontSize.md,
    color: MibuBrand.dark,
  },
  /** 刪除按鈕：小間距 */
  removeButton: {
    marginLeft: 2,
  },
  /** 輸入區域：橫向排列 */
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  /** 輸入框：填滿剩餘空間 */
  input: {
    flex: 1,
    fontSize: FontSize.md,
    color: MibuBrand.dark,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: MibuBrand.creamLight,
    borderRadius: Radius.sm,
  },
  /** 新增按鈕：圓形棕色按鈕 */
  addButton: {
    width: 36,
    height: 36,
    backgroundColor: MibuBrand.brown,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
