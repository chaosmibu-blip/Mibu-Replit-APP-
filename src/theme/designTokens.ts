/**
 * Mibu Design System Tokens
 * #017 Phase 2: Design System Standardization
 *
 * 使用方式：
 * import { Spacing, Radius, Typography } from '@/theme/designTokens';
 */

import { MibuBrand } from '../../constants/Colors';

// ========== 間距系統 (4px 基準) ==========
export const Spacing = {
  xs: 4,    // 極小間距
  sm: 8,    // 小間距
  md: 12,   // 中間距
  lg: 16,   // 大間距
  xl: 24,   // 超大間距
  xxl: 32,  // 特大間距
  xxxl: 48, // 巨大間距
} as const;

// ========== 圓角系統 ==========
export const Radius = {
  xs: 4,    // 極小圓角（tag、badge）
  sm: 8,    // 小圓角（按鈕、輸入框）
  md: 12,   // 中圓角（卡片內元素）
  lg: 16,   // 大圓角（卡片）
  xl: 20,   // 超大圓角（大卡片）
  xxl: 24,  // 特大圓角（特殊元素）
  full: 999, // 全圓（頭像、圓形按鈕）
} as const;

// ========== 字體大小 ==========
export const FontSize = {
  xs: 10,   // 極小文字（badge）
  sm: 12,   // 小文字（輔助說明）
  md: 14,   // 中文字（正文）
  lg: 16,   // 大文字（標題）
  xl: 18,   // 超大文字（大標題）
  xxl: 22,  // 特大文字（頁面標題）
  xxxl: 28, // 巨大文字（Hero）
} as const;

// ========== 字重 ==========
export const FontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

// ========== 陰影 ==========
export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
} as const;

// ========== 語意色彩（非品牌色時使用） ==========
export const SemanticColors = {
  // 狀態色
  success: {
    main: MibuBrand.success,
    light: '#DCFCE7',
    dark: '#16A34A',
  },
  warning: {
    main: MibuBrand.warning,
    light: '#FEF3C7',
    dark: '#D97706',
  },
  error: {
    main: MibuBrand.error,
    light: '#FEE2E2',
    dark: '#DC2626',
  },
  info: {
    main: MibuBrand.info,
    light: '#E0F2FE',
    dark: '#0284C7',
  },
} as const;

// ========== 常用樣式組合 ==========
export const CommonStyles = {
  // 卡片
  card: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    ...Shadow.md,
  },
  // 輸入框
  input: {
    backgroundColor: MibuBrand.creamLight,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    fontSize: FontSize.lg,
    color: MibuBrand.dark,
  },
  // 主要按鈕
  primaryButton: {
    backgroundColor: MibuBrand.brown,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  // 次要按鈕
  secondaryButton: {
    backgroundColor: MibuBrand.highlight,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  // 標籤
  tag: {
    backgroundColor: MibuBrand.highlight,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
} as const;

export default {
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  Shadow,
  SemanticColors,
  CommonStyles,
};
