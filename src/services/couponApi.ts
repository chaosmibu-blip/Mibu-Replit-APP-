/**
 * 優惠券 API（用戶端）
 *
 * @see 後端合約: contracts/APP.md
 */
import { ApiBase } from './base';

// ========== 類型定義 ==========

export interface UserCoupon {
  id: number;
  code: string;
  title: string;
  description?: string;
  discount: {
    type: 'percentage' | 'fixed';
    value: number;
  };
  merchantId: number;
  merchantName: string;
  merchantLogo?: string;
  status: 'active' | 'used' | 'expired';
  expiresAt: string; // ISO 8601
  usedAt?: string;
  createdAt: string;
}

export interface MyCouponsResponse {
  success: boolean;
  coupons: UserCoupon[];
  total: number;
  pagination?: {
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export interface RedeemCouponParams {
  couponId: number;
  merchantCode: string; // 商家每日核銷碼
}

export interface RedeemCouponResponse {
  success: boolean;
  message: string;
  coupon: UserCoupon;
}

export interface VerifyCouponResponse {
  success: boolean;
  valid: boolean;
  coupon?: {
    id: number;
    code: string;
    title: string;
    discount: {
      type: 'percentage' | 'fixed';
      value: number;
    };
    expiresAt: string;
    status: 'active' | 'used' | 'expired';
  };
  message?: string;
}

// ========== API 服務 ==========

class CouponApiService extends ApiBase {
  /**
   * 取得我的優惠券列表
   * GET /api/coupons/my
   */
  async getMyCoupons(
    token: string,
    params?: { page?: number; limit?: number; status?: 'active' | 'used' | 'expired' }
  ): Promise<MyCouponsResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.status) query.append('status', params.status);

    const queryString = query.toString();
    const endpoint = `/api/coupons/my${queryString ? `?${queryString}` : ''}`;

    return this.request<MyCouponsResponse>(endpoint, {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 核銷優惠券
   * POST /api/coupons/redeem
   */
  async redeemCoupon(
    token: string,
    params: RedeemCouponParams
  ): Promise<RedeemCouponResponse> {
    return this.request<RedeemCouponResponse>('/api/coupons/redeem', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify(params),
    });
  }

  /**
   * 驗證優惠券有效性（商家用）
   * GET /api/coupons/verify/:code
   * @see 後端合約 #013
   */
  async verifyCoupon(
    token: string,
    code: string
  ): Promise<VerifyCouponResponse> {
    return this.request<VerifyCouponResponse>(`/api/coupons/verify/${encodeURIComponent(code)}`, {
      headers: this.authHeaders(token),
    });
  }
}

export const couponApi = new CouponApiService();
