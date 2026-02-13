/**
 * ============================================================
 * 募資 Query Hooks (useCrowdfundingQueries.ts)
 * ============================================================
 * CrowdfundingScreen + CrowdfundingDetailScreen 專用
 *
 * 查詢：
 * - useCampaigns：募資活動列表
 * - useCampaignDetail：單一活動詳情
 * - useMyContributions：個人贊助記錄
 *
 * Mutation：
 * - useContribute：參與募資（IAP 驗證）
 *
 * 更新日期：2026-02-12（Phase 3 統一快取策略）
 */

import { useQueryClient } from '@tanstack/react-query';
import { useAuthQuery, useAuthMutation } from './useAuthQuery';
import { crowdfundingApi } from '../services/crowdfundingApi';
import type { CampaignsResponse, CampaignDetail, ContributeParams, ContributeResponse, MyContributionsResponse } from '../types/crowdfunding';

// ============ 查詢 Hooks ============

/** 募資活動列表 */
export function useCampaigns(params?: { status?: string; page?: number; limit?: number }) {
  return useAuthQuery<CampaignsResponse>(
    ['crowdfunding', 'campaigns', params ?? {}],
    (token) => crowdfundingApi.getCampaigns(token, params),
  );
}

/** 單一募資活動詳情 */
export function useCampaignDetail(campaignId: string | null) {
  return useAuthQuery<CampaignDetail>(
    ['crowdfunding', 'campaign', campaignId],
    (token) => crowdfundingApi.getCampaignDetail(token, campaignId!),
    { enabled: !!campaignId },
  );
}

/** 個人贊助記錄 */
export function useMyContributions() {
  return useAuthQuery<MyContributionsResponse>(
    ['crowdfunding', 'myContributions'],
    (token) => crowdfundingApi.getMyContributions(token),
  );
}

// ============ Mutation Hooks ============

/** 參與募資 */
export function useContribute() {
  const queryClient = useQueryClient();

  return useAuthMutation<ContributeResponse, ContributeParams>(
    (token, params) => crowdfundingApi.contribute(token, params),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['crowdfunding'] });
      },
    },
  );
}
