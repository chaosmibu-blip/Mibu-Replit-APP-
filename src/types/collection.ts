/**
 * 收藏相關類型
 * 依據後端合約 APP.md 定義
 */
import { Pagination } from './common';

export interface CollectionItem {
  id: number;
  userId: string;
  placeName: string;
  category: string;
  subcategory?: string;
  district: string;
  city: string;
  country: string;
  description?: string;
  /** 是否有商家促銷 */
  hasPromo: boolean;
  promoTitle?: string;
  promoDescription?: string;
  promoImageUrl?: string;
  /** 是否已讀 */
  isRead: boolean;
  /** 收藏時間 */
  collectedAt: string;
  createdAt: string;
}

export interface CollectionResponse {
  success: boolean;
  items: CollectionItem[];
  total: number;
  pagination?: Pagination;
}

export interface CollectionStats {
  total: number;
  byCity: Record<string, number>;
  byCategory: Record<string, number>;
  unreadCount: number;
}

// ========== 我的最愛系統 ==========

export interface FavoriteItem {
  id: number;
  placeId: string;
  placeName: string;
  category: string;
  subcategory?: string;
  district: string;
  city: string;
  country: string;
  imageUrl?: string;
  rating?: number;
  addedAt: string; // ISO 8601
}

export interface FavoritesResponse {
  success: boolean;
  favorites: FavoriteItem[];
  total: number;
  pagination?: {
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export interface FavoriteStatusResponse {
  isFavorite: boolean;
  favoriteId?: number;
}

export interface AddFavoriteResponse {
  success: boolean;
  favorite: FavoriteItem;
  message: string;
}

export interface RemoveFavoriteResponse {
  success: boolean;
  message: string;
}
