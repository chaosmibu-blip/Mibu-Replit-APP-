/**
 * CtaButton - 行動呼籲按鈕（Call to Action Button）
 *
 * 符合 Lovable 設計系統的全寬主要按鈕。
 * 用於頁面底部的主要操作，如「確認」、「送出」、「下一步」等。
 *
 * 特點：
 * - 固定高度 52px，適合手指點擊
 * - 支援左側圖示
 * - 三種樣式變體（primary / secondary / danger）
 * - 載入狀態和禁用狀態
 *
 * @example
 * // 主要按鈕
 * <CtaButton title="確認預約" onPress={handleConfirm} />
 *
 * // 帶圖示的按鈕
 * <CtaButton title="分享行程" icon="share-outline" onPress={handleShare} />
 *
 * // 次要按鈕（邊框樣式）
 * <CtaButton title="取消" variant="secondary" onPress={handleCancel} />
 *
 * // 危險操作按鈕（紅色邊框）
 * <CtaButton title="刪除" variant="danger" onPress={handleDelete} />
 */
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MibuBrand } from '../../../../constants/Colors';

// ============ Props 介面定義 ============

/**
 * CtaButton 元件的 Props 介面
 */
interface CtaButtonProps {
  /** 按鈕顯示的文字 */
  title: string;
  /** 點擊時觸發的回調函數 */
  onPress: () => void;
  /** 左側圖示（Ionicons 名稱） */
  icon?: keyof typeof Ionicons.glyphMap;
  /** 是否顯示載入中狀態（預設 false） */
  loading?: boolean;
  /** 是否禁用按鈕（預設 false） */
  disabled?: boolean;
  /** 樣式變體：primary 主要、secondary 次要、danger 危險（預設 primary） */
  variant?: 'primary' | 'secondary' | 'danger';
}

// ============ 主元件 ============

/**
 * 行動呼籲按鈕元件
 *
 * 設計為全寬使用，適合放在頁面底部作為主要操作按鈕。
 */
export function CtaButton({
  title,
  onPress,
  icon,
  loading = false,
  disabled = false,
  variant = 'primary',
}: CtaButtonProps) {
  /**
   * 根據 variant 取得對應的按鈕樣式
   */
  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.buttonSecondary;
      case 'danger':
        return styles.buttonDanger;
      default:
        return styles.buttonPrimary;
    }
  };

  /**
   * 根據 variant 取得對應的文字樣式
   */
  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.textSecondary;
      case 'danger':
        return styles.textDanger;
      default:
        return styles.textPrimary;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, getButtonStyle(), disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        // 載入中顯示旋轉指示器
        <ActivityIndicator
          color={variant === 'secondary' ? MibuBrand.brown : MibuBrand.warmWhite}
          size="small"
        />
      ) : (
        <View style={styles.content}>
          {/* 左側圖示（可選） */}
          {icon && (
            <Ionicons
              name={icon}
              size={20}
              color={variant === 'secondary' ? MibuBrand.brown : MibuBrand.warmWhite}
              style={styles.icon}
            />
          )}
          <Text style={[styles.text, getTextStyle()]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ============ 樣式定義 ============

const styles = StyleSheet.create({
  /** 按鈕基礎樣式：固定高度、圓角 */
  button: {
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  /** 主要按鈕：棕色實心背景 */
  buttonPrimary: {
    backgroundColor: MibuBrand.brown,
  },
  /** 次要按鈕：透明背景 + 棕色邊框 */
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: MibuBrand.brown,
  },
  /** 危險按鈕：透明背景 + 紅色邊框 */
  buttonDanger: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#C45C5C',
  },
  /** 禁用狀態：降低透明度 */
  buttonDisabled: {
    opacity: 0.5,
  },
  /** 按鈕內容容器：橫向排列 */
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  /** 圖示右側間距 */
  icon: {
    marginRight: 8,
  },
  /** 按鈕文字基礎樣式 */
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  /** 主要按鈕文字：白色 */
  textPrimary: {
    color: MibuBrand.warmWhite,
  },
  /** 次要按鈕文字：棕色 */
  textSecondary: {
    color: MibuBrand.brown,
  },
  /** 危險按鈕文字：紅色 */
  textDanger: {
    color: '#C45C5C',
  },
});
