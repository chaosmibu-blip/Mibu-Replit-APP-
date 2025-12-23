export enum Category {
  Food = 'Food',
  Stay = 'Stay',
  Education = 'Education',
  Entertainment = 'Entertainment',
  Scenery = 'Scenery',
  Shopping = 'Shopping',
  Activity = 'Activity'
}

export type Language = 'zh-TW' | 'en' | 'ja' | 'ko';
export type LocalizedContent = string | { [key in Language]?: string };

export type PlanTier = 'free' | 'partner' | 'premium';

export type UserRole = 'traveler' | 'merchant' | 'specialist' | 'admin';

export interface User {
  id: string;
  name?: string;
  email: string | null;
  username?: string;
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
  profileImageUrl?: string | null;
  role?: UserRole;
  activeRole?: UserRole;
  isApproved?: boolean;
  isSuperAdmin?: boolean;
  accessibleRoles?: string[];
  provider?: string | null;
  providerId?: string | null;
  isMerchant?: boolean;
  token?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface MerchantDailyCode {
  code: string;
  expiresAt: string;
}

export interface MerchantCredits {
  creditBalance: number;
  merchantId: number;
}

export interface SpecialistInfo {
  id: number;
  userId: string;
  name: string;
  isOnline: boolean;
  isAvailable: boolean;
  serviceRegion?: string;
  currentTravelers?: number;
  maxTravelers?: number;
}

export interface ServiceRelation {
  id: number;
  travelerId: string;
  specialistId: number;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  traveler?: {
    id: string;
    name: string;
  };
}

export type MerchantStatus = 'pending' | 'approved' | 'rejected';
export type MerchantLevel = 'free' | 'pro' | 'premium';
export type MerchantCouponTier = 'SP' | 'SSR' | 'SR' | 'S' | 'R';

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

export interface SosEvent {
  id: string;
  userId: string;
  status: 'pending' | 'active' | 'resolved' | 'cancelled';
  locationLat?: number;
  locationLng?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceOrder {
  id: string;
  userId: string;
  type: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  verificationCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Merchant {
  id: string;
  name: string;
  email: string;
  claimedPlaceNames: string[];
  subscriptionPlan: PlanTier;
}

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

export interface GachaPoolItem {
  id: string;
  name: LocalizedContent;
  category: string;
  rarity: 'N' | 'R' | 'SR' | 'SSR' | 'SP';
  imageUrl?: string;
  merchant?: MerchantInfo;
}

export interface GachaPoolResponse {
  success: boolean;
  pool: {
    city: string;
    jackpots: Array<{
      id: number;
      placeName: string;
      category: string;
      subCategory: string;
      rating: string | null;
    }>;
    totalInPool: number;
    jackpotCount: number;
  };
}

export interface GachaPullPayload {
  userId: string;
  city: string;
  district: string;
  itemCount: number;
}

export interface GachaPullResponse {
  success: boolean;
  items: GachaItem[];
  meta: GachaMeta;
}

export interface GachaItem {
  id: number;
  placeName: string;
  category: string;
  subcategory: string | null;
  description: string | null;
  address: string | null;
  rating: number | null;
  locationLat: number | null;
  locationLng: number | null;
  googlePlaceId?: string | null;
  city?: string;
  cityDisplay?: string;
  country?: string;
  district?: string;
  districtDisplay?: string;
  location?: { lat: number; lng: number } | null;
  collectedAt?: string;
  isCoupon?: boolean;
  couponData?: CouponData | null;
  merchant?: MerchantInfo;
  imageUrl?: string;
  rarity?: 'N' | 'R' | 'SR' | 'SSR' | 'SP';
}

export interface GachaMeta {
  date: string;
  country: string;
  city: string;
  lockedDistrict: string;
  userLevel: number;
  couponsWon?: number;
  themeIntro?: string;
  sortingMethod?: string;
}

export interface CouponWon {
  tier: CouponTier;
  placeName: string;
  couponName: string;
  inventoryId?: number;
}

export interface ItineraryV3Meta {
  city?: string;
  district?: string | null;
  message?: string;
  code?: string;
  sortingMethod?: 'coordinate' | 'ai_reordered';
  aiReorderResult?: 'reordered' | 'no_change' | 'no_numbers' | 'error';
  categoryDistribution?: Record<string, number>;
}

export interface ItineraryGenerateResponse {
  success?: boolean;
  itinerary?: any[];
  couponsWon?: CouponWon[];
  themeIntro?: string;
  meta?: ItineraryV3Meta;
  anchorDistrict?: string;
  pace?: string;
  totalPlaces?: number;
  totalCouponsWon?: number;
  categoryDistribution?: Record<string, number>;
  sortingMethod?: string;
  targetDistrict?: string;
  city?: string;
  country?: string;
  districtId?: number;
  legacyCouponsWon?: CouponWon[];
  error?: string;
  errorCode?: string;
  message?: string;
}

export interface GachaResponse {
  status: string;
  meta: GachaMeta;
  inventory: GachaItem[];
}

export interface Country {
  id: number;
  code: string;
  nameEn: string;
  nameZh: string;
  nameJa: string;
  nameKo: string;
  isActive: boolean;
}

export interface Region {
  id: number;
  countryId: number;
  code: string;
  nameEn: string;
  nameZh: string;
  nameJa: string;
  nameKo: string;
  isActive: boolean;
}

export interface CountriesResponse {
  countries: Country[];
}

export interface RegionsResponse {
  regions: Region[];
}

export type ItineraryPace = 'relaxed' | 'moderate' | 'packed';
export type TimeSlot = 'breakfast' | 'morning' | 'lunch' | 'afternoon' | 'dinner' | 'evening';

export interface ItineraryCoupon {
  id: number;
  title: string;
  code: string;
  terms: string | null;
}

export interface ItineraryPlace {
  id: number;
  placeName: LocalizedContent;
  category: string;
  subcategory?: string;
  description?: LocalizedContent;
  imageUrl?: string;
  googleRating?: number;
  location?: { lat: number; lng: number };
  verifiedAddress?: string;
}

export interface ItineraryItem {
  timeSlot: TimeSlot;
  place: ItineraryPlace;
  couponWon: ItineraryCoupon | null;
}

export interface ItineraryV3Response {
  success: boolean;
  itinerary: ItineraryItem[];
  couponsWon: ItineraryCoupon[];
  meta: {
    city: string;
    district: string;
    pace: ItineraryPace;
    totalPlaces: number;
    totalCouponsWon: number;
  };
}

export interface ItineraryV3Payload {
  city: string;
  district: string;
  pace: ItineraryPace;
}

export interface GlobalExclusion {
  id: number;
  userId: null;
  placeName: string;
  district: string;
  city: string;
  penaltyScore: number;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  email: string | null;
  name?: string;
  role: UserRole;
  isApproved: boolean;
  createdAt: string;
}

export interface PlaceDraft {
  id: number;
  placeName: string;
  district?: string;
  city?: string;
  category?: string;
  submittedBy?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export type AppView = 'home' | 'gacha_module' | 'planner_module' | 'settings' | 'result' | 'login';
export type GachaSubView = 'gacha' | 'collection' | 'itembox';
export type PlannerSubView = 'location' | 'itinerary' | 'chat' | 'service';

export interface AppState {
  language: Language;
  user: User | null;
  country: string;
  city: string;
  countryId: number | null;
  regionId: number | null;
  level: number;
  loading: boolean;
  error: string | null;
  result: GachaResponse | null;
  collection: GachaItem[];
  view: AppView;
  isAuthenticated: boolean;
  unreadItemCount: number;
}

export type AnnouncementType = 'announcement' | 'flash_event' | 'holiday_event';

export interface Announcement {
  id: number;
  type: AnnouncementType;
  title: string;
  content: string;
  imageUrl?: string;
  linkUrl?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementsResponse {
  announcements: Announcement[];
}

export interface CreateAnnouncementParams {
  type: AnnouncementType;
  title: string;
  content: string;
  imageUrl?: string;
  linkUrl?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  priority?: number;
}

export interface UpdateAnnouncementParams {
  type?: AnnouncementType;
  title?: string;
  content?: string;
  imageUrl?: string;
  linkUrl?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  priority?: number;
}

export type CouponRarity = 'SP' | 'SSR';

export interface RegionPoolCoupon {
  id: number;
  title: string;
  description: string | null;
  rarity: CouponRarity;
  merchantName: string;
  discount: string | null;
  merchantId: number;
}

// Inventory / Itembox Types
export type InventoryItemType = 'coupon' | 'ticket' | 'gift';
export type InventoryItemStatus = 'active' | 'expired' | 'redeemed' | 'deleted';
export type CouponTier = 'SP' | 'SSR' | 'SR' | 'S' | 'R';

export interface InventoryItem {
  id: number;
  type: 'coupon' | 'item';
  name: string;
  description: string | null;
  rarity: CouponTier;
  isRead: boolean;
  isRedeemed: boolean;
  expiresAt: string | null;
  obtainedAt: string;
  couponData?: {
    code: string;
    merchantName: string;
    terms: string;
  };
}

export interface InventoryResponse {
  items: InventoryItem[];
  slotCount: number;
  maxSlots: number;
  isFull: boolean;
}

export interface InventoryConfig {
  maxSlots: number;
}

export interface RarityConfig {
  spRate: number;
  ssrRate: number;
  srRate: number;
  sRate: number;
  rRate: number;
}

export interface RedeemResponse {
  success: boolean;
  redemptionCode: string;
  expiresAt: string;
}

// Collection with Promo
export interface CollectionWithPromo {
  id: number;
  placeName: string;
  country: string;
  city: string;
  district: string;
  category: string;
  hasPromo: boolean;
  promoTitle: string | null;
  promoDescription: string | null;
}

export interface CollectionWithPromoResponse {
  collections: CollectionWithPromo[];
  grouped: Record<string, CollectionWithPromo[]>;
  hasPromoItems: boolean;
}

export interface AutoSaveCollectionResponse {
  success: boolean;
  isNew: boolean;
  hasPromo: boolean;
  promoTitle: string | null;
}

// Ads
export type AdPlacement = 'gacha_start' | 'gacha_result' | 'collection_view' | 'item_use';

export interface AdConfig {
  placementKey: string;
  adUnitIdIos: string;
  adUnitIdAndroid: string;
  adType: string;
  fallbackImageUrl: string | null;
  showFrequency: number;
}

// Notifications
export interface NotificationStatus {
  itembox: number;
  collection: number;
}

// Merchant Redemption Code
export interface MerchantRedemptionCode {
  code: string;
  expiresAt: string;
}

// User Profile (Settings Page)
export type Gender = 'male' | 'female' | 'other';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  role: UserRole;
  gender: Gender | null;
  birthDate: string | null;
  phone: string | null;
  dietaryRestrictions: string[];
  medicalHistory: string[];
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  emergencyContactRelation: string | null;
  preferredLanguage: Language;
}

export interface UpdateProfileParams {
  firstName?: string;
  lastName?: string;
  gender?: Gender;
  birthDate?: string;
  phone?: string;
  dietaryRestrictions?: string[];
  medicalHistory?: string[];
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  preferredLanguage?: Language;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  profile: UserProfile;
}

// SOS System
export type SosAlertStatus = 'pending' | 'acknowledged' | 'resolved' | 'cancelled';

export interface SosAlert {
  id: number;
  userId: string;
  serviceOrderId: number | null;
  plannerId: number | null;
  location: string | null;
  locationAddress: string | null;
  message: string | null;
  status: SosAlertStatus;
  acknowledgedBy: string | null;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

export interface SosEligibility {
  eligible: boolean;
  reason: string | null;
}

export interface SosSendParams {
  serviceOrderId?: number;
  plannerId?: number;
  location?: string;
  locationAddress?: string;
  message?: string;
}

export interface SosSendResponse {
  success: boolean;
  alertId: number;
  message: string;
}

export interface SosAlertsResponse {
  alerts: SosAlert[];
}

// ============================================
// 行程卡商家/優惠券欄位
// ============================================
export interface ItineraryCardMerchantPromo {
  title: string;
  description: string;
}

export interface ItineraryCardCouponData {
  tier: CouponTier;
  name: string;
  validUntil: string;
}

export interface ItineraryCard {
  id: number;
  placeName: LocalizedContent;
  description: LocalizedContent;
  category: Category;
  district?: string;
  city?: string;
  country?: string;
  hasMerchant: boolean;
  merchantPromo?: ItineraryCardMerchantPromo;
  isCoupon?: boolean;
  couponData?: ItineraryCardCouponData;
}

// ============================================
// 圖鑑項目（含商家優惠狀態）
// ============================================
export interface CollectionItem {
  id: number;
  placeName: string;
  category: string;
  district: string;
  city: string;
  country: string;
  hasPromo: boolean;
  promoTitle?: string;
  promoDescription?: string;
  createdAt?: string;
}

export interface CollectionResponse {
  items: CollectionItem[];
  total: number;
}

// ============================================
// 獎池相關
// ============================================
export interface PrizePoolCoupon {
  id: number;
  title: string;
  rarity: 'SP' | 'SSR';
  merchantId: string;
  placeLinkId: number;
  placeName: string;
}

export interface PrizePoolResponse {
  success: boolean;
  coupons: PrizePoolCoupon[];
  region: {
    id: number;
    name: string;
  };
}

// ============================================
// 未讀計數
// ============================================
export interface UnreadCounts {
  unread: {
    collection: number;
    itembox: number;
    announcement: number;
  };
  total: number;
}

// ============================================
// 每日抽卡限制
// ============================================
export interface GachaItineraryMeta {
  city: string;
  anchorDistrict: string | null;
  pace: 'relaxed' | 'moderate' | 'packed';
  totalPlaces: number;
  totalCouponsWon: number;
  categoryDistribution: Record<string, number>;
  sortingMethod: 'coordinate' | 'ai_reordered';
  aiReorderResult: string;
  dailyLimit: number;
  dailyPullCount: number;
  remainingQuota: number;
}

export interface DailyLimitExceededResponse {
  success: false;
  error: string;
  code: 'DAILY_LIMIT_EXCEEDED' | 'EXCEEDS_REMAINING_QUOTA';
  dailyLimit: number;
  currentCount: number;
  remainingQuota: number;
}

// ============================================
// 刪除帳號
// ============================================
export interface DeleteAccountResponse {
  success: boolean;
  message?: string;
  error?: string;
  code?: 'UNAUTHORIZED' | 'MERCHANT_ACCOUNT_EXISTS' | 'DELETE_FAILED' | 'SERVER_ERROR';
}
