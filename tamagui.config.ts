/**
 * Tamagui Configuration
 * 將 MibuBrand 色系映射到 Tamagui token 系統
 */
import { createTamagui, createTokens } from 'tamagui';
import { createAnimations } from '@tamagui/animations-react-native';
import { MibuBrand, Colors } from './constants/Colors';

// 動畫設定
const animations = createAnimations({
  fast: {
    type: 'spring',
    damping: 20,
    mass: 1.2,
    stiffness: 250,
  },
  medium: {
    type: 'spring',
    damping: 15,
    mass: 1,
    stiffness: 200,
  },
  slow: {
    type: 'spring',
    damping: 20,
    stiffness: 60,
  },
  bouncy: {
    type: 'spring',
    damping: 10,
    mass: 0.9,
    stiffness: 100,
  },
  lazy: {
    type: 'spring',
    damping: 20,
    stiffness: 60,
  },
});

// Token 定義
const tokens = createTokens({
  color: {
    // MibuBrand 原色
    cream: MibuBrand.cream,
    creamLight: MibuBrand.creamLight,
    creamDark: MibuBrand.creamDark,
    brown: MibuBrand.brown,
    brownLight: MibuBrand.brownLight,
    brownDark: MibuBrand.brownDark,
    copper: MibuBrand.copper,
    copperLight: MibuBrand.copperLight,
    tan: MibuBrand.tan,
    tanLight: MibuBrand.tanLight,
    dark: MibuBrand.dark,
    darkBg: MibuBrand.darkBg,
    warmWhite: MibuBrand.warmWhite,
    highlight: MibuBrand.highlight,

    // 語意色彩
    success: MibuBrand.success,
    warning: MibuBrand.warning,
    error: MibuBrand.error,
    info: MibuBrand.info,

    // Tier 色彩
    tierSP: MibuBrand.tierSP,
    tierSSR: MibuBrand.tierSSR,
    tierSR: MibuBrand.tierSR,
    tierS: MibuBrand.tierS,
    tierR: MibuBrand.tierR,
    tierSPBg: MibuBrand.tierSPBg,
    tierSSRBg: MibuBrand.tierSSRBg,
    tierSRBg: MibuBrand.tierSRBg,
    tierSBg: MibuBrand.tierSBg,
    tierRBg: MibuBrand.tierRBg,

    // 基礎色
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
  },

  space: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
    true: 16,
  },

  size: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
    11: 44,
    12: 48,
    true: 44,
  },

  radius: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    round: 9999,
    true: 12,
  },

  zIndex: {
    0: 0,
    1: 100,
    2: 200,
    3: 300,
    4: 400,
    5: 500,
  },
});

// 淺色主題 (預設)
const lightTheme = {
  background: tokens.color.creamLight,
  backgroundHover: tokens.color.cream,
  backgroundPress: tokens.color.creamDark,
  backgroundFocus: tokens.color.cream,
  backgroundStrong: tokens.color.warmWhite,
  backgroundTransparent: tokens.color.transparent,

  color: tokens.color.dark,
  colorHover: tokens.color.brownDark,
  colorPress: tokens.color.brown,
  colorFocus: tokens.color.brownDark,
  colorTransparent: tokens.color.transparent,

  borderColor: tokens.color.tanLight,
  borderColorHover: tokens.color.tan,
  borderColorFocus: tokens.color.copper,
  borderColorPress: tokens.color.tan,

  placeholderColor: tokens.color.tan,

  // 品牌色
  primary: tokens.color.brown,
  primaryHover: tokens.color.brownLight,
  primaryPress: tokens.color.brownDark,

  secondary: tokens.color.copper,
  secondaryHover: tokens.color.copperLight,

  accent: tokens.color.highlight,
  accentHover: tokens.color.cream,

  // 語意色
  success: tokens.color.success,
  warning: tokens.color.warning,
  error: tokens.color.error,
  info: tokens.color.info,

  // 卡片
  card: tokens.color.warmWhite,
  cardHover: tokens.color.cream,
};

// 深色主題
const darkTheme = {
  background: tokens.color.darkBg,
  backgroundHover: tokens.color.dark,
  backgroundPress: '#4D3A2A',
  backgroundFocus: tokens.color.dark,
  backgroundStrong: '#3A2518',
  backgroundTransparent: tokens.color.transparent,

  color: tokens.color.creamLight,
  colorHover: tokens.color.cream,
  colorPress: tokens.color.tan,
  colorFocus: tokens.color.cream,
  colorTransparent: tokens.color.transparent,

  borderColor: '#4D3A2A',
  borderColorHover: '#5D4A3A',
  borderColorFocus: tokens.color.copper,
  borderColorPress: '#5D4A3A',

  placeholderColor: tokens.color.tan,

  // 品牌色
  primary: tokens.color.copper,
  primaryHover: tokens.color.copperLight,
  primaryPress: tokens.color.brown,

  secondary: tokens.color.tan,
  secondaryHover: tokens.color.tanLight,

  accent: tokens.color.dark,
  accentHover: '#4D3A2A',

  // 語意色
  success: '#6B9A74',
  warning: '#E4B25C',
  error: '#D46C6C',
  info: '#7B9CBE',

  // 卡片
  card: '#3A2518',
  cardHover: tokens.color.dark,
};

// 建立 Tamagui 設定
const config = createTamagui({
  animations,
  tokens,
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
  defaultTheme: 'light',
  shouldAddPrefersColorThemes: true,
  themeClassNameOnRoot: true,
});

export type AppConfig = typeof config;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
