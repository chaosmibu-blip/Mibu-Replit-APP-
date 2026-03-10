/**
 * ============================================================
 * 商家 Query Hooks (useMerchantQueries.ts)
 * ============================================================
 * Merchant 畫面專用（Dashboard、Profile、Analytics、Coupons、Places）
 *
 * 更新日期：2026-03-09（移除後端不存在的端點：credits、transactions、products）
 */

import { useQueryClient } from '@tanstack/react-query';
import { useAuthQuery, useAuthMutation } from './useAuthQuery';
import { merchantApi } from '../services/merchantApi';
import { AnalyticsPeriod } from '../types/merchant';

// ============ 查詢 Hooks ============

/** 商家個人資料（含 status 審核狀態） */
export function useMerchantMe() {
  return useAuthQuery(
    ['merchant', 'me'],
    (token) => merchantApi.getMerchantMe(token),
  );
}

/** 商家每日核銷碼（需 approved 狀態才呼叫） */
export function useMerchantDailyCode(options?: { enabled?: boolean }) {
  return useAuthQuery(
    ['merchant', 'dailyCode'],
    (token) => merchantApi.getMerchantDailyCode(token),
    { enabled: options?.enabled ?? true },
  );
}

/** 商家數據分析 */
export function useMerchantAnalytics(params?: { period?: AnalyticsPeriod; placeId?: number }) {
  return useAuthQuery(
    ['merchant', 'analytics', params ?? {}],
    (token) => merchantApi.getMerchantAnalytics(token, params),
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

// ============ Mutation Hooks ============

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

/** 驗證商家碼 */
export function useVerifyMerchantCode() {
  return useAuthMutation(
    (token, params: { merchantId: number; code: string }) =>
      merchantApi.verifyMerchantCode(token, params.merchantId, params.code),
  );
}

// ============ 商家申請（#053 新增） ============

/** 查詢商家申請狀態 */
export function useMerchantApplicationStatus() {
  return useAuthQuery(
    ['merchant', 'applicationStatus'],
    (token) => merchantApi.getMerchantApplicationStatus(token),
  );
}

/** 提交商家申請（#070: 含店家綁定欄位） */
export function useApplyMerchant() {
  const queryClient = useQueryClient();
  return useAuthMutation(
    (token, params: {
      businessName: string;
      email: string;
      surveyResponses?: Record<string, unknown>;
      claimedPlaceId?: number;
      claimedGooglePlaceId?: string;
      claimedGoogleMapsUrl?: string;
      claimedPlaceName?: string;
      claimedPlaceData?: Record<string, unknown>;
    }) =>
      merchantApi.applyMerchant(token, params),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['merchant', 'applicationStatus'] });
      },
    },
  );
}

// ============ #070 Google Maps 連結解析 ============

/** 解析 Google Maps 連結取得景點資料 */
export function useResolveGoogleMapsUrl() {
  return useAuthMutation(
    (token, url: string) => merchantApi.resolveGoogleMapsUrl(token, url),
  );
}
