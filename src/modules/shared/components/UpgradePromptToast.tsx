/**
 * UpgradePromptToast - 訪客升級提示 Toast 元件（#051）
 *
 * 非阻塞式的底部提示，附帶 CTA 按鈕引導訪客綁定帳號。
 * 基於 InfoToast 的動畫模式，增加「前往綁定」按鈕。
 *
 * @example
 * <UpgradePromptToast
 *   visible={!!activePrompt}
 *   message={promptMessage}
 *   actionLabel={promptActionLabel}
 *   onAction={handlePromptAction}
 *   onDismiss={dismissPrompt}
 * />
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MibuBrand } from '@/constants/Colors';
import { Spacing, Radius, FontSize } from '@/src/theme/designTokens';

// ============ Props ============

interface UpgradePromptToastProps {
  visible: boolean;
  message: string;
  actionLabel: string;
  onAction: () => void;
  onDismiss: () => void;
  /** 自動消失時間（毫秒），預設 6000 */
  duration?: number;
}

// ============ 主元件 ============

export function UpgradePromptToast({
  visible,
  message,
  actionLabel,
  onAction,
  onDismiss,
  duration = 6000,
}: UpgradePromptToastProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      // 進場動畫
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // 自動消失
      timerRef.current = setTimeout(() => {
        animateOut();
      }, duration);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible]);

  const animateOut = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 20,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  const handleAction = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    onAction();
  };

  const handleDismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    animateOut();
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.toast}
        onPress={handleDismiss}
        activeOpacity={0.95}
      >
        <Ionicons name="link-outline" size={20} color={MibuBrand.warmWhite} style={styles.icon} />
        <Text style={styles.message} numberOfLines={2}>{message}</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleAction}
          activeOpacity={0.8}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ============ 樣式 ============

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: Spacing.lg,
    right: Spacing.lg,
    alignItems: 'center',
    zIndex: 1000,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MibuBrand.brown,
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  icon: {
    marginRight: Spacing.sm,
  },
  message: {
    flex: 1,
    fontSize: FontSize.sm,
    color: MibuBrand.warmWhite,
    fontWeight: '500',
    lineHeight: 18,
  },
  actionButton: {
    backgroundColor: MibuBrand.copper,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    marginLeft: Spacing.sm,
  },
  actionText: {
    fontSize: FontSize.sm,
    color: MibuBrand.warmWhite,
    fontWeight: '700',
  },
});

export default UpgradePromptToast;
