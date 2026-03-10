/**
 * ============================================================
 * 商家 Query Hooks (useMerchantQueries.ts)
 * ============================================================
 * #074: 完全重寫，對齊後端 APP.md v4.2.0 契約
 *
 * Query Hooks（GET）：11 個
 * Mutation Hooks（POST/PUT/PATCH/DELETE）：12 個
 *
 * 更新日期：2026-03-10（#074 商家後台完整重做）
 */

import { useQueryClient } from '@tanstack/react-query';
import { useAuthQuery, useAuthMutation } from './useAuthQuery';
import { merchantApi } from '../services/merchantApi';
import type {
  AnalyticsPeriod,
  MerchantApplyRequest,
  ClaimPlaceRequest,
  NewPlaceRequest,
  UpdatePlaceRequest,
  CreateCouponRequest,
  UpdateCouponRequest,
  CheckoutRequest,
  CancelSubscriptionRequest,
  DeleteMerchantAccountRequest,
  RedemptionHistoryParams,
  MerchantErrorType,
} from '../types/merchant';
import { ApiError } from '../services/base';

// ========== Query Keys ==========

export const merchantKeys = {
  me: ['merchant', 'me'] as const,
  applicationStatus: ['merchant', 'applicationStatus'] as const,
  permissions: ['merchant', 'permissions'] as const,
  dailyCode: ['merchant', 'dailyCode'] as const,
  analytics: (period?: AnalyticsPeriod, placeId?: number) =>
    ['merchant', 'analytics', { period, placeId }] as const,
  analyticsSummary: ['merchant', 'analyticsSummary'] as const,
  places: ['merchant', 'places'] as const,
  coupons: (merchantId?: number) => ['merchant', 'coupons', merchantId] as const,
  redemptionHistory: (params?: RedemptionHistoryParams) =>
    ['merchant', 'redemptionHistory', params] as const,
  redemptionStats: ['merchant', 'redemptionStats'] as const,
  subscription: ['merchant', 'subscription'] as const,
} as const;

// ========== 403 錯誤分類 ==========

export function classifyMerchantError(error: unknown): MerchantErrorType {
  if (!(error instanceof ApiError) || error.status !== 403) return 'unknown';

  const msg = error.serverMessage || '';
  const code = error.code || '';

  if (msg.includes('尚未通過審核') || msg.includes('未審核')) return 'not_approved';
  if (msg.includes('升級至 Pro') || msg.includes('升級')) return 'upgrade_required';
  if (code === 'E4009') return 'place_limit';
  if (code === 'E4010') return 'coupon_limit';

  return 'unknown';
}

// ========== Query Hooks ==========

/** 商家資料 */
export function useMerchantMe() {
  return useAuthQuery(
    merchantKeys.me,
    (token) => merchantApi.getMerchantMe(token),
  );
}

/** 申請狀態 */
export function useMerchantApplicationStatus() {
  return useAuthQuery(
    merchantKeys.applicationStatus,
    (token) => merchantApi.getApplicationStatus(token),
  );
}

/** 權限與方案資訊（approved 才啟用） */
export function useMerchantPermissions(enabled = true) {
  return useAuthQuery(
    merchantKeys.permissions,
    (token) => merchantApi.getMerchantPermissions(token),
    { enabled },
  );
}

/** 今日核銷碼（approved 才啟用） */
export function useMerchantDailyCode(enabled = true) {
  return useAuthQuery(
    merchantKeys.dailyCode,
    (token) => merchantApi.getDailyCode(token),
    { enabled },
  );
}

/** 數據分析（approved + Pro 以上） */
export function useMerchantAnalytics(
  params?: { period?: AnalyticsPeriod; placeId?: number },
  enabled = true,
) {
  return useAuthQuery(
    merchantKeys.analytics(params?.period, params?.placeId),
    (token) => merchantApi.getAnalytics(token, params),
    { enabled },
  );
}

/** 數據摘要（approved + Pro 以上） */
export function useMerchantAnalyticsSummary(enabled = true) {
  return useAuthQuery(
    merchantKeys.analyticsSummary,
    (token) => merchantApi.getAnalyticsSummary(token),
    { enabled },
  );
}

/** 已認領景點列表（approved 才啟用） */
export function useMerchantPlaces(enabled = true) {
  return useAuthQuery(
    merchantKeys.places,
    (token) => merchantApi.getMerchantPlaces(token),
    { enabled },
  );
}

/** 優惠券列表（approved 才啟用，需 merchantId） */
export function useMerchantCoupons(merchantId: number | undefined, enabled = true) {
  return useAuthQuery(
    merchantKeys.coupons(merchantId),
    (token) => merchantApi.getMerchantCoupons(token, merchantId!),
    { enabled: enabled && !!merchantId },
  );
}

/** 核銷歷史（approved 才啟用） */
export function useRedemptionHistory(params?: RedemptionHistoryParams, enabled = true) {
  return useAuthQuery(
    merchantKeys.redemptionHistory(params),
    (token) => merchantApi.getRedemptionHistory(token, params),
    { enabled },
  );
}

/** 核銷統計（approved 才啟用） */
export function useRedemptionStats(enabled = true) {
  return useAuthQuery(
    merchantKeys.redemptionStats,
    (token) => merchantApi.getRedemptionStats(token),
    { enabled },
  );
}

/** 訂閱狀態（approved 才啟用） */
export function useMerchantSubscription(enabled = true) {
  return useAuthQuery(
    merchantKeys.subscription,
    (token) => merchantApi.getSubscription(token),
    { enabled },
  );
}

// ========== Mutation Hooks ==========

/** 提交商家申請 */
export function useApplyMerchant() {
  const queryClient = useQueryClient();
  return useAuthMutation(
    (token, data: MerchantApplyRequest) => merchantApi.applyMerchant(token, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: merchantKeys.me });
        queryClient.invalidateQueries({ queryKey: merchantKeys.applicationStatus });
      },
    },
  );
}

/** 搜尋景點（手動觸發） */
export function useSearchPlaces() {
  return useAuthMutation(
    (token, params: { query: string; district?: string; city?: string }) =>
      merchantApi.searchPlaces(token, params),
  );
}

/** 解析 Google Maps 連結 */
export function useResolveGoogleMapsUrl() {
  return useAuthMutation(
    (token, url: string) => merchantApi.resolveGoogleMapsUrl(token, url),
  );
}

/** 認領景點 */
export function useClaimPlace() {
  const queryClient = useQueryClient();
  return useAuthMutation(
    (token, data: ClaimPlaceRequest) => merchantApi.claimPlace(token, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: merchantKeys.places });
      },
    },
  );
}

/** 新增自有景點 */
export function useCreateNewPlace() {
  const queryClient = useQueryClient();
  return useAuthMutation(
    (token, data: NewPlaceRequest) => merchantApi.createNewPlace(token, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: merchantKeys.places });
      },
    },
  );
}

/** 更新景點 */
export function useUpdatePlace() {
  const queryClient = useQueryClient();
  return useAuthMutation(
    (token, params: { linkId: number; data: UpdatePlaceRequest }) =>
      merchantApi.updatePlace(token, params.linkId, params.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: merchantKeys.places });
      },
    },
  );
}

/** 建立優惠券 */
export function useCreateCoupon() {
  const queryClient = useQueryClient();
  return useAuthMutation(
    (token, data: CreateCouponRequest) => merchantApi.createCoupon(token, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['merchant', 'coupons'] });
      },
    },
  );
}

/** 更新優惠券 */
export function useUpdateCoupon() {
  const queryClient = useQueryClient();
  return useAuthMutation(
    (token, params: { couponId: number; data: UpdateCouponRequest }) =>
      merchantApi.updateCoupon(token, params.couponId, params.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['merchant', 'coupons'] });
      },
    },
  );
}

/** 刪除優惠券 */
export function useDeleteCoupon() {
  const queryClient = useQueryClient();
  return useAuthMutation(
    (token, couponId: number) => merchantApi.deleteCoupon(token, couponId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['merchant', 'coupons'] });
      },
    },
  );
}

/** 建立結帳 */
export function useCreateCheckout() {
  return useAuthMutation(
    (token, data: CheckoutRequest) => merchantApi.createCheckout(token, data),
  );
}

/** 取消訂閱 */
export function useCancelSubscription() {
  const queryClient = useQueryClient();
  return useAuthMutation(
    (token, data: CancelSubscriptionRequest) => merchantApi.cancelSubscription(token, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: merchantKeys.subscription });
        queryClient.invalidateQueries({ queryKey: merchantKeys.permissions });
      },
    },
  );
}

/** 刪除商家帳號 */
export function useDeleteMerchantAccount() {
  const queryClient = useQueryClient();
  return useAuthMutation(
    (token, data: DeleteMerchantAccountRequest) => merchantApi.deleteMerchantAccount(token, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['merchant'] });
      },
    },
  );
}
