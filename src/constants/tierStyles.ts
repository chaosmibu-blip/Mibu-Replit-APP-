/**
 * 扭蛋稀有度樣式定義
 *
 * 定義扭蛋系統中各等級（SP、SSR、SR、S、R）的視覺樣式
 * 包含背景色、邊框色、文字色、漸層色等
 *
 * 使用方式：
 * import { getTierStyle, TIER_STYLES } from '@/constants/tierStyles';
 *
 * @example
 * const style = getTierStyle('SSR');
 * // { backgroundColor: '...', borderColor: '...', ... }
 */

import { MerchantCouponTier } from '../types';
import { MibuBrand } from '../../constants/Colors';

/**
 * 稀有度樣式介面
 * 定義每個等級需要的所有視覺屬性
 */
export interface TierStyle {
  /** 背景色 */
  backgroundColor: string;
  /** 邊框色 */
  borderColor: string;
  /** 文字色 */
  textColor: string;
  /** 漸層色（用於特效） */
  gradientColors: [string, string];
  /** 光暈色（用於動畫） */
  glowColor: string;
  /** 翻譯字典 key */
  labelKey: string;
  /** 抽中機率（百分比） */
  probability: number;
}

/**
 * 各稀有度等級的樣式定義
 *
 * 等級說明：
 * - SP (Special): 傳說等級，最稀有（2%）
 * - SSR (Super Super Rare): 超稀有等級（8%）
 * - SR (Super Rare): 稀有等級（15%）
 * - S (Superior): 高級等級（23%）
 * - R (Regular): 普通等級，最常見（32%）
 */
export const TIER_STYLES: Record<MerchantCouponTier, TierStyle> = {
  /** SP 傳說等級 - 金色系，最閃耀 */
  SP: {
    backgroundColor: '#FFF8E7',
    borderColor: '#D4A24C',
    textColor: '#8B6914',
    gradientColors: ['#F5D78E', '#D4A24C'],
    glowColor: 'rgba(212, 162, 76, 0.4)',
    labelKey: 'gacha_tierSP',
    probability: 2,
  },
  /** SSR 超稀有等級 - 粉紅色系 */
  SSR: {
    backgroundColor: '#FFF0F5',
    borderColor: '#C97B8B',
    textColor: '#8B4D5C',
    gradientColors: ['#E8A8B8', '#C97B8B'],
    glowColor: 'rgba(201, 123, 139, 0.35)',
    labelKey: 'gacha_tierSSR',
    probability: 8,
  },
  /** SR 稀有等級 - 紫色系 */
  SR: {
    backgroundColor: '#F5F0FA',
    borderColor: '#9B7BB8',
    textColor: '#6B4B88',
    gradientColors: ['#B8A0D0', '#9B7BB8'],
    glowColor: 'rgba(155, 123, 184, 0.3)',
    labelKey: 'gacha_tierSR',
    probability: 15,
  },
  /** S 高級等級 - 藍色系 */
  S: {
    backgroundColor: '#F0F5F8',
    borderColor: '#7BA0B8',
    textColor: '#4B6B88',
    gradientColors: ['#A0C0D0', '#7BA0B8'],
    glowColor: 'rgba(123, 160, 184, 0.25)',
    labelKey: 'gacha_tierS',
    probability: 23,
  },
  /** R 普通等級 - 使用品牌色系 */
  R: {
    backgroundColor: MibuBrand.cream,
    borderColor: MibuBrand.tan,
    textColor: MibuBrand.brownDark,
    gradientColors: [MibuBrand.tanLight, MibuBrand.tan],
    glowColor: 'rgba(176, 136, 96, 0.2)',
    labelKey: 'gacha_tierR',
    probability: 32,
  },
};

/**
 * 稀有度等級排序（由高到低）
 * 用於排序和顯示優先級
 */
export const TIER_ORDER: MerchantCouponTier[] = ['SP', 'SSR', 'SR', 'S', 'R'];

/**
 * 取得指定等級的樣式
 *
 * @param tier - 稀有度等級
 * @returns 該等級的完整樣式物件，若等級無效則回傳 R 級樣式
 *
 * @example
 * const ssrStyle = getTierStyle('SSR');
 * console.log(ssrStyle.label); // '超稀有'
 */
export const getTierStyle = (tier: MerchantCouponTier): TierStyle => {
  return TIER_STYLES[tier] || TIER_STYLES.R;
};

/**
 * 取得指定等級的標籤樣式
 * 用於 Badge 元件的快速樣式設定
 *
 * @param tier - 稀有度等級
 * @returns 包含背景色、邊框色、邊框寬度的樣式物件
 *
 * @example
 * <View style={getTierBadgeStyle('SP')}>
 *   <Text>傳說</Text>
 * </View>
 */
export const getTierBadgeStyle = (tier: MerchantCouponTier) => {
  const style = getTierStyle(tier);
  return {
    backgroundColor: style.backgroundColor,
    borderColor: style.borderColor,
    borderWidth: 1,
  };
};
