/**
 * 商家相關類型
 */
import { LocalizedContent, PlanTier, CouponRarity } from './common';

export type MerchantStatus = 'pending' | 'approved' | 'rejected';
export type MerchantLevel = 'free' | 'pro' | 'premium';
export type MerchantCouponTier = 'SP' | 'SSR' | 'SR' | 'S' | 'R';

export interface CouponData {
  title: LocalizedContent;
  code: string;
  terms: LocalizedContent;
}

export interface MerchantInfo {
  id: string;
  name: string;
  badge?: string;
  discount?: string;
  description?: string;
  brandColor?: string;
  isPro?: boolean;
  promo?: string;
}

export interface Merchant {
  id: string;
  name: string;
  email: string;
  claimedPlaceNames: string[];
  subscriptionPlan: PlanTier;
}

export interface MerchantMe {
  id: number;
  userId: string;
  name?: string;
  email?: string;
  ownerName?: string;
  businessName?: string;
  taxId?: string;
  businessCategory?: string;
  address?: string;
  phone?: string;
  mobile?: string;
  contactEmail?: string;
  status: MerchantStatus;
  merchantLevel: MerchantLevel;
  isApproved: boolean;
  creditBalance: number;
  subscriptionPlan?: string;
  createdAt: string;
}

export interface MerchantDailyCode {
  code: string;
  expiresAt: string;
}

export interface MerchantCredits {
  creditBalance: number;
  merchantId: number;
}

export interface MerchantApplyParams {
  ownerName: string;
  businessName: string;
  taxId?: string;
  businessCategory: string;
  address: string;
  phone?: string;
  mobile: string;
  email: string;
}

export interface MerchantApplyResponse {
  success: boolean;
  merchant: MerchantMe;
  isNew: boolean;
  message: string;
}

export interface MerchantAnalyticsOverview {
  totalExposures: number;
  totalCollectors: number;
  couponIssued: number;
  couponRedeemed: number;
  redemptionRate: number;
}

export interface MerchantAnalyticsTrend {
  date: string;
  exposures: number;
}

export interface MerchantAnalyticsTopCoupon {
  couponId: number;
  title: string;
  issued: number;
  redeemed: number;
  redemptionRate: number;
}

export interface MerchantAnalyticsPlaceBreakdown {
  placeId: number;
  placeName: string;
  collectionCount: number;
}

export type AnalyticsPeriod = '7d' | '30d' | '90d' | 'all';

export interface MerchantAnalytics {
  overview: MerchantAnalyticsOverview;
  trend: MerchantAnalyticsTrend[];
  topCoupons: MerchantAnalyticsTopCoupon[];
  placeBreakdown: MerchantAnalyticsPlaceBreakdown[];
  period: string;
  generatedAt: string;
}

// 舊版相容（如果有地方還在用）
export interface MerchantAnalyticsLegacy {
  itineraryCardCount: number;
  couponStats: {
    total: number;
    active: number;
    redeemed: number;
  };
  impressions: number;
  collectionClickCount: number;
}

export interface MerchantCoupon {
  id: number;
  merchantId: number;
  name: string;
  tier: MerchantCouponTier;
  content: string;
  terms: string | null;
  quantity: number;
  remainingQuantity: number;
  validFrom: string | null;
  validUntil: string | null;
  isActive: boolean;
  /** 背包顯示用圖片 */
  inventoryImageUrl: string | null;
  /** 卡片背景圖片 */
  backgroundImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMerchantCouponParams {
  name: string;
  tier: MerchantCouponTier;
  content: string;
  terms?: string;
  quantity: number;
  validFrom?: string;
  validUntil?: string;
  isActive?: boolean;
  inventoryImageUrl?: string;
  backgroundImageUrl?: string;
}

export interface UpdateMerchantCouponParams {
  name?: string;
  tier?: MerchantCouponTier;
  content?: string;
  terms?: string;
  quantity?: number;
  validFrom?: string;
  validUntil?: string;
  isActive?: boolean;
  inventoryImageUrl?: string;
  backgroundImageUrl?: string;
}

export interface MerchantCouponsResponse {
  success: boolean;
  coupons: MerchantCoupon[];
}

export interface MerchantTransaction {
  id: number;
  merchantId: number;
  amount: number;
  type: 'purchase' | 'usage' | 'refund';
  description?: string;
  createdAt: string;
}

export interface MerchantPlaceOpeningHours {
  weekdayText?: string[];
  periods?: any[];
}

export type MerchantPlaceStatus = 'pending' | 'approved' | 'rejected';
export type MerchantPlaceCardLevel = 'free' | 'pro' | 'premium';

export interface MerchantPlace {
  id: number;
  merchantId: number;
  officialPlaceId: number | null;
  placeName: string;
  district: string;
  city: string;
  country: string;
  description: string | null;
  googleMapUrl: string | null;
  openingHours: MerchantPlaceOpeningHours | null;
  status: MerchantPlaceStatus;
  cardLevel: MerchantPlaceCardLevel;
  promoTitle: string | null;
  promoDescription: string | null;
  inventoryImageUrl: string | null;
  isPromoActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateMerchantPlaceParams {
  description?: string;
  googleMapUrl?: string;
  openingHours?: MerchantPlaceOpeningHours;
  promoTitle?: string;
  promoDescription?: string;
  isPromoActive?: boolean;
}

// 舊版相容
export interface MerchantPlaceLegacy {
  id: number;
  linkId: string;
  merchantId: number;
  placeName: string;
  district?: string;
  city?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface MerchantProduct {
  id: number;
  merchantId: number;
  placeId?: number;
  name: string;
  description?: string;
  price?: number;
  discountPrice?: number;
  isActive: boolean;
  createdAt: string;
}

export interface PlaceSearchResult {
  id: number;
  placeId: string;
  placeName: string;
  district?: string;
  city?: string;
  isClaimed: boolean;
}

export interface MerchantRedemptionCode {
  code: string;
  expiresAt: string;
}

export interface RegionPoolCoupon {
  id: number;
  title: string;
  description: string | null;
  rarity: CouponRarity;
  merchantName: string;
  discount: string | null;
  merchantId: number;
}
