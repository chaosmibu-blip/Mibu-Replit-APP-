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

export interface MerchantMe {
  id: number;
  userId: string;
  businessName?: string;
  contactEmail?: string;
  isApproved: boolean;
  creditBalance: number;
  createdAt: string;
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
  city: string;
  district: string;
  items: GachaPoolItem[];
  totalCount: number;
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
  place_name: LocalizedContent;
  description: LocalizedContent;
  ai_description?: LocalizedContent;
  category: Category;
  subcategory?: LocalizedContent;
  suggested_time: string;
  duration: string;
  search_query: string;
  color_hex: string;
  city?: string;
  cityDisplay?: string;
  country?: string;
  district?: string;
  districtDisplay?: string;
  collectedAt?: string;
  operating_status?: string;
  is_coupon: boolean;
  coupon_data: CouponData | null;
  store_promo?: LocalizedContent;
  is_promo_active?: boolean;
  merchant_id?: string;
  merchant?: MerchantInfo;
  remaining_coupons?: number;
  place_id?: string | null;
  verified_name?: string | null;
  verified_address?: string | null;
  google_rating?: number | null;
  google_types?: string[];
  primary_type?: string | null;
  location?: { lat: number; lng: number } | null;
  is_location_verified?: boolean;
  imageUrl?: string;
  rarity?: 'N' | 'R' | 'SR' | 'SSR' | 'SP';
}

export interface GachaMeta {
  date: string;
  country: string;
  city: string;
  locked_district: LocalizedContent;
  user_level: number;
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
  nameJa: string | null;
  nameKo: string | null;
}

export interface Region {
  id: number;
  countryId: number;
  nameEn: string;
  nameZh: string;
  nameJa: string | null;
  nameKo: string | null;
}

export type ItineraryPace = 'relaxed' | 'moderate' | 'packed';
export type TimeSlot = 'breakfast' | 'morning' | 'lunch' | 'afternoon' | 'dinner' | 'evening';

export interface ItineraryCoupon {
  id: string;
  title: string;
  code: string;
  terms: string;
}

export interface ItineraryPlace {
  id: number;
  placeName: LocalizedContent;
  category: string;
  subcategory?: string;
  description?: LocalizedContent;
  imageUrl?: string;
  google_rating?: number;
  location?: { lat: number; lng: number };
  verified_address?: string;
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
}
