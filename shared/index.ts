/**
 * @mibu/shared - MIBU 前後端共用模組
 *
 * 此模組包含前後端共用的型別、常數、錯誤碼定義
 * APP 和官網應該使用此模組，確保與後端一致
 *
 * 安裝方式（未來發布 npm 後）：
 * ```bash
 * npm install @mibu/shared
 * ```
 *
 * 目前使用方式（手動複製）：
 * 將 shared/ 資料夾複製到前端專案
 *
 * 使用範例：
 * ```typescript
 * import {
 *   // 錯誤碼
 *   ErrorCode,
 *   createErrorResponse,
 *   isAuthError,
 *
 *   // 常數
 *   SEVEN_CATEGORIES,
 *   GACHA_CONFIG,
 *
 *   // API 型別
 *   V2GachaPullRequest,
 *   V2GachaPullResponse,
 *   ItineraryDetailResponse,
 *
 *   // 回應格式
 *   API_RESPONSE_FORMAT,
 *   isApiError,
 *
 *   // ID 規範
 *   CollectionId,
 *   ItineraryItemId,
 * } from '@mibu/shared';
 * ```
 */

// ============ 錯誤碼 ============
export {
  ErrorCode,
  ErrorMessages,
  createErrorResponse,
  getErrorMessage,
  isAuthError,
  isServerError,
  type ApiErrorResponse,
  type ApiSuccessResponse,
} from './errors';

// ============ 常數 ============
export {
  // 七大分類
  SEVEN_CATEGORIES,
  type MibuCategory,

  // 優惠券稀有度
  COUPON_RARITIES,
  type CouponRarity,

  // 扭蛋配置
  GACHA_CONFIG,

  // 分頁預設值
  PAGINATION_DEFAULTS,

  // 成就類別
  ACHIEVEMENT_CATEGORIES,
  type AchievementCategory,

  // 用戶角色
  USER_ROLES,
  type UserRole,

  // 訂單狀態
  ORDER_STATUSES,
  type OrderStatus,

  // SOS 狀態
  SOS_STATUSES,
  type SosStatus,
} from './constants';

// ============ 回應格式 ============
export {
  API_RESPONSE_FORMAT,
  isApiError,
  isSuccessResponse,
  type PaginationInfo,
  type PaginatedResponse,
  type SuccessResponse,
  type SuccessResponseWithData,
} from './response';

// ============ ID 規範 ============
export {
  ID_USAGE_MAP,
  COMMON_ID_MISTAKES,
  type OfficialPlaceId,
  type CollectionId,
  type ItineraryItemId,
  type ItineraryId,
  type ItineraryPlaceItem,
} from './id-conventions';

// ============ API 型別 ============
export type {
  // 扭蛋系統
  V2GachaPullRequest,
  V2GachaPullResponse,
  V2GachaCard,
  GachaQuotaResponse,

  // 圖鑑系統
  CollectionsResponse,
  Collection,
  CollectionStatsResponse,
  FavoritesResponse,
  PromoUpdatesResponse,

  // 行程系統
  CreateItineraryRequest,
  CreateItineraryResponse,
  ItineraryListResponse,
  ItineraryDetailResponse,
  ItineraryPlaceDetail,
  AvailablePlacesResponse,
  AddPlacesRequest,
  AddPlacesResponse,
  RemovePlaceResponse,
  ReorderPlacesRequest,
  ReorderPlacesResponse,

  // AI 對話
  AIChatRequest,
  AIChatResponse,
  AISuggestedPlace,
  AIAddPlacesRequest,

  // 用戶系統
  ProfileResponse,
  UserLevelResponse,
  AchievementsResponse,
  DailyTasksResponse,

  // 通知系統
  NotificationsResponse,
} from './api-types';
