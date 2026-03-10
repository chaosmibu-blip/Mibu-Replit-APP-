/**
 * ============================================================
 * 商家 API 服務 (merchantApi.ts)
 * ============================================================
 * #074: 完全重寫，對齊後端 APP.md v4.2.0 契約
 *
 * 23 個端點，分 7 類：
 * - 商家帳號（#1-#5）
 * - 核銷碼（#6）
 * - 數據分析（#7-#8）
 * - 店家管理（#9-#14）
 * - 優惠券管理（#15-#18）⚠️ 路徑 /api/coupons
 * - 核銷記錄（#19-#20）
 * - 訂閱管理（#21-#23）
 *
 * 更新日期：2026-03-10（#074 商家後台完整重做）
 */
import { ApiBase } from './base';
import type {
  MerchantMeResponse,
  MerchantApplyRequest,
  MerchantApplyResponse,
  MerchantApplicationStatusResponse,
  MerchantPermissionsResponse,
  DeleteMerchantAccountRequest,
  MerchantDailyCode,
  MerchantAnalytics,
  MerchantAnalyticsSummary,
  AnalyticsPeriod,
  PlaceSearchResponse,
  ResolveUrlResponse,
  MerchantPlacesResponse,
  ClaimPlaceRequest,
  ClaimPlaceResponse,
  NewPlaceRequest,
  NewPlaceResponse,
  UpdatePlaceRequest,
  UpdatePlaceResponse,
  MerchantCouponsResponse,
  CreateCouponRequest,
  CreateCouponResponse,
  UpdateCouponRequest,
  UpdateCouponResponse,
  DeleteCouponResponse,
  RedemptionHistoryResponse,
  RedemptionHistoryParams,
  RedemptionStatsResponse,
  MerchantSubscription,
  CheckoutRequest,
  CheckoutResponse,
  CancelSubscriptionRequest,
  CancelSubscriptionResponse,
} from '../types/merchant';

class MerchantApiService extends ApiBase {

  // ========== 商家帳號（#1-#5） ==========

  /** #1: 取得商家資料 */
  async getMerchantMe(token: string): Promise<MerchantMeResponse> {
    return this.request<MerchantMeResponse>('/api/merchant/me', {
      headers: this.authHeaders(token),
    });
  }

  /** #2: 提交商家申請 */
  async applyMerchant(token: string, data: MerchantApplyRequest): Promise<MerchantApplyResponse> {
    return this.request<MerchantApplyResponse>('/api/merchant/apply', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify(data),
    });
  }

  /** #3: 查詢申請狀態 */
  async getApplicationStatus(token: string): Promise<MerchantApplicationStatusResponse> {
    return this.request<MerchantApplicationStatusResponse>('/api/merchant/application-status', {
      headers: this.authHeaders(token),
    });
  }

  /** #4: 取得權限與方案資訊（需審核通過） */
  async getMerchantPermissions(token: string): Promise<MerchantPermissionsResponse> {
    return this.request<MerchantPermissionsResponse>('/api/merchant/permissions', {
      headers: this.authHeaders(token),
    });
  }

  /** #5: 刪除（停用）帳號 */
  async deleteMerchantAccount(token: string, data?: DeleteMerchantAccountRequest): Promise<{ success: true; message: string }> {
    return this.request('/api/merchant/account', {
      method: 'DELETE',
      headers: this.authHeaders(token),
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // ========== 核銷碼（#6） ==========

  /** #6: 取得今日核銷碼（需審核通過） */
  async getDailyCode(token: string): Promise<MerchantDailyCode> {
    return this.request<MerchantDailyCode>('/api/merchant/daily-code', {
      headers: this.authHeaders(token),
    });
  }

  // ========== 數據分析（#7-#8） ==========

  /** #7: 數據分析（需審核通過 + Pro 以上） */
  async getAnalytics(
    token: string,
    params?: { period?: AnalyticsPeriod; placeId?: number },
  ): Promise<MerchantAnalytics> {
    const searchParams = new URLSearchParams();
    if (params?.period) searchParams.append('period', params.period);
    if (params?.placeId) searchParams.append('placeId', params.placeId.toString());

    const query = searchParams.toString();
    const url = query ? `/api/merchant/analytics?${query}` : '/api/merchant/analytics';

    return this.request<MerchantAnalytics>(url, {
      headers: this.authHeaders(token),
    });
  }

  /** #8: 數據摘要（首頁卡片用，需 Pro 以上） */
  async getAnalyticsSummary(token: string): Promise<MerchantAnalyticsSummary> {
    return this.request<MerchantAnalyticsSummary>('/api/merchant/analytics/summary', {
      headers: this.authHeaders(token),
    });
  }

  // ========== 店家管理（#9-#14） ==========

  /** #9: 搜尋可認領景點（登入即可） */
  async searchPlaces(
    token: string,
    params: { query: string; district?: string; city?: string },
  ): Promise<PlaceSearchResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append('query', params.query);
    if (params.district) searchParams.append('district', params.district);
    if (params.city) searchParams.append('city', params.city);

    return this.request<PlaceSearchResponse>(
      `/api/merchant/places/search?${searchParams.toString()}`,
      { headers: this.authHeaders(token) },
    );
  }

  /** #10: 解析 Google Maps 連結（登入即可） */
  async resolveGoogleMapsUrl(token: string, url: string): Promise<ResolveUrlResponse> {
    return this.request<ResolveUrlResponse>('/api/merchant/places/resolve-url', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify({ url }),
    });
  }

  /** #11: 取得已認領景點列表（需審核通過） */
  async getMerchantPlaces(token: string): Promise<MerchantPlacesResponse> {
    return this.request<MerchantPlacesResponse>('/api/merchant/places', {
      headers: this.authHeaders(token),
    });
  }

  /** #12: 認領現有景點（需審核通過） */
  async claimPlace(token: string, data: ClaimPlaceRequest): Promise<ClaimPlaceResponse> {
    return this.request<ClaimPlaceResponse>('/api/merchant/places/claim', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify(data),
    });
  }

  /** #13: 手動新增自有景點（需審核通過） */
  async createNewPlace(token: string, data: NewPlaceRequest): Promise<NewPlaceResponse> {
    return this.request<NewPlaceResponse>('/api/merchant/places/new', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify(data),
    });
  }

  /** #14: 更新景點資訊（需審核通過 + 屬於自己） */
  async updatePlace(token: string, linkId: number, data: UpdatePlaceRequest): Promise<UpdatePlaceResponse> {
    return this.request<UpdatePlaceResponse>(`/api/merchant/places/${linkId}`, {
      method: 'PUT',
      headers: this.authHeaders(token),
      body: JSON.stringify(data),
    });
  }

  // ========== 優惠券管理（#15-#18）⚠️ 路徑 /api/coupons ==========

  /** #15: 取得商家優惠券列表（需審核通過） */
  async getMerchantCoupons(token: string, merchantId: number): Promise<MerchantCouponsResponse> {
    return this.request<MerchantCouponsResponse>(`/api/coupons/merchant/${merchantId}`, {
      headers: this.authHeaders(token),
    });
  }

  /** #16: 建立優惠券（需審核通過） */
  async createCoupon(token: string, data: CreateCouponRequest): Promise<CreateCouponResponse> {
    return this.request<CreateCouponResponse>('/api/coupons', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify(data),
    });
  }

  /** #17: 更新優惠券（⚠️ PATCH，不是 PUT） */
  async updateCoupon(token: string, couponId: number, data: UpdateCouponRequest): Promise<UpdateCouponResponse> {
    return this.request<UpdateCouponResponse>(`/api/coupons/${couponId}`, {
      method: 'PATCH',
      headers: this.authHeaders(token),
      body: JSON.stringify(data),
    });
  }

  /** #18: 刪除優惠券（軟刪除） */
  async deleteCoupon(token: string, couponId: number): Promise<DeleteCouponResponse> {
    return this.request<DeleteCouponResponse>(`/api/coupons/${couponId}`, {
      method: 'DELETE',
      headers: this.authHeaders(token),
    });
  }

  // ========== 核銷記錄（#19-#20） ==========

  /** #19: 核銷歷史列表（需審核通過） */
  async getRedemptionHistory(token: string, params?: RedemptionHistoryParams): Promise<RedemptionHistoryResponse> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());

    const query = searchParams.toString();
    const url = query ? `/api/merchant/redemption-history?${query}` : '/api/merchant/redemption-history';

    return this.request<RedemptionHistoryResponse>(url, {
      headers: this.authHeaders(token),
    });
  }

  /** #20: 核銷統計（需審核通過） */
  async getRedemptionStats(token: string): Promise<RedemptionStatsResponse> {
    return this.request<RedemptionStatsResponse>('/api/merchant/redemption-history/stats', {
      headers: this.authHeaders(token),
    });
  }

  // ========== 訂閱管理（#21-#23） ==========

  /** #21: 取得訂閱狀態（需審核通過） */
  async getSubscription(token: string): Promise<MerchantSubscription> {
    return this.request<MerchantSubscription>('/api/merchant/subscription', {
      headers: this.authHeaders(token),
    });
  }

  /** #22: 建立結帳（需審核通過 + 已綁定 Google/Apple） */
  async createCheckout(token: string, data: CheckoutRequest): Promise<CheckoutResponse> {
    return this.request<CheckoutResponse>('/api/merchant/subscription/checkout', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify(data),
    });
  }

  /** #23: 取消訂閱（需審核通過） */
  async cancelSubscription(token: string, data: CancelSubscriptionRequest): Promise<CancelSubscriptionResponse> {
    return this.request<CancelSubscriptionResponse>('/api/merchant/subscription/cancel', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify(data),
    });
  }
}

export const merchantApi = new MerchantApiService();
