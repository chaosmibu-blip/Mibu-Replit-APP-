/**
 * 扭蛋相關 API - 抽獎、行程生成、獎池
 */
import { ApiBase, API_BASE } from './base';
import {
  GachaItem,
  GachaPoolResponse,
  GachaPullPayload,
  GachaPullResponse,
  ItineraryGenerateResponse,
  PrizePoolResponse
} from '../types';

class GachaApiService extends ApiBase {
  async generateItinerary(params: {
    regionId?: number;
    countryId?: number;
    itemCount?: number;
    pace?: 'relaxed' | 'moderate' | 'packed';
    language?: string;
  }, token?: string): Promise<ItineraryGenerateResponse> {
    const url = `${this.baseUrl}/api/gacha/itinerary/v3`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(params),
    });

    const data = await response.json();
    return data;
  }

  async getGachaPool(city: string): Promise<GachaPoolResponse> {
    try {
      const params = new URLSearchParams({ city });
      const data = await this.request<GachaPoolResponse>(`/api/gacha/pool?${params}`);
      return data;
    } catch (error) {
      console.error('Failed to get gacha pool:', error);
      throw error;
    }
  }

  async pullGacha(payload: GachaPullPayload): Promise<GachaPullResponse> {
    try {
      const data = await this.request<GachaPullResponse>('/api/gacha/pull', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return data;
    } catch (error) {
      console.error('Failed to pull gacha:', error);
      throw error;
    }
  }

  async getPrizePool(regionId: number): Promise<PrizePoolResponse> {
    return this.request<PrizePoolResponse>(`/api/gacha/prize-pool?regionId=${regionId}`);
  }

  async excludePlace(params: {
    placeName: string;
    district: string;
    city: string;
    placeCacheId?: string | null;
  }): Promise<void> {
    await this.request('/api/feedback/exclude', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getPlacePromo(params: {
    placeId?: string;
    placeName?: string;
    district?: string;
    city?: string;
  }): Promise<{ promo: { title?: string; description?: string; discount?: string; validUntil?: string } | null }> {
    const queryParams = new URLSearchParams();
    if (params.placeId) queryParams.append('placeId', params.placeId);
    if (params.placeName) queryParams.append('placeName', params.placeName);
    if (params.district) queryParams.append('district', params.district);
    if (params.city) queryParams.append('city', params.city);

    return this.request(`/api/place/promo?${queryParams}`);
  }
}

export const gachaApi = new GachaApiService();
