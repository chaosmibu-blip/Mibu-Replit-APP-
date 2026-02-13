/**
 * ============================================================
 * 管理員 Query Hooks (useAdminQueries.ts)
 * ============================================================
 * Admin 畫面專用（Dashboard、Announcements、Exclusions）
 *
 * 更新日期：2026-02-12（Phase 3 統一快取策略）
 */

import { useQueryClient } from '@tanstack/react-query';
import { useAuthQuery, useAuthMutation } from './useAuthQuery';
import { adminApi } from '../services/adminApi';

// ============ 查詢 Hooks ============

/** 管理員用戶列表 */
export function useAdminUsers() {
  return useAuthQuery(
    ['admin', 'users'],
    (token) => adminApi.getAdminUsers(token),
  );
}

/** 待審核用戶 */
export function useAdminPendingUsers() {
  return useAuthQuery(
    ['admin', 'pendingUsers'],
    (token) => adminApi.getAdminPendingUsers(token),
  );
}

/** 全域排除景點 */
export function useGlobalExclusions() {
  return useAuthQuery(
    ['admin', 'exclusions'],
    (token) => adminApi.getGlobalExclusions(token),
  );
}

/** 景點草稿 */
export function usePlaceDrafts() {
  return useAuthQuery(
    ['admin', 'placeDrafts'],
    (token) => adminApi.getPlaceDrafts(token),
  );
}

/** 公告列表 */
export function useAdminAnnouncements() {
  return useAuthQuery(
    ['admin', 'announcements'],
    (token) => adminApi.getAdminAnnouncements(token),
  );
}

// ============ Mutation Hooks ============

/** 審核用戶 */
export function useApproveUser() {
  const queryClient = useQueryClient();
  return useAuthMutation(
    (token, params: { userId: string; isApproved: boolean }) =>
      adminApi.approveUser(token, params.userId, params.isApproved),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
        queryClient.invalidateQueries({ queryKey: ['admin', 'pendingUsers'] });
      },
    },
  );
}

/** 新增全域排除 */
export function useAddGlobalExclusion() {
  const queryClient = useQueryClient();
  return useAuthMutation(
    (token, params: { placeName: string; district?: string; city?: string }) =>
      adminApi.addGlobalExclusion(token, params),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'exclusions'] });
      },
    },
  );
}

/** 移除全域排除 */
export function useRemoveGlobalExclusion() {
  const queryClient = useQueryClient();
  return useAuthMutation(
    (token, id: number) => adminApi.removeGlobalExclusion(token, id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'exclusions'] });
      },
    },
  );
}

/** 發布景點草稿 */
export function usePublishPlaceDraft() {
  const queryClient = useQueryClient();
  return useAuthMutation(
    (token, draftId: number) => adminApi.publishPlaceDraft(token, draftId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'placeDrafts'] });
      },
    },
  );
}

/** 刪除景點草稿 */
export function useDeletePlaceDraft() {
  const queryClient = useQueryClient();
  return useAuthMutation(
    (token, draftId: number) => adminApi.deletePlaceDraft(token, draftId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'placeDrafts'] });
      },
    },
  );
}

/** 新增公告 */
export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  return useAuthMutation(
    (token, params: any) => adminApi.createAnnouncement(token, params),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] });
      },
    },
  );
}

/** 更新公告 */
export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();
  return useAuthMutation(
    (token, params: { id: number; data: any }) =>
      adminApi.updateAnnouncement(token, params.id, params.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] });
      },
    },
  );
}

/** 刪除公告 */
export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();
  return useAuthMutation(
    (token, id: number) => adminApi.deleteAnnouncement(token, id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] });
      },
    },
  );
}
