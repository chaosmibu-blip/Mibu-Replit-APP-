/**
 * 扭蛋相關類型
 */
import { LocalizedContent, CouponTier, Category } from './common';
import { MerchantInfo, CouponData } from './merchant';

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
  requestedCount?: number;
  totalPlaces?: number;
  isShortfall?: boolean;
  shortfallMessage?: string;
  dailyPullCount?: number;
  remainingQuota?: number;
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
  requestedCount?: number;
  totalPlaces?: number;
  isShortfall?: boolean;
  shortfallMessage?: string;
  dailyPullCount?: number;
  remainingQuota?: number;
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
