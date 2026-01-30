/**
 * Mibu 品牌色彩系統
 *
 * 基於 Mibu Logo 的溫暖大地色調調色板
 * - 主色系：棕色/咖啡色調
 * - 背景色：奶油/米色暖色調
 *
 * 使用方式：
 * import { MibuBrand, SemanticColors, Colors } from '@/constants/Colors';
 *
 * @example
 * // 使用品牌主色
 * style={{ color: MibuBrand.brown }}
 *
 * // 使用語意色彩
 * style={{ color: SemanticColors.successMain }}
 *
 * // 使用主題色彩
 * style={{ color: Colors.light.primary }}
 */

/**
 * Mibu 品牌色彩常數
 * 定義 App 中所有品牌相關的顏色
 */
export const MibuBrand = {
  // ========== 背景色系 ==========
  /** 奶油色 - 輸入框背景、表單背景 */
  cream: '#F5E6D3',
  /** 淺奶油色 - 頁面背景色 */
  creamLight: '#F5EDE3',    // 調暖調深，讓卡片更突出
  /** 深奶油色 - 分隔線、邊框 */
  creamDark: '#E8D5C0',

  // ========== 主色系（棕色） ==========
  /** 棕色主色 - 主要按鈕、強調文字 */
  brown: '#7A5230',
  /** 淺棕色 - 次要文字、輔助說明 */
  brownLight: '#9A7250',
  /** 深棕色 - 深色標題、重要文字 */
  brownDark: '#5A3820',

  // ========== 輔色系（銅色） ==========
  /** 銅色 - Icon、裝飾元素 */
  copper: '#B08860',
  /** 淺銅色 - 輔助裝飾 */
  copperLight: '#C9A580',

  // ========== 米黃色系 ==========
  /** 米黃色 - 輔助色 */
  tan: '#D4B896',
  /** 淺米黃色 - 邊框色調暖 */
  tanLight: '#E8DCC8',

  // ========== 深色系 ==========
  /** 深咖啡色 - 深色模式文字 */
  dark: '#3D2415',
  /** 深色背景 - 深色模式背景 */
  darkBg: '#2A1A0F',

  // ========== 特殊色 ==========
  /** 暖白色 - 卡片背景（最亮） */
  warmWhite: '#FFFDF9',
  /** 高亮色 - 標籤背景、強調區域 */
  highlight: '#FFEFD8',

  // ========== 狀態色 ==========
  /** 成功色 - 綠色 */
  success: '#5D8A66',
  /** 警告色 - 金色 */
  warning: '#D4A24C',
  /** 錯誤色 - 紅色 */
  error: '#C45C5C',
  /** 資訊色 - 藍色 */
  info: '#6B8CAE',

  // ========== 稀有度色彩（扭蛋系統） ==========
  /** SP 等級文字色 - 金色 */
  tierSP: '#D4A24C',
  /** SSR 等級文字色 - 紫銅色 */
  tierSSR: '#B08860',
  /** SR 等級文字色 - 深銅色 */
  tierSR: '#9A7250',
  /** S 等級文字色 - 淺銅色 */
  tierS: '#C9A580',
  /** R 等級文字色 - 米黃色 */
  tierR: '#D4B896',
  /** SP 等級背景色 */
  tierSPBg: '#FFF3D4',
  /** SSR 等級背景色 */
  tierSSRBg: '#F5E6D3',
  /** SR 等級背景色 */
  tierSRBg: '#EDE0D4',
  /** S 等級背景色 */
  tierSBg: '#F8F0E8',
  /** R 等級背景色 */
  tierRBg: '#FDFBF8',
};

/**
 * 語意色彩系統
 * 用於狀態顯示，如成功、警告、錯誤、資訊提示
 */
export const SemanticColors = {
  // ========== 成功狀態（綠色系） ==========
  /** 成功淺色 - 成功訊息背景 */
  successLight: '#DCFCE7',
  /** 成功主色 - 成功圖標、文字 */
  successMain: '#5D8A66',
  /** 成功深色 - 成功強調 */
  successDark: '#16A34A',

  // ========== 警告狀態（黃色系） ==========
  /** 警告淺色 - 警告訊息背景 */
  warningLight: '#FEF3C7',
  /** 警告主色 - 警告圖標、文字 */
  warningMain: '#D4A24C',
  /** 警告深色 - 警告強調 */
  warningDark: '#D97706',

  // ========== 錯誤狀態（紅色系） ==========
  /** 錯誤淺色 - 錯誤訊息背景 */
  errorLight: '#FEE2E2',
  /** 錯誤主色 - 錯誤圖標、文字 */
  errorMain: '#C45C5C',
  /** 錯誤深色 - 錯誤強調 */
  errorDark: '#DC2626',

  // ========== 資訊狀態（藍色系） ==========
  /** 資訊淺色 - 資訊訊息背景 */
  infoLight: '#E0F2FE',
  /** 資訊主色 - 資訊圖標、文字 */
  infoMain: '#6B8CAE',
  /** 資訊深色 - 資訊強調 */
  infoDark: '#0284C7',

  // ========== 評分（星級） ==========
  /** 星級黃色 - 評分星星 */
  starYellow: '#F59E0B',
  /** 星級背景色 - 星星背景 */
  starBg: '#FEF3C7',
};

/**
 * 分類色彩 Token 介面
 * 定義每個景點分類的顏色組合
 */
export interface CategoryToken {
  /** 側邊條紋色 */
  stripe: string;
  /** 標籤背景色 */
  badge: string;
  /** 標籤文字色 */
  badgeText: string;
  /** 圖標色 */
  icon: string;
}

/**
 * 景點分類色彩 Token
 * 每個分類有獨特的配色方案，用於卡片、標籤等 UI 元素
 */
export const CategoryTokens: Record<string, CategoryToken> = {
  /** 美食分類 - 溫暖橘棕色 */
  food: {
    stripe: '#C4906A',
    badge: '#F5E0D0',
    badgeText: '#8B5A3C',
    icon: '#C4906A',
  },
  /** 住宿分類 - 沉穩青綠色 */
  stay: {
    stripe: '#7A9A9A',
    badge: '#E8F0F0',
    badgeText: '#4A6A6A',
    icon: '#7A9A9A',
  },
  /** 教育分類 - 知性紫色 */
  education: {
    stripe: '#9A8AAA',
    badge: '#F0EAF5',
    badgeText: '#6A5A7A',
    icon: '#9A8AAA',
  },
  /** 娛樂分類 - 活潑粉紅色 */
  entertainment: {
    stripe: '#C48A9A',
    badge: '#F8E8EC',
    badgeText: '#8A5A6A',
    icon: '#C48A9A',
  },
  /** 景點分類 - 自然綠色 */
  scenery: {
    stripe: '#7AAA8A',
    badge: '#E8F5EC',
    badgeText: '#4A7A5A',
    icon: '#7AAA8A',
  },
  /** 購物分類 - 金黃色 */
  shopping: {
    stripe: '#C4A870',
    badge: '#F8F0E0',
    badgeText: '#8A7840',
    icon: '#C4A870',
  },
  /** 活動分類 - 草綠色 */
  activity: {
    stripe: '#9AAA7A',
    badge: '#F0F5E8',
    badgeText: '#6A7A4A',
    icon: '#9AAA7A',
  },
  /** 體驗分類 - 金黃色（同購物） */
  experience: {
    stripe: '#C4A870',
    badge: '#F8F0E0',
    badgeText: '#8A7840',
    icon: '#C4A870',
  },
};

/**
 * 取得分類的色彩 Token
 *
 * @param category - 分類名稱（如 'food', 'stay' 等）
 * @returns 該分類的色彩 Token，若找不到則回傳預設的銅色系
 *
 * @example
 * const foodColors = getCategoryToken('food');
 * // { stripe: '#C4906A', badge: '#F5E0D0', ... }
 */
export const getCategoryToken = (category: string): CategoryToken => {
  const key = category?.toLowerCase() || '';
  return CategoryTokens[key] || {
    stripe: MibuBrand.copper,
    badge: MibuBrand.cream,
    badgeText: MibuBrand.brown,
    icon: MibuBrand.copper,
  };
};

/**
 * 商家品牌色彩配色介面
 * 用於根據商家主色衍生出一組協調的配色
 */
export interface MerchantColorScheme {
  /** 主色 */
  accent: string;
  /** 淺色（用於背景） */
  accentLight: string;
  /** 深色（用於強調） */
  accentDark: string;
  /** 是否為有效的顏色 */
  isValid: boolean;
}

/**
 * 將 HEX 色碼轉換為 HSL 色彩空間
 * 用於色彩運算和調整
 *
 * @param hex - HEX 色碼（如 '#FF5500'）
 * @returns HSL 物件 { h: 色相, s: 飽和度, l: 亮度 }
 */
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

/**
 * 將 HSL 色彩空間轉換為 HEX 色碼
 *
 * @param h - 色相（0-360）
 * @param s - 飽和度（0-100）
 * @param l - 亮度（0-100）
 * @returns HEX 色碼（如 '#FF5500'）
 */
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

/** Mibu 品牌棕色的色相值 */
const MIBU_BROWN_HUE = 25;
/** Mibu 品牌銅色的色相值 */
const MIBU_COPPER_HUE = 30;

/**
 * 根據商家品牌色衍生出一組配色方案
 * 會自動調整飽和度和亮度，確保與 Mibu 品牌風格協調
 *
 * @param hex - 商家品牌主色的 HEX 色碼
 * @returns 衍生的配色方案，包含主色、淺色、深色
 *
 * @example
 * const scheme = deriveMerchantScheme('#FF5500');
 * // { accent: '#...', accentLight: '#...', accentDark: '#...', isValid: true }
 */
export const deriveMerchantScheme = (hex: string): MerchantColorScheme => {
  // 清理輸入的色碼
  const cleanHex = hex?.replace(/[^a-fA-F0-9]/g, '') || '';

  // 若色碼無效，回傳 Mibu 預設配色
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

  // 調整飽和度和亮度，確保視覺協調
  if (s > 70) s = 70;    // 限制最高飽和度
  if (s < 15) s = 35;    // 確保最低飽和度
  if (l < 25) l = 30;    // 確保最低亮度
  if (l > 75) l = 65;    // 限制最高亮度

  // 避免與 Mibu 品牌色過於相近
  const hueDiffBrown = Math.abs(h - MIBU_BROWN_HUE);
  const hueDiffCopper = Math.abs(h - MIBU_COPPER_HUE);
  if ((hueDiffBrown < 15 || hueDiffCopper < 15) && Math.abs(s - 50) < 20) {
    h = h > MIBU_BROWN_HUE ? h + 20 : h - 20;
    if (h < 0) h += 360;
    if (h > 360) h -= 360;
  }

  // 生成主色、淺色、深色
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

/** 淺色模式強調色（棕色） */
const tintColorLight = MibuBrand.brown;
/** 深色模式強調色（奶油色） */
const tintColorDark = MibuBrand.cream;

/**
 * 主題色彩配置
 * 包含淺色模式和深色模式的完整色彩定義
 *
 * @example
 * // 在元件中使用
 * const theme = useColorScheme();
 * const textColor = Colors[theme].text;
 */
export const Colors = {
  /** 淺色模式色彩配置 */
  light: {
    /** 主要文字色 */
    text: MibuBrand.dark,
    /** 次要文字色 */
    textSecondary: MibuBrand.brownLight,
    /** 頁面背景色 */
    background: MibuBrand.creamLight,
    /** 表面色（元件背景） */
    surface: MibuBrand.cream,
    /** 靜音表面色 */
    surfaceMuted: MibuBrand.tanLight,
    /** 強調色 */
    tint: tintColorLight,
    /** 圖標色 */
    icon: MibuBrand.copper,
    /** Tab 圖標預設色 */
    tabIconDefault: MibuBrand.copper,
    /** Tab 圖標選中色 */
    tabIconSelected: tintColorLight,
    /** 邊框色 */
    border: MibuBrand.tan,
    /** 主要按鈕色 */
    primary: MibuBrand.brown,
    /** 主要按鈕淺色 */
    primaryLight: MibuBrand.brownLight,
    /** 主要按鈕深色 */
    primaryDark: MibuBrand.brownDark,
    /** 輔助色 */
    accent: MibuBrand.copper,
    /** 卡片背景色 */
    card: MibuBrand.warmWhite,
    /** 卡片邊框色 */
    cardBorder: MibuBrand.tanLight,
    /** 成功色 */
    success: MibuBrand.success,
    /** 警告色 */
    warning: MibuBrand.warning,
    /** 錯誤色 */
    error: MibuBrand.error,
    /** 資訊色 */
    info: MibuBrand.info,
  },
  /** 深色模式色彩配置 */
  dark: {
    /** 主要文字色 */
    text: MibuBrand.creamLight,
    /** 次要文字色 */
    textSecondary: MibuBrand.tan,
    /** 頁面背景色 */
    background: MibuBrand.darkBg,
    /** 表面色（元件背景） */
    surface: MibuBrand.dark,
    /** 靜音表面色 */
    surfaceMuted: '#3D2A1F',
    /** 強調色 */
    tint: tintColorDark,
    /** 圖標色 */
    icon: MibuBrand.tan,
    /** Tab 圖標預設色 */
    tabIconDefault: MibuBrand.tan,
    /** Tab 圖標選中色 */
    tabIconSelected: tintColorDark,
    /** 邊框色 */
    border: '#4D3A2A',
    /** 主要按鈕色 */
    primary: MibuBrand.copper,
    /** 主要按鈕淺色 */
    primaryLight: MibuBrand.copperLight,
    /** 主要按鈕深色 */
    primaryDark: MibuBrand.brown,
    /** 輔助色 */
    accent: MibuBrand.tan,
    /** 卡片背景色 */
    card: '#3A2518',
    /** 卡片邊框色 */
    cardBorder: '#4D3525',
    /** 成功色 */
    success: '#6B9A74',
    /** 警告色 */
    warning: '#E4B25C',
    /** 錯誤色 */
    error: '#D46C6C',
    /** 資訊色 */
    info: '#7B9CBE',
  },
  /** 品牌色彩參考 */
  brand: MibuBrand,
};
