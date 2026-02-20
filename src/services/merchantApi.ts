/**
 * 商家相關 API 服務
 *
 * 處理商家儀表板、優惠券管理、地點認領、產品管理、金流等功能
 *
 * @module services/merchantApi
 * @see 後端契約: contracts/APP.md
 *
 * ============ 串接端點 ============
 * 基本資訊：
 * - GET  /api/merchant/me                - 取得商家資訊
 * - POST /api/merchant/register          - 註冊商家
 * - POST /api/merchant/apply             - 申請商家
 * - POST /api/merchant/verify            - 驗證商家碼
 *
 * 數據分析：
 * - GET  /api/merchant/analytics         - 取得分析數據
 *
 * 金流：
 * - GET  /api/merchant/daily-code        - 取得每日核銷碼
 * - GET  /api/merchant/credits           - 取得點數餘額
 * - POST /api/merchant/credits/purchase  - 購買點數
 * - GET  /api/merchant/transactions      - 取得交易記錄
 * - GET  /api/merchant/redemption-code   - 取得核銷碼
 *
 * 優惠券 CRUD：
 * - GET    /api/merchant/coupons         - 取得優惠券列表
 * - POST   /api/merchant/coupons         - 建立優惠券
 * - PUT    /api/merchant/coupons/:id     - 更新優惠券
 * - DELETE /api/merchant/coupons/:id     - 刪除優惠券
 *
 * 地點管理：
 * - GET  /api/merchant/places/search     - 搜尋可認領地點
 * - POST /api/merchant/places/claim      - 認領地點
 * - GET  /api/merchant/places            - 取得已認領地點
 * - PUT  /api/merchant/places/:id        - 更新地點資訊
 *
 * 產品管理：
 * - GET    /api/merchant/products        - 取得產品列表
 * - POST   /api/merchant/products        - 建立產品
 * - PUT    /api/merchant/products/:id    - 更新產品
 * - DELETE /api/merchant/products/:id    - 刪除產品
 */
import { ApiBase } from './base';
import {
  MerchantMe,
  MerchantDailyCode,
  MerchantCredits,
  MerchantTransaction,
  MerchantPlace,
  MerchantProduct,
  PlaceSearchResult,
  MerchantApplyParams,
  MerchantApplyResponse,
  MerchantApplicationStatusResponse,
  MerchantAnalytics,
  MerchantCoupon,
  MerchantCouponsResponse,
  CreateMerchantCouponParams,
  UpdateMerchantCouponParams,
  UpdateMerchantPlaceParams,
  MerchantRedemptionCode,
  AnalyticsPeriod
} from '../types';

// ============ API 服務類別 ============

/**
 * 商家 API 服務類別
 *
 * 提供商家後台所需的所有功能
 */
class MerchantApiService extends ApiBase {

  // ============ 基本資訊 ============

  /**
   * 取得商家資訊
   *
   * @param token - JWT Token
   * @returns 商家詳細資料
   */
  async getMerchantMe(token: string): Promise<MerchantMe> {
    return this.request<MerchantMe>('/api/merchant/me', {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 註冊商家
   *
   * 快速註冊成為商家
   *
   * @param token - JWT Token
   * @param params - 註冊資料
   * @returns 新建立的商家資料
   */
  async registerMerchant(token: string, params: {
    businessName: string;
    contactEmail?: string;
  }): Promise<{ merchant: MerchantMe }> {
    return this.request('/api/merchant/register', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify(params),
    });
  }

  /**
   * 申請商家
   *
   * 提交完整的商家申請資料，需要審核
   *
   * @param token - JWT Token
   * @param params - 申請資料
   * @returns 申請結果
   */
  async applyMerchant(token: string, params: MerchantApplyParams): Promise<MerchantApplyResponse> {
    return this.request('/api/merchant/apply', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify(params),
    });
  }

  /**
   * 查詢商家申請狀態
   * #053: 新增端點
   *
   * @param token - JWT Token
   * @returns 申請狀態與詳情
   */
  async getMerchantApplicationStatus(token: string): Promise<MerchantApplicationStatusResponse> {
    return this.request<MerchantApplicationStatusResponse>('/api/merchant/application-status', {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 驗證商家碼
   *
   * @param token - JWT Token
   * @param merchantId - 商家 ID
   * @param code - 商家驗證碼
   * @returns 驗證結果
   */
  async verifyMerchantCode(token: string, merchantId: number, code: string): Promise<{ valid: boolean; merchant?: MerchantMe; error?: string }> {
    return this.request('/api/merchant/verify', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify({ merchantId, code }),
    });
  }

  // ============ 數據分析 ============

  /**
   * 取得商家分析數據
   *
   * 包含曝光數、點擊數、核銷數等統計
   *
   * @param token - JWT Token
   * @param options - 查詢選項
   * @param options.period - 時間區間
   * @param options.placeId - 指定地點（可選）
   * @returns 分析數據
   */
  async getMerchantAnalytics(
    token: string,
    options?: { period?: AnalyticsPeriod; placeId?: number }
  ): Promise<MerchantAnalytics> {
    // 組裝查詢參數
    const params = new URLSearchParams();
    if (options?.period) params.append('period', options.period);
    if (options?.placeId) params.append('placeId', options.placeId.toString());

    const queryString = params.toString();
    const url = queryString
      ? `/api/merchant/analytics?${queryString}`
      : '/api/merchant/analytics';

    return this.request(url, {
      headers: this.authHeaders(token),
    });
  }

  // ============ 金流 ============

  /**
   * 取得每日核銷碼
   *
   * 商家用於核銷用戶優惠券的每日驗證碼
   * 每天更換一次
   *
   * @param token - JWT Token
   * @returns 今日核銷碼
   */
  async getMerchantDailyCode(token: string): Promise<MerchantDailyCode> {
    return this.request<MerchantDailyCode>('/api/merchant/daily-code', {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 取得商家點數餘額
   *
   * @param token - JWT Token
   * @returns 點數餘額資訊
   */
  async getMerchantCredits(token: string): Promise<MerchantCredits> {
    return this.request<MerchantCredits>('/api/merchant/credits', {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 購買點數
   *
   * 商家購買廣告點數
   *
   * @param token - JWT Token
   * @param amount - 購買金額
   * @param provider - 付款方式（stripe/recur）
   * @returns 購買結果和付款連結
   */
  async purchaseCredits(token: string, amount: number, provider: 'stripe' | 'recur' = 'stripe'): Promise<{
    transactionId: number;
    amount: number;
    provider: 'stripe' | 'recur';
    checkoutUrl: string | null;
    status: string;
    message: string;
  }> {
    return this.request('/api/merchant/credits/purchase', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify({ amount, provider }),
    });
  }

  /**
   * 取得交易記錄
   *
   * @param token - JWT Token
   * @returns 交易記錄列表
   */
  async getMerchantTransactions(token: string): Promise<{ transactions: MerchantTransaction[] }> {
    return this.request('/api/merchant/transactions', {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 取得核銷碼
   *
   * @param token - JWT Token
   * @returns 核銷碼資訊
   */
  async getMerchantRedemptionCode(token: string): Promise<MerchantRedemptionCode> {
    return this.request<MerchantRedemptionCode>('/api/merchant/redemption-code', {
      headers: this.authHeaders(token),
    });
  }

  // ============ 優惠券 CRUD ============

  /**
   * 取得商家優惠券列表
   *
   * @param token - JWT Token
   * @returns 優惠券列表
   */
  async getMerchantCoupons(token: string): Promise<MerchantCouponsResponse> {
    return this.request('/api/merchant/coupons', {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 建立商家優惠券
   *
   * @param token - JWT Token
   * @param params - 優惠券資料
   * @returns 新建立的優惠券
   */
  async createMerchantCoupon(token: string, params: CreateMerchantCouponParams): Promise<{ success: boolean; coupon: MerchantCoupon }> {
    return this.request('/api/merchant/coupons', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify(params),
    });
  }

  /**
   * 更新商家優惠券
   *
   * @param token - JWT Token
   * @param couponId - 優惠券 ID
   * @param params - 要更新的欄位
   * @returns 更新後的優惠券
   */
  async updateMerchantCoupon(token: string, couponId: number, params: UpdateMerchantCouponParams): Promise<{ success: boolean; coupon: MerchantCoupon }> {
    return this.request(`/api/merchant/coupons/${couponId}`, {
      method: 'PUT',
      headers: this.authHeaders(token),
      body: JSON.stringify(params),
    });
  }

  /**
   * 刪除商家優惠券
   *
   * @param token - JWT Token
   * @param couponId - 優惠券 ID
   * @returns 刪除結果
   */
  async deleteMerchantCoupon(token: string, couponId: number): Promise<{ success: boolean }> {
    return this.request(`/api/merchant/coupons/${couponId}`, {
      method: 'DELETE',
      headers: this.authHeaders(token),
    });
  }

  // ============ 地點管理 ============

  /**
   * 搜尋可認領地點
   *
   * 商家搜尋尚未被認領的景點
   *
   * @param token - JWT Token
   * @param query - 搜尋關鍵字
   * @returns 搜尋結果
   */
  async searchMerchantPlaces(token: string, query: string): Promise<{ places: PlaceSearchResult[] }> {
    // 改用 this.request() 統一走 base.ts（含超時機制）
    // 401 會拋出 ApiError { status: 401 }，caller 改用 error.status === 401 判斷
    return this.request<{ places: PlaceSearchResult[] }>(
      `/api/merchant/places/search?query=${encodeURIComponent(query)}`,
      {
        headers: this.authHeaders(token),
      }
    );
  }

  /**
   * 認領地點
   *
   * 商家認領一個景點為自己的店面
   *
   * @param token - JWT Token
   * @param place - 地點資訊
   * @returns 認領結果
   */
  async claimMerchantPlace(token: string, place: {
    placeName: string;
    district?: string;
    city?: string;
    country?: string;
    placeCacheId?: string;
    googlePlaceId?: string;
  }): Promise<{ place: MerchantPlace }> {
    // 組裝請求資料，填入預設值
    const requestBody = {
      placeName: place.placeName,
      district: place.district || '',
      city: place.city || '',
      country: place.country || '台灣',
      placeCacheId: place.placeCacheId,
      googlePlaceId: place.googlePlaceId,
    };

    return this.request('/api/merchant/places/claim', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify(requestBody),
    });
  }

  /**
   * 取得已認領地點列表
   *
   * @param token - JWT Token
   * @returns 地點列表
   */
  async getMerchantPlaces(token: string): Promise<{ places: MerchantPlace[] }> {
    return this.request('/api/merchant/places', {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 更新地點資訊
   *
   * @param token - JWT Token
   * @param placeId - 地點 ID
   * @param params - 要更新的欄位
   * @returns 更新後的地點資料
   */
  async updateMerchantPlace(
    token: string,
    placeId: number,
    params: UpdateMerchantPlaceParams
  ): Promise<{ place: MerchantPlace }> {
    return this.request(`/api/merchant/places/${placeId}`, {
      method: 'PUT',
      headers: this.authHeaders(token),
      body: JSON.stringify(params),
    });
  }

  // ============ 產品管理 ============

  /**
   * 取得商家產品列表
   *
   * @param token - JWT Token
   * @returns 產品列表
   */
  async getMerchantProducts(token: string): Promise<{ products: MerchantProduct[] }> {
    return this.request('/api/merchant/products', {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 建立商家產品
   *
   * @param token - JWT Token
   * @param params - 產品資料
   * @returns 新建立的產品
   */
  async createMerchantProduct(token: string, params: {
    name: string;
    description?: string;
    price?: number;
    discountPrice?: number;
    placeId?: number;
  }): Promise<{ product: MerchantProduct }> {
    return this.request('/api/merchant/products', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify(params),
    });
  }

  /**
   * 更新商家產品
   *
   * @param token - JWT Token
   * @param productId - 產品 ID
   * @param params - 要更新的欄位
   * @returns 更新後的產品
   */
  async updateMerchantProduct(token: string, productId: number, params: Partial<MerchantProduct>): Promise<{ product: MerchantProduct }> {
    return this.request(`/api/merchant/products/${productId}`, {
      method: 'PUT',
      headers: this.authHeaders(token),
      body: JSON.stringify(params),
    });
  }

  /**
   * 刪除商家產品
   *
   * @param token - JWT Token
   * @param productId - 產品 ID
   * @returns 刪除結果
   */
  async deleteMerchantProduct(token: string, productId: number): Promise<{ success: boolean }> {
    return this.request(`/api/merchant/products/${productId}`, {
      method: 'DELETE',
      headers: this.authHeaders(token),
    });
  }
}

// ============ 匯出 ============

/** 商家 API 服務實例 */
export const merchantApi = new MerchantApiService();
