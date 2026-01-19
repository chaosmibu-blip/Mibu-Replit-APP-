/**
 * CtaButton - 行動呼籲按鈕
 * 符合 Lovable 設計系統的全寬主要按鈕
 */
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MibuBrand } from '../../../../constants/Colors';

interface CtaButtonProps {
  title: string;
  onPress: () => void;
  /** 左側圖標 */
  icon?: keyof typeof Ionicons.glyphMap;
  /** 是否顯示載入中狀態 */
  loading?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 樣式變體 */
  variant?: 'primary' | 'secondary' | 'danger';
}

export function CtaButton({
  title,
  onPress,
  icon,
  loading = false,
  disabled = false,
  variant = 'primary',
}: CtaButtonProps) {
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
        <ActivityIndicator
          color={variant === 'secondary' ? MibuBrand.brown : MibuBrand.warmWhite}
          size="small"
        />
      ) : (
        <View style={styles.content}>
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

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: MibuBrand.brown,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: MibuBrand.brown,
  },
  buttonDanger: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#C45C5C',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  textPrimary: {
    color: MibuBrand.warmWhite,
  },
  textSecondary: {
    color: MibuBrand.brown,
  },
  textDanger: {
    color: '#C45C5C',
  },
});
