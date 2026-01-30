/**
 * @fileoverview 扭蛋系統型別定義
 *
 * 定義扭蛋（Gacha）相關的資料結構，包含：
 * - 扭蛋池資訊
 * - 扭蛋結果
 * - 行程生成
 * - 優惠券獎勵
 * - 額度管理
 *
 * @module types/gacha
 */

import { LocalizedContent, CouponTier, Category } from './common';
import { MerchantInfo, CouponData } from './merchant';
import { Achievement } from './economy';

// ============ 扭蛋池 ============

/**
 * 扭蛋池中的項目
 *
 * 用於顯示當前區域可抽到的景點
 */
export interface GachaPoolItem {
  id: string;                            // 項目 ID
  name: LocalizedContent;                // 多語言名稱
  category: string;                      // 分類
  rarity: 'N' | 'R' | 'SR' | 'SSR' | 'SP'; // 稀有度
  imageUrl?: string;                     // 圖片 URL
  merchant?: MerchantInfo;               // 關聯商家資訊
}

/**
 * 扭蛋池查詢回應
 * GET /api/gacha/pool
 */
export interface GachaPoolResponse {
  success: boolean;  // 是否成功
  pool: {
    city: string;              // 城市名稱
    jackpots: Array<{          // 大獎列表
      id: number;              // 地點 ID
      placeName: string;       // 地點名稱
      category: string;        // 分類
      subCategory: string;     // 子分類
      rating: string | null;   // 評分
    }>;
    totalInPool: number;       // 池中總項目數
    jackpotCount: number;      // 大獎數量
  };
}

// ============ 扭蛋抽取 ============

/**
 * 扭蛋抽取請求參數
 * POST /api/gacha/pull
 */
export interface GachaPullPayload {
  userId: string;    // 用戶 ID
  city: string;      // 城市
  district: string;  // 區域
  itemCount: number; // 抽取數量
}

/**
 * 扭蛋抽取回應
 * POST /api/gacha/pull
 */
export interface GachaPullResponse {
  success: boolean;      // 是否成功
  items: GachaItem[];    // 抽到的項目
  meta: GachaMeta;       // 元資料
}

// ============ 扭蛋項目 ============

/**
 * 扭蛋項目（景點）
 *
 * 扭蛋抽到的單一景點資訊
 */
export interface GachaItem {
  id: number;                          // 地點 ID
  placeName: string;                   // 地點名稱
  category: string;                    // 主分類
  subcategory: string | null;          // 子分類
  description: string | null;          // 描述
  address: string | null;              // 地址
  rating: number | null;               // Google 評分
  locationLat: number | null;          // 緯度
  locationLng: number | null;          // 經度
  googlePlaceId?: string | null;       // Google Place ID
  city?: string;                       // 城市代碼
  cityDisplay?: string;                // 城市顯示名稱
  country?: string;                    // 國家
  district?: string;                   // 區域代碼
  districtDisplay?: string;            // 區域顯示名稱
  location?: { lat: number; lng: number } | null; // 座標物件
  collectedAt?: string;                // 收藏時間（ISO 8601）
  isCoupon?: boolean;                  // 是否附帶優惠券
  couponData?: CouponData | null;      // 優惠券資料
  merchant?: MerchantInfo;             // 商家資訊
  imageUrl?: string;                   // 圖片 URL
  rarity?: 'N' | 'R' | 'SR' | 'SSR' | 'SP'; // 稀有度
  isRedeemed?: boolean;                // 是否已核銷（優惠券）
  redeemedAt?: string;                 // 核銷時間（ISO 8601）
}

/**
 * 扭蛋元資料
 *
 * 包含扭蛋結果的統計資訊
 */
export interface GachaMeta {
  date: string;                // 扭蛋日期
  country: string;             // 國家
  city: string;                // 城市
  lockedDistrict: string;      // 鎖定的區域
  userLevel: number;           // 用戶等級
  couponsWon?: number;         // 獲得的優惠券數量
  themeIntro?: string;         // 主題介紹文字
  sortingMethod?: string;      // 排序方式
  requestedCount?: number;     // 請求的數量
  totalPlaces?: number;        // 實際回傳的數量
  isShortfall?: boolean;       // 是否數量不足
  shortfallMessage?: string;   // 數量不足訊息
  dailyPullCount?: number;     // 今日已抽次數
  remainingQuota?: number;     // 剩餘額度
}

// ============ 優惠券獎勵 ============

/**
 * 獲得的優惠券
 *
 * 扭蛋時抽中的優惠券資訊
 */
export interface CouponWon {
  tier: CouponTier;       // 優惠券等級
  placeName: string;      // 關聯地點名稱
  couponName: string;     // 優惠券名稱
  inventoryId?: number;   // 背包項目 ID
}

// ============ 行程生成（V3）============

/**
 * 行程生成 V3 元資料
 */
export interface ItineraryV3Meta {
  city?: string;                     // 城市
  district?: string | null;          // 區域
  message?: string;                  // 訊息
  code?: string;                     // 狀態碼
  sortingMethod?: 'coordinate' | 'ai_reordered'; // 排序方式
  aiReorderResult?: 'reordered' | 'no_change' | 'no_numbers' | 'error'; // AI 重排結果
  categoryDistribution?: Record<string, number>; // 分類分布
  requestedCount?: number;           // 請求數量
  totalPlaces?: number;              // 實際數量
  isShortfall?: boolean;             // 是否不足
  shortfallMessage?: string;         // 不足訊息
  dailyPullCount?: number;           // 今日已用
  remainingQuota?: number;           // 剩餘額度
}

/**
 * 行程原始項目（後端回傳格式）
 *
 * 後端回傳的原始格式，需要前端處理轉換
 */
export interface ItineraryItemRaw {
  place?: Partial<GachaItem>;        // 地點資訊（巢狀）
  placeName?: string;                // 地點名稱
  description?: string;              // 描述
  category?: string;                 // 分類
  subcategory?: string;              // 子分類
  address?: string;                  // 地址
  rating?: number;                   // 評分
  locationLat?: number;              // 緯度
  locationLng?: number;              // 經度
  googlePlaceId?: string;            // Google Place ID
  city?: string;                     // 城市
  district?: string;                 // 區域
  country?: string;                  // 國家
  rarity?: 'N' | 'R' | 'SR' | 'SSR' | 'SP'; // 稀有度
  isCoupon?: boolean;                // 是否有優惠券
  couponWon?: CouponData;            // 獲得的優惠券
  couponData?: CouponData | null;    // 優惠券資料
  merchantPromo?: {                  // 商家促銷
    merchantId?: string;             // 商家 ID
    promoTitle?: string;             // 促銷標題
    promoDescription?: string;       // 促銷描述
    badge?: string;                  // 徽章
    discount?: string;               // 折扣
    isPromoActive?: boolean;         // 促銷是否啟用
  };
  subCategory?: string;              // 子分類（舊欄位）
}

/**
 * 行程生成回應
 * POST /api/gacha/itinerary
 */
export interface ItineraryGenerateResponse {
  success?: boolean;                 // 是否成功
  itinerary?: ItineraryItemRaw[];    // 行程項目列表
  couponsWon?: CouponWon[];          // 獲得的優惠券
  themeIntro?: string;               // 主題介紹
  meta?: ItineraryV3Meta;            // 元資料
  anchorDistrict?: string;           // 錨定區域
  pace?: string;                     // 節奏
  totalPlaces?: number;              // 總地點數
  totalCouponsWon?: number;          // 總優惠券數
  categoryDistribution?: Record<string, number>; // 分類分布
  sortingMethod?: string;            // 排序方式
  targetDistrict?: string;           // 目標區域
  city?: string;                     // 城市
  country?: string;                  // 國家
  districtId?: number;               // 區域 ID
  legacyCouponsWon?: CouponWon[];    // 舊版優惠券（相容）
  error?: string;                    // 錯誤訊息
  errorCode?: string;                // 錯誤碼
  message?: string;                  // 訊息
  code?: string;                     // 狀態碼
  remainingQuota?: number;           // 剩餘額度
  unlockedAchievements?: Achievement[]; // 扭蛋後新解鎖的成就（#020）
}

/**
 * 扭蛋回應（舊版格式）
 */
export interface GachaResponse {
  status: string;          // 狀態
  meta: GachaMeta;         // 元資料
  inventory: GachaItem[];  // 項目列表
}

// ============ 行程 V3 格式 ============

/**
 * 行程節奏
 * - relaxed: 輕鬆（每天 3-4 個點）
 * - moderate: 適中（每天 5-6 個點）
 * - packed: 緊湊（每天 7+ 個點）
 */
export type ItineraryPace = 'relaxed' | 'moderate' | 'packed';

/**
 * 時段
 */
export type TimeSlot = 'breakfast' | 'morning' | 'lunch' | 'afternoon' | 'dinner' | 'evening';

/**
 * 行程優惠券（V3）
 */
export interface ItineraryCoupon {
  id: number;             // 優惠券 ID
  title: string;          // 標題
  code: string;           // 兌換碼
  terms: string | null;   // 使用條款
}

/**
 * 行程地點（V3）
 */
export interface ItineraryPlace {
  id: number;                            // 地點 ID
  placeName: LocalizedContent;           // 多語言名稱
  category: string;                      // 分類
  subcategory?: string;                  // 子分類
  description?: LocalizedContent;        // 多語言描述
  imageUrl?: string;                     // 圖片 URL
  googleRating?: number;                 // Google 評分
  location?: { lat: number; lng: number }; // 座標
  verifiedAddress?: string;              // 已驗證地址
}

/**
 * 行程項目（V3）
 */
export interface ItineraryItem {
  timeSlot: TimeSlot;              // 時段
  place: ItineraryPlace;           // 地點資訊
  couponWon: ItineraryCoupon | null; // 獲得的優惠券
}

/**
 * 行程 V3 回應
 */
export interface ItineraryV3Response {
  success: boolean;                // 是否成功
  itinerary: ItineraryItem[];      // 行程項目
  couponsWon: ItineraryCoupon[];   // 獲得的優惠券
  meta: {
    city: string;                  // 城市
    district: string;              // 區域
    pace: ItineraryPace;           // 節奏
    totalPlaces: number;           // 總地點數
    totalCouponsWon: number;       // 總優惠券數
  };
}

/**
 * 行程 V3 請求參數
 */
export interface ItineraryV3Payload {
  city: string;          // 城市
  district: string;      // 區域
  pace: ItineraryPace;   // 節奏
}

// ============ 行程卡片 ============

/**
 * 行程卡片商家促銷
 */
export interface ItineraryCardMerchantPromo {
  title: string;        // 促銷標題
  description: string;  // 促銷描述
}

/**
 * 行程卡片優惠券資料
 */
export interface ItineraryCardCouponData {
  tier: CouponTier;     // 優惠券等級
  name: string;         // 優惠券名稱
  validUntil: string;   // 有效期限
}

/**
 * 行程卡片
 *
 * 用於 UI 顯示的行程卡片資料
 */
export interface ItineraryCard {
  id: number;                                  // 項目 ID
  placeName: LocalizedContent;                 // 多語言名稱
  description: LocalizedContent;               // 多語言描述
  category: Category;                          // 分類
  district?: string;                           // 區域
  city?: string;                               // 城市
  country?: string;                            // 國家
  hasMerchant: boolean;                        // 是否有商家
  merchantPromo?: ItineraryCardMerchantPromo;  // 商家促銷
  isCoupon?: boolean;                          // 是否有優惠券
  couponData?: ItineraryCardCouponData;        // 優惠券資料
}

// ============ 獎池 ============

/**
 * 獎池優惠券
 */
export interface PrizePoolCoupon {
  id: number;          // 優惠券 ID
  title: string;       // 標題
  rarity: 'SP' | 'SSR'; // 稀有度
  merchantId: string;  // 商家 ID
  placeLinkId: number; // 地點連結 ID
  placeName: string;   // 地點名稱
}

/**
 * 獎池回應
 * GET /api/gacha/prize-pool
 */
export interface PrizePoolResponse {
  success: boolean;              // 是否成功
  coupons: PrizePoolCoupon[];    // 優惠券列表
  region: {
    id: number;                  // 地區 ID
    name: string;                // 地區名稱
  };
}

// ============ 扭蛋行程元資料 ============

/**
 * 扭蛋行程元資料
 */
export interface GachaItineraryMeta {
  city: string;                              // 城市
  anchorDistrict: string | null;             // 錨定區域
  pace: 'relaxed' | 'moderate' | 'packed';   // 節奏
  totalPlaces: number;                       // 總地點數
  totalCouponsWon: number;                   // 總優惠券數
  categoryDistribution: Record<string, number>; // 分類分布
  sortingMethod: 'coordinate' | 'ai_reordered'; // 排序方式
  aiReorderResult: string;                   // AI 重排結果
  dailyLimit: number;                        // 每日上限
  dailyPullCount: number;                    // 今日已用
  remainingQuota: number;                    // 剩餘額度
}

/**
 * 每日額度超過回應
 */
export interface DailyLimitExceededResponse {
  success: false;                            // 固定為 false
  error: string;                             // 錯誤訊息
  code: 'DAILY_LIMIT_EXCEEDED' | 'EXCEEDS_REMAINING_QUOTA'; // 錯誤碼
  dailyLimit: number;                        // 每日上限
  currentCount: number;                      // 當前已用
  remainingQuota: number;                    // 剩餘額度
}

// ============ #009 額度查詢 ============

/**
 * 扭蛋額度查詢回應
 * GET /api/gacha/quota
 */
export interface GachaQuotaResponse {
  dailyLimit: number;   // 每日上限（36）
  usedToday: number;    // 今日已用
  remaining: number;    // 剩餘額度
  isUnlimited: boolean; // 是否無限（管理員）
}

// ============ #010 行程提交 ============

/**
 * 行程提交回應
 * POST /api/gacha/submit-trip
 */
export interface SubmitTripResponse {
  success: boolean;     // 是否成功
  message: string;      // 回應訊息
  trip: {
    sessionId: string;      // 行程 Session ID
    city: string;           // 城市
    district?: string;      // 區域
    tripImageUrl?: string;  // 行程圖片 URL
    isPublished: boolean;   // 是否已發布
    publishedAt: string;    // 發布時間
  };
}
