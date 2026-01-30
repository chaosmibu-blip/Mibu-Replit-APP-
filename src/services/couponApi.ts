/**
 * 優惠券 API 服務（用戶端）
 *
 * 處理用戶的優惠券管理、核銷、驗證等功能
 *
 * @module services/couponApi
 * @see 後端契約: contracts/APP.md
 *
 * ============ 串接端點 ============
 * - GET  /api/coupons/my              - 取得我的優惠券列表
 * - POST /api/coupons/redeem          - 核銷優惠券
 * - GET  /api/coupons/verify/:code    - 驗證優惠券有效性 (#013)
 */
import { ApiBase } from './base';

// ============ 類型定義 ============

/**
 * 用戶優惠券資料
 */
export interface UserCoupon {
  /** 優惠券 ID */
  id: number;
  /** 優惠券碼 */
  code: string;
  /** 優惠券標題 */
  title: string;
  /** 優惠券說明 */
  description?: string;
  /** 折扣資訊 */
  discount: {
    /** 折扣類型（百分比/固定金額） */
    type: 'percentage' | 'fixed';
    /** 折扣值 */
    value: number;
  };
  /** 商家 ID */
  merchantId: number;
  /** 商家名稱 */
  merchantName: string;
  /** 商家 Logo */
  merchantLogo?: string;
  /** 優惠券狀態 */
  status: 'active' | 'used' | 'expired';
  /** 到期時間（ISO 8601） */
  expiresAt: string;
  /** 使用時間（ISO 8601） */
  usedAt?: string;
  /** 建立時間（ISO 8601） */
  createdAt: string;
}

/**
 * 我的優惠券列表回應
 */
export interface MyCouponsResponse {
  /** 操作是否成功 */
  success: boolean;
  /** 優惠券列表 */
  coupons: UserCoupon[];
  /** 總數量 */
  total: number;
  /** 分頁資訊 */
  pagination?: {
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

/**
 * 核銷優惠券參數
 */
export interface RedeemCouponParams {
  /** 優惠券 ID */
  couponId: number;
  /** 商家每日核銷碼 */
  merchantCode: string;
}

/**
 * 核銷優惠券回應
 */
export interface RedeemCouponResponse {
  /** 操作是否成功 */
  success: boolean;
  /** 回應訊息 */
  message: string;
  /** 核銷後的優惠券資料 */
  coupon: UserCoupon;
}

/**
 * 驗證優惠券回應
 */
export interface VerifyCouponResponse {
  /** 操作是否成功 */
  success: boolean;
  /** 優惠券是否有效 */
  valid: boolean;
  /** 優惠券資料（若有效） */
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
  /** 錯誤訊息（若無效） */
  message?: string;
}

// ============ API 服務類別 ============

/**
 * 優惠券 API 服務類別
 *
 * 處理用戶端的優惠券操作
 */
class CouponApiService extends ApiBase {

  /**
   * 取得我的優惠券列表
   *
   * #030: 後端回傳 { coupons, total, pagination }，沒有 success 欄位
   *
   * @param token - JWT Token
   * @param params - 查詢參數
   * @param params.page - 頁碼
   * @param params.limit - 每頁數量
   * @param params.status - 狀態篩選
   * @returns 優惠券列表
   */
  async getMyCoupons(
    token: string,
    params?: { page?: number; limit?: number; status?: 'active' | 'used' | 'expired' }
  ): Promise<MyCouponsResponse> {
    // 組裝查詢參數
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.status) query.append('status', params.status);

    const queryString = query.toString();
    const endpoint = `/api/coupons/my${queryString ? `?${queryString}` : ''}`;

    try {
      const data = await this.request<{
        coupons: UserCoupon[];
        total: number;
        pagination?: { page: number; limit: number; hasMore: boolean };
      }>(endpoint, {
        headers: this.authHeaders(token),
      });

      // 後端沒有 success 欄位，HTTP 200 就是成功
      return {
        success: true,
        coupons: data.coupons || [],
        total: data.total || 0,
        pagination: data.pagination,
      };
    } catch (error) {
      console.error('[CouponApi] getMyCoupons error:', error);
      return { success: false, coupons: [], total: 0 };
    }
  }

  /**
   * 核銷優惠券
   *
   * 用戶到店消費時，使用優惠券
   *
   * @param token - JWT Token
   * @param params - 核銷參數
   * @param params.couponId - 優惠券 ID
   * @param params.merchantCode - 商家每日核銷碼
   * @returns 核銷結果
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
   * 驗證優惠券有效性
   *
   * 商家用於驗證用戶提供的優惠券是否有效
   * @see 後端契約 #013
   *
   * #030: 後端回傳 { valid, coupon?, message? }，沒有 success 欄位
   *
   * @param token - JWT Token
   * @param code - 優惠券碼
   * @returns 驗證結果
   */
  async verifyCoupon(
    token: string,
    code: string
  ): Promise<VerifyCouponResponse> {
    try {
      const data = await this.request<{
        valid: boolean;
        coupon?: VerifyCouponResponse['coupon'];
        message?: string;
      }>(`/api/coupons/verify/${encodeURIComponent(code)}`, {
        headers: this.authHeaders(token),
      });

      // 後端沒有 success 欄位，HTTP 200 就是成功
      return {
        success: true,
        valid: data.valid,
        coupon: data.coupon,
        message: data.message,
      };
    } catch (error) {
      console.error('[CouponApi] verifyCoupon error:', error);
      return { success: false, valid: false, message: 'Verification failed' };
    }
  }
}

// ============ 匯出 ============

/** 優惠券 API 服務實例 */
export const couponApi = new CouponApiService();
