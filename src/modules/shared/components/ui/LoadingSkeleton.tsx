/**
 * LoadingSkeleton - 載入骨架元件
 *
 * 在資料載入期間顯示的佔位骨架動畫。
 * 支援不同形狀（矩形、圓形、文字行）和自訂尺寸。
 *
 * @example
 * // 卡片骨架
 * <LoadingSkeleton width="100%" height={120} borderRadius={20} />
 *
 * // 圓形頭像骨架
 * <LoadingSkeleton variant="circle" size={48} />
 *
 * // 文字行骨架
 * <LoadingSkeleton variant="text" width="80%" />
 * <LoadingSkeleton variant="text" width="60%" />
 *
 * // 預設卡片列表骨架
 * <LoadingSkeleton.CardList count={3} />
 */
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { MibuBrand } from '../../../../../constants/Colors';
import { Spacing, Radius } from '@/src/theme/designTokens';

// ========== 基礎骨架方塊 ==========

interface SkeletonBlockProps {
  /** 寬度（數字或百分比字串） */
  width?: number | string;
  /** 高度 */
  height?: number;
  /** 圓角 */
  borderRadius?: number;
  /** 自訂樣式 */
  style?: ViewStyle;
}

function SkeletonBlock({
  width = '100%',
  height = 16,
  borderRadius = Radius.sm,
  style,
}: SkeletonBlockProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: MibuBrand.tanLight,
          opacity,
        },
        style,
      ]}
    />
  );
}

// ========== 主元件 ==========

type SkeletonVariant = 'rect' | 'circle' | 'text';

interface LoadingSkeletonProps {
  /** 形狀類型 */
  variant?: SkeletonVariant;
  /** 寬度（rect/text 用） */
  width?: number | string;
  /** 高度（rect 用） */
  height?: number;
  /** 尺寸（circle 用，同時設定寬高） */
  size?: number;
  /** 圓角 */
  borderRadius?: number;
  /** 自訂樣式 */
  style?: ViewStyle;
}

export function LoadingSkeleton({
  variant = 'rect',
  width,
  height,
  size,
  borderRadius,
  style,
}: LoadingSkeletonProps) {
  if (variant === 'circle') {
    const circleSize = size || 48;
    return (
      <SkeletonBlock
        width={circleSize}
        height={circleSize}
        borderRadius={circleSize / 2}
        style={style}
      />
    );
  }

  if (variant === 'text') {
    return (
      <SkeletonBlock
        width={width || '100%'}
        height={height || 14}
        borderRadius={borderRadius || Radius.xs}
        style={[{ marginBottom: Spacing.sm }, style]}
      />
    );
  }

  // rect
  return (
    <SkeletonBlock
      width={width || '100%'}
      height={height || 120}
      borderRadius={borderRadius || Radius.xl}
      style={style}
    />
  );
}

// ========== 預設骨架組合 ==========

/** 卡片骨架 */
function CardSkeleton() {
  return (
    <View style={skeletonStyles.card}>
      <SkeletonBlock width="60%" height={18} />
      <SkeletonBlock width="100%" height={12} style={{ marginTop: Spacing.sm }} />
      <SkeletonBlock width="40%" height={12} style={{ marginTop: Spacing.sm }} />
    </View>
  );
}

/** 卡片列表骨架 */
function CardList({ count = 3 }: { count?: number }) {
  return (
    <View style={skeletonStyles.list}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </View>
  );
}

/** 列表項目骨架 */
function ListItemSkeleton() {
  return (
    <View style={skeletonStyles.listItem}>
      <SkeletonBlock width={40} height={40} borderRadius={Radius.md} />
      <View style={skeletonStyles.listItemContent}>
        <SkeletonBlock width="70%" height={14} />
        <SkeletonBlock width="50%" height={12} style={{ marginTop: Spacing.xs }} />
      </View>
    </View>
  );
}

/** 列表骨架 */
function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <ListItemSkeleton key={i} />
      ))}
    </View>
  );
}

// 掛載靜態方法
LoadingSkeleton.CardList = CardList;
LoadingSkeleton.ListSkeleton = ListSkeleton;

const skeletonStyles = StyleSheet.create({
  card: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  list: {
    gap: Spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  listItemContent: {
    flex: 1,
  },
});
