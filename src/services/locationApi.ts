/**
 * 地點相關 API 服務
 *
 * 處理國家、地區、區域查詢和用戶位置更新等功能
 *
 * @module services/locationApi
 * @see 後端契約: contracts/APP.md
 *
 * ============ 串接端點 ============
 * - GET  /api/countries           - 取得國家列表 (#010)
 * - GET  /api/regions/:countryId  - 取得地區列表 (#010)
 * - GET  /api/districts/:regionId - 取得區域列表 (#010)
 * - POST /api/location/update     - 更新用戶位置
 * - GET  /api/location/me         - 取得用戶位置
 */
import { ApiBase } from './base';
import { Country, Region } from '../types';

// ============ API 服務類別 ============

/**
 * 地點 API 服務類別
 *
 * 管理地理位置相關的資料查詢
 */
class LocationApiService extends ApiBase {

  /**
   * 取得國家列表
   *
   * #010 端點對齊
   *
   * @returns 國家列表
   */
  async getCountries(): Promise<Country[]> {
    const data = await this.request<{ countries: Country[] }>('/api/countries');
    return data.countries || [];
  }

  /**
   * 取得地區列表
   *
   * 取得指定國家的所有地區（例如：台灣的縣市）
   * #010 端點對齊
   *
   * @param countryId - 國家 ID
   * @returns 地區列表
   */
  async getRegions(countryId: number): Promise<Region[]> {
    const data = await this.request<{ regions: Region[] }>(`/api/regions/${countryId}`);
    return data.regions || [];
  }

  /**
   * 取得區域列表
   *
   * 取得指定地區的所有區域（例如：台北市的各行政區）
   * #010 端點對齊
   *
   * @param regionId - 地區 ID
   * @returns 區域列表和總數
   */
  async getDistricts(regionId: number): Promise<{
    count: number;
    districts: {
      id: number;
      name: string;
      nameZh?: string;
      nameEn?: string;
      nameJa?: string;
      nameKo?: string
    }[]
  }> {
    const data = await this.request<{
      districts: {
        id: number;
        name: string;
        nameZh?: string;
        nameEn?: string;
        nameJa?: string;
        nameKo?: string
      }[];
      count?: number
    }>(`/api/districts/${regionId}`);

    return {
      count: data.districts?.length || data.count || 0,
      districts: data.districts || []
    };
  }

  /**
   * 更新用戶位置
   *
   * 用於追蹤用戶即時位置（需用戶授權）
   *
   * @param token - JWT Token
   * @param params - 位置座標
   * @param params.lat - 緯度
   * @param params.lng - 經度
   * @returns 更新結果
   */
  async updateLocation(token: string, params: { lat: number; lng: number }): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/api/location/update', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify(params),
    });
  }

  /**
   * 取得用戶位置
   *
   * 取得用戶上次回報的位置
   *
   * @param token - JWT Token
   * @returns 用戶位置，若未設定則為 null
   */
  async getMyLocation(token: string): Promise<{ location: { latitude: number; longitude: number } | null }> {
    return this.request<{ location: { latitude: number; longitude: number } | null }>('/api/location/me', {
      headers: this.authHeaders(token),
    });
  }
}

// ============ 匯出 ============

/** 地點 API 服務實例 */
export const locationApi = new LocationApiService();
