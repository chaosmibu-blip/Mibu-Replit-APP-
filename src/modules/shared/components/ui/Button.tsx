import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { MibuBrand } from '../../../../../constants/Colors';
import { Spacing, Radius, FontSize } from '@/theme/designTokens';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  style,
  textStyle,
}: ButtonProps) {
  const isDisabled = disabled || loading;

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
        <ActivityIndicator color={variant === 'outline' ? MibuBrand.brown : MibuBrand.warmWhite} />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: MibuBrand.brown,
  },
  secondary: {
    backgroundColor: MibuBrand.dark,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: MibuBrand.brown,
  },
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: MibuBrand.warmWhite,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  outlineText: {
    color: MibuBrand.brown,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
});
