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
  PrizePoolResponse,
  GachaQuotaResponse,
  SubmitTripResponse,
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

    console.log('🎰 [Gacha] Calling API:', url);
    console.log('🎰 [Gacha] Params:', JSON.stringify(params));

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(params),
    });

    console.log('🎰 [Gacha] Response status:', response.status);

    // 處理 HTTP 錯誤狀態碼
    if (!response.ok) {
      console.error('🎰 [Gacha] HTTP Error:', response.status, response.statusText);

      // 嘗試解析錯誤回應
      try {
        const errorData = await response.json();
        console.error('🎰 [Gacha] Error response:', JSON.stringify(errorData));
        return {
          success: false,
          error: errorData.error || errorData.message || `HTTP ${response.status}`,
          code: errorData.code || 'HTTP_ERROR',
          itinerary: [],
        } as ItineraryGenerateResponse;
      } catch {
        // 如果無法解析 JSON（例如 HTML 錯誤頁面）
        // 根據 HTTP 狀態碼給出更友善的錯誤訊息
        let errorMessage = `伺服器錯誤 (${response.status})`;
        if (response.status === 503) {
          errorMessage = '伺服器正在啟動中，請稍後再試';
        } else if (response.status === 502) {
          errorMessage = '無法連線到伺服器，請稍後再試';
        } else if (response.status === 504) {
          errorMessage = '伺服器回應超時，請稍後再試';
        } else if (response.status >= 500) {
          errorMessage = '伺服器忙碌中，請稍後再試';
        }
        return {
          success: false,
          error: errorMessage,
          code: 'HTTP_ERROR',
          itinerary: [],
        } as ItineraryGenerateResponse;
      }
    }

    const data = await response.json();
    console.log('🎰 [Gacha] Response success:', data.success, 'items:', data.itinerary?.length || 0);
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
      // #009: 端點對齊 /api/gacha/pull/v3
      const data = await this.request<GachaPullResponse>('/api/gacha/pull/v3', {
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

  // ========== #009 新增 ==========

  /**
   * 取得今日扭蛋額度
   * GET /api/gacha/quota
   */
  async getQuota(token: string): Promise<GachaQuotaResponse> {
    return this.request<GachaQuotaResponse>('/api/gacha/quota', {
      headers: this.authHeaders(token),
    });
  }

  // ========== #010 新增 ==========

  /**
   * 提交行程至官網 SEO
   * POST /api/gacha/submit-trip
   */
  async submitTrip(
    token: string,
    params: { sessionId: string; tripImageUrl?: string }
  ): Promise<SubmitTripResponse> {
    return this.request<SubmitTripResponse>('/api/gacha/submit-trip', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify(params),
    });
  }
}

export const gachaApi = new GachaApiService();
