/**
 * ============================================================
 * 信箱 Query Hooks (useMailboxQueries.ts)
 * ============================================================
 * 信箱系統 React Query hooks（MailboxScreen + MailboxDetailScreen）
 *
 * 查詢：
 * - useMailboxList：信箱列表（分頁 + 狀態篩選，useInfiniteQuery）
 * - useMailboxDetail：單一信箱項目詳情
 *
 * Mutation：
 * - useClaimAll：一鍵全部領取
 * - useClaimItem：領取單一項目
 * - useRedeemPromoCode：兌換優惠碼
 *
 * 更新日期：2026-02-12（Phase 3 統一快取策略）
 */

import { useQueryClient } from '@tanstack/react-query';
import { useAuthQuery, useAuthInfiniteQuery, useAuthMutation } from './useAuthQuery';
import { mailboxApi } from '../services/mailboxApi';
import type { MailboxListResponse, MailboxStatus } from '../types/mailbox';

const PAGE_SIZE = 20;

// ============ 查詢 Hooks ============

/**
 * 信箱列表（分頁 + 狀態篩選）
 *
 * 使用 useInfiniteQuery 管理分頁：
 * - data.pages 是所有已載入的頁面陣列
 * - items = data.pages.flatMap(p => p.items) 取得所有項目
 * - fetchNextPage() 載入下一頁
 * - hasNextPage 判斷是否還有更多
 */
export function useMailboxList(status: MailboxStatus) {
  return useAuthInfiniteQuery<MailboxListResponse>(
    ['mailbox', 'list', status],
    (token, pageParam) =>
      mailboxApi.getList(token, { page: pageParam, limit: PAGE_SIZE, status }),
    {
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        const { page, totalPages } = lastPage.pagination;
        return page < totalPages ? page + 1 : undefined;
      },
    },
  );
}

/**
 * 信箱項目詳情
 * 進入頁面即觸發（副作用：自動標記已讀）
 */
export function useMailboxDetail(itemId: number | null) {
  return useAuthQuery(
    ['mailbox', 'detail', itemId],
    (token) => mailboxApi.getDetail(token, itemId!),
    { enabled: itemId !== null && !isNaN(itemId) },
  );
}

// ============ Mutation Hooks ============

/** 一鍵全部領取 */
export function useClaimAll() {
  const queryClient = useQueryClient();

  return useAuthMutation(
    (token, _: void) => mailboxApi.claimAll(token),
    {
      onSuccess: () => {
        // 領取後刷新所有信箱列表
        queryClient.invalidateQueries({ queryKey: ['mailbox'] });
      },
    },
  );
}

/** 領取單一信箱項目 */
export function useClaimItem() {
  const queryClient = useQueryClient();

  return useAuthMutation(
    (token, itemId: number) => mailboxApi.claimItem(token, itemId),
    {
      onSuccess: () => {
        // 領取後刷新信箱列表和詳情
        queryClient.invalidateQueries({ queryKey: ['mailbox'] });
      },
    },
  );
}

/** 兌換優惠碼 */
export function useRedeemPromoCode() {
  const queryClient = useQueryClient();

  return useAuthMutation(
    (token, code: string) => mailboxApi.redeemPromoCode(token, code),
    {
      onSuccess: () => {
        // 兌換後刷新未領取列表
        queryClient.invalidateQueries({ queryKey: ['mailbox'] });
      },
    },
  );
}
