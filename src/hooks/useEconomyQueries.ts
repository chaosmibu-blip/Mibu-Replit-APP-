/**
 * ============================================================
 * 經濟系統 Query Hooks (useEconomyQueries.ts)
 * ============================================================
 * EconomyScreen / HomeScreen 共用的 React Query hooks
 *
 * 查詢：
 * - useRules：規則引擎資料（任務+成就）
 * - usePerks：用戶權益
 * - useCoins：金幣資訊
 *
 * Mutation：
 * - useClaimReward：領取獎勵
 *
 * 更新日期：2026-02-12（Phase 3 統一快取策略）
 */

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthQuery, useAuthMutation, queryKeys } from './useAuthQuery';
import { rulesApi } from '../services/rulesApi';
import { economyApi } from '../services/economyApi';
import type { RuleType, RuleStatus } from '../types/rules';

// ============ 查詢 Hooks ============

/** 取得規則引擎資料（任務 + 成就） */
export function useRules(params?: { type?: RuleType; status?: RuleStatus; resetType?: 'none' | 'daily' | 'weekly' }) {
  return useAuthQuery(
    ['economy', 'rules', params ?? {}],
    (token) => rulesApi.getRules(token, params),
  );
}

/** 取得用戶權益 */
export function usePerks() {
  return useAuthQuery(
    queryKeys.perks,
    (token) => economyApi.getPerks(token),
  );
}

/** 取得金幣資訊 */
export function useCoins() {
  return useAuthQuery(
    queryKeys.coins,
    (token) => economyApi.getCoins(token),
  );
}

// ============ Mutation Hooks ============

/** 領取已完成規則的獎勵 */
export function useClaimReward() {
  const queryClient = useQueryClient();

  return useAuthMutation(
    (token, ruleId: number) => rulesApi.claimReward(token, ruleId),
    {
      onSuccess: () => {
        // 領取後刷新規則 + 金幣
        queryClient.invalidateQueries({ queryKey: ['economy'] });
      },
    },
  );
}

// ============ 自己人申請 Hooks（#053 新增） ============

/** 取得自己人申請資格 */
export function usePartnerEligibility() {
  return useAuthQuery(
    ['partner', 'eligibility'],
    (token) => economyApi.getPartnerEligibility(token),
  );
}

/** 查詢自己人申請狀態 */
export function usePartnerApplicationStatus() {
  return useAuthQuery(
    ['partner', 'applicationStatus'],
    (token) => economyApi.getPartnerApplicationStatus(token),
  );
}

/** 提交自己人申請 */
export function useApplyPartner() {
  const queryClient = useQueryClient();
  return useAuthMutation(
    (token, surveyResponses: Record<string, unknown>) =>
      economyApi.applyPartner(token, surveyResponses),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['partner'] });
        queryClient.invalidateQueries({ queryKey: queryKeys.perks });
      },
    },
  );
}

// ============ 複合 Hook ============

/** 刷新所有經濟系統查詢 */
export function useRefreshEconomyData() {
  const queryClient = useQueryClient();

  return useCallback(() => {
    return queryClient.invalidateQueries({ queryKey: ['economy'] });
  }, [queryClient]);
}
