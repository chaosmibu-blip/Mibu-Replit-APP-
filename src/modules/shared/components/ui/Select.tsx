/**
 * Select - 下拉選擇器元件
 *
 * 提供從底部彈出的選項列表，支援載入狀態和空狀態處理。
 * 適用於國家、城市、分類等選擇場景。
 *
 * @example
 * <Select
 *   options={[
 *     { label: '台灣', value: 'TW' },
 *     { label: '日本', value: 'JP' },
 *   ]}
 *   value={selectedCountry}
 *   onChange={setSelectedCountry}
 *   placeholder="選擇國家"
 *   label="目的地"
 * />
 */
import React, { useState, ReactNode } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MibuBrand } from '../../../../../constants/Colors';

// ============ Props 介面定義 ============

/**
 * 選項資料結構
 */
interface Option {
  /** 顯示的文字 */
  label: string;
  /** 選項的值（唯一識別） */
  value: string | number;
}

/**
 * Select 元件的 Props 介面
 */
interface SelectProps {
  /** 可選擇的選項列表 */
  options: Option[];
  /** 目前選中的值 */
  value: string | number | null;
  /** 選擇變更時的回調函數 */
  onChange: (value: string | number) => void;
  /** 未選擇時顯示的提示文字，也用於 Modal 標題 */
  placeholder: string;
  /** 選擇器上方的標籤文字（可選） */
  label?: string;
  /** 是否顯示載入狀態（選項載入中） */
  loading?: boolean;
  /** Modal 底部的自訂內容（例如新增按鈕） */
  footerContent?: ReactNode;
}

// ============ 主元件 ============

/**
 * 下拉選擇器元件
 *
 * 點擊後從底部彈出 Modal 顯示選項列表。
 * 支援三種狀態：載入中、無選項、正常選項列表。
 */
export function Select({ options, value, onChange, placeholder, label, loading, footerContent }: SelectProps) {
  // 控制 Modal 開關狀態
  const [isOpen, setIsOpen] = useState(false);

  // 找出目前選中的選項物件
  const selectedOption = options.find(opt => opt.value === value);

  /**
   * 處理選項點擊
   * 更新選中值並關閉 Modal
   */
  const handleSelect = (optionValue: string | number) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      {/* 標籤文字 */}
      {label && <Text style={styles.label}>{label}</Text>}

      {/* 選擇器按鈕 */}
      <TouchableOpacity
        style={styles.selector}
        onPress={() => !loading && setIsOpen(true)}
        disabled={loading}
      >
        <Text style={[styles.selectorText, !selectedOption && styles.placeholder]}>
          {loading ? '載入中...' : (selectedOption?.label || placeholder)}
        </Text>
        <Ionicons name="chevron-down" size={20} color={MibuBrand.tan} />
      </TouchableOpacity>

      {/* 選項列表 Modal */}
      <Modal visible={isOpen} transparent animationType="slide">
        {/* 點擊背景關閉 Modal */}
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent}>
            {/* Modal 標題列 */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{placeholder}</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Ionicons name="close" size={24} color={MibuBrand.copper} />
              </TouchableOpacity>
            </View>

            {/* 根據狀態顯示不同內容 */}
            {loading ? (
              // 載入中狀態
              <View style={styles.emptyState}>
                <ActivityIndicator size="large" color={MibuBrand.brown} />
                <Text style={[styles.emptyText, { marginTop: 12 }]}>載入中...</Text>
              </View>
            ) : options.length === 0 ? (
              // 無選項狀態
              <View style={styles.emptyState}>
                <Ionicons name="alert-circle-outline" size={40} color={MibuBrand.tan} />
                <Text style={[styles.emptyText, { marginTop: 12 }]}>暫無選項</Text>
              </View>
            ) : (
              // 正常選項列表
              <FlatList
                data={options}
                keyExtractor={(item) => String(item.value)}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.option,
                      item.value === value && styles.selectedOption,
                    ]}
                    onPress={() => handleSelect(item.value)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        item.value === value && styles.selectedOptionText,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {/* 選中的選項顯示勾選圖示 */}
                    {item.value === value && (
                      <Ionicons name="checkmark" size={20} color={MibuBrand.brown} />
                    )}
                  </TouchableOpacity>
                )}
                style={styles.optionsList}
                ListFooterComponent={footerContent ? <View style={styles.footerContainer}>{footerContent}</View> : null}
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// ============ 樣式定義 ============

const styles = StyleSheet.create({
  /** 容器：提供底部間距 */
  container: {
    marginBottom: 16,
  },
  /** 標籤文字樣式 */
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: 8,
  },
  /** 選擇器按鈕：橫向排列、帶邊框 */
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: MibuBrand.creamLight,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  /** 選擇器文字 */
  selectorText: {
    fontSize: 16,
    color: MibuBrand.brownDark,
    fontWeight: '500',
  },
  /** 未選擇時的提示文字：使用較淺顏色 */
  placeholder: {
    color: MibuBrand.tan,
  },
  /** Modal 背景遮罩：半透明黑色 */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  /**
   * Modal 內容區：從底部彈出，圓角頂部
   *
   * 【截圖 2 修改】高度改為自適應
   * - 原本：height: '65%'（固定高度，選項少時顯得很空）
   * - 現在：maxHeight: '65%'（最大高度，選項少時自動縮小）
   * - 效果：國家選單只有台灣一個選項時，不會顯得太空
   */
  modalContent: {
    backgroundColor: MibuBrand.warmWhite,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '65%',
    paddingBottom: 34, // Safe area for bottom
  },
  /** Modal 標題列：左右對齊 */
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.tanLight,
  },
  /** Modal 標題文字 */
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  /** 選項列表容器 */
  optionsList: {
    paddingHorizontal: 8,
  },
  /** 單一選項：橫向排列 */
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginVertical: 2,
    borderRadius: 12,
  },
  /** 選中的選項：高亮背景 */
  selectedOption: {
    backgroundColor: MibuBrand.highlight,
  },
  /** 選項文字 */
  optionText: {
    fontSize: 16,
    color: MibuBrand.brownDark,
  },
  /** 選中的選項文字：加深顏色、加粗 */
  selectedOptionText: {
    color: MibuBrand.brown,
    fontWeight: '600',
  },
  /** 空狀態容器：居中對齊 */
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** 空狀態文字 */
  emptyText: {
    fontSize: 16,
    color: MibuBrand.tan,
  },
  /** 底部自訂內容容器 */
  footerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: 'center',
  },
});
