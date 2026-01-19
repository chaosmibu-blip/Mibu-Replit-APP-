/**
 * React Native Paper 主題設定
 * 將 MibuBrand 色系映射到 Material Design 3 主題
 */
import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';
import { MibuBrand } from '../../constants/Colors';

// 字型設定
const fontConfig = {
  fontFamily: 'System',
};

// 淺色主題 - MibuBrand 風格
export const mibuLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    // 主要色 - 棕色系
    primary: MibuBrand.brown,
    onPrimary: MibuBrand.warmWhite,
    primaryContainer: MibuBrand.brownLight,
    onPrimaryContainer: MibuBrand.brownDark,

    // 次要色 - 銅色系
    secondary: MibuBrand.copper,
    onSecondary: MibuBrand.warmWhite,
    secondaryContainer: MibuBrand.copperLight,
    onSecondaryContainer: MibuBrand.brownDark,

    // 第三色 - 米黃色系
    tertiary: MibuBrand.tan,
    onTertiary: MibuBrand.brownDark,
    tertiaryContainer: MibuBrand.tanLight,
    onTertiaryContainer: MibuBrand.brownDark,

    // 背景
    background: MibuBrand.creamLight,
    onBackground: MibuBrand.dark,
    surface: MibuBrand.warmWhite,
    onSurface: MibuBrand.dark,
    surfaceVariant: MibuBrand.cream,
    onSurfaceVariant: MibuBrand.brownDark,

    // 輪廓
    outline: MibuBrand.tan,
    outlineVariant: MibuBrand.tanLight,

    // 錯誤
    error: MibuBrand.error,
    onError: MibuBrand.warmWhite,
    errorContainer: '#FFDAD6',
    onErrorContainer: '#410002',

    // 卡片
    elevation: {
      level0: 'transparent',
      level1: MibuBrand.warmWhite,
      level2: MibuBrand.cream,
      level3: MibuBrand.creamLight,
      level4: MibuBrand.cream,
      level5: MibuBrand.creamDark,
    },

    // 其他
    inverseSurface: MibuBrand.dark,
    inverseOnSurface: MibuBrand.creamLight,
    inversePrimary: MibuBrand.copperLight,
    shadow: MibuBrand.dark,
    scrim: MibuBrand.dark,
    backdrop: 'rgba(45, 32, 20, 0.4)',
  },
  fonts: configureFonts({ config: fontConfig }),
};

// 深色主題 - MibuBrand 風格
export const mibuDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    // 主要色 - 銅色系（深色模式較亮）
    primary: MibuBrand.copperLight,
    onPrimary: MibuBrand.brownDark,
    primaryContainer: MibuBrand.brown,
    onPrimaryContainer: MibuBrand.creamLight,

    // 次要色
    secondary: MibuBrand.tanLight,
    onSecondary: MibuBrand.brownDark,
    secondaryContainer: MibuBrand.copper,
    onSecondaryContainer: MibuBrand.creamLight,

    // 第三色
    tertiary: MibuBrand.cream,
    onTertiary: MibuBrand.brownDark,
    tertiaryContainer: MibuBrand.tan,
    onTertiaryContainer: MibuBrand.creamLight,

    // 背景
    background: MibuBrand.darkBg,
    onBackground: MibuBrand.creamLight,
    surface: MibuBrand.dark,
    onSurface: MibuBrand.creamLight,
    surfaceVariant: '#4D3A2A',
    onSurfaceVariant: MibuBrand.tanLight,

    // 輪廓
    outline: MibuBrand.tan,
    outlineVariant: '#4D3A2A',

    // 錯誤
    error: '#FFB4AB',
    onError: '#690005',
    errorContainer: '#93000A',
    onErrorContainer: '#FFB4AB',

    // 卡片
    elevation: {
      level0: 'transparent',
      level1: '#3A2518',
      level2: MibuBrand.dark,
      level3: '#4D3A2A',
      level4: '#5D4A3A',
      level5: '#6D5A4A',
    },

    // 其他
    inverseSurface: MibuBrand.creamLight,
    inverseOnSurface: MibuBrand.dark,
    inversePrimary: MibuBrand.brown,
    shadow: '#000000',
    scrim: '#000000',
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
  fonts: configureFonts({ config: fontConfig }),
};

export type MibuTheme = typeof mibuLightTheme;
