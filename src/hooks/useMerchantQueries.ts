/**
 * ============================================================
 * 商家 Query Hooks (useMerchantQueries.ts)
 * ============================================================
 * Merchant 畫面專用（Dashboard、Profile、Analytics、Coupons、Places、Products）
 *
 * 更新日期：2026-02-12（Phase 3 統一快取策略）
 */

import { useQueryClient } from '@tanstack/react-query';
import { useAuthQuery, useAuthMutation } from './useAuthQuery';
import { merchantApi } from '../services/merchantApi';
import { AnalyticsPeriod } from '../types/merchant';

// ============ 查詢 Hooks ============

/** 商家個人資料 */
export function useMerchantMe() {
  return useAuthQuery(
    ['merchant', 'me'],
    (token) => merchantApi.getMerchantMe(token),
  );
}

/** 商家每日核銷碼 */
export function useMerchantDailyCode() {
  return useAuthQuery(
    ['merchant', 'dailyCode'],
    (token) => merchantApi.getMerchantDailyCode(token),
  );
}

/** 商家信用額度 */
export function useMerchantCredits() {
  return useAuthQuery(
    ['merchant', 'credits'],
    (token) => merchantApi.getMerchantCredits(token),
  );
}

/** 商家數據分析 */
export function useMerchantAnalytics(params?: { period?: AnalyticsPeriod; placeId?: number }) {
  return useAuthQuery(
    ['merchant', 'analytics', params ?? {}],
    (token) => merchantApi.getMerchantAnalytics(token, params),
  );
}

/** 商家交易記錄 */
export function useMerchantTransactions() {
  return useAuthQuery(
    ['merchant', 'transactions'],
    (token) => merchantApi.getMerchantTransactions(token),
  );
}

/** 商家優惠券列表 */
export function useMerchantCoupons() {
  return useAuthQuery(
    ['merchant', 'coupons'],
    (token) => merchantApi.getMerchantCoupons(token),
  );
}

/** 商家據點列表 */
export function useMerchantPlaces() {
  return useAuthQuery(
    ['merchant', 'places'],
    (token) => merchantApi.getMerchantPlaces(token),
  );
}

/** 商家商品列表 */
export function useMerchantProducts() {
  return useAuthQuery(
    ['merchant', 'products'],
    (token) => merchantApi.getMerchantProducts(token),
  );
}

// ============ Mutation Hooks ============

/** 購買信用額度 */
export function usePurchaseCredits() {
  const queryClient = useQueryClient();
  return useAuthMutation(
    (token, params: { amount: number; provider?: 'stripe' | 'recur' }) =>
      merchantApi.purchaseCredits(token, params.amount, params.provider),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['merchant', 'credits'] });
        queryClient.invalidateQueries({ queryKey: ['merchant', 'transactions'] });
      },
    },
  );
}

/** 新增優惠券 */
export function useCreateMerchantCoupon() {
  const queryClient = useQueryClient();
  return useAuthMutation(
    (token, params: any) => merchantApi.createMerchantCoupon(token, params),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['merchant', 'coupons'] });
      },
    },
  );
}

/** 更新優惠券 */
export function useUpdateMerchantCoupon() {
  const queryClient = useQueryClient();
  return useAuthMutation(
    (token, params: { couponId: number; data: any }) =>
      merchantApi.updateMerchantCoupon(token, params.couponId, params.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['merchant', 'coupons'] });
      },
    },
  );
}

/** 刪除優惠券 */
export function useDeleteMerchantCoupon() {
  const queryClient = useQueryClient();
  return useAuthMutation(
    (token, couponId: number) => merchantApi.deleteMerchantCoupon(token, couponId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['merchant', 'coupons'] });
      },
    },
  );
}

/** 搜尋據點 */
export function useSearchMerchantPlaces() {
  return useAuthMutation(
    (token, query: string) => merchantApi.searchMerchantPlaces(token, query),
  );
}

/** 認領據點 */
export function useClaimMerchantPlace() {
  const queryClient = useQueryClient();
  return useAuthMutation(
    (token, place: { placeName: string; district?: string; city?: string; category?: string }) =>
      merchantApi.claimMerchantPlace(token, place),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['merchant', 'places'] });
      },
    },
  );
}

/** 更新據點 */
export function useUpdateMerchantPlace() {
  const queryClient = useQueryClient();
  return useAuthMutation(
    (token, params: { placeId: number; data: any }) =>
      merchantApi.updateMerchantPlace(token, params.placeId, params.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['merchant', 'places'] });
      },
    },
  );
}

/** 新增商品 */
export function useCreateMerchantProduct() {
  const queryClient = useQueryClient();
  return useAuthMutation(
    (token, params: any) => merchantApi.createMerchantProduct(token, params),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['merchant', 'products'] });
      },
    },
  );
}

/** 更新商品 */
export function useUpdateMerchantProduct() {
  const queryClient = useQueryClient();
  return useAuthMutation(
    (token, params: { productId: number; data: any }) =>
      merchantApi.updateMerchantProduct(token, params.productId, params.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['merchant', 'products'] });
      },
    },
  );
}

/** 刪除商品 */
export function useDeleteMerchantProduct() {
  const queryClient = useQueryClient();
  return useAuthMutation(
    (token, productId: number) => merchantApi.deleteMerchantProduct(token, productId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['merchant', 'products'] });
      },
    },
  );
}

/** 驗證商家碼 */
export function useVerifyMerchantCode() {
  return useAuthMutation(
    (token, params: { merchantId: number; code: string }) =>
      merchantApi.verifyMerchantCode(token, params.merchantId, params.code),
  );
}
