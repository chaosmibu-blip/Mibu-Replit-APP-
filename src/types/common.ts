/**
 * @fileoverview 通用基礎型別定義
 *
 * 定義整個應用程式共用的基礎型別，包含：
 * - 分類常數
 * - 語言與本地化
 * - 用戶角色
 * - 稀有度等級
 * - 分頁
 * - API 回應格式
 *
 * 依據後端合約 COMMON.md 定義
 * #034: 優先使用 @shared 的定義，此處 re-export 保持向後兼容
 *
 * @module types/common
 */

// ============ 從 @shared 統一匯入 ============

export {
  SEVEN_CATEGORIES,                        // 七大分類常數
  SEVEN_CATEGORIES as MIBU_CATEGORIES,     // 向後兼容別名
  GACHA_CONFIG,                            // 扭蛋配置
  PAGINATION_DEFAULTS,                     // 分頁預設值
  COUPON_RARITIES,                         // 優惠券稀有度
  ACHIEVEMENT_CATEGORIES,                  // 成就分類
  USER_ROLES,                              // 用戶角色
  ORDER_STATUSES,                          // 訂單狀態
  SOS_STATUSES,                            // SOS 狀態
  type MibuCategory,                       // Mibu 分類型別
  type CouponRarity as SharedCouponRarity, // 優惠券稀有度型別
  // AchievementCategory 由 economy.ts 定義，避免重複匯出
  type UserRole as SharedUserRole,         // 用戶角色型別
  type OrderStatus,                        // 訂單狀態型別
  type SosStatus,                          // SOS 狀態型別
} from '@shared';

// ============ 本地型別（向後兼容，未來考慮移除）============

/**
 * 分類列舉
 * @deprecated 使用 MibuCategory from @shared
 */
export enum Category {
  Food = 'Food',                   // 美食
  Stay = 'Stay',                   // 住宿
  Education = 'Education',         // 教育
  Entertainment = 'Entertainment', // 娛樂
  Scenery = 'Scenery',             // 景點
  Shopping = 'Shopping',           // 購物
}

// ============ 語言與本地化 ============

/**
 * 支援的語言
 */
export type Language = 'zh-TW' | 'en' | 'ja' | 'ko';

/**
 * 多語言內容
 *
 * 可以是單一字串或多語言物件
 */
export type LocalizedContent = string | { [key in Language]?: string };

// ============ 用戶與權限 ============

/**
 * 訂閱方案等級
 */
export type PlanTier = 'free' | 'partner' | 'premium';

/**
 * 用戶角色
 */
export type UserRole = 'traveler' | 'merchant' | 'specialist' | 'admin';

/**
 * OAuth 提供者
 */
export type AuthProvider = 'google' | 'apple' | 'email' | 'replit' | 'guest';

// ============ 稀有度等級 ============

/**
 * 優惠券等級
 * - SP: 特別版（最稀有）
 * - SSR: 超超稀有
 * - SR: 超稀有
 * - S: 稀有
 * - R: 普通
 */
export type CouponTier = 'SP' | 'SSR' | 'SR' | 'S' | 'R';

/**
 * 優惠券稀有度（僅限高稀有度）
 */
export type CouponRarity = 'SP' | 'SSR';

/**
 * 地點稀有度
 */
export type PlaceRarity = 'N' | 'R' | 'SR' | 'SSR' | 'SP';

/**
 * 地點等級
 */
export type PlaceTier = 'free' | 'pro' | 'premium';

// ============ 分頁 ============

/**
 * 分頁參數
 *
 * 用於 API 請求的分頁參數
 */
export interface PaginationParams {
  page?: number;   // 頁碼（從 1 開始）
  limit?: number;  // 每頁數量
}

/**
 * 分頁資訊
 *
 * API 回應中的分頁資訊
 */
export interface Pagination {
  page: number;        // 當前頁碼
  limit: number;       // 每頁數量
  total: number;       // 總數量
  totalPages: number;  // 總頁數
}

// ============ API 回應格式 ============

/**
 * 標準 API 成功回應
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;             // 固定為 true
  data?: T;                  // 回應資料
  message?: string;          // 回應訊息
  pagination?: Pagination;   // 分頁資訊
}

/**
 * 標準 API 失敗回應
 */
export interface ApiErrorResponse {
  success: false;                       // 固定為 false
  error: string;                        // 錯誤訊息
  code: string;                         // 錯誤碼
  details?: Record<string, unknown>;    // 錯誤詳情
}

/**
 * 通用 API 回應
 *
 * 成功或失敗的聯合型別
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// ============ 限制與配置 ============

/**
 * Rate Limiting 配置
 *
 * 各類 API 的請求頻率限制（每分鐘）
 */
export const RATE_LIMITS = {
  general: 100,  // 一般 API：100 次/分鐘
  gacha: 10,     // 扭蛋 API：10 次/分鐘
  auth: 5,       // 認證 API：5 次/分鐘
} as const;

/**
 * 每日扭蛋上限
 */
export const DAILY_GACHA_LIMIT = 36;
