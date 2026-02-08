/**
 * 管理員相關 API 服務
 *
 * 處理用戶管理、公告管理、排除清單管理等管理員功能
 *
 * @module services/adminApi
 * @see 後端契約: contracts/APP.md
 *
 * ============ 串接端點 ============
 * 用戶管理：
 * - GET   /api/admin/users                    - 取得用戶列表
 * - GET   /api/admin/users/pending            - 取得待審核用戶
 * - PATCH /api/admin/users/:id/approve        - 審核用戶
 *
 * 全域排除清單：
 * - GET    /api/admin/global-exclusions       - 取得全域排除清單
 * - POST   /api/admin/global-exclusions       - 新增全域排除
 * - DELETE /api/admin/global-exclusions/:id   - 移除全域排除
 *
 * 地點草稿：
 * - GET    /api/admin/place-drafts            - 取得地點草稿
 * - POST   /api/admin/place-drafts            - 建立地點草稿
 * - DELETE /api/admin/place-drafts/:id        - 刪除地點草稿
 * - POST   /api/admin/place-drafts/:id/publish - 發佈地點草稿
 *
 * 公告管理：
 * - GET    /api/admin/announcements           - 取得公告列表
 * - POST   /api/admin/announcements           - 建立公告
 * - PATCH  /api/admin/announcements/:id       - 更新公告
 * - DELETE /api/admin/announcements/:id       - 刪除公告
 */
import { ApiBase } from './base';
import {
  GlobalExclusion,
  AdminUser,
  PlaceDraft,
  Announcement,
  AnnouncementsResponse,
  CreateAnnouncementParams,
  UpdateAnnouncementParams,
  AnnouncementType
} from '../types';

// ============ API 服務類別 ============

/**
 * 管理員 API 服務類別
 *
 * 提供後台管理所需的所有功能
 */
class AdminApiService extends ApiBase {

  // ============ 用戶管理 ============

  /**
   * 取得用戶列表
   *
   * @param token - JWT Token（需管理員權限）
   * @returns 用戶列表
   */
  async getAdminUsers(token: string): Promise<{ users: AdminUser[] }> {
    return this.request('/api/admin/users', {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 取得待審核用戶
   *
   * 商家和策劃師申請需要管理員審核
   *
   * @param token - JWT Token（需管理員權限）
   * @returns 待審核用戶列表
   */
  async getAdminPendingUsers(token: string): Promise<{ users: AdminUser[] }> {
    return this.request('/api/admin/users/pending', {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 審核用戶
   *
   * 批准或拒絕用戶的申請
   *
   * @param token - JWT Token（需管理員權限）
   * @param userId - 用戶 ID
   * @param isApproved - 是否批准
   * @returns 更新後的用戶資料
   */
  async approveUser(token: string, userId: string, isApproved: boolean): Promise<{ user: AdminUser }> {
    return this.request(`/api/admin/users/${userId}/approve`, {
      method: 'PATCH',
      headers: this.authHeaders(token),
      body: JSON.stringify({ isApproved }),
    });
  }

  // ============ 全域排除清單 ============

  /**
   * 取得全域排除清單
   *
   * 全域排除的景點不會出現在任何用戶的扭蛋結果中
   *
   * @param token - JWT Token（需管理員權限）
   * @returns 排除清單
   */
  async getGlobalExclusions(token: string): Promise<GlobalExclusion[]> {
    const data = await this.request<{ exclusions: GlobalExclusion[] }>('/api/admin/global-exclusions', {
      headers: this.authHeaders(token),
    });
    return data.exclusions || [];
  }

  /**
   * 新增全域排除
   *
   * @param token - JWT Token（需管理員權限）
   * @param params - 景點資訊
   * @returns 新增的排除項目
   */
  async addGlobalExclusion(token: string, params: {
    placeName: string;
    district: string;
    city: string;
  }): Promise<GlobalExclusion> {
    const data = await this.request<{ success: boolean; exclusion: GlobalExclusion }>('/api/admin/global-exclusions', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify(params),
    });
    return data.exclusion;
  }

  /**
   * 移除全域排除
   *
   * @param token - JWT Token（需管理員權限）
   * @param id - 排除項目 ID
   */
  async removeGlobalExclusion(token: string, id: number): Promise<void> {
    await this.request(`/api/admin/global-exclusions/${id}`, {
      method: 'DELETE',
      headers: this.authHeaders(token),
    });
  }

  // ============ 地點草稿 ============

  /**
   * 取得地點草稿列表
   *
   * 用戶建議的新景點會先存為草稿
   *
   * @param token - JWT Token（需管理員權限）
   * @returns 草稿列表
   */
  async getPlaceDrafts(token: string): Promise<{ drafts: PlaceDraft[] }> {
    return this.request('/api/admin/place-drafts', {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 建立地點草稿
   *
   * @param token - JWT Token（需管理員權限）
   * @param params - 地點資訊
   * @returns 新建立的草稿
   */
  async createPlaceDraft(token: string, params: {
    placeName: string;
    district?: string;
    city?: string;
    category?: string;
  }): Promise<{ draft: PlaceDraft }> {
    return this.request('/api/admin/place-drafts', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify(params),
    });
  }

  /**
   * 刪除地點草稿
   *
   * @param token - JWT Token（需管理員權限）
   * @param draftId - 草稿 ID
   * @returns 刪除結果
   */
  async deletePlaceDraft(token: string, draftId: number): Promise<{ success: boolean }> {
    return this.request(`/api/admin/place-drafts/${draftId}`, {
      method: 'DELETE',
      headers: this.authHeaders(token),
    });
  }

  /**
   * 發佈地點草稿
   *
   * 將草稿正式加入景點資料庫
   *
   * @param token - JWT Token（需管理員權限）
   * @param draftId - 草稿 ID
   * @returns 發佈結果
   */
  async publishPlaceDraft(token: string, draftId: number): Promise<{ success: boolean }> {
    return this.request(`/api/admin/place-drafts/${draftId}/publish`, {
      method: 'POST',
      headers: this.authHeaders(token),
    });
  }

  // ============ 公告管理 ============

  /**
   * 取得管理員公告列表
   *
   * 包含所有狀態的公告（草稿、已發佈、已過期）
   *
   * @param token - JWT Token（需管理員權限）
   * @returns 公告列表
   */
  async getAdminAnnouncements(token: string): Promise<AnnouncementsResponse> {
    return this.request<AnnouncementsResponse>('/api/admin/announcements', {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 建立公告
   *
   * @param token - JWT Token（需管理員權限）
   * @param params - 公告資料
   * @returns 新建立的公告
   */
  async createAnnouncement(token: string, params: CreateAnnouncementParams): Promise<{ success: boolean; announcement: Announcement }> {
    return this.request('/api/admin/announcements', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify(params),
    });
  }

  /**
   * 更新公告
   *
   * @param token - JWT Token（需管理員權限）
   * @param id - 公告 ID
   * @param params - 要更新的欄位
   * @returns 更新後的公告
   */
  async updateAnnouncement(token: string, id: number, params: UpdateAnnouncementParams): Promise<{ success: boolean; announcement: Announcement }> {
    return this.request(`/api/admin/announcements/${id}`, {
      method: 'PATCH',
      headers: this.authHeaders(token),
      body: JSON.stringify(params),
    });
  }

  /**
   * 刪除公告
   *
   * @param token - JWT Token（需管理員權限）
   * @param id - 公告 ID
   * @returns 刪除結果
   */
  async deleteAnnouncement(token: string, id: number): Promise<{ success: boolean; message: string }> {
    return this.request(`/api/admin/announcements/${id}`, {
      method: 'DELETE',
      headers: this.authHeaders(token),
    });
  }
}

// ============ 匯出 ============

/** 管理員 API 服務實例 */
export const adminApi = new AdminApiService();
