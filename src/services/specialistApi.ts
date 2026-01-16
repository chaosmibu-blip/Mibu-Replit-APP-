/**
 * 專員相關 API - 追蹤、旅客管理、服務關係
 * 依據後端合約定義
 */
import { ApiBase } from './base';
import { SpecialistInfo, ServiceRelation } from '../types';

class SpecialistApiService extends ApiBase {
  /**
   * 獲取專員資訊
   * GET /api/specialist/me
   */
  async getSpecialistMe(token: string): Promise<SpecialistInfo> {
    return this.request<SpecialistInfo>('/api/specialist/me', {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 註冊成為專員
   * POST /api/specialist/register
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
   * POST /api/specialist/toggle-online
   */
  async toggleSpecialistOnline(token: string): Promise<{ specialist: SpecialistInfo }> {
    return this.request<{ specialist: SpecialistInfo }>('/api/specialist/toggle-online', {
      method: 'POST',
      headers: this.authHeaders(token),
    });
  }

  /**
   * 獲取專員服務關係
   * GET /api/specialist/services
   */
  async getSpecialistServices(token: string): Promise<{ relations: ServiceRelation[] }> {
    return this.request<{ relations: ServiceRelation[] }>('/api/specialist/services', {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 更新專員資料
   * PATCH /api/specialist/profile
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

export const specialistApi = new SpecialistApiService();
