/**
 * 通用 API 服務
 *
 * 提供多種通用功能的 API 端點封裝，包含：
 * - 公告系統（公開）
 * - 通知管理
 * - 廣告配置
 * - 聊天功能
 * - SOS 緊急求救
 * - 緊急聯絡人管理
 * - 推播通知
 * - App 設定
 *
 * @module CommonApiService
 * @see 後端合約: contracts/APP.md
 *
 * API 端點清單：
 * - GET /api/announcements - 取得公告列表
 * - GET /api/notifications - 取得通知
 * - POST /api/notifications/:type/seen - 標記通知已讀
 * - GET /api/ads/placements - 取得廣告配置
 * - GET /api/chat/token - 取得聊天 Token
 * - GET /api/coupons/region/:id/pool - 取得地區優惠券池
 * - GET /api/sos/eligibility - 檢查 SOS 資格
 * - POST /api/sos/trigger - 發送 SOS 警報
 * - GET /api/sos/alerts - 取得 SOS 警報列表
 * - POST /api/sos/cancel - 取消 SOS 警報
 * - GET /api/sos/contacts - 取得緊急聯絡人
 * - POST /api/sos/contacts - 新增緊急聯絡人
 * - PUT /api/sos/contacts/:id - 更新緊急聯絡人
 * - DELETE /api/sos/contacts/:id - 刪除緊急聯絡人
 * - POST /api/notifications/register-token - 註冊推播 Token
 * - POST /api/notifications/read-all - 全部標記已讀
 * - PATCH /api/notifications/:id/read - 標記單一通知已讀
 * - GET /api/config/app - 取得 App 設定
 * - GET /api/config/mapbox - 取得 Mapbox Token
 * - GET /api/sos/status - 查詢 SOS 狀態
 * - POST /api/sos/location - 更新 SOS 位置
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

// ========== API 服務類別 ==========

/**
 * 通用 API 服務類別
 *
 * 繼承 ApiBase 基礎類別，提供多種通用功能的 API 方法
 * 部分方法為公開 API（不需認證），部分需要 authToken
 */
class CommonApiService extends ApiBase {
  // ========== 公告（公開） ==========

  /**
   * 取得公告列表
   *
   * 公開 API，不需要認證
   * 取得系統所有公告
   *
   * @returns 公告列表
   *
   * @example
   * const announcements = await commonApi.getAnnouncements();
   */
  async getAnnouncements(): Promise<AnnouncementsResponse> {
    return this.request<AnnouncementsResponse>('/api/announcements');
  }

  /**
   * 依類型取得公告列表
   *
   * 公開 API，不需要認證
   * 可依類型篩選公告（system/event/maintenance）
   *
   * @param type - 公告類型（可選）
   * @returns 篩選後的公告列表
   *
   * @example
   * const systemAnnouncements = await commonApi.getAnnouncementsByType('system');
   */
  async getAnnouncementsByType(type?: AnnouncementType): Promise<AnnouncementsResponse> {
    const url = type ? `/api/announcements?type=${type}` : '/api/announcements';
    return this.request<AnnouncementsResponse>(url);
  }

  // ========== 通知 ==========

  /**
   * 取得通知
   *
   * 取得用戶的未讀通知數量
   *
   * @param token - 用戶認證 Token
   * @returns 未讀通知數量
   *
   * @example
   * const counts = await commonApi.getNotifications(token);
   */
  async getNotifications(token: string): Promise<UnreadCounts> {
    return this.request<UnreadCounts>('/api/notifications', {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 標記通知已讀（依類型）
   *
   * 將特定類型的通知標記為已讀
   *
   * @param token - 用戶認證 Token
   * @param type - 通知類型（itembox/collection/announcement）
   * @returns 操作結果
   *
   * @example
   * await commonApi.markNotificationSeen(token, 'itembox');
   */
  async markNotificationSeen(token: string, type: 'itembox' | 'collection' | 'announcement'): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/notifications/${type}/seen`, {
      method: 'POST',
      headers: this.authHeaders(token),
    });
  }

  /**
   * 取得未讀數量
   *
   * 取得各類型通知的未讀數量
   * 與 getNotifications 功能相同，提供語意化命名
   *
   * @param token - 用戶認證 Token
   * @returns 各類型未讀數量
   *
   * @example
   * const { itembox, collection, announcement } = await commonApi.getUnreadCounts(token);
   */
  async getUnreadCounts(token: string): Promise<UnreadCounts> {
    return this.request<UnreadCounts>('/api/notifications', {
      headers: this.authHeaders(token),
    });
  }

  // ========== 廣告 ==========

  /**
   * 取得廣告配置
   *
   * 根據版位和平台取得對應的廣告配置
   *
   * @param placement - 廣告版位
   * @param platform - 平台（ios/android/web）
   * @returns 廣告配置，若無廣告則為 null
   *
   * @example
   * const { ad } = await commonApi.getAdPlacement('home_banner', 'ios');
   * if (ad) {
   *   // 顯示廣告
   * }
   */
  async getAdPlacement(placement: AdPlacement, platform: 'ios' | 'android' | 'web'): Promise<{ ad: AdConfig | null }> {
    return this.request<{ ad: AdConfig | null }>(`/api/ads/placements?placement=${placement}&platform=${platform}`);
  }

  // ========== 聊天 ==========

  /**
   * 取得聊天 Token
   *
   * 取得用於即時通訊的 Token
   * 用於連接聊天服務（如 Twilio、SendBird 等）
   *
   * @param token - 用戶認證 Token
   * @returns 聊天 Token 與用戶身份
   *
   * @example
   * const { token: chatToken, identity } = await commonApi.getChatToken(authToken);
   */
  async getChatToken(token: string): Promise<{ token: string; identity: string }> {
    return this.request<{ token: string; identity: string }>('/api/chat/token', {
      method: 'GET',
      headers: this.authHeaders(token),
    });
  }

  // ========== 優惠券（地區獎池） ==========

  /**
   * 取得地區優惠券池
   *
   * 取得特定地區可用的優惠券列表
   * 用於扭蛋抽獎的獎池
   *
   * @param token - 用戶認證 Token
   * @param regionId - 地區 ID
   * @returns 地區優惠券列表
   *
   * @example
   * const coupons = await commonApi.getRegionCouponPool(token, 1);
   */
  async getRegionCouponPool(token: string, regionId: number): Promise<RegionPoolCoupon[]> {
    return this.request<RegionPoolCoupon[]>(`/api/coupons/region/${regionId}/pool`, {
      headers: this.authHeaders(token),
    });
  }

  // ========== SOS 緊急求救 ==========

  /**
   * 檢查 SOS 資格
   *
   * 檢查用戶是否可以發送 SOS 警報
   * 可能受限於等級、次數等條件
   *
   * @param token - 用戶認證 Token
   * @returns SOS 資格狀態
   *
   * @example
   * const eligibility = await commonApi.getSosEligibility(token);
   * if (eligibility.eligible) {
   *   // 允許發送 SOS
   * }
   */
  async getSosEligibility(token: string): Promise<SosEligibility> {
    return this.request<SosEligibility>('/api/sos/eligibility', {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 發送 SOS 警報
   *
   * 觸發緊急求救，系統會通知緊急聯絡人
   *
   * #011: 端點對齊 /api/sos/trigger
   *
   * @param token - 用戶認證 Token
   * @param params - SOS 參數（位置、訊息等）
   * @returns 發送結果
   *
   * @example
   * const result = await commonApi.sendSosAlert(token, {
   *   location: { lat: 25.033, lng: 121.565 },
   *   message: '需要幫助！'
   * });
   */
  async sendSosAlert(token: string, params: SosSendParams): Promise<SosSendResponse> {
    // #011: 端點對齊 /api/sos/trigger
    return this.request<SosSendResponse>('/api/sos/trigger', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify(params),
    });
  }

  /**
   * 取得 SOS 警報列表
   *
   * 取得用戶的 SOS 警報歷史記錄
   *
   * @param token - 用戶認證 Token
   * @returns SOS 警報列表
   *
   * @example
   * const alerts = await commonApi.getSosAlerts(token);
   */
  async getSosAlerts(token: string): Promise<SosAlertsResponse> {
    return this.request<SosAlertsResponse>('/api/sos/alerts', {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 取消 SOS 警報（舊版，向後相容）
   *
   * @deprecated 請使用 cancelSOS
   * @param token - 用戶認證 Token
   * @param alertId - 警報 ID
   * @returns 取消結果
   */
  async cancelSosAlert(token: string, alertId: number): Promise<{ success: boolean; alert: SosAlert }> {
    return this.request<{ success: boolean; alert: SosAlert }>(`/api/sos/alerts/${alertId}/cancel`, {
      method: 'PATCH',
      headers: this.authHeaders(token),
    });
  }

  /**
   * 取消 SOS 警報
   *
   * 取消進行中的 SOS 警報
   *
   * @see 後端合約 #013
   * @param token - 用戶認證 Token
   * @param params - 取消參數（sosId、取消原因）
   * @returns 取消結果
   *
   * @example
   * const result = await commonApi.cancelSOS(token, {
   *   sosId: 123,
   *   reason: '誤觸發'
   * });
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

  /**
   * 取得 SOS 分享連結
   *
   * 取得用戶專屬的 SOS 分享連結
   * 可分享給親友，讓他們追蹤用戶位置
   *
   * @param token - 用戶認證 Token
   * @returns SOS 分享連結與金鑰
   *
   * @example
   * const { sosLink, sosKey } = await commonApi.getSosLink(token);
   */
  async getSosLink(token: string): Promise<{ sosLink: string; sosKey: string }> {
    return this.request<{ sosLink: string; sosKey: string }>('/api/user/sos-link', {
      headers: this.authHeaders(token),
    });
  }

  // ========== 緊急聯絡人 ==========

  /**
   * 取得緊急聯絡人列表
   *
   * 取得用戶設定的緊急聯絡人
   * SOS 警報會通知這些聯絡人
   *
   * #030: 後端回傳 { contacts }，沒有 success 欄位
   * HTTP 200 視為成功，前端包裝 success 欄位
   *
   * @param token - 用戶認證 Token
   * @returns 緊急聯絡人列表
   *
   * @example
   * const { success, contacts } = await commonApi.getSOSContacts(token);
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
   *
   * 新增一位緊急聯絡人
   * 數量上限由 App 設定決定（maxSOSContacts）
   *
   * @param token - 用戶認證 Token
   * @param params - 聯絡人資訊（姓名、電話等）
   * @returns 新增結果
   *
   * @example
   * const result = await commonApi.addSOSContact(token, {
   *   name: '媽媽',
   *   phone: '0912345678',
   *   relationship: 'family'
   * });
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
   *
   * 更新現有緊急聯絡人的資訊
   *
   * @param token - 用戶認證 Token
   * @param contactId - 聯絡人 ID
   * @param params - 要更新的欄位
   * @returns 更新結果
   *
   * @example
   * await commonApi.updateSOSContact(token, 1, { phone: '0987654321' });
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
   *
   * 移除一位緊急聯絡人
   *
   * @param token - 用戶認證 Token
   * @param contactId - 聯絡人 ID
   * @returns 刪除結果
   *
   * @example
   * await commonApi.deleteSOSContact(token, 1);
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
   *
   * 向後端註冊裝置的推播 Token
   * 用於接收推播通知
   *
   * @see #010 推播通知
   * @param authToken - 用戶認證 Token
   * @param params - 推播 Token 資訊
   * @returns 註冊結果
   *
   * @example
   * await commonApi.registerPushToken(authToken, {
   *   token: 'ExponentPushToken[xxx]',
   *   platform: 'ios',
   *   deviceId: 'device-uuid'
   * });
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
   *
   * 將所有通知標記為已讀
   *
   * @param token - 用戶認證 Token
   * @returns 操作結果
   *
   * @example
   * await commonApi.markAllNotificationsRead(token);
   */
  async markAllNotificationsRead(token: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/api/notifications/read-all', {
      method: 'POST',
      headers: this.authHeaders(token),
    });
  }

  /**
   * 標記單一通知已讀
   *
   * 將特定通知標記為已讀
   *
   * @param token - 用戶認證 Token
   * @param notificationId - 通知 ID
   * @returns 操作結果
   *
   * @example
   * await commonApi.markNotificationRead(token, 123);
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
   *
   * 取得應用程式設定資訊
   * 包含版本、維護狀態、功能開關等
   *
   * @returns App 設定資訊
   *
   * @example
   * const config = await commonApi.getAppConfig();
   */
  async getAppConfig(): Promise<AppConfigResponse> {
    return this.request<AppConfigResponse>('/api/config/app');
  }

  /**
   * 取得 Mapbox Token
   *
   * 取得 Mapbox 地圖服務的 Access Token
   *
   * @returns Mapbox Access Token
   *
   * @example
   * const { accessToken } = await commonApi.getMapboxToken();
   */
  async getMapboxToken(): Promise<{ accessToken: string }> {
    return this.request<{ accessToken: string }>('/api/config/mapbox');
  }

  // ========== #011 SOS 狀態補齊 ==========

  /**
   * 查詢 SOS 狀態
   *
   * 檢查用戶是否有進行中的 SOS 警報
   *
   * @see #011 SOS 狀態補齊
   * @param token - 用戶認證 Token
   * @returns SOS 狀態資訊
   *
   * @example
   * const status = await commonApi.getSOSStatus(token);
   * if (status.hasActiveAlert) {
   *   // 顯示 SOS 進行中的 UI
   * }
   */
  async getSOSStatus(token: string): Promise<SOSStatusResponse> {
    return this.request<SOSStatusResponse>('/api/sos/status', {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 更新 SOS 位置
   *
   * 更新 SOS 警報的最新位置
   * 用於持續追蹤用戶位置
   *
   * @see #011 SOS 狀態補齊
   * @param token - 用戶認證 Token
   * @param sosId - SOS 警報 ID
   * @param location - 最新位置座標
   * @returns 更新結果
   *
   * @example
   * await commonApi.updateSOSLocation(token, 123, {
   *   lat: 25.033,
   *   lng: 121.565
   * });
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

/**
 * App 設定回應格式
 *
 * @see #010 推播通知
 */
export interface AppConfigResponse {
  /** 最低支援版本 */
  minVersion: string;
  /** 目前版本 */
  currentVersion: string;
  /** 是否強制更新 */
  forceUpdate: boolean;
  /** 是否維護中 */
  maintenanceMode: boolean;
  /** 維護訊息 */
  maintenanceMessage?: string;
  /** 功能開關 */
  features: {
    /** SOS 功能是否啟用 */
    sosEnabled: boolean;
    /** 聊天功能是否啟用 */
    chatEnabled: boolean;
    /** 商家功能是否啟用 */
    merchantEnabled: boolean;
  };
}

// ========== #011 類型定義 ==========

/**
 * SOS 狀態回應格式
 *
 * @see #011 SOS 狀態補齊
 */
export interface SOSStatusResponse {
  /** 是否有進行中的警報 */
  hasActiveAlert: boolean;
  /** 進行中的警報詳情 */
  activeAlert?: {
    /** 警報 ID */
    id: number;
    /** 警報狀態 */
    status: 'active' | 'resolved' | 'cancelled';
    /** 建立時間 */
    createdAt: string;
    /** 最後位置 */
    location?: { lat: number; lng: number };
  };
}

// ========== 匯出單例 ==========

/** 通用 API 服務單例，供全域使用 */
export const commonApi = new CommonApiService();
