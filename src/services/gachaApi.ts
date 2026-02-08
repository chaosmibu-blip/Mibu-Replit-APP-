/**
 * 扭蛋系統 API 服務
 *
 * 處理扭蛋抽獎、AI 行程生成、獎池查詢等功能
 *
 * @module services/gachaApi
 * @see 後端契約: contracts/APP.md
 *
 * ============ 串接端點 ============
 * - POST /api/gacha/itinerary/v3 - AI 生成行程
 * - GET  /api/gacha/pool         - 取得扭蛋獎池
 * - POST /api/gacha/pull/v3      - 抽取扭蛋 (#009)
 * - GET  /api/gacha/prize-pool   - 取得獎池優惠券
 * - POST /api/feedback/exclude   - 排除景點
 * - GET  /api/place/promo        - 取得景點優惠
 * - GET  /api/gacha/quota        - 取得今日額度 (#009)
 * - POST /api/gacha/submit-trip  - 提交行程至官網 (#010)
 *
 * ============ 特別說明 ============
 * #031: 新增 deviceId 參數用於防刷機制
 *       同一裝置每日限抽 36 次
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
import type { V2GachaPullRequest, V2GachaPullResponse } from '@chaosmibu-blip/mibu-shared';
import * as Application from 'expo-application';
import { Platform } from 'react-native';

// ============ 輔助函數 ============

/**
 * 取得裝置識別碼
 *
 * 用於防刷機制，每個裝置每日有抽取次數限制
 * #031: 同一裝置每日限抽 36 次
 *
 * @returns 裝置識別碼，若無法取得則回傳空字串
 *
 * @example
 * const deviceId = await getDeviceId();
 * await gachaApi.generateItinerary({ regionId: 1, deviceId });
 */
export const getDeviceId = async (): Promise<string> => {
  try {
    if (Platform.OS === 'ios') {
      // iOS 使用 Vendor ID（同一開發者的 App 共用）
      return await Application.getIosIdForVendorAsync() || '';
    } else if (Platform.OS === 'android') {
      // Android 使用 Android ID
      return await Application.getAndroidId() || '';
    }
    // Web 平台沒有 deviceId，回傳空字串
    return '';
  } catch (error) {
    console.warn('[GachaApi] Failed to get deviceId:', error);
    return '';
  }
};

// ============ API 服務類別 ============

/**
 * 扭蛋 API 服務類別
 *
 * 處理所有扭蛋相關的 API 請求
 */
class GachaApiService extends ApiBase {

  /**
   * AI 生成行程
   *
   * 根據指定的地區和參數，由 AI 生成推薦行程
   * 這個過程可能需要 1-2 分鐘，UI 需要顯示 loading 狀態
   *
   * @param params - 生成參數
   * @param params.regionId - 地區 ID
   * @param params.countryId - 國家 ID
   * @param params.itemCount - 景點數量
   * @param params.pace - 行程節奏（relaxed/moderate/packed）
   * @param params.language - 語言代碼
   * @param params.deviceId - 裝置識別碼（#031 防刷機制）
   * @param token - JWT Token（可選，未登入也可使用）
   * @returns 生成的行程項目列表
   *
   * @example
   * const result = await gachaApi.generateItinerary({
   *   regionId: 1,
   *   itemCount: 5,
   *   pace: 'moderate',
   *   deviceId: await getDeviceId(),
   * }, token);
   */
  async generateItinerary(params: {
    regionId?: number;
    countryId?: number;
    itemCount?: number;
    pace?: 'relaxed' | 'moderate' | 'packed';
    language?: string;
    deviceId?: string;
  }, token?: string): Promise<ItineraryGenerateResponse> {
    // 改用 base.ts request()，超時 120 秒（AI 生成需要 1-2 分鐘）
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return this.request<ItineraryGenerateResponse>(
      '/api/gacha/itinerary/v3',
      {
        method: 'POST',
        headers,
        body: JSON.stringify(params),
      },
      120_000, // AI 生成超時 120 秒
    );
  }

  /**
   * 取得扭蛋獎池
   *
   * 查詢指定城市的扭蛋獎池內容
   * #030: 後端回傳 { pool }，沒有 success 欄位
   *
   * @param city - 城市名稱
   * @returns 獎池內容
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

  /**
   * 抽取扭蛋
   *
   * 執行扭蛋抽獎，消耗抽取次數
   * #009: 端點對齊 /api/gacha/pull/v3
   *
   * @param payload - 抽獎參數
   * @returns 抽獎結果
   */
  async pullGacha(payload: GachaPullPayload): Promise<GachaPullResponse> {
    try {
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
   *
   * 查詢指定地區的可抽取優惠券
   * #030: 後端回傳 { coupons, region }，沒有 success 欄位
   *
   * @param regionId - 地區 ID
   * @returns 優惠券列表和地區資訊
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

  /**
   * 排除景點
   *
   * 用戶不喜歡某個景點時，可將其加入排除清單
   * 未來抽獎不會再抽到該景點
   *
   * @param params - 景點資訊
   * @param params.placeName - 景點名稱
   * @param params.district - 區域
   * @param params.city - 城市
   * @param params.placeCacheId - 快取 ID（可選）
   */
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

  /**
   * 取得景點優惠
   *
   * 查詢景點目前的優惠活動
   *
   * @param params - 景點查詢參數（至少需要一個）
   * @param params.placeId - 景點 ID
   * @param params.placeName - 景點名稱
   * @param params.district - 區域
   * @param params.city - 城市
   * @returns 優惠資訊
   */
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

  // ============ V2 API ============

  /**
   * V2 扭蛋抽取
   *
   * 新版扭蛋 API，回傳更完整的卡片資訊
   * 包含：地點詳情、優惠券、每日額度狀態
   *
   * @param params - 抽取參數
   * @param params.regionId - 地區 ID
   * @param params.city - 城市名稱
   * @param params.district - 區域名稱
   * @param params.count - 抽取數量（預設 5）
   * @param params.deviceId - 裝置識別碼（防刷機制）
   * @param token - JWT Token（可選）
   * @returns V2 格式的抽取結果
   */
  async pullGachaV2(params: V2GachaPullRequest, token?: string): Promise<V2GachaPullResponse> {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return this.request<V2GachaPullResponse>('/api/v2/gacha/pull', {
      method: 'POST',
      headers,
      body: JSON.stringify(params),
    });
  }

  // ============ #009 新增 ============

  /**
   * 取得今日扭蛋額度
   *
   * 查詢用戶今日剩餘的抽取次數
   *
   * @param token - JWT Token
   * @returns 額度資訊（已用/總額度）
   */
  async getQuota(token: string): Promise<GachaQuotaResponse> {
    return this.request<GachaQuotaResponse>('/api/gacha/quota', {
      headers: this.authHeaders(token),
    });
  }

  // ============ #010 新增 ============

  /**
   * 提交行程至官網 SEO
   *
   * 將 AI 生成的行程發布到官網，用於 SEO 和分享
   *
   * @param token - JWT Token
   * @param params - 提交參數
   * @param params.sessionId - 行程 session ID
   * @param params.tripImageUrl - 行程圖片網址（可選）
   * @returns 提交結果
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

// ============ 匯出 ============

/** 扭蛋 API 服務實例 */
export const gachaApi = new GachaApiService();
