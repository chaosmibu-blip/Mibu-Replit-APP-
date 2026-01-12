/**
 * 管理員相關 API - 用戶管理、公告、排除清單
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

class AdminApiService extends ApiBase {
  // === 用戶管理 ===
  async getAdminUsers(token: string): Promise<{ users: AdminUser[] }> {
    return this.request('/api/admin/users', {
      headers: this.authHeaders(token),
    });
  }

  async getAdminPendingUsers(token: string): Promise<{ users: AdminUser[] }> {
    return this.request('/api/admin/users/pending', {
      headers: this.authHeaders(token),
    });
  }

  async approveUser(token: string, userId: string, isApproved: boolean): Promise<{ user: AdminUser }> {
    return this.request(`/api/admin/users/${userId}/approve`, {
      method: 'PATCH',
      headers: this.authHeaders(token),
      body: JSON.stringify({ isApproved }),
    });
  }

  // === 全域排除清單 ===
  async getGlobalExclusions(token: string): Promise<GlobalExclusion[]> {
    try {
      const data = await this.request<{ exclusions: GlobalExclusion[] }>('/api/admin/global-exclusions', {
        headers: this.authHeaders(token),
      });
      return data.exclusions || [];
    } catch (error) {
      console.error('Failed to get global exclusions:', error);
      throw error;
    }
  }

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

  async removeGlobalExclusion(token: string, id: number): Promise<void> {
    await this.request(`/api/admin/global-exclusions/${id}`, {
      method: 'DELETE',
      headers: this.authHeaders(token),
    });
  }

  // === 地點草稿 ===
  async getPlaceDrafts(token: string): Promise<{ drafts: PlaceDraft[] }> {
    return this.request('/api/admin/place-drafts', {
      headers: this.authHeaders(token),
    });
  }

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

  async deletePlaceDraft(token: string, draftId: number): Promise<{ success: boolean }> {
    return this.request(`/api/admin/place-drafts/${draftId}`, {
      method: 'DELETE',
      headers: this.authHeaders(token),
    });
  }

  async publishPlaceDraft(token: string, draftId: number): Promise<{ success: boolean }> {
    return this.request(`/api/admin/place-drafts/${draftId}/publish`, {
      method: 'POST',
      headers: this.authHeaders(token),
    });
  }

  // === 公告管理 ===
  async getAdminAnnouncements(token: string): Promise<AnnouncementsResponse> {
    return this.request<AnnouncementsResponse>('/api/admin/announcements', {
      headers: this.authHeaders(token),
    });
  }

  async createAnnouncement(token: string, params: CreateAnnouncementParams): Promise<{ success: boolean; announcement: Announcement }> {
    return this.request('/api/admin/announcements', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify(params),
    });
  }

  async updateAnnouncement(token: string, id: number, params: UpdateAnnouncementParams): Promise<{ success: boolean; announcement: Announcement }> {
    return this.request(`/api/admin/announcements/${id}`, {
      method: 'PATCH',
      headers: this.authHeaders(token),
      body: JSON.stringify(params),
    });
  }

  async deleteAnnouncement(token: string, id: number): Promise<{ success: boolean; message: string }> {
    return this.request(`/api/admin/announcements/${id}`, {
      method: 'DELETE',
      headers: this.authHeaders(token),
    });
  }
}

export const adminApi = new AdminApiService();
