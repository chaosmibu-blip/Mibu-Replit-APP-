/**
 * ============================================================
 * 圖鑑/收藏 Query Hooks (useCollectionQueries.ts)
 * ============================================================
 * CollectionScreen 專用的 React Query hooks，取代：
 * - useState(loading) + useState(refreshing) + useState(collection)
 * - useFocusEffect → loadCollection() 每次 mount 都重新請求
 * - 手動 pull-to-refresh 邏輯
 *
 * 更新日期：2026-02-12（Phase 3 統一快取策略）
 */

import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useAuthQuery, useAuthMutation, queryKeys } from './useAuthQuery';
import { collectionApi } from '../services/collectionApi';

// ============ 查詢 Hooks ============

/** 取得收藏列表 */
export function useCollectionList(params?: { page?: number; limit?: number; city?: string; sort?: string }) {
  return useAuthQuery(
    queryKeys.collection(params as Record<string, unknown>),
    (token) => collectionApi.getCollections(token, params),
    {
      // 圖鑑資料 2 分鐘內視為新鮮（扭蛋後可能有新收藏）
      staleTime: 2 * 60 * 1000,
    },
  );
}

/** 取得收藏統計 */
export function useCollectionStats() {
  return useAuthQuery(
    queryKeys.collectionStats,
    (token) => collectionApi.getCollectionStats(token),
  );
}

/** 取得未讀數量 */
export function useCollectionUnread() {
  return useAuthQuery(
    queryKeys.collectionUnread,
    (token) => collectionApi.getUnreadCount(token),
  );
}

// ============ Mutation Hooks ============

/** 標記收藏為已讀 */
export function useMarkCollectionRead() {
  const queryClient = useQueryClient();

  return useAuthMutation(
    (token) => collectionApi.markCollectionRead(token),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.collectionUnread });
        queryClient.invalidateQueries({ queryKey: ['collection'] });
      },
    },
  );
}

/** 刪除收藏 */
export function useDeleteCollection() {
  const queryClient = useQueryClient();

  return useAuthMutation(
    (token, collectionId: number) => collectionApi.deleteCollection(token, collectionId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['collection'] });
      },
    },
  );
}

// ============ 複合 Hook ============

/**
 * 刷新所有圖鑑查詢
 * 用於 pull-to-refresh 或扭蛋完成後
 */
export function useRefreshCollectionData() {
  const queryClient = useQueryClient();

  return useCallback(() => {
    return queryClient.invalidateQueries({ queryKey: ['collection'] });
  }, [queryClient]);
}
