/**
 * ============================================================
 * 專家 Query Hooks (useSpecialistQueries.ts)
 * ============================================================
 * Specialist 畫面專用（Dashboard、Profile、History）
 *
 * 更新日期：2026-02-12（Phase 3 統一快取策略）
 */

import { useQueryClient } from '@tanstack/react-query';
import { useAuthQuery, useAuthMutation } from './useAuthQuery';
import { specialistApi } from '../services/specialistApi';

// ============ 查詢 Hooks ============

/** 專家個人資料 */
export function useSpecialistMe() {
  return useAuthQuery(
    ['specialist', 'me'],
    (token) => specialistApi.getSpecialistMe(token),
  );
}

/** 專家服務列表 */
export function useSpecialistServices() {
  return useAuthQuery(
    ['specialist', 'services'],
    (token) => specialistApi.getSpecialistServices(token),
  );
}

// ============ Mutation Hooks ============

/** 切換上線狀態 */
export function useToggleSpecialistOnline() {
  const queryClient = useQueryClient();
  return useAuthMutation(
    (token, _: void) => specialistApi.toggleSpecialistOnline(token),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['specialist', 'me'] });
      },
    },
  );
}

/** 更新可用狀態 */
export function useUpdateSpecialistAvailability() {
  const queryClient = useQueryClient();
  return useAuthMutation(
    (token, isAvailable: boolean) =>
      specialistApi.updateSpecialistAvailability(token, isAvailable),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['specialist', 'me'] });
      },
    },
  );
}
