/**
 * Button - 通用按鈕元件
 *
 * 提供三種樣式變體的按鈕，支援載入狀態和禁用狀態。
 * 符合 Mibu 品牌設計系統。
 *
 * @example
 * // 主要按鈕
 * <Button title="確認" onPress={handlePress} />
 *
 * // 次要按鈕（深色背景）
 * <Button title="取消" variant="secondary" onPress={handleCancel} />
 *
 * // 邊框按鈕
 * <Button title="了解更多" variant="outline" onPress={handleMore} />
 *
 * // 載入中狀態
 * <Button title="送出" loading={true} onPress={handleSubmit} />
 */
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { MibuBrand } from '../../../../../constants/Colors';
import { Spacing, Radius, FontSize } from '@/src/theme/designTokens';

// ============ Props 介面定義 ============

/**
 * Button 元件的 Props 介面
 */
interface ButtonProps {
  /** 按鈕顯示的文字 */
  title: string;
  /** 點擊時觸發的回調函數 */
  onPress: () => void;
  /** 是否禁用按鈕（預設 false） */
  disabled?: boolean;
  /** 是否顯示載入中狀態（預設 false） */
  loading?: boolean;
  /** 按鈕樣式變體：primary 主要、secondary 次要、outline 邊框（預設 primary） */
  variant?: 'primary' | 'secondary' | 'outline';
  /** 自訂按鈕容器樣式 */
  style?: ViewStyle;
  /** 自訂按鈕文字樣式 */
  textStyle?: TextStyle;
}

// ============ 主元件 ============

/**
 * 通用按鈕元件
 *
 * 當 loading 或 disabled 為 true 時，按鈕會被禁用。
 * loading 狀態會顯示旋轉的載入指示器。
 */
export function Button({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  style,
  textStyle,
}: ButtonProps) {
  // 載入中或禁用時，按鈕都不可點擊
  const isDisabled = disabled || loading;

  /**
   * 根據 variant 取得對應的按鈕樣式
   */
  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondary;
      case 'outline':
        return styles.outline;
      default:
        return styles.primary;
    }
  };

  /**
   * 根據 variant 取得對應的文字樣式
   * outline 變體使用深色文字，其他使用淺色文字
   */
  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return styles.outlineText;
      default:
        return styles.buttonText;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        // 載入中顯示旋轉指示器，顏色根據變體調整
        <ActivityIndicator color={variant === 'outline' ? MibuBrand.brown : MibuBrand.warmWhite} />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

// ============ 樣式定義 ============

const styles = StyleSheet.create({
  /** 按鈕基礎樣式 */
  button: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** 主要按鈕：棕色背景 */
  primary: {
    backgroundColor: MibuBrand.brown,
  },
  /** 次要按鈕：深色背景 */
  secondary: {
    backgroundColor: MibuBrand.dark,
  },
  /** 邊框按鈕：透明背景 + 棕色邊框 */
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: MibuBrand.brown,
  },
  /** 禁用狀態：降低透明度 */
  disabled: {
    opacity: 0.5,
  },
  /** 一般按鈕文字：白色粗體 */
  buttonText: {
    color: MibuBrand.warmWhite,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  /** 邊框按鈕文字：棕色粗體 */
  outlineText: {
    color: MibuBrand.brown,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
});
