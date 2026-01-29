/**
 * 扭蛋相關 API - 抽獎、行程生成、獎池
 *
 * #031: 新增 deviceId 參數防刷機制
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
import * as Application from 'expo-application';
import { Platform } from 'react-native';

/**
 * 取得裝置識別碼
 * #031: 用於防刷機制，同一裝置每日限抽 36 次
 */
export const getDeviceId = async (): Promise<string> => {
  try {
    if (Platform.OS === 'ios') {
      return await Application.getIosIdForVendorAsync() || '';
    } else if (Platform.OS === 'android') {
      return Application.androidId || '';
    }
    // Web 平台沒有 deviceId，回傳空字串
    return '';
  } catch (error) {
    console.warn('[GachaApi] Failed to get deviceId:', error);
    return '';
  }
};

class GachaApiService extends ApiBase {
  async generateItinerary(params: {
    regionId?: number;
    countryId?: number;
    itemCount?: number;
    pace?: 'relaxed' | 'moderate' | 'packed';
    language?: string;
    deviceId?: string;  // #031: 裝置識別碼
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

  /**
   * 取得扭蛋獎池
   * GET /api/gacha/pool
   *
   * #030: 後端回傳 { pool }，沒有 success 欄位
   */
  async getGachaPool(city: string): Promise<GachaPoolResponse> {
    try {
      const params = new URLSearchParams({ city });
      const data = await this.request<{ pool: GachaPoolResponse['pool'] }>(`/api/gacha/pool?${params}`);
      // 後端沒有 success 欄位，HTTP 200 就是成功
      return { success: true, pool: data.pool };
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

  /**
   * 取得獎池優惠券列表
   * GET /api/gacha/prize-pool
   *
   * #030: 後端回傳 { coupons, region }，沒有 success 欄位
   */
  async getPrizePool(regionId: number): Promise<PrizePoolResponse> {
    try {
      const data = await this.request<{
        coupons: PrizePoolResponse['coupons'];
        region: PrizePoolResponse['region'];
      }>(`/api/gacha/prize-pool?regionId=${regionId}`);
      // 後端沒有 success 欄位，HTTP 200 就是成功
      return { success: true, coupons: data.coupons || [], region: data.region };
    } catch (error) {
      console.error('[GachaApi] getPrizePool error:', error);
      return { success: false, coupons: [], region: { id: 0, name: '' } };
    }
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
