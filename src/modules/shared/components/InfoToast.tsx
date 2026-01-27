import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MibuBrand } from '@/constants/Colors';
import { Spacing, Radius, FontSize, Shadow, SemanticColors } from '@/theme/designTokens';

interface InfoToastProps {
  visible: boolean;
  message: string;
  duration?: number;
  onHide?: () => void;
}

export function InfoToast({ visible, message, duration = 3000, onHide }: InfoToastProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (visible) {
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

      const timer = setTimeout(() => {
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
          onHide?.();
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, fadeAnim, translateY, onHide]);

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
      <View style={styles.toast}>
        <Ionicons name="information-circle" size={20} color={SemanticColors.warning.dark} style={styles.icon} />
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
}

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
    backgroundColor: SemanticColors.warning.light,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: MibuBrand.warning,
    ...Shadow.md,
  },
  icon: {
    marginRight: Spacing.sm + 2,
  },
  message: {
    flex: 1,
    fontSize: FontSize.md,
    color: SemanticColors.warning.dark,
    fontWeight: '500',
    lineHeight: 20,
  },
});

export default InfoToast;
