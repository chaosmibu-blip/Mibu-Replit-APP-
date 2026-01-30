/**
 * @fileoverview 商家系統型別定義
 *
 * 定義商家相關的資料結構，包含：
 * - 商家資訊與狀態
 * - 優惠券管理
 * - 數據分析
 * - 地點認領
 *
 * @module types/merchant
 */

import { LocalizedContent, PlanTier, CouponRarity } from './common';

// ============ 商家狀態型別 ============

/**
 * 商家審核狀態
 * - pending: 待審核
 * - approved: 已通過
 * - rejected: 已拒絕
 */
export type MerchantStatus = 'pending' | 'approved' | 'rejected';

/**
 * 商家等級
 * - free: 免費版
 * - pro: 專業版
 * - premium: 頂級版
 */
export type MerchantLevel = 'free' | 'pro' | 'premium';

/**
 * 商家優惠券等級
 */
export type MerchantCouponTier = 'SP' | 'SSR' | 'SR' | 'S' | 'R';

// ============ 優惠券資料 ============

/**
 * 優惠券資料
 *
 * 與景點關聯的優惠券資訊
 */
export interface CouponData {
  title: LocalizedContent;     // 多語言標題
  code: string;                // 優惠券代碼
  terms: LocalizedContent;     // 多語言使用條款
  expiresAt?: string;          // 到期時間（ISO 8601）
}

// ============ 商家資訊 ============

/**
 * 商家簡要資訊
 *
 * 用於景點卡片等處顯示的商家資訊
 */
export interface MerchantInfo {
  id: string;            // 商家 ID
  name: string;          // 商家名稱
  badge?: string;        // 徽章
  discount?: string;     // 折扣資訊
  description?: string;  // 描述
  brandColor?: string;   // 品牌顏色
  isPro?: boolean;       // 是否為專業版
  promo?: string;        // 促銷資訊
}

/**
 * 商家基本資訊
 */
export interface Merchant {
  id: string;                    // 商家 ID
  name: string;                  // 商家名稱
  email: string;                 // 電子郵件
  claimedPlaceNames: string[];   // 已認領的地點名稱
  subscriptionPlan: PlanTier;    // 訂閱方案
}

/**
 * 商家詳細資訊（我的商家）
 *
 * GET /api/merchant/me 回傳的完整商家資訊
 */
export interface MerchantMe {
  id: number;                   // 商家 ID
  userId: string;               // 關聯用戶 ID
  name?: string;                // 商家名稱
  email?: string;               // 電子郵件
  ownerName?: string;           // 負責人姓名
  businessName?: string;        // 店家名稱
  taxId?: string;               // 統一編號
  businessCategory?: string;    // 商業類別
  address?: string;             // 地址
  phone?: string;               // 電話
  mobile?: string;              // 手機
  contactEmail?: string;        // 聯絡信箱
  status: MerchantStatus;       // 審核狀態
  merchantLevel: MerchantLevel; // 商家等級
  isApproved: boolean;          // 是否已審核通過
  creditBalance: number;        // 點數餘額
  subscriptionPlan?: string;    // 訂閱方案
  createdAt: string;            // 建立時間（ISO 8601）
}

// ============ 商家核銷碼 ============

/**
 * 商家每日核銷碼
 *
 * 用於店員驗證優惠券的每日碼
 */
export interface MerchantDailyCode {
  code: string;       // 驗證碼
  expiresAt: string;  // 過期時間（ISO 8601）
}

/**
 * 商家點數資訊
 */
export interface MerchantCredits {
  creditBalance: number;  // 點數餘額
  merchantId: number;     // 商家 ID
}

// ============ 商家申請 ============

/**
 * 商家申請參數
 * POST /api/merchant/apply
 */
export interface MerchantApplyParams {
  ownerName: string;        // 負責人姓名
  businessName: string;     // 店家名稱
  taxId?: string;           // 統一編號（可選）
  businessCategory: string; // 商業類別
  address: string;          // 地址
  phone?: string;           // 電話（可選）
  mobile: string;           // 手機
  email: string;            // 電子郵件
}

/**
 * 商家申請回應
 * POST /api/merchant/apply
 */
export interface MerchantApplyResponse {
  success: boolean;       // 是否成功
  merchant: MerchantMe;   // 商家資訊
  isNew: boolean;         // 是否為新申請
  message: string;        // 回應訊息
}

// ============ 數據分析 ============

/**
 * 商家分析概覽
 */
export interface MerchantAnalyticsOverview {
  totalExposures: number;    // 總曝光次數
  totalCollectors: number;   // 總收藏人數
  couponIssued: number;      // 發行優惠券數
  couponRedeemed: number;    // 核銷優惠券數
  redemptionRate: number;    // 核銷率
}

/**
 * 商家分析趨勢
 */
export interface MerchantAnalyticsTrend {
  date: string;       // 日期
  exposures: number;  // 曝光數
}

/**
 * 熱門優惠券分析
 */
export interface MerchantAnalyticsTopCoupon {
  couponId: number;       // 優惠券 ID
  title: string;          // 標題
  issued: number;         // 發行數
  redeemed: number;       // 核銷數
  redemptionRate: number; // 核銷率
}

/**
 * 地點收藏分析
 */
export interface MerchantAnalyticsPlaceBreakdown {
  placeId: number;        // 地點 ID
  placeName: string;      // 地點名稱
  collectionCount: number; // 收藏次數
}

/**
 * 分析時間範圍
 */
export type AnalyticsPeriod = '7d' | '30d' | '90d' | 'all';

/**
 * 商家分析資料
 * GET /api/merchant/analytics
 */
export interface MerchantAnalytics {
  overview: MerchantAnalyticsOverview;           // 概覽
  trend: MerchantAnalyticsTrend[];               // 趨勢
  topCoupons: MerchantAnalyticsTopCoupon[];      // 熱門優惠券
  placeBreakdown: MerchantAnalyticsPlaceBreakdown[]; // 地點分析
  period: string;                                // 時間範圍
  generatedAt: string;                           // 生成時間
}

/**
 * 商家分析資料（舊版相容）
 * @deprecated 使用 MerchantAnalytics
 */
export interface MerchantAnalyticsLegacy {
  itineraryCardCount: number;  // 行程卡片出現次數
  couponStats: {
    total: number;             // 總優惠券數
    active: number;            // 有效優惠券數
    redeemed: number;          // 已核銷數
  };
  impressions: number;         // 曝光次數
  collectionClickCount: number; // 收藏點擊次數
}

// ============ 商家優惠券管理 ============

/**
 * 商家優惠券
 */
export interface MerchantCoupon {
  id: number;                       // 優惠券 ID
  merchantId: number;               // 商家 ID
  name: string;                     // 優惠券名稱
  tier: MerchantCouponTier;         // 優惠券等級
  content: string;                  // 優惠內容
  terms: string | null;             // 使用條款
  quantity: number;                 // 發行數量
  remainingQuantity: number;        // 剩餘數量
  validFrom: string | null;         // 生效時間
  validUntil: string | null;        // 過期時間
  isActive: boolean;                // 是否啟用
  inventoryImageUrl: string | null; // 背包顯示用圖片
  backgroundImageUrl: string | null; // 卡片背景圖片
  createdAt: string;                // 建立時間
  updatedAt: string;                // 更新時間
}

/**
 * 建立商家優惠券參數
 * POST /api/merchant/coupons
 */
export interface CreateMerchantCouponParams {
  name: string;                  // 優惠券名稱
  tier: MerchantCouponTier;      // 優惠券等級
  content: string;               // 優惠內容
  terms?: string;                // 使用條款
  quantity: number;              // 發行數量
  validFrom?: string;            // 生效時間
  validUntil?: string;           // 過期時間
  isActive?: boolean;            // 是否啟用
  inventoryImageUrl?: string;    // 背包顯示用圖片
  backgroundImageUrl?: string;   // 卡片背景圖片
}

/**
 * 更新商家優惠券參數
 * PUT /api/merchant/coupons/:id
 */
export interface UpdateMerchantCouponParams {
  name?: string;                 // 優惠券名稱
  tier?: MerchantCouponTier;     // 優惠券等級
  content?: string;              // 優惠內容
  terms?: string;                // 使用條款
  quantity?: number;             // 發行數量
  validFrom?: string;            // 生效時間
  validUntil?: string;           // 過期時間
  isActive?: boolean;            // 是否啟用
  inventoryImageUrl?: string;    // 背包顯示用圖片
  backgroundImageUrl?: string;   // 卡片背景圖片
}

/**
 * 商家優惠券列表回應
 * GET /api/merchant/coupons
 */
export interface MerchantCouponsResponse {
  success: boolean;              // 是否成功
  coupons: MerchantCoupon[];     // 優惠券列表
}

// ============ 商家交易記錄 ============

/**
 * 商家交易記錄
 */
export interface MerchantTransaction {
  id: number;                                    // 交易 ID
  merchantId: number;                            // 商家 ID
  amount: number;                                // 金額
  type: 'purchase' | 'usage' | 'refund';         // 交易類型
  description?: string;                          // 描述
  createdAt: string;                             // 交易時間
}

// ============ 商家地點管理 ============

/**
 * 營業時間
 */
export interface MerchantPlaceOpeningHours {
  weekdayText?: string[];  // 文字格式的營業時間
  periods?: any[];         // 結構化營業時間
}

/**
 * 商家地點審核狀態
 */
export type MerchantPlaceStatus = 'pending' | 'approved' | 'rejected';

/**
 * 商家地點卡片等級
 */
export type MerchantPlaceCardLevel = 'free' | 'pro' | 'premium';

/**
 * 商家地點
 */
export interface MerchantPlace {
  id: number;                                 // 地點 ID
  merchantId: number;                         // 商家 ID
  officialPlaceId: number | null;             // 官方地點 ID
  placeName: string;                          // 地點名稱
  district: string;                           // 區域
  city: string;                               // 城市
  country: string;                            // 國家
  description: string | null;                 // 描述
  googleMapUrl: string | null;                // Google 地圖連結
  openingHours: MerchantPlaceOpeningHours | null; // 營業時間
  status: MerchantPlaceStatus;                // 審核狀態
  cardLevel: MerchantPlaceCardLevel;          // 卡片等級
  promoTitle: string | null;                  // 促銷標題
  promoDescription: string | null;            // 促銷描述
  inventoryImageUrl: string | null;           // 背包圖片 URL
  isPromoActive: boolean;                     // 促銷是否啟用
  createdAt: string;                          // 建立時間
  updatedAt: string;                          // 更新時間

  // ============ 擴充欄位（UI 向後兼容） ============
  /** 連結 ID（舊版欄位） */
  linkId?: string;
  /** 是否已驗證（可由 status === 'approved' 判斷） */
  isVerified?: boolean;
}

/**
 * 更新商家地點參數
 * PUT /api/merchant/places/:id
 */
export interface UpdateMerchantPlaceParams {
  description?: string;                       // 描述
  googleMapUrl?: string;                      // Google 地圖連結
  openingHours?: MerchantPlaceOpeningHours;   // 營業時間
  promoTitle?: string;                        // 促銷標題
  promoDescription?: string;                  // 促銷描述
  isPromoActive?: boolean;                    // 是否啟用促銷
}

/**
 * 商家地點（舊版相容）
 * @deprecated 使用 MerchantPlace
 */
export interface MerchantPlaceLegacy {
  id: number;          // 地點 ID
  linkId: string;      // 連結 ID
  merchantId: number;  // 商家 ID
  placeName: string;   // 地點名稱
  district?: string;   // 區域
  city?: string;       // 城市
  isVerified: boolean; // 是否已驗證
  createdAt: string;   // 建立時間
}

// ============ 商家產品 ============

/**
 * 商家產品
 */
export interface MerchantProduct {
  id: number;              // 產品 ID
  merchantId: number;      // 商家 ID
  placeId?: number;        // 關聯地點 ID
  name: string;            // 產品名稱
  description?: string;    // 描述
  price?: number;          // 原價
  discountPrice?: number;  // 折扣價
  isActive: boolean;       // 是否啟用
  createdAt: string;       // 建立時間
}

// ============ 地點搜尋 ============

/**
 * 地點搜尋結果
 *
 * 商家認領地點時的搜尋結果
 */
export interface PlaceSearchResult {
  id: number;          // 地點 ID
  placeId: string;     // 地點識別碼
  placeName: string;   // 地點名稱
  district?: string;   // 區域
  city?: string;       // 城市
  isClaimed: boolean;  // 是否已被認領
}

// ============ 核銷碼 ============

/**
 * 商家核銷碼
 *
 * 用於優惠券核銷的驗證碼
 */
export interface MerchantRedemptionCode {
  code: string;       // 核銷碼
  expiresAt: string;  // 過期時間（ISO 8601）
}

// ============ 區域獎池 ============

/**
 * 區域獎池優惠券
 *
 * 顯示在特定區域可獲得的優惠券
 */
export interface RegionPoolCoupon {
  id: number;                  // 優惠券 ID
  title: string;               // 標題
  description: string | null;  // 描述
  rarity: CouponRarity;        // 稀有度
  merchantName: string;        // 商家名稱
  discount: string | null;     // 折扣內容
  merchantId: number;          // 商家 ID
}
