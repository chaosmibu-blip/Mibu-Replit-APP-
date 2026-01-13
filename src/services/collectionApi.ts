/**
 * 收藏相關 API
 */
import { ApiBase } from './base';
import {
  GachaItem,
  CollectionWithPromoResponse,
  AutoSaveCollectionResponse
} from '../types';

class CollectionApiService extends ApiBase {
  async saveToCollection(item: Partial<GachaItem>): Promise<void> {
    await this.request('/api/collections', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async getCollectionWithPromo(token: string): Promise<CollectionWithPromoResponse> {
    return this.request<CollectionWithPromoResponse>('/api/collection/with-promo', {
      headers: this.authHeaders(token),
    });
  }

  async autoSaveToCollection(token: string, params: {
    placeName: string;
    country: string;
    city: string;
    district: string;
    category: string;
    description?: string;
  }): Promise<AutoSaveCollectionResponse> {
    return this.request<AutoSaveCollectionResponse>('/api/collection/auto-save', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify(params),
    });
  }

  async getUnreadCount(token: string): Promise<{ count: number }> {
    return this.request<{ count: number }>('/api/collection/unread-count', {
      headers: this.authHeaders(token),
    });
  }
}

export const collectionApi = new CollectionApiService();
