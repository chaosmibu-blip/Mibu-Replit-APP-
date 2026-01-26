/**
 * 通用 API - 公告、通知、廣告、聊天、SOS、優惠券
 */
import { ApiBase } from './base';
import {
  AnnouncementsResponse,
  AnnouncementType,
  UnreadCounts,
  AdConfig,
  AdPlacement,
  RegionPoolCoupon,
  SosEligibility,
  SosSendParams,
  SosSendResponse,
  SosAlertsResponse,
  SosAlert,
  SOSContact,
  SOSContactsResponse,
  SOSContactResponse,
  CreateSOSContactParams,
  UpdateSOSContactParams,
  DeleteSOSContactResponse,
} from '../types';

class CommonApiService extends ApiBase {
  // === 公告（公開） ===
  async getAnnouncements(): Promise<AnnouncementsResponse> {
    return this.request<AnnouncementsResponse>('/api/announcements');
  }

  async getAnnouncementsByType(type?: AnnouncementType): Promise<AnnouncementsResponse> {
    const url = type ? `/api/announcements?type=${type}` : '/api/announcements';
    return this.request<AnnouncementsResponse>(url);
  }

  // === 通知 ===
  async getNotifications(token: string): Promise<UnreadCounts> {
    return this.request<UnreadCounts>('/api/notifications', {
      headers: this.authHeaders(token),
    });
  }

  async markNotificationSeen(token: string, type: 'itembox' | 'collection' | 'announcement'): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/notifications/${type}/seen`, {
      method: 'POST',
      headers: this.authHeaders(token),
    });
  }

  async getUnreadCounts(token: string): Promise<UnreadCounts> {
    return this.request<UnreadCounts>('/api/notifications', {
      headers: this.authHeaders(token),
    });
  }

  // === 廣告 ===
  async getAdPlacement(placement: AdPlacement, platform: 'ios' | 'android' | 'web'): Promise<{ ad: AdConfig | null }> {
    return this.request<{ ad: AdConfig | null }>(`/api/ads/placements?placement=${placement}&platform=${platform}`);
  }

  // === 聊天 ===
  async getChatToken(token: string): Promise<{ token: string; identity: string }> {
    return this.request<{ token: string; identity: string }>('/api/chat/token', {
      method: 'GET',
      headers: this.authHeaders(token),
    });
  }

  // === 優惠券（地區獎池） ===
  async getRegionCouponPool(token: string, regionId: number): Promise<RegionPoolCoupon[]> {
    return this.request<RegionPoolCoupon[]>(`/api/coupons/region/${regionId}/pool`, {
      headers: this.authHeaders(token),
    });
  }

  // === SOS 緊急求救 ===
  async getSosEligibility(token: string): Promise<SosEligibility> {
    return this.request<SosEligibility>('/api/sos/eligibility', {
      headers: this.authHeaders(token),
    });
  }

  async sendSosAlert(token: string, params: SosSendParams): Promise<SosSendResponse> {
    // #011: 端點對齊 /api/sos/trigger
    return this.request<SosSendResponse>('/api/sos/trigger', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify(params),
    });
  }

  async getSosAlerts(token: string): Promise<SosAlertsResponse> {
    return this.request<SosAlertsResponse>('/api/sos/alerts', {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 取消 SOS 警報（舊版，向後相容）
   * @deprecated 請使用 cancelSOS
   */
  async cancelSosAlert(token: string, alertId: number): Promise<{ success: boolean; alert: SosAlert }> {
    return this.request<{ success: boolean; alert: SosAlert }>(`/api/sos/alerts/${alertId}/cancel`, {
      method: 'PATCH',
      headers: this.authHeaders(token),
    });
  }

  /**
   * 取消 SOS 警報
   * POST /api/sos/cancel
   * @see 後端合約 #013
   */
  async cancelSOS(
    token: string,
    params: { sosId: number; reason?: string }
  ): Promise<{ success: boolean; message?: string }> {
    return this.request<{ success: boolean; message?: string }>('/api/sos/cancel', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify(params),
    });
  }

  async getSosLink(token: string): Promise<{ sosLink: string; sosKey: string }> {
    return this.request<{ sosLink: string; sosKey: string }>('/api/user/sos-link', {
      headers: this.authHeaders(token),
    });
  }

  // === 緊急聯絡人 ===

  /**
   * 取得緊急聯絡人列表
   * GET /api/sos/contacts
   *
   * #030: 後端回傳 { contacts }，沒有 success 欄位
   */
  async getSOSContacts(token: string): Promise<SOSContactsResponse> {
    try {
      const data = await this.request<{ contacts: SOSContact[] }>('/api/sos/contacts', {
        headers: this.authHeaders(token),
      });
      // 後端沒有 success 欄位，HTTP 200 就是成功
      return { success: true, contacts: data.contacts || [] };
    } catch (error) {
      console.error('[CommonApi] getSOSContacts error:', error);
      return { success: false, contacts: [] };
    }
  }

  /**
   * 新增緊急聯絡人
   * POST /api/sos/contacts
   */
  async addSOSContact(
    token: string,
    params: CreateSOSContactParams
  ): Promise<SOSContactResponse> {
    return this.request<SOSContactResponse>('/api/sos/contacts', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify(params),
    });
  }

  /**
   * 更新緊急聯絡人
   * PUT /api/sos/contacts/:id
   */
  async updateSOSContact(
    token: string,
    contactId: number,
    params: UpdateSOSContactParams
  ): Promise<SOSContactResponse> {
    return this.request<SOSContactResponse>(`/api/sos/contacts/${contactId}`, {
      method: 'PUT',
      headers: this.authHeaders(token),
      body: JSON.stringify(params),
    });
  }

  /**
   * 刪除緊急聯絡人
   * DELETE /api/sos/contacts/:id
   */
  async deleteSOSContact(
    token: string,
    contactId: number
  ): Promise<DeleteSOSContactResponse> {
    return this.request<DeleteSOSContactResponse>(`/api/sos/contacts/${contactId}`, {
      method: 'DELETE',
      headers: this.authHeaders(token),
    });
  }

  // ========== #010 推播通知 ==========

  /**
   * 註冊推播 Token
   * POST /api/notifications/register-token
   */
  async registerPushToken(
    authToken: string,
    params: { token: string; platform: 'ios' | 'android'; deviceId?: string }
  ): Promise<{ success: boolean; tokenId?: number }> {
    return this.request<{ success: boolean; tokenId?: number }>('/api/notifications/register-token', {
      method: 'POST',
      headers: this.authHeaders(authToken),
      body: JSON.stringify(params),
    });
  }

  /**
   * 全部標記已讀
   * POST /api/notifications/read-all
   */
  async markAllNotificationsRead(token: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/api/notifications/read-all', {
      method: 'POST',
      headers: this.authHeaders(token),
    });
  }

  /**
   * 標記單一通知已讀
   * PATCH /api/notifications/:id/read
   */
  async markNotificationRead(
    token: string,
    notificationId: number
  ): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers: this.authHeaders(token),
    });
  }

  // ========== #010 App 設定 ==========

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
  async getMapboxToken(): Promise<{ accessToken: string }> {
    return this.request<{ accessToken: string }>('/api/config/mapbox');
  }

  // ========== #011 SOS 狀態補齊 ==========

  /**
   * 查詢 SOS 狀態
   * GET /api/sos/status
   */
  async getSOSStatus(token: string): Promise<SOSStatusResponse> {
    return this.request<SOSStatusResponse>('/api/sos/status', {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 更新 SOS 位置
   * POST /api/sos/location
   */
  async updateSOSLocation(
    token: string,
    sosId: number,
    location: { lat: number; lng: number }
  ): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/api/sos/location', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify({ sosId, location }),
    });
  }
}

// ========== #010 類型定義 ==========

export interface AppConfigResponse {
  minVersion: string;
  currentVersion: string;
  forceUpdate: boolean;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  features: {
    sosEnabled: boolean;
    chatEnabled: boolean;
    merchantEnabled: boolean;
  };
}

// ========== #011 類型定義 ==========

export interface SOSStatusResponse {
  hasActiveAlert: boolean;
  activeAlert?: {
    id: number;
    status: 'active' | 'resolved' | 'cancelled';
    createdAt: string;
    location?: { lat: number; lng: number };
  };
}

export const commonApi = new CommonApiService();
