/**
 * App 設定 API 服務
 *
 * 提供應用程式設定相關的 API 端點封裝，包含：
 * - App 版本與更新資訊
 * - 功能開關（Feature Flags）
 * - 系統限制參數
 * - Mapbox 地圖設定
 *
 * @module ConfigApiService
 * @see 後端合約: contracts/APP.md
 *
 * API 端點清單：
 * - GET /api/config/app - 取得 App 設定
 * - GET /api/config/mapbox - 取得 Mapbox Token
 */
import { ApiBase } from './base';

// ========== 類型定義 ==========

/**
 * App 設定資料結構
 *
 * 包含應用程式運行所需的各種設定參數
 */
export interface AppConfig {
  /** 目前版本號 */
  version: string;
  /** 最低支援版本 */
  minVersion: string;
  /** 是否強制更新 */
  forceUpdate: boolean;
  /** 是否維護中 */
  maintenance: boolean;
  /** 維護訊息（維護時顯示） */
  maintenanceMessage?: string;
  /** 功能開關 */
  features: {
    /** 扭蛋功能是否啟用 */
    gacha: boolean;
    /** 行程規劃功能是否啟用 */
    planner: boolean;
    /** 募資功能是否啟用 */
    crowdfunding: boolean;
    /** 推薦碼功能是否啟用 */
    referral: boolean;
  };
  /** 系統限制參數 */
  limits: {
    /** 每日扭蛋上限 */
    dailyGachaLimit: number;
    /** 背包容量上限 */
    inventoryCapacity: number;
    /** 緊急聯絡人數量上限 */
    maxSOSContacts: number;
  };
}

/**
 * Mapbox 設定資料結構
 */
export interface MapboxConfig {
  /** Mapbox Access Token */
  accessToken: string;
  /** 自訂地圖樣式 URL（可選） */
  styleUrl?: string;
}

/**
 * App 設定 API 回應格式
 */
export interface AppConfigResponse {
  /** 是否成功 */
  success: boolean;
  /** App 設定資料 */
  config: AppConfig;
}

/**
 * Mapbox 設定 API 回應格式
 */
export interface MapboxConfigResponse {
  /** 是否成功 */
  success: boolean;
  /** Mapbox 設定資料 */
  mapbox: MapboxConfig;
}

// ========== API 服務類別 ==========

/**
 * 設定 API 服務類別
 *
 * 繼承 ApiBase 基礎類別，提供設定相關的 API 方法
 */
class ConfigApiService extends ApiBase {
  // ========== App 設定 ==========

  /**
   * 取得 App 設定
   *
   * 取得應用程式運行所需的設定資訊
   * 包含版本檢查、功能開關、系統限制等
   *
   * #030: 後端回傳 { config }，沒有 success 欄位
   * HTTP 200 視為成功，前端包裝 success 欄位
   *
   * 錯誤時回傳預設值，確保 App 仍可運作：
   * - version/minVersion: '1.0.0'
   * - forceUpdate: false
   * - maintenance: false
   * - 所有功能啟用
   * - 使用預設限制值
   *
   * @returns App 設定資訊
   *
   * @example
   * const { success, config } = await configApi.getAppConfig();
   * if (config.forceUpdate && compareVersions(appVersion, config.minVersion) < 0) {
   *   // 顯示強制更新對話框
   * }
   */
  async getAppConfig(): Promise<AppConfigResponse> {
    try {
      const data = await this.request<{ config: AppConfig }>('/api/config/app');
      // 後端沒有 success 欄位，HTTP 200 就是成功
      return { success: true, config: data.config };
    } catch (error) {
      console.error('[ConfigApi] getAppConfig error:', error);
      // 錯誤時回傳預設值，確保 App 可正常運作
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

  // ========== Mapbox 設定 ==========

  /**
   * 取得 Mapbox Token
   *
   * 取得 Mapbox 地圖服務所需的 Access Token
   * 此 API 需要認證，避免 Token 外洩
   *
   * #030: 後端回傳 { mapbox }，沒有 success 欄位
   * HTTP 200 視為成功，前端包裝 success 欄位
   *
   * @param token - 用戶認證 Token
   * @returns Mapbox 設定資訊
   *
   * @example
   * const { success, mapbox } = await configApi.getMapboxConfig(userToken);
   * if (success) {
   *   Mapbox.setAccessToken(mapbox.accessToken);
   * }
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
      // 錯誤時回傳空 Token，地圖功能將無法使用
      return { success: false, mapbox: { accessToken: '' } };
    }
  }
}

// ========== 匯出單例 ==========

/** 設定 API 服務單例，供全域使用 */
export const configApi = new ConfigApiService();
