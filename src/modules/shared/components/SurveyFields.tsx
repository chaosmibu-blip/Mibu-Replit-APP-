/**
 * ============================================================
 * 問卷共用元件 (SurveyFields.tsx)
 * ============================================================
 * 提供自己人申請、商家申請問卷使用的共用表單元件
 *
 * 包含：
 * - SurveySectionTitle — 分段標題
 * - TextInputField — 文字輸入（含必填標記）
 * - SingleSelectField — 單選 chips
 * - MultiSelectField — 多選 chips（支援 maxSelect）
 * - RegionPickerField — 縣市下拉選單
 *
 * 更新日期：2026-02-22
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MibuBrand } from '../../../../constants/Colors';
import { Spacing, Radius, FontSize } from '../../../theme/designTokens';

// ============================================================
// 台灣縣市列表
// ============================================================

export const TAIWAN_REGIONS = [
  '台北市', '新北市', '基隆市', '桃園市', '新竹市', '新竹縣',
  '苗栗縣', '台中市', '彰化縣', '南投縣', '雲林縣', '嘉義市',
  '嘉義縣', '台南市', '高雄市', '屏東縣', '宜蘭縣', '花蓮縣',
  '台東縣', '澎湖縣', '金門縣', '連江縣',
];

// ============================================================
// Props 型別
// ============================================================

interface SurveySectionTitleProps {
  step: number;
  title: string;
}

interface TextInputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  required?: boolean;
  multiline?: boolean;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
}

interface SelectOption {
  value: string;
  label: string;
}

interface SingleSelectFieldProps {
  label: string;
  options: SelectOption[];
  selected: string;
  onSelect: (value: string) => void;
  required?: boolean;
}

interface MultiSelectFieldProps {
  label: string;
  options: SelectOption[];
  selected: string[];
  onToggle: (value: string) => void;
  required?: boolean;
  maxSelect?: number;
  maxSelectHint?: string;
}

interface RegionPickerFieldProps {
  label: string;
  value: string;
  onSelect: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}

// ============================================================
// SurveySectionTitle — 分段標題
// ============================================================

export function SurveySectionTitle({ step, title }: SurveySectionTitleProps) {
  return (
    <View style={styles.sectionTitleContainer}>
      <View style={styles.sectionStepBadge}>
        <Text style={styles.sectionStepText}>{step}</Text>
      </View>
      <Text style={styles.sectionTitleText}>{title}</Text>
    </View>
  );
}

// ============================================================
// TextInputField — 文字輸入
// ============================================================

export function TextInputField({
  label,
  value,
  onChangeText,
  required = false,
  multiline = false,
  placeholder,
  keyboardType = 'default',
}: TextInputFieldProps) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        {label}
        {required && <Text style={styles.requiredMark}> *</Text>}
      </Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        placeholder={placeholder}
        placeholderTextColor={MibuBrand.tanLight}
        keyboardType={keyboardType}
        autoCapitalize="none"
      />
    </View>
  );
}

// ============================================================
// SingleSelectField — 單選 chips
// ============================================================

export function SingleSelectField({
  label,
  options,
  selected,
  onSelect,
  required = false,
}: SingleSelectFieldProps) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        {label}
        {required && <Text style={styles.requiredMark}> *</Text>}
      </Text>
      <View style={styles.chipGrid}>
        {options.map(opt => {
          const isSelected = selected === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => onSelect(opt.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ============================================================
// MultiSelectField — 多選 chips
// ============================================================

export function MultiSelectField({
  label,
  options,
  selected,
  onToggle,
  required = false,
  maxSelect,
  maxSelectHint,
}: MultiSelectFieldProps) {
  const isMaxReached = maxSelect != null && selected.length >= maxSelect;

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        {label}
        {required && <Text style={styles.requiredMark}> *</Text>}
      </Text>
      {maxSelectHint && (
        <Text style={styles.fieldHint}>{maxSelectHint}</Text>
      )}
      <View style={styles.chipGrid}>
        {options.map(opt => {
          const isSelected = selected.includes(opt.value);
          const isDisabled = !isSelected && isMaxReached;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.chip,
                isSelected && styles.chipSelected,
                isDisabled && styles.chipDisabled,
              ]}
              onPress={() => !isDisabled && onToggle(opt.value)}
              activeOpacity={isDisabled ? 1 : 0.7}
            >
              <Text style={[
                styles.chipText,
                isSelected && styles.chipTextSelected,
                isDisabled && styles.chipTextDisabled,
              ]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ============================================================
// RegionPickerField — 縣市下拉選單
// ============================================================

export function RegionPickerField({
  label,
  value,
  onSelect,
  required = false,
  placeholder,
}: RegionPickerFieldProps) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        {label}
        {required && <Text style={styles.requiredMark}> *</Text>}
      </Text>
      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.pickerText, !value && styles.pickerPlaceholder]}>
          {value || placeholder || ''}
        </Text>
        <Ionicons name="chevron-down" size={20} color={MibuBrand.copper} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={MibuBrand.brownDark} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={TAIWAN_REGIONS}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    item === value && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    onSelect(item);
                    setModalVisible(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.modalItemText,
                    item === value && styles.modalItemTextSelected,
                  ]}>
                    {item}
                  </Text>
                  {item === value && (
                    <Ionicons name="checkmark" size={20} color={MibuBrand.brown} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ============================================================
// 樣式定義
// ============================================================

const styles = StyleSheet.create({
  // ========== 分段標題 ==========
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xxl,
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.tanLight,
  },
  sectionStepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: MibuBrand.brown,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  sectionStepText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionTitleText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },

  // ========== 欄位容器 ==========
  fieldContainer: {
    marginBottom: Spacing.xl,
  },
  fieldLabel: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: MibuBrand.brownDark,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  requiredMark: {
    color: MibuBrand.error,
  },
  fieldHint: {
    fontSize: FontSize.sm,
    color: MibuBrand.copper,
    marginBottom: Spacing.sm,
  },

  // ========== 文字輸入 ==========
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: MibuBrand.brownDark,
  },
  inputMultiline: {
    minHeight: 100,
    paddingTop: Spacing.md,
  },

  // ========== Chip 選項 ==========
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
    backgroundColor: '#FFFFFF',
  },
  chipSelected: {
    backgroundColor: MibuBrand.creamLight,
    borderColor: MibuBrand.brown,
  },
  chipDisabled: {
    opacity: 0.4,
  },
  chipText: {
    fontSize: FontSize.md,
    color: MibuBrand.brownLight,
  },
  chipTextSelected: {
    color: MibuBrand.brown,
    fontWeight: '600',
  },
  chipTextDisabled: {
    color: MibuBrand.tanLight,
  },

  // ========== 下拉選單按鈕 ==========
  pickerButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerText: {
    fontSize: FontSize.md,
    color: MibuBrand.brownDark,
  },
  pickerPlaceholder: {
    color: MibuBrand.tanLight,
  },

  // ========== Modal ==========
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    maxHeight: '60%',
    paddingBottom: Spacing.xxl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.tanLight,
  },
  modalTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  modalItemSelected: {
    backgroundColor: MibuBrand.creamLight,
  },
  modalItemText: {
    fontSize: FontSize.md,
    color: MibuBrand.brownDark,
  },
  modalItemTextSelected: {
    color: MibuBrand.brown,
    fontWeight: '600',
  },
});
