/**
 * 策劃師相關 API 服務
 *
 * 處理策劃師追蹤、旅客管理、服務關係等功能
 * 依據後端合約定義
 *
 * @module services/specialistApi
 * @see 後端契約: contracts/APP.md
 *
 * ============ 串接端點 ============
 * - GET   /api/specialist/me            - 取得策劃師資訊
 * - POST  /api/specialist/register      - 註冊成為策劃師
 * - POST  /api/specialist/toggle-online - 切換上線狀態
 * - GET   /api/specialist/services      - 取得服務關係
 * - PATCH /api/specialist/profile       - 更新策劃師資料
 */
import { ApiBase } from './base';
import { SpecialistInfo, ServiceRelation } from '../types';

// ============ API 服務類別 ============

/**
 * 策劃師 API 服務類別
 *
 * 管理策劃師的服務狀態和旅客關係
 */
class SpecialistApiService extends ApiBase {

  /**
   * 獲取策劃師資訊
   *
   * @param token - JWT Token
   * @returns 策劃師詳細資料
   */
  async getSpecialistMe(token: string): Promise<SpecialistInfo> {
    return this.request<SpecialistInfo>('/api/specialist/me', {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 註冊成為策劃師
   *
   * @param token - JWT Token
   * @param params - 註冊資料
   * @param params.serviceRegion - 服務地區
   * @returns 新建立的策劃師資料
   */
  async registerSpecialist(token: string, params: {
    serviceRegion?: string;
  }): Promise<{ specialist: SpecialistInfo }> {
    return this.request('/api/specialist/register', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify(params),
    });
  }

  /**
   * 切換上線狀態
   *
   * 策劃師可切換是否接受新的服務請求
   *
   * @param token - JWT Token
   * @returns 更新後的策劃師資料
   */
  async toggleSpecialistOnline(token: string): Promise<{ specialist: SpecialistInfo }> {
    return this.request<{ specialist: SpecialistInfo }>('/api/specialist/toggle-online', {
      method: 'POST',
      headers: this.authHeaders(token),
    });
  }

  /**
   * 獲取策劃師服務關係
   *
   * 取得目前正在服務的旅客列表
   *
   * @param token - JWT Token
   * @returns 服務關係列表
   */
  async getSpecialistServices(token: string): Promise<{ relations: ServiceRelation[] }> {
    return this.request<{ relations: ServiceRelation[] }>('/api/specialist/services', {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 更新策劃師資料
   *
   * @param token - JWT Token
   * @param params - 要更新的欄位
   * @param params.serviceRegion - 服務地區
   * @param params.bio - 自我介紹
   * @param params.languages - 語言能力列表
   * @returns 更新後的策劃師資料
   */
  async updateSpecialistProfile(token: string, params: {
    serviceRegion?: string;
    bio?: string;
    languages?: string[];
  }): Promise<{ specialist: SpecialistInfo }> {
    return this.request<{ specialist: SpecialistInfo }>('/api/specialist/profile', {
      method: 'PATCH',
      headers: this.authHeaders(token),
      body: JSON.stringify(params),
    });
  }
}

// ============ 匯出 ============

/** 策劃師 API 服務實例 */
export const specialistApi = new SpecialistApiService();
