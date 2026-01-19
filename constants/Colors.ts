/**
 * Mibu Brand Colors
 * Based on the warm earth-tone palette from the Mibu logo
 * Primary: Brown/Coffee tones
 * Background: Cream/Beige warmth
 */

export const MibuBrand = {
  cream: '#F5E6D3',
  creamLight: '#F5EDE3',    // 調暖調深，讓卡片更突出
  creamDark: '#E8D5C0',
  brown: '#7A5230',
  brownLight: '#9A7250',
  brownDark: '#5A3820',
  copper: '#B08860',
  copperLight: '#C9A580',
  tan: '#D4B896',
  tanLight: '#E8DCC8',      // 邊框色調暖
  dark: '#3D2415',
  darkBg: '#2A1A0F',
  warmWhite: '#FFFDF9',     // 卡片更白更亮
  highlight: '#FFEFD8',
  success: '#5D8A66',
  warning: '#D4A24C',
  error: '#C45C5C',
  info: '#6B8CAE',
  // 稀有度色彩
  tierSP: '#D4A24C',
  tierSSR: '#B08860',
  tierSR: '#9A7250',
  tierS: '#C9A580',
  tierR: '#D4B896',
  tierSPBg: '#FFF3D4',
  tierSSRBg: '#F5E6D3',
  tierSRBg: '#EDE0D4',
  tierSBg: '#F8F0E8',
  tierRBg: '#FDFBF8',
};

// ========== 語意色彩（用於狀態顯示） ==========
export const SemanticColors = {
  // 成功狀態（綠色系）
  successLight: '#DCFCE7',
  successMain: '#5D8A66',
  successDark: '#16A34A',
  // 警告狀態（黃色系）
  warningLight: '#FEF3C7',
  warningMain: '#D4A24C',
  warningDark: '#D97706',
  // 錯誤狀態（紅色系）
  errorLight: '#FEE2E2',
  errorMain: '#C45C5C',
  errorDark: '#DC2626',
  // 資訊狀態（藍色系）
  infoLight: '#E0F2FE',
  infoMain: '#6B8CAE',
  infoDark: '#0284C7',
  // 星級評分（金色）
  starYellow: '#F59E0B',
  starBg: '#FEF3C7',
};

export interface CategoryToken {
  stripe: string;
  badge: string;
  badgeText: string;
  icon: string;
}

export const CategoryTokens: Record<string, CategoryToken> = {
  food: {
    stripe: '#C4906A',
    badge: '#F5E0D0',
    badgeText: '#8B5A3C',
    icon: '#C4906A',
  },
  stay: {
    stripe: '#7A9A9A',
    badge: '#E8F0F0',
    badgeText: '#4A6A6A',
    icon: '#7A9A9A',
  },
  education: {
    stripe: '#9A8AAA',
    badge: '#F0EAF5',
    badgeText: '#6A5A7A',
    icon: '#9A8AAA',
  },
  entertainment: {
    stripe: '#C48A9A',
    badge: '#F8E8EC',
    badgeText: '#8A5A6A',
    icon: '#C48A9A',
  },
  scenery: {
    stripe: '#7AAA8A',
    badge: '#E8F5EC',
    badgeText: '#4A7A5A',
    icon: '#7AAA8A',
  },
  shopping: {
    stripe: '#C4A870',
    badge: '#F8F0E0',
    badgeText: '#8A7840',
    icon: '#C4A870',
  },
  activity: {
    stripe: '#9AAA7A',
    badge: '#F0F5E8',
    badgeText: '#6A7A4A',
    icon: '#9AAA7A',
  },
  experience: {
    stripe: '#C4A870',
    badge: '#F8F0E0',
    badgeText: '#8A7840',
    icon: '#C4A870',
  },
};

export const getCategoryToken = (category: string): CategoryToken => {
  const key = category?.toLowerCase() || '';
  return CategoryTokens[key] || {
    stripe: MibuBrand.copper,
    badge: MibuBrand.cream,
    badgeText: MibuBrand.brown,
    icon: MibuBrand.copper,
  };
};

export interface MerchantColorScheme {
  accent: string;
  accentLight: string;
  accentDark: string;
  isValid: boolean;
}

const hexToHsl = (hex: string): { h: number; s: number; l: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 0, l: 50 };
  
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  
  return { h: h * 360, s: s * 100, l: l * 100 };
};

const hslToHex = (h: number, s: number, l: number): string => {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

const MIBU_BROWN_HUE = 25;
const MIBU_COPPER_HUE = 30;

export const deriveMerchantScheme = (hex: string): MerchantColorScheme => {
  const cleanHex = hex?.replace(/[^a-fA-F0-9]/g, '') || '';
  
  if (cleanHex.length !== 6) {
    return {
      accent: MibuBrand.copper,
      accentLight: MibuBrand.copperLight,
      accentDark: MibuBrand.brown,
      isValid: false,
    };
  }
  
  const fullHex = `#${cleanHex}`;
  let { h, s, l } = hexToHsl(fullHex);
  
  if (s > 70) s = 70;
  if (s < 15) s = 35;
  if (l < 25) l = 30;
  if (l > 75) l = 65;
  
  const hueDiffBrown = Math.abs(h - MIBU_BROWN_HUE);
  const hueDiffCopper = Math.abs(h - MIBU_COPPER_HUE);
  if ((hueDiffBrown < 15 || hueDiffCopper < 15) && Math.abs(s - 50) < 20) {
    h = h > MIBU_BROWN_HUE ? h + 20 : h - 20;
    if (h < 0) h += 360;
    if (h > 360) h -= 360;
  }
  
  const accent = hslToHex(h, s, l);
  const accentLight = hslToHex(h, Math.max(s - 20, 10), Math.min(l + 25, 92));
  const accentDark = hslToHex(h, Math.min(s + 10, 60), Math.max(l - 15, 20));
  
  return {
    accent,
    accentLight,
    accentDark,
    isValid: true,
  };
};

const tintColorLight = MibuBrand.brown;
const tintColorDark = MibuBrand.cream;

export const Colors = {
  light: {
    text: MibuBrand.dark,
    textSecondary: MibuBrand.brownLight,
    background: MibuBrand.creamLight,
    surface: MibuBrand.cream,
    surfaceMuted: MibuBrand.tanLight,
    tint: tintColorLight,
    icon: MibuBrand.copper,
    tabIconDefault: MibuBrand.copper,
    tabIconSelected: tintColorLight,
    border: MibuBrand.tan,
    primary: MibuBrand.brown,
    primaryLight: MibuBrand.brownLight,
    primaryDark: MibuBrand.brownDark,
    accent: MibuBrand.copper,
    card: MibuBrand.warmWhite,
    cardBorder: MibuBrand.tanLight,
    success: MibuBrand.success,
    warning: MibuBrand.warning,
    error: MibuBrand.error,
    info: MibuBrand.info,
  },
  dark: {
    text: MibuBrand.creamLight,
    textSecondary: MibuBrand.tan,
    background: MibuBrand.darkBg,
    surface: MibuBrand.dark,
    surfaceMuted: '#3D2A1F',
    tint: tintColorDark,
    icon: MibuBrand.tan,
    tabIconDefault: MibuBrand.tan,
    tabIconSelected: tintColorDark,
    border: '#4D3A2A',
    primary: MibuBrand.copper,
    primaryLight: MibuBrand.copperLight,
    primaryDark: MibuBrand.brown,
    accent: MibuBrand.tan,
    card: '#3A2518',
    cardBorder: '#4D3525',
    success: '#6B9A74',
    warning: '#E4B25C',
    error: '#D46C6C',
    info: '#7B9CBE',
  },
  brand: MibuBrand,
};
