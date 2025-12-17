import { MerchantCouponTier } from '../types';
import { MibuBrand } from '../../constants/Colors';

export interface TierStyle {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  gradientColors: [string, string];
  glowColor: string;
  label: string;
  labelEn: string;
  probability: number;
}

export const TIER_STYLES: Record<MerchantCouponTier, TierStyle> = {
  SP: {
    backgroundColor: '#FFF8E7',
    borderColor: '#D4A24C',
    textColor: '#8B6914',
    gradientColors: ['#F5D78E', '#D4A24C'],
    glowColor: 'rgba(212, 162, 76, 0.4)',
    label: '傳說',
    labelEn: 'Legendary',
    probability: 2,
  },
  SSR: {
    backgroundColor: '#FFF0F5',
    borderColor: '#C97B8B',
    textColor: '#8B4D5C',
    gradientColors: ['#E8A8B8', '#C97B8B'],
    glowColor: 'rgba(201, 123, 139, 0.35)',
    label: '超稀有',
    labelEn: 'Super Rare',
    probability: 8,
  },
  SR: {
    backgroundColor: '#F5F0FA',
    borderColor: '#9B7BB8',
    textColor: '#6B4B88',
    gradientColors: ['#B8A0D0', '#9B7BB8'],
    glowColor: 'rgba(155, 123, 184, 0.3)',
    label: '稀有',
    labelEn: 'Rare',
    probability: 15,
  },
  S: {
    backgroundColor: '#F0F5F8',
    borderColor: '#7BA0B8',
    textColor: '#4B6B88',
    gradientColors: ['#A0C0D0', '#7BA0B8'],
    glowColor: 'rgba(123, 160, 184, 0.25)',
    label: '高級',
    labelEn: 'Superior',
    probability: 23,
  },
  R: {
    backgroundColor: MibuBrand.cream,
    borderColor: MibuBrand.tan,
    textColor: MibuBrand.brownDark,
    gradientColors: [MibuBrand.tanLight, MibuBrand.tan],
    glowColor: 'rgba(176, 136, 96, 0.2)',
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
