/**
 * ============================================================
 * 商家系統型別定義 (merchant.ts)
 * ============================================================
 * #074: 完全重寫，對齊後端 APP.md v4.2.0 契約
 *
 * 涵蓋 23 個 API 端點的請求/回應型別：
 * - 商家帳號（me、apply、application-status、permissions、delete）
 * - 核銷碼（daily-code）
 * - 數據分析（analytics、summary）
 * - 店家管理（search、resolve-url、places、claim、new、update）
 * - 優惠券管理（list、create、update、delete）— 路徑 /api/coupons
 * - 核銷記錄（redemption-history、stats）
 * - 訂閱管理（subscription、checkout、cancel）
 *
 * 更新日期：2026-03-10（#074 商家後台完整重做）
 */

// ========== 基礎列舉型別 ==========

export type MerchantStatus = 'pending' | 'approved' | 'rejected';
export type MerchantLevel = 'free' | 'pro' | 'premium';
export type MerchantApplicationStatus = 'none' | 'pending' | 'approved' | 'rejected';
export type AnalyticsPeriod = '7d' | '30d' | '90d' | 'all';
export type MerchantPlaceStatus = 'pending' | 'approved' | 'rejected';
export type MerchantPlaceCardLevel = 'free' | 'pro' | 'premium';
export type CouponRarityLevel = 'R' | 'S' | 'SR' | 'SSR';

// ========== API #1: GET /api/merchant/me ==========

export interface MerchantMe {
  id: number;
  userId: string;
  businessName: string | null;
  email: string;
  subscriptionPlan: string;
  status: MerchantStatus;
  merchantLevel: MerchantLevel;
  createdAt: string;
  rejectionReason: string | null;
  claimedPlaceName: string | null;
}

export interface MerchantMeResponse {
  merchant: MerchantMe | null;
}

// ========== API #2: POST /api/merchant/apply ==========

export interface MerchantSurveyResponses {
  contactName: string;
  taxId?: string;
  industryCategory: string;
  region: string;
  address?: string;
  customerSources: string[];
  challenges: string[];
  marketingBudget: string;
  onlineChannels: string[];
  expectedOutcome: string;
  gamificationView: string;
  contactInfo: string;
}

export interface MerchantApplyRequest {
  businessName: string;
  email: string;
  surveyResponses: MerchantSurveyResponses;
  claimedPlaceId?: number;
  claimedGooglePlaceId?: string;
  claimedGoogleMapsUrl?: string;
  claimedPlaceName?: string;
  claimedPlaceData?: {
    address?: string;
    district?: string;
    city?: string;
    country?: string;
    category?: string;
    subcategory?: string;
    locationLat?: number;
    locationLng?: number;
    openingHours?: { weekdayText?: string[]; periods?: any[] };
    phone?: string;
    website?: string;
  };
}

export interface MerchantApplyResponse {
  success: boolean;
  application: {
    id: number;
    status: 'pending';
    businessName: string;
    claimedPlaceName: string | null;
    createdAt: string;
  };
}

// ========== API #3: GET /api/merchant/application-status ==========

export interface MerchantApplicationStatusResponse {
  status: MerchantApplicationStatus;
  application: {
    id: number;
    businessName: string;
    email: string;
    surveyResponses: Record<string, unknown> | null;
    claimedPlaceName: string | null;
    createdAt: string;
    approvedAt: string | null;
    rejectionReason: string | null;
  } | null;
  merchantTier?: string;
}

// ========== API #4: GET /api/merchant/permissions ==========

export interface MerchantTierPermissions {
  maxPlaces: number;
  maxCoupons: number;
  analytics: boolean;
  allowedRarities: CouponRarityLevel[];
  hasFrame: boolean;
  hasLoadingEffect: boolean;
  canEditPromo: boolean;
  canEditItemboxImage: boolean;
  hasDedicatedSupport: boolean;
}

export interface MerchantPermissionsResponse {
  merchantTier: MerchantLevel;
  maxPlaces: number;
  hasAnalytics: boolean;
  permissions: MerchantTierPermissions;
  allTierPermissions: {
    free: MerchantTierPermissions;
    pro: MerchantTierPermissions;
    premium: MerchantTierPermissions;
  };
}

// ========== API #5: DELETE /api/merchant/account ==========

export interface DeleteMerchantAccountRequest {
  reason?: string;
}

// ========== API #6: GET /api/merchant/daily-code ==========

export interface MerchantDailyCode {
  seedCode: string;
  updatedAt: string;
  expiresAt: string;
}

// ========== API #7: GET /api/merchant/analytics ==========

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

export interface MerchantAnalytics {
  overview: MerchantAnalyticsOverview;
  trend: MerchantAnalyticsTrend[];
  topCoupons: MerchantAnalyticsTopCoupon[];
  placeBreakdown: MerchantAnalyticsPlaceBreakdown[];
  period: string;
  generatedAt: string;
}

// ========== API #8: GET /api/merchant/analytics/summary ==========

export interface MerchantAnalyticsSummary {
  placesCount: number;
  activeCouponsCount: number;
  monthlyExposures: number;
  subscriptionTier: string;
}

// ========== API #9: GET /api/merchant/places/search ==========

export interface PlaceSearchResult {
  id: number;
  placeName: string;
  district: string;
  city: string;
  country: string;
  category?: string;
}

export interface PlaceSearchResponse {
  places: PlaceSearchResult[];
}

// ========== API #10: POST /api/merchant/places/resolve-url ==========

export interface ResolveUrlRequest {
  url: string;
}

export interface ResolvedPlace {
  googlePlaceId: string;
  placeName: string;
  address: string;
  district?: string;
  city?: string;
  country?: string;
  locationLat: number;
  locationLng: number;
  phone?: string;
  website?: string;
  openingHours?: { weekdayText?: string[]; periods?: any[] };
  rating?: number;
  types?: string[];
  businessStatus?: string;
}

export interface ResolveUrlResponse {
  success: boolean;
  place: ResolvedPlace;
}

// ========== API #11: GET /api/merchant/places ==========

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
  openingHours: { weekdayText?: string[]; periods?: any[] } | null;
  status: MerchantPlaceStatus;
  cardLevel: MerchantPlaceCardLevel;
  promoTitle: string | null;
  promoDescription: string | null;
  isPromoActive: boolean | null;
  createdAt: string;
}

export interface MerchantPlacesResponse {
  places: MerchantPlace[];
}

// ========== API #12: POST /api/merchant/places/claim ==========

export interface ClaimPlaceRequest {
  placeName: string;
  district: string;
  city: string;
  country: string;
  placeCacheId?: number;
  googlePlaceId?: string;
}

export interface ClaimPlaceResponse {
  success: true;
  link: MerchantPlace;
  message: string;
}

// ========== API #13: POST /api/merchant/places/new ==========

export interface NewPlaceRequest {
  placeName: string;
  district: string;
  city: string;
  country: string;
  address?: string;
  category?: string;
  subcategory?: string;
  description?: string;
  googlePlaceId?: string;
  locationLat?: string;
  locationLng?: string;
  openingHours?: { weekdayText?: string[]; periods?: any[] };
  phone?: string;
  website?: string;
}

export interface NewPlaceResponse {
  success: true;
  draft: {
    id: number;
    merchantId: number;
    placeName: string;
    status: 'pending';
    source: 'merchant';
  };
  message: string;
}

// ========== API #14: PUT /api/merchant/places/:linkId ==========

export interface UpdatePlaceRequest {
  description?: string;
  googleMapUrl?: string;
  openingHours?: { weekdayText?: string[]; periods?: any[] };
  promoTitle?: string;
  promoDescription?: string;
  isPromoActive?: boolean;
}

export interface UpdatePlaceResponse {
  success: true;
  link: MerchantPlace;
}

// ========== API #15: GET /api/coupons/merchant/:merchantId ==========

export interface MerchantCoupon {
  id: number;
  code: string;
  title: string;
  terms: string | null;
  placeName: string | null;
  rarity: CouponRarityLevel | null;
  isActive: boolean;
  archived: boolean;
  remainingQuantity: number | null;
  redeemedCount: number;
  createdAt: string;
}

export interface MerchantCouponsResponse {
  coupons: MerchantCoupon[];
}

// ========== API #16: POST /api/coupons ==========

export interface CreateCouponRequest {
  code: string;
  title: string;
  terms?: string;
  merchantId: number;
  placeId?: number;
  rarity?: CouponRarityLevel;
  isActive?: boolean;
  remainingQuantity?: number;
}

export interface CreateCouponResponse {
  coupon: MerchantCoupon;
}

// ========== API #17: PATCH /api/coupons/:id ==========

export interface UpdateCouponRequest {
  title?: string;
  terms?: string;
  isActive?: boolean;
  remainingQuantity?: number;
}

export interface UpdateCouponResponse {
  coupon: MerchantCoupon;
}

// ========== API #18: DELETE /api/coupons/:id ==========

export interface DeleteCouponResponse {
  success: true;
  message: string;
}

// ========== API #19: GET /api/merchant/redemption-history ==========

export interface RedemptionRecord {
  id: number;
  userId: string;
  userDisplayName: string;
  couponTitle: string;
  redemptionCode: string;
  status: string;
  verifiedAt: string | null;
  createdAt: string;
}

export interface RedemptionHistoryResponse {
  redemptions: RedemptionRecord[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface RedemptionHistoryParams {
  limit?: number;
  offset?: number;
}

// ========== API #20: GET /api/merchant/redemption-history/stats ==========

export interface RedemptionStats {
  totalRedemptions: number;
  todayRedemptions: number;
  weekRedemptions: number;
  monthRedemptions: number;
}

export interface RedemptionStatsResponse {
  stats: RedemptionStats;
}

// ========== API #21: GET /api/merchant/subscription ==========

export interface MerchantSubscription {
  merchantId: number;
  merchantLevel: MerchantLevel;
  merchantLevelExpiresAt: string | null;
  limits: {
    maxPlaces: number;
    analytics: boolean;
  };
  subscription: {
    id: number;
    tier: string;
    status: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
  } | null;
}

// ========== API #22: POST /api/merchant/subscription/checkout ==========

export interface CheckoutRequest {
  type: 'merchant' | 'place';
  tier: 'pro' | 'premium';
  placeId?: number;
  provider?: 'stripe' | 'recur';
  successUrl?: string;
  cancelUrl?: string;
}

export interface StripeCheckoutResponse {
  url: string;
  checkoutUrl: string;
  sessionId: string;
}

export interface RecurCheckoutResponse {
  provider: 'recur';
  productId: string;
  publishableKey: string;
  customerEmail: string;
  externalCustomerId: string;
  successUrl: string;
  cancelUrl: string;
}

export type CheckoutResponse = StripeCheckoutResponse | RecurCheckoutResponse;

// ========== API #23: POST /api/merchant/subscription/cancel ==========

export interface CancelSubscriptionRequest {
  subscriptionId: number;
}

export interface CancelSubscriptionResponse {
  success: true;
  subscription: Record<string, unknown>;
}

// ========== Profile 區塊（GET /api/account/profile） ==========

export interface ProfileMerchantBlock {
  isMerchant: boolean;
  applicationStatus: MerchantApplicationStatus;
  merchantId: number | null;
}

export interface ProfilePartnerBlock {
  isPartner: boolean;
  applicationStatus: 'none' | 'pending' | 'approved' | 'rejected';
}

// ========== 403 錯誤分類輔助 ==========

export type MerchantErrorType =
  | 'not_approved'
  | 'upgrade_required'
  | 'place_limit'
  | 'coupon_limit'
  | 'unknown';
