/**
 * ============================================================
 * 用戶貢獻 Query Hooks (useContributionQueries.ts)
 * ============================================================
 * ContributionScreen 專用
 *
 * 查詢：
 * - useMyReports：個人回報記錄
 * - useMySuggestions：個人建議記錄
 * - usePendingVotes：待投票景點
 * - usePendingSuggestions：待投票建議
 *
 * Mutation：
 * - useVotePlace：景點投票
 * - useVoteSuggestion：建議投票
 *
 * 更新日期：2026-02-12（Phase 3 統一快取策略）
 */

import { useQueryClient } from '@tanstack/react-query';
import { useAuthQuery, useAuthMutation } from './useAuthQuery';
import { contributionApi } from '../services/contributionApi';
import type {
  MyReportsResponse,
  MySuggestionsResponse,
  PendingVotesResponse,
  PendingSuggestionsResponse,
  VotePlaceParams,
  VotePlaceResponse,
  VoteSuggestionParams,
  VoteSuggestionResponse,
} from '../types/contribution';

// ============ 查詢 Hooks ============

/** 個人回報記錄 */
export function useMyReports() {
  return useAuthQuery<MyReportsResponse>(
    ['contribution', 'myReports'],
    (token) => contributionApi.getMyReports(token),
  );
}

/** 個人建議記錄 */
export function useMySuggestions() {
  return useAuthQuery<MySuggestionsResponse>(
    ['contribution', 'mySuggestions'],
    (token) => contributionApi.getMySuggestions(token),
  );
}

/** 待投票景點 */
export function usePendingVotes() {
  return useAuthQuery<PendingVotesResponse>(
    ['contribution', 'pendingVotes'],
    (token) => contributionApi.getPendingVotes(token),
  );
}

/** 待投票建議 */
export function usePendingSuggestions() {
  return useAuthQuery<PendingSuggestionsResponse>(
    ['contribution', 'pendingSuggestions'],
    (token) => contributionApi.getPendingSuggestions(token),
  );
}

// ============ Mutation Hooks ============

/** 景點投票 */
export function useVotePlace() {
  const queryClient = useQueryClient();

  return useAuthMutation<VotePlaceResponse, { placeId: string; params: VotePlaceParams }>(
    (token, { placeId, params }) => contributionApi.votePlace(token, placeId, params),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['contribution', 'pendingVotes'] });
      },
    },
  );
}

/** 建議投票 */
export function useVoteSuggestion() {
  const queryClient = useQueryClient();

  return useAuthMutation<VoteSuggestionResponse, { suggestionId: string; params: VoteSuggestionParams }>(
    (token, { suggestionId, params }) => contributionApi.voteSuggestion(token, suggestionId, params),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['contribution', 'pendingSuggestions'] });
      },
    },
  );
}
