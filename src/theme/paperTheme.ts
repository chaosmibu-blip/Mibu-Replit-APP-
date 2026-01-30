/**
 * React Native Paper 主題設定
 *
 * 將 Mibu 品牌色系映射到 Material Design 3 (MD3) 主題
 * 讓 React Native Paper 元件能夠使用 Mibu 的品牌風格
 *
 * 使用方式：
 * import { mibuLightTheme, mibuDarkTheme } from '@/theme/paperTheme';
 *
 * @example
 * // 在 App 根元件使用
 * <PaperProvider theme={mibuLightTheme}>
 *   <App />
 * </PaperProvider>
 */

import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';
import { MibuBrand } from '../../constants/Colors';

/**
 * 字型配置
 * 使用系統預設字體以確保最佳效能和相容性
 */
const fontConfig = {
  fontFamily: 'System',
};

/**
 * 淺色主題 - Mibu 品牌風格
 * 基於 MD3LightTheme 擴展，覆寫為 Mibu 品牌色彩
 */
export const mibuLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,

    // ========== 主要色 - 棕色系 ==========
    /** 主要色 - 用於主要按鈕、重要元素 */
    primary: MibuBrand.brown,
    /** 主要色上的文字/圖標色 */
    onPrimary: MibuBrand.warmWhite,
    /** 主要色容器 - 淺棕色背景 */
    primaryContainer: MibuBrand.brownLight,
    /** 主要色容器上的文字色 */
    onPrimaryContainer: MibuBrand.brownDark,

    // ========== 次要色 - 銅色系 ==========
    /** 次要色 - 用於次要按鈕、輔助元素 */
    secondary: MibuBrand.copper,
    /** 次要色上的文字/圖標色 */
    onSecondary: MibuBrand.warmWhite,
    /** 次要色容器 */
    secondaryContainer: MibuBrand.copperLight,
    /** 次要色容器上的文字色 */
    onSecondaryContainer: MibuBrand.brownDark,

    // ========== 第三色 - 米黃色系 ==========
    /** 第三色 - 用於裝飾、強調 */
    tertiary: MibuBrand.tan,
    /** 第三色上的文字色 */
    onTertiary: MibuBrand.brownDark,
    /** 第三色容器 */
    tertiaryContainer: MibuBrand.tanLight,
    /** 第三色容器上的文字色 */
    onTertiaryContainer: MibuBrand.brownDark,

    // ========== 背景色 ==========
    /** 頁面背景色 */
    background: MibuBrand.creamLight,
    /** 背景上的文字色 */
    onBackground: MibuBrand.dark,
    /** 表面色 - 卡片、對話框背景 */
    surface: MibuBrand.warmWhite,
    /** 表面上的文字色 */
    onSurface: MibuBrand.dark,
    /** 表面變體色 */
    surfaceVariant: MibuBrand.cream,
    /** 表面變體上的文字色 */
    onSurfaceVariant: MibuBrand.brownDark,

    // ========== 輪廓色 ==========
    /** 主要輪廓色 - 邊框、分隔線 */
    outline: MibuBrand.tan,
    /** 輪廓變體色 - 較淡的邊框 */
    outlineVariant: MibuBrand.tanLight,

    // ========== 錯誤色 ==========
    /** 錯誤主色 */
    error: MibuBrand.error,
    /** 錯誤色上的文字色 */
    onError: MibuBrand.warmWhite,
    /** 錯誤容器背景色 */
    errorContainer: '#FFDAD6',
    /** 錯誤容器上的文字色 */
    onErrorContainer: '#410002',

    // ========== 卡片層級色（用於 elevation） ==========
    elevation: {
      /** level0 - 透明 */
      level0: 'transparent',
      /** level1 - 最亮白色 */
      level1: MibuBrand.warmWhite,
      /** level2 - 奶油色 */
      level2: MibuBrand.cream,
      /** level3 - 淺奶油色 */
      level3: MibuBrand.creamLight,
      /** level4 - 奶油色 */
      level4: MibuBrand.cream,
      /** level5 - 深奶油色 */
      level5: MibuBrand.creamDark,
    },

    // ========== 其他色彩 ==========
    /** 反轉表面色 - 用於 Snackbar 等 */
    inverseSurface: MibuBrand.dark,
    /** 反轉表面上的文字色 */
    inverseOnSurface: MibuBrand.creamLight,
    /** 反轉主色 */
    inversePrimary: MibuBrand.copperLight,
    /** 陰影色 */
    shadow: MibuBrand.dark,
    /** 遮罩色 */
    scrim: MibuBrand.dark,
    /** 背景遮罩色（半透明） */
    backdrop: 'rgba(45, 32, 20, 0.4)',
  },
  fonts: configureFonts({ config: fontConfig }),
};

/**
 * 深色主題 - Mibu 品牌風格
 * 基於 MD3DarkTheme 擴展，覆寫為 Mibu 品牌色彩
 * 深色模式下使用較亮的色彩作為主色以確保可讀性
 */
export const mibuDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,

    // ========== 主要色 - 銅色系（深色模式較亮） ==========
    /** 主要色 - 深色模式使用較亮的銅色 */
    primary: MibuBrand.copperLight,
    /** 主要色上的文字色 */
    onPrimary: MibuBrand.brownDark,
    /** 主要色容器 */
    primaryContainer: MibuBrand.brown,
    /** 主要色容器上的文字色 */
    onPrimaryContainer: MibuBrand.creamLight,

    // ========== 次要色 ==========
    /** 次要色 */
    secondary: MibuBrand.tanLight,
    /** 次要色上的文字色 */
    onSecondary: MibuBrand.brownDark,
    /** 次要色容器 */
    secondaryContainer: MibuBrand.copper,
    /** 次要色容器上的文字色 */
    onSecondaryContainer: MibuBrand.creamLight,

    // ========== 第三色 ==========
    /** 第三色 */
    tertiary: MibuBrand.cream,
    /** 第三色上的文字色 */
    onTertiary: MibuBrand.brownDark,
    /** 第三色容器 */
    tertiaryContainer: MibuBrand.tan,
    /** 第三色容器上的文字色 */
    onTertiaryContainer: MibuBrand.creamLight,

    // ========== 背景色 ==========
    /** 頁面背景色 - 深咖啡色 */
    background: MibuBrand.darkBg,
    /** 背景上的文字色 */
    onBackground: MibuBrand.creamLight,
    /** 表面色 */
    surface: MibuBrand.dark,
    /** 表面上的文字色 */
    onSurface: MibuBrand.creamLight,
    /** 表面變體色 */
    surfaceVariant: '#4D3A2A',
    /** 表面變體上的文字色 */
    onSurfaceVariant: MibuBrand.tanLight,

    // ========== 輪廓色 ==========
    /** 主要輪廓色 */
    outline: MibuBrand.tan,
    /** 輪廓變體色 */
    outlineVariant: '#4D3A2A',

    // ========== 錯誤色 ==========
    /** 錯誤主色 - 深色模式較淡 */
    error: '#FFB4AB',
    /** 錯誤色上的文字色 */
    onError: '#690005',
    /** 錯誤容器背景色 */
    errorContainer: '#93000A',
    /** 錯誤容器上的文字色 */
    onErrorContainer: '#FFB4AB',

    // ========== 卡片層級色 ==========
    elevation: {
      level0: 'transparent',
      level1: '#3A2518',
      level2: MibuBrand.dark,
      level3: '#4D3A2A',
      level4: '#5D4A3A',
      level5: '#6D5A4A',
    },

    // ========== 其他色彩 ==========
    /** 反轉表面色 */
    inverseSurface: MibuBrand.creamLight,
    /** 反轉表面上的文字色 */
    inverseOnSurface: MibuBrand.dark,
    /** 反轉主色 */
    inversePrimary: MibuBrand.brown,
    /** 陰影色 */
    shadow: '#000000',
    /** 遮罩色 */
    scrim: '#000000',
    /** 背景遮罩色 */
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
  fonts: configureFonts({ config: fontConfig }),
};

/**
 * Mibu 主題型別定義
 * 用於 TypeScript 型別推導
 */
export type MibuTheme = typeof mibuLightTheme;
