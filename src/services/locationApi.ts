/**
 * 地點相關 API - 國家、地區、區域
 */
import { ApiBase } from './base';
import { Country, Region } from '../types';

class LocationApiService extends ApiBase {
  /**
   * 取得國家列表
   * GET /api/countries (#010 端點對齊)
   */
  async getCountries(): Promise<Country[]> {
    const data = await this.request<{ countries: Country[] }>('/api/countries');
    return data.countries || [];
  }

  /**
   * 取得地區列表
   * GET /api/regions/:countryId (#010 端點對齊)
   */
  async getRegions(countryId: number): Promise<Region[]> {
    const data = await this.request<{ regions: Region[] }>(`/api/regions/${countryId}`);
    return data.regions || [];
  }

  /**
   * 取得區域列表
   * GET /api/districts/:regionId (#010 端點對齊)
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
    const data = await this.request<{ districts: { id: number; name: string; nameZh?: string; nameEn?: string; nameJa?: string; nameKo?: string }[]; count?: number }>(`/api/districts/${regionId}`);
    return {
      count: data.districts?.length || data.count || 0,
      districts: data.districts || []
    };
  }

  async updateLocation(token: string, params: { lat: number; lng: number }): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/api/location/update', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify(params),
    });
  }

  async getMyLocation(token: string): Promise<{ location: { latitude: number; longitude: number } | null }> {
    return this.request<{ location: { latitude: number; longitude: number } | null }>('/api/location/me', {
      headers: this.authHeaders(token),
    });
  }
}

export const locationApi = new LocationApiService();
