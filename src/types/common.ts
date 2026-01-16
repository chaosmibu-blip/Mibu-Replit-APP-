/**
 * 通用基礎類型
 * 依據後端合約 COMMON.md 定義
 */

export enum Category {
  Food = 'Food',
  Stay = 'Stay',
  Education = 'Education',
  Entertainment = 'Entertainment',
  Scenery = 'Scenery',
  Shopping = 'Shopping',
}

export const MIBU_CATEGORIES = ['美食', '住宿', '景點', '購物', '娛樂設施', '生態文化教育', '遊程體驗'] as const;
export type MibuCategory = typeof MIBU_CATEGORIES[number];

export type Language = 'zh-TW' | 'en' | 'ja' | 'ko';
export type LocalizedContent = string | { [key in Language]?: string };

export type PlanTier = 'free' | 'partner' | 'premium';
export type UserRole = 'traveler' | 'merchant' | 'specialist' | 'admin';
export type AuthProvider = 'google' | 'apple' | 'email' | 'replit' | 'guest';

export type CouponTier = 'SP' | 'SSR' | 'SR' | 'S' | 'R';
export type CouponRarity = 'SP' | 'SSR';
export type PlaceRarity = 'N' | 'R' | 'SR' | 'SSR' | 'SP';
export type PlaceTier = 'free' | 'pro' | 'premium';

/**
 * 分頁參數
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * 分頁回應
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * 標準 API 成功回應
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data?: T;
  message?: string;
  pagination?: Pagination;
}

/**
 * 標準 API 失敗回應
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  code: string;
  details?: Record<string, unknown>;
}

/**
 * 通用 API 回應
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Rate Limiting 配置
 */
export const RATE_LIMITS = {
  general: 100,    // 100 req/min
  gacha: 10,       // 10 req/min
  auth: 5,         // 5 req/min
} as const;

/**
 * 每日扭蛋上限
 */
export const DAILY_GACHA_LIMIT = 36;
