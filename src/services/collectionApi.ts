/**
 * 收藏/圖鑑 API 服務
 *
 * 處理用戶的景點收藏、我的最愛、優惠更新通知等功能
 * 依據後端合約 APP.md 定義
 *
 * @module services/collectionApi
 * @see 後端契約: contracts/APP.md
 *
 * ============ 串接端點 ============
 * - GET    /api/collections                  - 取得收藏列表
 * - POST   /api/collections/add              - 新增收藏 (#011)
 * - DELETE /api/collections/:id              - 刪除收藏
 * - GET    /api/collections/unread-count     - 取得未讀數量
 * - POST   /api/collections/read-all         - 標記全部已讀（清除所有未讀紅點）
 * - GET    /api/collections/place/promo      - 取得景點優惠
 * - GET    /api/collections/stats            - 取得收藏統計
 * - GET    /api/collections/favorites        - 取得我的最愛列表
 * - POST   /api/collections/:placeId/favorite - 加入我的最愛
 * - DELETE /api/collections/:placeId/favorite - 移除我的最愛
 * - GET    /api/collections/:placeId/favorite/status - 檢查最愛狀態
 * - GET    /api/collections/promo-updates    - 取得優惠更新通知 (#028)
 * - PATCH  /api/collections/:id/promo-read   - 標記優惠已讀 (#028)
 */
import { ApiBase } from './base';
import {
  GachaItem,
  CollectionItem,
  CollectionResponse,
  PaginationParams,
  FavoritesResponse,
  FavoriteItem,
  FavoriteStatusResponse,
  AddFavoriteResponse,
  RemoveFavoriteResponse,
  PromoUpdatesResponse,
  MarkPromoReadResponse,
} from '../types';

// ============ 類型定義 ============

/**
 * 景點優惠回應
 */
export interface PlacePromoResponse {
  /** 優惠資訊，若無優惠則為 null */
  promo: {
    title?: string;
    description?: string;
    imageUrl?: string;
  } | null;
}

/**
 * 收藏統計回應
 */
export interface CollectionStatsResponse {
  /** 總收藏數 */
  total: number;
  /** 依城市分類的數量 */
  byCity: Record<string, number>;
  /** 依類別分類的數量 */
  byCategory: Record<string, number>;
}

// ============ API 服務類別 ============

/**
 * 收藏 API 服務類別
 *
 * 管理用戶的景點圖鑑和收藏
 */
class CollectionApiService extends ApiBase {

  /**
   * 獲取用戶收藏列表
   *
   * @param token - JWT Token
   * @param params - 查詢參數
   * @param params.page - 頁碼
   * @param params.limit - 每頁數量
   * @param params.city - 城市篩選
   * @param params.sort - 排序方式（unread 優先未讀、newest 最新、oldest 最舊）
   * @returns 收藏列表
   */
  async getCollections(token: string, params?: PaginationParams & { city?: string; sort?: 'unread' | 'newest' | 'oldest' }): Promise<CollectionResponse> {
    // 組裝查詢參數
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.city) queryParams.append('city', params.city);
    if (params?.sort) queryParams.append('sort', params.sort);

    const query = queryParams.toString();
    const url = `/api/collections${query ? `?${query}` : ''}`;

    return this.request<CollectionResponse>(url, {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 標記單一收藏項目為已讀
   *
   * @param token - JWT Token
   * @param collectionId - 收藏項目 ID
   * @returns 操作結果
   */
  async markCollectionItemRead(token: string, collectionId: number): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/collections/${collectionId}/read`, {
      method: 'PATCH',
      headers: this.authHeaders(token),
    });
  }

  /**
   * 新增收藏項目
   *
   * 將扭蛋抽到的景點加入圖鑑
   * #011 端點對齊
   *
   * @param token - JWT Token
   * @param item - 景點資料
   * @returns 新增的收藏項目
   */
  async saveToCollection(token: string, item: Partial<GachaItem>): Promise<{ collection: CollectionItem }> {
    return this.request<{ collection: CollectionItem }>('/api/collections/add', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify(item),
    });
  }

  /**
   * 刪除收藏項目
   *
   * @param token - JWT Token
   * @param collectionId - 收藏項目 ID
   * @returns 刪除結果
   */
  async deleteCollection(token: string, collectionId: number): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/collections/${collectionId}`, {
      method: 'DELETE',
      headers: this.authHeaders(token),
    });
  }

  /**
   * 獲取未讀數量
   *
   * 用於顯示圖鑑 Tab 的紅點
   *
   * @param token - JWT Token
   * @returns 未讀數量
   */
  async getUnreadCount(token: string): Promise<{ count: number }> {
    return this.request<{ count: number }>('/api/collections/unread-count', {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 標記全部已讀
   *
   * 後端會將所有 is_read = false 的圖鑑更新為已讀，並清除通知徽章
   *
   * @param token - JWT Token
   * @returns 操作結果（含被標記的數量）
   */
  async markCollectionRead(token: string): Promise<{ success: boolean; markedCount: number }> {
    return this.request<{ success: boolean; markedCount: number }>('/api/collections/read-all', {
      method: 'POST',
      headers: this.authHeaders(token),
    });
  }

  /**
   * 獲取地點促銷資訊
   *
   * 查詢景點是否有優惠活動
   *
   * @param params - 景點查詢參數
   * @returns 優惠資訊
   */
  async getPlacePromo(params: {
    placeId?: string;
    placeName?: string;
    district?: string;
    city?: string;
  }): Promise<PlacePromoResponse> {
    const queryParams = new URLSearchParams();
    if (params.placeId) queryParams.append('placeId', params.placeId);
    if (params.placeName) queryParams.append('placeName', params.placeName);
    if (params.district) queryParams.append('district', params.district);
    if (params.city) queryParams.append('city', params.city);

    return this.request<PlacePromoResponse>(`/api/collections/place/promo?${queryParams}`);
  }

  /**
   * 獲取收藏統計
   *
   * 取得用戶圖鑑的統計資料
   *
   * @param token - JWT Token
   * @returns 統計資料（依城市、類別分組）
   */
  async getCollectionStats(token: string): Promise<CollectionStatsResponse> {
    return this.request<CollectionStatsResponse>('/api/collections/stats', {
      headers: this.authHeaders(token),
    });
  }

  // ============ 我的最愛 ============

  /**
   * 取得我的最愛列表
   *
   * #030: 後端回傳 { favorites, total }，沒有 success 欄位
   *
   * @param token - JWT Token
   * @param params - 分頁參數
   * @returns 最愛列表
   */
  async getFavorites(
    token: string,
    params?: { page?: number; limit?: number }
  ): Promise<FavoritesResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const queryString = query.toString();
    const endpoint = `/api/collections/favorites${queryString ? `?${queryString}` : ''}`;

    try {
      const data = await this.request<{ favorites: FavoriteItem[]; total: number }>(endpoint, {
        headers: this.authHeaders(token),
      });
      // 後端沒有 success 欄位，HTTP 200 就是成功
      return { success: true, favorites: data.favorites || [], total: data.total || 0 };
    } catch (error) {
      console.error('[CollectionApi] getFavorites error:', error);
      return { success: false, favorites: [], total: 0 };
    }
  }

  /**
   * 加入我的最愛
   *
   * @param token - JWT Token
   * @param placeId - 景點 ID
   * @returns 加入結果
   */
  async addFavorite(token: string, placeId: string): Promise<AddFavoriteResponse> {
    return this.request<AddFavoriteResponse>(`/api/collections/${placeId}/favorite`, {
      method: 'POST',
      headers: this.authHeaders(token),
    });
  }

  /**
   * 移除我的最愛
   *
   * @param token - JWT Token
   * @param placeId - 景點 ID
   * @returns 移除結果
   */
  async removeFavorite(token: string, placeId: string): Promise<RemoveFavoriteResponse> {
    return this.request<RemoveFavoriteResponse>(`/api/collections/${placeId}/favorite`, {
      method: 'DELETE',
      headers: this.authHeaders(token),
    });
  }

  /**
   * 檢查是否為我的最愛
   *
   * @param token - JWT Token
   * @param placeId - 景點 ID
   * @returns 最愛狀態
   */
  async getFavoriteStatus(token: string, placeId: string): Promise<FavoriteStatusResponse> {
    return this.request<FavoriteStatusResponse>(`/api/collections/${placeId}/favorite/status`, {
      headers: this.authHeaders(token),
    });
  }

  // ============ #028 圖鑑優惠更新通知 ============

  /**
   * 取得優惠更新通知
   *
   * 當商家更新優惠時，持有該景點卡片的用戶會收到紅點提醒
   * #030: 後端回傳 { unreadCount, unreadCollectionIds }，沒有 success 欄位
   *
   * @param token - JWT Token
   * @returns 未讀優惠更新的數量和項目 ID
   */
  async getPromoUpdates(token: string): Promise<PromoUpdatesResponse> {
    try {
      const data = await this.request<{ unreadCount: number; unreadCollectionIds: number[] }>(
        '/api/collections/promo-updates',
        { headers: this.authHeaders(token) }
      );
      // 後端沒有 success 欄位，HTTP 200 就是成功
      return {
        success: true,
        unreadCount: data.unreadCount || 0,
        unreadCollectionIds: data.unreadCollectionIds || [],
      };
    } catch {
      // 靜默處理：後端可能尚未實現此端點
      return { success: false, unreadCount: 0, unreadCollectionIds: [] };
    }
  }

  /**
   * 標記優惠已讀
   *
   * 用戶查看卡片詳情時呼叫，清除紅點
   *
   * @param token - JWT Token
   * @param collectionId - 收藏項目 ID
   * @returns 操作結果
   */
  async markPromoRead(token: string, collectionId: number): Promise<MarkPromoReadResponse> {
    try {
      return await this.request<MarkPromoReadResponse>(`/api/collections/${collectionId}/promo-read`, {
        method: 'PATCH',
        headers: this.authHeaders(token),
      });
    } catch (error) {
      console.error('[CollectionApi] markPromoRead error:', error);
      return { success: false };
    }
  }
}

// ============ 匯出 ============

/** 收藏 API 服務實例 */
export const collectionApi = new CollectionApiService();
