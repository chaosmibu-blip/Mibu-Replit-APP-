/**
 * NetworkBanner - 網路狀態橫幅元件
 *
 * 全域使用，在網路斷線時自動顯示提示。
 * 重新連線後自動隱藏。
 *
 * @example
 * // 在 _layout.tsx 或根元件中使用
 * <NetworkBanner />
 *
 * // 自訂訊息
 * <NetworkBanner offlineMessage="目前離線中，部分功能無法使用" />
 */
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MibuBrand, SemanticColors } from '../../../../../constants/Colors';
import { Spacing, FontSize } from '@/src/theme/designTokens';

// React Native 的 NetInfo 需要 @react-native-community/netinfo
// 這裡使用簡化的線上/離線檢測
let NetInfo: any = null;
try {
  // 動態載入，避免未安裝時崩潰
  NetInfo = require('@react-native-community/netinfo');
} catch {
  // 未安裝時使用 web fallback
}

interface NetworkBannerProps {
  /** 離線時顯示的訊息 */
  offlineMessage?: string;
  /** 重新連線時顯示的訊息 */
  onlineMessage?: string;
}

export function NetworkBanner({
  offlineMessage = '網路連線中斷',
  onlineMessage = '已恢復連線',
}: NetworkBannerProps) {
  const [isConnected, setIsConnected] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const [wasDisconnected, setWasDisconnected] = useState(false);
  const translateY = useRef(new Animated.Value(-60)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Web 平台使用 navigator.onLine
    if (Platform.OS === 'web') {
      const handleOnline = () => {
        setIsConnected(true);
        if (wasDisconnected) {
          // 顯示「已恢復」後自動隱藏
          setShowBanner(true);
          hideTimer.current = setTimeout(() => setShowBanner(false), 3000);
        }
      };
      const handleOffline = () => {
        setIsConnected(false);
        setWasDisconnected(true);
        setShowBanner(true);
      };

      if (typeof window !== 'undefined') {
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        // 初始狀態
        if (!navigator.onLine) {
          setIsConnected(false);
          setShowBanner(true);
        }
        return () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
          if (hideTimer.current) clearTimeout(hideTimer.current);
        };
      }
      return;
    }

    // 原生平台使用 NetInfo
    if (NetInfo?.addEventListener) {
      const unsubscribe = NetInfo.addEventListener((state: any) => {
        const connected = state.isConnected ?? true;
        if (!connected) {
          setIsConnected(false);
          setWasDisconnected(true);
          setShowBanner(true);
        } else if (wasDisconnected) {
          setIsConnected(true);
          setShowBanner(true);
          hideTimer.current = setTimeout(() => setShowBanner(false), 3000);
        }
      });
      return () => {
        unsubscribe();
        if (hideTimer.current) clearTimeout(hideTimer.current);
      };
    }
  }, [wasDisconnected]);

  // 動畫控制
  useEffect(() => {
    Animated.timing(translateY, {
      toValue: showBanner ? 0 : -60,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showBanner, translateY]);

  if (!showBanner && translateY._value === -60) {
    return null;
  }

  const bannerColor = isConnected
    ? SemanticColors.successMain
    : SemanticColors.errorMain;
  const bannerBg = isConnected ? '#DCFCE7' : '#FEE2E2';
  const message = isConnected ? onlineMessage : offlineMessage;
  const iconName = isConnected ? 'wifi' : 'cloud-offline-outline';

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: bannerBg, transform: [{ translateY }] },
      ]}
    >
      <Ionicons name={iconName as any} size={16} color={bannerColor} />
      <Text style={[styles.text, { color: bannerColor }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
    zIndex: 9999,
  },
  text: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
});
