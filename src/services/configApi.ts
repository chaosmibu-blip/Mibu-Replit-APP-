/**
 * App 設定 API
 *
 * @see 後端合約: contracts/APP.md
 */
import { ApiBase } from './base';

// ========== 類型定義 ==========

export interface AppConfig {
  version: string;
  minVersion: string;
  forceUpdate: boolean;
  maintenance: boolean;
  maintenanceMessage?: string;
  features: {
    gacha: boolean;
    planner: boolean;
    crowdfunding: boolean;
    referral: boolean;
  };
  limits: {
    dailyGachaLimit: number;
    inventoryCapacity: number;
    maxSOSContacts: number;
  };
}

export interface MapboxConfig {
  accessToken: string;
  styleUrl?: string;
}

export interface AppConfigResponse {
  success: boolean;
  config: AppConfig;
}

export interface MapboxConfigResponse {
  success: boolean;
  mapbox: MapboxConfig;
}

// ========== API 服務 ==========

class ConfigApiService extends ApiBase {
  /**
   * 取得 App 設定
   * GET /api/config/app
   *
   * #030: 後端回傳 { config }，沒有 success 欄位
   */
  async getAppConfig(): Promise<AppConfigResponse> {
    try {
      const data = await this.request<{ config: AppConfig }>('/api/config/app');
      // 後端沒有 success 欄位，HTTP 200 就是成功
      return { success: true, config: data.config };
    } catch (error) {
      console.error('[ConfigApi] getAppConfig error:', error);
      return {
        success: false,
        config: {
          version: '1.0.0',
          minVersion: '1.0.0',
          forceUpdate: false,
          maintenance: false,
          features: { gacha: true, planner: true, crowdfunding: true, referral: true },
          limits: { dailyGachaLimit: 36, inventoryCapacity: 30, maxSOSContacts: 5 },
        },
      };
    }
  }

  /**
   * 取得 Mapbox Token
   * GET /api/config/mapbox
   *
   * #030: 後端回傳 { mapbox }，沒有 success 欄位
   */
  async getMapboxConfig(token: string): Promise<MapboxConfigResponse> {
    try {
      const data = await this.request<{ mapbox: MapboxConfig }>('/api/config/mapbox', {
        headers: this.authHeaders(token),
      });
      // 後端沒有 success 欄位，HTTP 200 就是成功
      return { success: true, mapbox: data.mapbox };
    } catch (error) {
      console.error('[ConfigApi] getMapboxConfig error:', error);
      return { success: false, mapbox: { accessToken: '' } };
    }
  }
}

export const configApi = new ConfigApiService();
