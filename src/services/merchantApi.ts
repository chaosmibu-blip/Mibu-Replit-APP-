/**
 * 商家相關 API - 儀表板、優惠券、地點、產品、金流
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
  MerchantAnalytics,
  MerchantCoupon,
  MerchantCouponsResponse,
  CreateMerchantCouponParams,
  UpdateMerchantCouponParams,
  MerchantRedemptionCode
} from '../types';

class MerchantApiService extends ApiBase {
  // === 基本資訊 ===
  async getMerchantMe(token: string): Promise<MerchantMe> {
    return this.request<MerchantMe>('/api/merchant/me', {
      headers: this.authHeaders(token),
    });
  }

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

  async applyMerchant(token: string, params: MerchantApplyParams): Promise<MerchantApplyResponse> {
    return this.request('/api/merchant/apply', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify(params),
    });
  }

  async verifyMerchantCode(token: string, merchantId: number, code: string): Promise<{ valid: boolean; merchant?: any; error?: string }> {
    return this.request('/api/merchant/verify', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify({ merchantId, code }),
    });
  }

  // === 數據分析 ===
  async getMerchantAnalytics(token: string): Promise<MerchantAnalytics> {
    return this.request('/api/merchant/analytics', {
      headers: this.authHeaders(token),
    });
  }

  // === 金流 ===
  async getMerchantDailyCode(token: string): Promise<MerchantDailyCode> {
    return this.request<MerchantDailyCode>('/api/merchant/daily-code', {
      headers: this.authHeaders(token),
    });
  }

  async getMerchantCredits(token: string): Promise<MerchantCredits> {
    return this.request<MerchantCredits>('/api/merchant/credits', {
      headers: this.authHeaders(token),
    });
  }

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

  async getMerchantTransactions(token: string): Promise<{ transactions: MerchantTransaction[] }> {
    return this.request('/api/merchant/transactions', {
      headers: this.authHeaders(token),
    });
  }

  async getMerchantRedemptionCode(token: string): Promise<MerchantRedemptionCode> {
    return this.request<MerchantRedemptionCode>('/api/merchant/redemption-code', {
      headers: this.authHeaders(token),
    });
  }

  // === 優惠券 CRUD ===
  async getMerchantCoupons(token: string): Promise<MerchantCouponsResponse> {
    return this.request('/api/merchant/coupons', {
      headers: this.authHeaders(token),
    });
  }

  async createMerchantCoupon(token: string, params: CreateMerchantCouponParams): Promise<{ success: boolean; coupon: MerchantCoupon }> {
    return this.request('/api/merchant/coupons', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify(params),
    });
  }

  async updateMerchantCoupon(token: string, couponId: number, params: UpdateMerchantCouponParams): Promise<{ success: boolean; coupon: MerchantCoupon }> {
    return this.request(`/api/merchant/coupons/${couponId}`, {
      method: 'PUT',
      headers: this.authHeaders(token),
      body: JSON.stringify(params),
    });
  }

  async deleteMerchantCoupon(token: string, couponId: number): Promise<{ success: boolean }> {
    return this.request(`/api/merchant/coupons/${couponId}`, {
      method: 'DELETE',
      headers: this.authHeaders(token),
    });
  }

  // === 地點管理 ===
  async searchMerchantPlaces(token: string, query: string): Promise<{ places: PlaceSearchResult[] }> {
    const response = await fetch(`${this.baseUrl}/api/merchant/places/search?query=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      throw new Error('UNAUTHORIZED');
    }

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }

  async claimMerchantPlace(token: string, place: {
    placeName: string;
    district?: string;
    city?: string;
    country?: string;
    placeCacheId?: string;
    googlePlaceId?: string;
  }): Promise<{ place: MerchantPlace }> {
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

  async getMerchantPlaces(token: string): Promise<{ places: MerchantPlace[] }> {
    return this.request('/api/merchant/places', {
      headers: this.authHeaders(token),
    });
  }

  async updateMerchantPlace(token: string, linkId: string, params: Partial<MerchantPlace>): Promise<{ place: MerchantPlace }> {
    return this.request(`/api/merchant/places/${linkId}`, {
      method: 'PUT',
      headers: this.authHeaders(token),
      body: JSON.stringify(params),
    });
  }

  // === 產品管理 ===
  async getMerchantProducts(token: string): Promise<{ products: MerchantProduct[] }> {
    return this.request('/api/merchant/products', {
      headers: this.authHeaders(token),
    });
  }

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

  async updateMerchantProduct(token: string, productId: number, params: Partial<MerchantProduct>): Promise<{ product: MerchantProduct }> {
    return this.request(`/api/merchant/products/${productId}`, {
      method: 'PUT',
      headers: this.authHeaders(token),
      body: JSON.stringify(params),
    });
  }

  async deleteMerchantProduct(token: string, productId: number): Promise<{ success: boolean }> {
    return this.request(`/api/merchant/products/${productId}`, {
      method: 'DELETE',
      headers: this.authHeaders(token),
    });
  }
}

export const merchantApi = new MerchantApiService();
