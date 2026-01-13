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

export interface MerchantAnalytics {
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

export interface MerchantPlace {
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
