/**
 * ============================================================
 * 帳號連結 Query Hooks (useAuthQueries.ts)
 * ============================================================
 * #071 帳號連結 — 綁定 / 解除多登入方式
 *
 * 查詢：
 * - useLinkedAccounts：取得已綁定的登入方式列表
 *
 * Mutation：
 * - useLinkAccount：綁定新的登入方式
 * - useUnlinkAccount：解除綁定登入方式
 *
 * 更新日期：2026-03-10
 */

import { useQueryClient } from '@tanstack/react-query';
import { useAuthQuery, useAuthMutation, queryKeys } from './useAuthQuery';
import { authApi } from '../services/authApi';
import type {
  LinkedAccountsResponse,
  LinkAccountParams,
  LinkAccountResponse,
  UnlinkAccountResponse,
} from '../types';

// ============ #071 帳號連結 Hooks ============

/** 已綁定的登入方式列表 */
export function useLinkedAccounts() {
  return useAuthQuery<LinkedAccountsResponse>(
    queryKeys.linkedAccounts,
    (token) => authApi.getLinkedAccounts(token),
  );
}

/** 綁定新的登入方式（Apple/Google OAuth → POST /api/auth/link） */
export function useLinkAccount() {
  const queryClient = useQueryClient();

  return useAuthMutation<LinkAccountResponse, LinkAccountParams>(
    (token, params) => authApi.linkAccount(token, params),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.linkedAccounts });
      },
    },
  );
}

/** 解除綁定登入方式（DELETE /api/auth/unlink/:provider） */
export function useUnlinkAccount() {
  const queryClient = useQueryClient();

  return useAuthMutation<UnlinkAccountResponse, 'apple' | 'google'>(
    (token, provider) => authApi.unlinkAccount(token, provider),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.linkedAccounts });
      },
    },
  );
}
