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
  SosAlert
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
    return this.request<SosSendResponse>('/api/sos/alert', {
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

  async cancelSosAlert(token: string, alertId: number): Promise<{ success: boolean; alert: SosAlert }> {
    return this.request<{ success: boolean; alert: SosAlert }>(`/api/sos/alerts/${alertId}/cancel`, {
      method: 'PATCH',
      headers: this.authHeaders(token),
    });
  }

  async getSosLink(token: string): Promise<{ sosLink: string; sosKey: string }> {
    return this.request<{ sosLink: string; sosKey: string }>('/api/user/sos-link', {
      headers: this.authHeaders(token),
    });
  }
}

export const commonApi = new CommonApiService();
