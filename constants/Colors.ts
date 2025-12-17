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
