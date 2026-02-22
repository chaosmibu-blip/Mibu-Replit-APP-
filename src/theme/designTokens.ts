/**
 * Mibu Design System Tokens
 * 設計系統標準化 - Design Token 定義
 *
 * 這是 Mibu App 的設計系統核心，定義了所有 UI 元素的基礎樣式
 * 包含間距、圓角、字體、陰影等設計規範
 *
 * 使用方式：
 * import { Spacing, Radius, FontSize, Shadow, CommonStyles } from '@/theme/designTokens';
 *
 * @example
 * // 使用間距
 * style={{ padding: Spacing.lg, marginBottom: Spacing.md }}
 *
 * // 使用圓角
 * style={{ borderRadius: Radius.xl }}
 *
 * // 使用預設樣式
 * style={CommonStyles.card}
 */

import { Dimensions } from 'react-native';
import { MibuBrand } from '../../constants/Colors';

// ========== iPad 等比縮放 ==========
// iPad 內容寬度 ~750pt vs iPhone ~390pt，字體與間距需等比放大以維持視覺比例
const TABLET_BREAKPOINT = 600;
const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth > TABLET_BREAKPOINT;
const tabletScale = isTablet ? 1.2 : 1;
const s = (value: number) => Math.round(value * tabletScale);

// ========== 間距系統 (4px 基準) ==========
/**
 * 間距系統
 * 基於 4px 的倍數設計，確保視覺一致性
 * iPad 自動放大 1.2 倍
 */
export const Spacing = {
  /** 極小間距 - 4px（元素內緊密間距） */
  xs: s(4),
  /** 小間距 - 8px（元素間小間距） */
  sm: s(8),
  /** 中間距 - 12px（一般元素間距） */
  md: s(12),
  /** 大間距 - 16px（常用，區塊內間距） */
  lg: s(16),
  /** 超大間距 - 24px（區塊間間距） */
  xl: s(24),
  /** 特大間距 - 32px（大區塊間距） */
  xxl: s(32),
  /** 巨大間距 - 48px（頁面級間距） */
  xxxl: s(48),
} as const;

// ========== 圓角系統 ==========
/**
 * 圓角系統
 * 統一的圓角規範，從極小到全圓
 * iPad 自動放大 1.2 倍
 */
export const Radius = {
  /** 極小圓角 - 4px（tag、badge） */
  xs: s(4),
  /** 小圓角 - 8px（按鈕、輸入框） */
  sm: s(8),
  /** 中圓角 - 12px（卡片內元素） */
  md: s(12),
  /** 大圓角 - 16px（小卡片） */
  lg: s(16),
  /** 超大圓角 - 20px（大卡片，最常用） */
  xl: s(20),
  /** 特大圓角 - 24px（特殊元素） */
  xxl: s(24),
  /** 全圓 - 999px（頭像、圓形按鈕） */
  full: 999,
} as const;

// ========== 字體大小 ==========
/**
 * 字體大小系統
 * 從極小到巨大的字體尺寸規範
 * iPad 自動放大 1.2 倍
 */
export const FontSize = {
  /** 極小文字 - 10px（badge、輔助標記） */
  xs: s(10),
  /** 小文字 - 12px（輔助說明、註解） */
  sm: s(12),
  /** 中文字 - 14px（正文、一般內容） */
  md: s(14),
  /** 大文字 - 16px（小標題） */
  lg: s(16),
  /** 超大文字 - 18px（大標題） */
  xl: s(18),
  /** 特大文字 - 22px（頁面標題） */
  xxl: s(22),
  /** 巨大文字 - 28px（Hero 區塊標題） */
  xxxl: s(28),
} as const;

// ========== 字重 ==========
/**
 * 字重系統
 * 定義不同強調程度的字體粗細
 */
export const FontWeight = {
  /** 正常字重 - 400 */
  normal: '400' as const,
  /** 中等字重 - 500 */
  medium: '500' as const,
  /** 半粗體 - 600 */
  semibold: '600' as const,
  /** 粗體 - 700 */
  bold: '700' as const,
  /** 特粗體 - 800 */
  extrabold: '800' as const,
};

// ========== 陰影 ==========
/**
 * 陰影系統
 * React Native 陰影樣式，包含 iOS 和 Android (elevation) 支援
 */
export const Shadow = {
  /** 小陰影 - 輕微浮起效果 */
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,  // Android 陰影
  },
  /** 中陰影 - 明顯浮起效果（常用） */
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  /** 大陰影 - 強烈浮起效果 */
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
} as const;

// ========== 語意色彩（非品牌色時使用） ==========
/**
 * 語意色彩系統
 * 用於狀態指示，如成功、警告、錯誤、資訊
 * 每種狀態有三個色階：主色、淺色（背景）、深色（強調）
 */
export const SemanticColors = {
  /** 成功狀態色 - 綠色系 */
  success: {
    /** 成功主色 - 用於圖標、文字 */
    main: MibuBrand.success,
    /** 成功淺色 - 用於背景 */
    light: '#DCFCE7',
    /** 成功深色 - 用於強調 */
    dark: '#16A34A',
  },
  /** 警告狀態色 - 黃色系 */
  warning: {
    /** 警告主色 */
    main: MibuBrand.warning,
    /** 警告淺色 */
    light: '#FEF3C7',
    /** 警告深色 */
    dark: '#D97706',
  },
  /** 錯誤狀態色 - 紅色系 */
  error: {
    /** 錯誤主色 */
    main: MibuBrand.error,
    /** 錯誤淺色 */
    light: '#FEE2E2',
    /** 錯誤深色 */
    dark: '#DC2626',
  },
  /** 資訊狀態色 - 藍色系 */
  info: {
    /** 資訊主色 */
    main: MibuBrand.info,
    /** 資訊淺色 */
    light: '#E0F2FE',
    /** 資訊深色 */
    dark: '#0284C7',
  },
} as const;

// ========== 常用樣式組合 ==========
/**
 * 常用樣式組合
 * 預先定義好的樣式，可直接使用或展開合併
 *
 * @example
 * // 直接使用
 * <View style={CommonStyles.card}>
 *
 * // 展開合併
 * <View style={{ ...CommonStyles.card, marginBottom: Spacing.lg }}>
 */
export const CommonStyles = {
  /** 卡片樣式 - 白底圓角帶陰影 */
  card: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    ...Shadow.md,
  },
  /** 輸入框樣式 */
  input: {
    backgroundColor: MibuBrand.creamLight,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    fontSize: FontSize.lg,
    color: MibuBrand.dark,
  },
  /** 主要按鈕樣式 - 棕色背景 */
  primaryButton: {
    backgroundColor: MibuBrand.brown,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  /** 次要按鈕樣式 - 淺色背景 */
  secondaryButton: {
    backgroundColor: MibuBrand.highlight,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  /** 標籤樣式 - 小圓角淺色背景 */
  tag: {
    backgroundColor: MibuBrand.highlight,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
} as const;

/**
 * 預設匯出所有 Design Tokens
 * 方便整包引入使用
 */
export default {
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  Shadow,
  SemanticColors,
  CommonStyles,
};
