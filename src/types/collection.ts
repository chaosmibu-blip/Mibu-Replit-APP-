/**
 * @fileoverview 收藏/圖鑑型別定義
 *
 * 定義圖鑑收藏系統相關的資料結構，包含：
 * - 收藏項目
 * - 我的最愛
 * - 優惠更新通知
 *
 * 依據後端合約 APP.md 定義
 *
 * @module types/collection
 */

import { Pagination } from './common';

// ============ 收藏項目 ============

/**
 * 圖鑑收藏項目
 *
 * 用戶收藏的景點，扭蛋獲得後自動加入圖鑑
 */
export interface CollectionItem {
  id: number;                    // 收藏 ID
  userId: string;                // 用戶 ID
  placeId?: string;              // 地點 ID
  placeName: string;             // 地點名稱
  category: string;              // 分類
  subcategory?: string;          // 子分類
  district: string;              // 區域代碼
  districtDisplay?: string;      // 區域顯示名稱
  city: string;                  // 城市代碼
  cityDisplay?: string;          // 城市顯示名稱
  country: string;               // 國家
  description?: string;          // 描述
  hasPromo: boolean;             // 是否有商家促銷
  promoTitle?: string;           // 促銷標題
  promoDescription?: string;     // 促銷描述
  promoImageUrl?: string;        // 促銷圖片 URL
  isRead: boolean;               // 是否已讀
  collectedAt: string;           // 收藏時間（ISO 8601）
  createdAt: string;             // 建立時間（ISO 8601）
  merchant?: {                   // 商家資訊
    id: string;                  // 商家 ID
    name: string;                // 商家名稱
    isPro?: boolean;             // 是否為專業版
    brandColor?: string;         // 品牌顏色
  };
  isCoupon?: boolean;            // 是否有優惠券
  couponData?: {                 // 優惠券資料
    title: string;               // 優惠券標題
    discount: string;            // 折扣內容
    expiresAt?: string;          // 過期時間
  };
}

/**
 * 圖鑑列表回應
 * GET /api/collections
 */
export interface CollectionResponse {
  collections: CollectionItem[]; // 收藏列表（後端欄位名為 collections）
}

/**
 * 圖鑑統計資料
 */
export interface CollectionStats {
  total: number;                      // 總收藏數
  byCity: Record<string, number>;     // 按城市統計
  byCategory: Record<string, number>; // 按分類統計
  unreadCount: number;                // 未讀數量
}

// ============ 我的最愛系統 ============

/**
 * 我的最愛項目
 *
 * 用戶手動標記的最愛景點
 */
export interface FavoriteItem {
  id: number;              // 最愛 ID
  placeId: string;         // 地點 ID
  placeName: string;       // 地點名稱
  category: string;        // 分類
  subcategory?: string;    // 子分類
  district: string;        // 區域
  city: string;            // 城市
  country: string;         // 國家
  imageUrl?: string;       // 圖片 URL
  rating?: number;         // 評分
  addedAt: string;         // 加入時間（ISO 8601）
}

/**
 * 我的最愛列表回應
 * GET /api/favorites
 */
export interface FavoritesResponse {
  success: boolean;              // 是否成功
  favorites: FavoriteItem[];     // 最愛列表
  total: number;                 // 總數量
  pagination?: {                 // 分頁資訊
    page: number;                // 當前頁碼
    limit: number;               // 每頁數量
    hasMore: boolean;            // 是否有更多
  };
}

/**
 * 我的最愛狀態回應
 * GET /api/favorites/:placeId/status
 */
export interface FavoriteStatusResponse {
  isFavorite: boolean;     // 是否已加入最愛
  favoriteId?: number;     // 最愛 ID（如果已加入）
}

/**
 * 加入最愛回應
 * POST /api/favorites
 */
export interface AddFavoriteResponse {
  success: boolean;          // 是否成功
  favorite: FavoriteItem;    // 新增的最愛項目
  message: string;           // 回應訊息
}

/**
 * 移除最愛回應
 * DELETE /api/favorites/:id
 */
export interface RemoveFavoriteResponse {
  success: boolean;    // 是否成功
  message: string;     // 回應訊息
}

// ============ #028 圖鑑優惠更新通知 ============

/**
 * 優惠更新通知回應
 * GET /api/collections/promo-updates
 *
 * 用於檢查是否有新的商家優惠更新
 */
export interface PromoUpdatesResponse {
  success: boolean;                // 是否成功
  unreadCount: number;             // 未讀優惠數量
  unreadCollectionIds: number[];   // 有未讀優惠的收藏 ID
}

/**
 * 標記優惠已讀回應
 * PATCH /api/collections/:id/promo-read
 */
export interface MarkPromoReadResponse {
  success: boolean;  // 是否成功
}
