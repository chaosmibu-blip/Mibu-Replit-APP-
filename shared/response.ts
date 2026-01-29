/**
 * MIBU API 回應格式定義
 *
 * 此檔案明確定義 API 回應的格式規範
 * 解決前端不知道該不該檢查 success 的問題
 */

import { ErrorCode } from './errors';

// ============ 回應格式規則 ============
/**
 * MIBU API 回應格式分為兩種：
 *
 * 1. 【資料型回應】- 直接回傳資料，沒有 success 欄位
 *    - GET 請求（查詢資料）
 *    - 例：{ itineraries: [...] }、{ collections: [...] }
 *
 * 2. 【操作型回應】- 有 success 欄位
 *    - POST/PUT/DELETE（修改資料）
 *    - 例：{ success: true, message: "..." }
 *
 * 前端判斷方式：
 * - 如果是查詢資料 → 直接使用回傳的資料
 * - 如果是修改操作 → 可以檢查 success
 */

// ============ 標準錯誤回應 ============
export interface ApiErrorResponse {
  errorCode: ErrorCode;
  message: string;
  details?: unknown;
}

// ============ 分頁回應 ============
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationInfo;
}

// ============ 操作型回應 ============
export interface SuccessResponse {
  success: true;
  message?: string;
}

export interface SuccessResponseWithData<T> {
  success: true;
  data: T;
  message?: string;
}

// ============ API 回應格式對照表 ============
/**
 * 此對照表明確列出每個 API 的回應格式
 * 前端應該根據此表決定如何處理回應
 */
export const API_RESPONSE_FORMAT = {
  // ====== 直接回傳資料（不要檢查 success）======
  'GET /api/itinerary': 'data',                      // { itineraries: [...] }
  'GET /api/itinerary/:id': 'data',                  // { id, title, places: [...] }
  'GET /api/itinerary/:id/available-places': 'data', // { categories: [...] }
  'GET /api/collections': 'data',                    // { collections: [...], pagination }
  'GET /api/collections/stats': 'data',              // { totalCollected, byCity, ... }
  'GET /api/collections/favorites': 'data',          // { favorites: [...], count }
  'GET /api/profile': 'data',                        // { id, email, firstName, ... }
  'GET /api/user/level': 'data',                     // { level: {...}, recentExp: [...] }
  'GET /api/user/achievements': 'data',              // { achievements: [...], summary }
  'GET /api/user/daily-tasks': 'data',               // { tasks: [...], summary }
  'GET /api/gacha/quota': 'data',                    // { dailyLimit, usedToday, remaining }
  'GET /api/notifications': 'data',                  // { notifications: [...], unreadCount }
  'GET /api/inventory': 'data',                      // { items: [...], pagination }
  'POST /api/itinerary': 'data',                     // { id, title, date, ... }（建立後回傳資料）
  'POST /api/itinerary/:id/ai-chat': 'data',         // { message, response, suggestions }

  // ====== 有 success 欄位 ======
  'POST /api/v2/gacha/pull': 'success',              // { success, cards, meta }
  'POST /api/itinerary/:id/places': 'success',       // { added: [...], count }
  'DELETE /api/itinerary/:id': 'success',            // { success }
  'DELETE /api/itinerary/:id/places/:itemId': 'success', // { success, removedItemId }
  'PUT /api/itinerary/:id/places/reorder': 'success', // { success }
  'DELETE /api/collections/:id': 'success',          // { success, message }
  'POST /api/collections/:placeId/favorite': 'success', // { success, favorite }
  'DELETE /api/collections/:placeId/favorite': 'success', // { success, message }
  'POST /api/coupons/redeem': 'success',             // { success, redemption }
  'POST /api/user/daily-tasks/:id/complete': 'success', // { success, expGained }
} as const;

// ============ 型別輔助函數 ============
/**
 * 判斷 API 回應是否為錯誤
 */
export function isApiError(response: unknown): response is ApiErrorResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'errorCode' in response
  );
}

/**
 * 判斷 API 回應是否為成功操作
 */
export function isSuccessResponse(response: unknown): response is SuccessResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    (response as SuccessResponse).success === true
  );
}
