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
   */
  async getAppConfig(): Promise<AppConfigResponse> {
    return this.request<AppConfigResponse>('/api/config/app');
  }

  /**
   * 取得 Mapbox Token
   * GET /api/config/mapbox
   */
  async getMapboxConfig(token: string): Promise<MapboxConfigResponse> {
    return this.request<MapboxConfigResponse>('/api/config/mapbox', {
      headers: this.authHeaders(token),
    });
  }
}

export const configApi = new ConfigApiService();
