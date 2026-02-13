/**
 * ============================================================
 * 通知 Query Hooks (useNotificationQueries.ts)
 * ============================================================
 * 通知系統 React Query hooks（NotificationListScreen + NotificationPreferencesScreen）
 *
 * 查詢：
 * - useNotificationList：通知歷史列表（分頁，useInfiniteQuery）
 * - useNotificationPreferences：通知偏好設定
 *
 * Mutation：
 * - useMarkNotificationRead：標記單一通知已讀
 * - useMarkAllNotificationsRead：全部標記已讀
 * - useUpdateNotificationPreferences：更新通知偏好設定
 *
 * 更新日期：2026-02-12（Phase 3 統一快取策略）
 */

import { useQueryClient } from '@tanstack/react-query';
import { useAuthQuery, useAuthInfiniteQuery, useAuthMutation } from './useAuthQuery';
import { apiService } from '../services/api';
import type {
  NotificationListResponse,
  NotificationPreferences,
  UpdateNotificationPreferencesRequest,
} from '../types/notifications';

const PAGE_SIZE = 20;

// ============ 查詢 Hooks ============

/**
 * 通知歷史列表（分頁）
 *
 * 使用 useInfiniteQuery 管理分頁：
 * - data.pages 是所有已載入的頁面陣列
 * - items = data.pages.flatMap(p => p.notifications) 取得所有通知
 * - fetchNextPage() 載入下一頁
 * - hasNextPage 判斷是否還有更多
 */
export function useNotificationList() {
  return useAuthInfiniteQuery<NotificationListResponse>(
    ['notifications', 'list'],
    (token, pageParam) =>
      apiService.getNotificationList(token, pageParam, PAGE_SIZE),
    {
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        const { page, pageSize, total } = lastPage;
        return page * pageSize < total ? page + 1 : undefined;
      },
    },
  );
}

/**
 * 通知偏好設定
 */
export function useNotificationPreferences() {
  return useAuthQuery<NotificationPreferences>(
    ['notifications', 'preferences'],
    (token) => apiService.getNotificationPreferences(token),
  );
}

// ============ Mutation Hooks ============

/** 標記單一通知已讀 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useAuthMutation(
    (token, notificationId: number) =>
      apiService.markNotificationRead(token, notificationId),
    {
      onSuccess: () => {
        // 不立即 invalidate，依賴樂觀更新的 optimisticReadIds
        // 下次 refetch 時會自動同步
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      },
    },
  );
}

/** 全部標記已讀 */
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useAuthMutation(
    (token, _: void) => apiService.markAllNotificationsRead(token),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      },
    },
  );
}

/** 更新通知偏好設定 */
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useAuthMutation(
    (token, params: UpdateNotificationPreferencesRequest) =>
      apiService.updateNotificationPreferences(token, params),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['notifications', 'preferences'] });
      },
    },
  );
}
