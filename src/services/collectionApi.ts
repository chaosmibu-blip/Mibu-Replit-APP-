/**
 * 收藏相關 API
 * 依據後端合約 APP.md 定義
 */
import { ApiBase } from './base';
import {
  GachaItem,
  CollectionItem,
  CollectionResponse,
  PaginationParams,
} from '../types';

export interface PlacePromoResponse {
  promo: {
    title?: string;
    description?: string;
    imageUrl?: string;
  } | null;
}

export interface CollectionStatsResponse {
  total: number;
  byCity: Record<string, number>;
  byCategory: Record<string, number>;
}

class CollectionApiService extends ApiBase {
  /**
   * 獲取用戶收藏列表
   * GET /api/collections
   */
  async getCollections(token: string, params?: PaginationParams & { city?: string }): Promise<CollectionResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.city) queryParams.append('city', params.city);

    const query = queryParams.toString();
    const url = `/api/collections${query ? `?${query}` : ''}`;

    return this.request<CollectionResponse>(url, {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 新增收藏項目
   * POST /api/collections
   */
  async saveToCollection(token: string, item: Partial<GachaItem>): Promise<{ collection: CollectionItem }> {
    return this.request<{ collection: CollectionItem }>('/api/collections', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify(item),
    });
  }

  /**
   * 刪除收藏項目
   * DELETE /api/collections/:id
   */
  async deleteCollection(token: string, collectionId: number): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/collections/${collectionId}`, {
      method: 'DELETE',
      headers: this.authHeaders(token),
    });
  }

  /**
   * 獲取未讀數量
   * GET /api/collections/unread-count
   */
  async getUnreadCount(token: string): Promise<{ count: number }> {
    return this.request<{ count: number }>('/api/collections/unread-count', {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 標記為已讀
   * POST /api/collections/mark-read
   */
  async markCollectionRead(token: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/api/collections/mark-read', {
      method: 'POST',
      headers: this.authHeaders(token),
    });
  }

  /**
   * 獲取地點促銷資訊
   * GET /api/collections/place/promo
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
   * GET /api/collections/stats
   */
  async getCollectionStats(token: string): Promise<CollectionStatsResponse> {
    return this.request<CollectionStatsResponse>('/api/collections/stats', {
      headers: this.authHeaders(token),
    });
  }
}

export const collectionApi = new CollectionApiService();
