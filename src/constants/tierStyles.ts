import { MerchantCouponTier } from '../types';

export interface TierStyle {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  gradientColors: [string, string];
  label: string;
  labelEn: string;
  probability: number;
}

export const TIER_STYLES: Record<MerchantCouponTier, TierStyle> = {
  SP: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
    textColor: '#b45309',
    gradientColors: ['#fbbf24', '#f59e0b'],
    label: '傳說',
    labelEn: 'Legendary',
    probability: 2,
  },
  SSR: {
    backgroundColor: '#fce7f3',
    borderColor: '#ec4899',
    textColor: '#be185d',
    gradientColors: ['#f472b6', '#ec4899'],
    label: '超稀有',
    labelEn: 'Super Rare',
    probability: 8,
  },
  SR: {
    backgroundColor: '#ede9fe',
    borderColor: '#8b5cf6',
    textColor: '#6d28d9',
    gradientColors: ['#a78bfa', '#8b5cf6'],
    label: '稀有',
    labelEn: 'Rare',
    probability: 15,
  },
  S: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
    textColor: '#1d4ed8',
    gradientColors: ['#60a5fa', '#3b82f6'],
    label: '高級',
    labelEn: 'Superior',
    probability: 23,
  },
  R: {
    backgroundColor: '#f1f5f9',
    borderColor: '#64748b',
    textColor: '#334155',
    gradientColors: ['#94a3b8', '#64748b'],
    label: '普通',
    labelEn: 'Regular',
    probability: 32,
  },
};

export const TIER_ORDER: MerchantCouponTier[] = ['SP', 'SSR', 'SR', 'S', 'R'];

export const getTierStyle = (tier: MerchantCouponTier): TierStyle => {
  return TIER_STYLES[tier] || TIER_STYLES.R;
};

export const getTierBadgeStyle = (tier: MerchantCouponTier) => {
  const style = getTierStyle(tier);
  return {
    backgroundColor: style.backgroundColor,
    borderColor: style.borderColor,
    borderWidth: 1,
  };
};
