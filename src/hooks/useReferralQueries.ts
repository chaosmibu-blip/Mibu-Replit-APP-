/**
 * ============================================================
 * 推薦系統 Query Hooks (useReferralQueries.ts)
 * ============================================================
 * ReferralScreen 專用的 React Query hooks，取代：
 * - 5 個 useState（loading, code, referrals, balance, leaderboard, rank）
 * - 1 個 loadAllData() 包含 Promise.allSettled
 * - 手動 pull-to-refresh 邏輯
 *
 * 改為宣告式的 useQuery hooks，自動快取 + 自動刷新。
 *
 * 更新日期：2026-02-12（Phase 3 統一快取策略）
 */

import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useAuthQuery, useAuthMutation, queryKeys } from './useAuthQuery';
import { referralApi } from '../services/referralApi';
import type { LeaderboardPeriod } from '../types/referral';

// ============ 查詢 Hooks ============

/** 取得我的推薦碼 */
export function useReferralCode() {
  return useAuthQuery(
    queryKeys.referralCode,
    (token) => referralApi.getMyCode(token),
  );
}

/** 取得推薦人列表 */
export function useReferralList() {
  return useAuthQuery(
    queryKeys.referralList,
    (token) => referralApi.getMyReferrals(token),
  );
}

/** 取得推薦獎勵餘額 */
export function useReferralBalance() {
  return useAuthQuery(
    queryKeys.referralBalance,
    (token) => referralApi.getBalance(token),
  );
}

/** 取得推薦排行榜 */
export function useReferralLeaderboard(period: LeaderboardPeriod = 'weekly') {
  return useAuthQuery(
    queryKeys.referralLeaderboard(period),
    (token) => referralApi.getLeaderboard(token, { period }),
  );
}

/** 取得我的排名 */
export function useReferralRank() {
  return useAuthQuery(
    queryKeys.referralRank,
    (token) => referralApi.getMyRank(token),
  );
}

// ============ Mutation Hooks ============

/** 生成推薦碼 */
export function useGenerateCode() {
  const queryClient = useQueryClient();

  return useAuthMutation(
    (token) => referralApi.generateCode(token),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.referralCode });
      },
    },
  );
}

/** 使用推薦碼 */
export function useApplyCode() {
  const queryClient = useQueryClient();

  return useAuthMutation(
    (token, params: { code: string }) => referralApi.applyCode(token, params),
    {
      onSuccess: () => {
        // 使用推薦碼後刷新餘額和列表
        queryClient.invalidateQueries({ queryKey: queryKeys.referralBalance });
        queryClient.invalidateQueries({ queryKey: queryKeys.referralList });
      },
    },
  );
}

// ============ 複合 Hook ============

/**
 * 刷新所有推薦相關查詢
 * 用於 pull-to-refresh
 */
export function useRefreshReferralData() {
  const queryClient = useQueryClient();

  return useCallback(() => {
    return queryClient.invalidateQueries({ queryKey: ['referral'] });
  }, [queryClient]);
}
