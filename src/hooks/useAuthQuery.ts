/**
 * ============================================================
 * 統一認證查詢 Hook (useAuthQuery.ts)
 * ============================================================
 * 封裝 React Query + Token 注入的通用 Hook，解決：
 * - 28+ 個畫面的 useState + useEffect + try/catch 樣板重複
 * - 自動處理 token 取得（未登入時不發送請求）
 * - 統一的 loading / error / data 狀態
 * - 自動快取（staleTime 由 QueryProvider 全域配置）
 *
 * 使用方式：
 * ```typescript
 * // 基本用法
 * const { data, isLoading, error, refetch } = useAuthQuery(
 *   ['referral', 'balance'],
 *   (token) => referralApi.getBalance(token),
 * );
 *
 * // 帶條件的查詢
 * const { data } = useAuthQuery(
 *   ['itinerary', 'detail', itineraryId],
 *   (token) => itineraryApi.getItinerary(itineraryId!, token),
 *   { enabled: !!itineraryId },
 * );
 *
 * // 自訂 staleTime
 * const { data } = useAuthQuery(
 *   ['collection', 'list'],
 *   (token) => collectionApi.getCollections(token),
 *   { staleTime: 2 * 60 * 1000 }, // 2 分鐘
 * );
 * ```
 *
 * 更新日期：2026-02-12（Phase 3 統一快取策略）
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryOptions, UseMutationOptions, QueryKey } from '@tanstack/react-query';
import { useAuth } from '../context/AppContext';

// ============ useAuthQuery ============

/**
 * 帶認證的查詢 Hook
 *
 * 自動注入 token，未登入時不發送請求。
 * 取代 useState + useEffect + try/catch 樣板。
 *
 * @param queryKey - 查詢 key（用於快取識別）
 * @param queryFn - 查詢函數，接收 token 參數
 * @param options - React Query 選項（enabled、staleTime 等）
 */
export function useAuthQuery<TData>(
  queryKey: QueryKey,
  queryFn: (token: string) => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, Error>, 'queryKey' | 'queryFn'>,
) {
  const { getToken } = useAuth();

  return useQuery<TData, Error>({
    queryKey,
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error('未登入');
      }
      return queryFn(token);
    },
    // 未登入時停用查詢（由外部 enabled 控制或預設啟用）
    ...options,
  });
}

// ============ useAuthMutation ============

/**
 * 帶認證的 Mutation Hook
 *
 * 用於 POST / PUT / DELETE 操作，自動注入 token。
 *
 * @param mutationFn - 執行函數，接收 { token, ...args } 參數
 * @param options - React Query mutation 選項（onSuccess、onError 等）
 *
 * @example
 * ```typescript
 * const deleteMutation = useAuthMutation(
 *   (token, id: number) => itineraryApi.deleteItinerary(id, token),
 *   {
 *     onSuccess: () => {
 *       queryClient.invalidateQueries({ queryKey: ['itineraries'] });
 *     },
 *   },
 * );
 *
 * // 使用
 * deleteMutation.mutate(itineraryId);
 * ```
 */
export function useAuthMutation<TData, TVariables>(
  mutationFn: (token: string, variables: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'>,
) {
  const { getToken } = useAuth();

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables: TVariables) => {
      const token = await getToken();
      if (!token) {
        throw new Error('未登入');
      }
      return mutationFn(token, variables);
    },
    ...options,
  });
}

// ============ Query Key 常數 ============

/**
 * 統一管理 Query Key
 *
 * 使用常數避免拼寫錯誤，也方便 invalidateQueries 時精確匹配。
 */
export const queryKeys = {
  // 行程
  itineraries: ['itineraries'] as const,
  itinerary: (id: number) => ['itineraries', id] as const,
  itineraryPlaces: (id: number) => ['itineraries', id, 'places'] as const,

  // 圖鑑 / 收藏
  collection: (params?: Record<string, unknown>) =>
    params ? ['collection', params] as const : ['collection'] as const,
  collectionStats: ['collection', 'stats'] as const,
  collectionUnread: ['collection', 'unread'] as const,

  // 推薦
  referralCode: ['referral', 'code'] as const,
  referralList: ['referral', 'list'] as const,
  referralBalance: ['referral', 'balance'] as const,
  referralLeaderboard: (period: string) => ['referral', 'leaderboard', period] as const,
  referralRank: ['referral', 'rank'] as const,

  // 經濟
  coins: ['economy', 'coins'] as const,
  coinsHistory: (params?: Record<string, unknown>) =>
    params ? ['economy', 'coins', 'history', params] as const : ['economy', 'coins', 'history'] as const,
  perks: ['economy', 'perks'] as const,

  // 信箱
  mailbox: (params?: Record<string, unknown>) =>
    params ? ['mailbox', params] as const : ['mailbox'] as const,
  mailboxUnread: ['mailbox', 'unread'] as const,

  // 用戶
  profile: ['user', 'profile'] as const,
  notifications: ['user', 'notifications'] as const,
} as const;

