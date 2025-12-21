/**
 * Mibu Brand Colors
 * Based on the warm earth-tone palette from the Mibu logo
 * Primary: Brown/Coffee tones
 * Background: Cream/Beige warmth
 */

export const MibuBrand = {
  cream: '#F5E6D3',
  creamLight: '#FDF8F3',
  creamDark: '#E8D5C0',
  brown: '#7A5230',
  brownLight: '#9A7250',
  brownDark: '#5A3820',
  copper: '#B08860',
  copperLight: '#C9A580',
  tan: '#D4B896',
  tanLight: '#E5D4BC',
  dark: '#3D2415',
  darkBg: '#2A1A0F',
  warmWhite: '#FFFAF5',
  highlight: '#FFEFD8',
  success: '#5D8A66',
  warning: '#D4A24C',
  error: '#C45C5C',
  info: '#6B8CAE',
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
