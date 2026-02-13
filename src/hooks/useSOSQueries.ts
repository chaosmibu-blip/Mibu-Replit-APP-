/**
 * ============================================================
 * SOS Query Hooks (useSOSQueries.ts)
 * ============================================================
 * SOSScreen + SOSContactsScreen 專用
 *
 * 查詢：
 * - useSOSEligibility：SOS 資格檢查
 * - useSOSAlerts：SOS 求救記錄
 * - useSOSContacts：緊急聯絡人列表
 *
 * Mutation：
 * - useSendSOS：發送求救
 * - useCancelSOS：取消求救
 * - useAddSOSContact：新增聯絡人
 * - useUpdateSOSContact：更新聯絡人
 * - useDeleteSOSContact：刪除聯絡人
 *
 * 更新日期：2026-02-12（Phase 3 統一快取策略）
 */

import { useQueryClient } from '@tanstack/react-query';
import { useAuthQuery, useAuthMutation } from './useAuthQuery';
import { apiService } from '../services/api';
import { commonApi } from '../services/commonApi';
import type { SosSendParams } from '../types/sos';

// ============ 查詢 Hooks ============

/** SOS 資格檢查 */
export function useSOSEligibility() {
  return useAuthQuery(
    ['sos', 'eligibility'],
    (token) => apiService.getSosEligibility(token),
  );
}

/** SOS 求救記錄 */
export function useSOSAlerts() {
  return useAuthQuery(
    ['sos', 'alerts'],
    (token) => apiService.getSosAlerts(token),
  );
}

/** 緊急聯絡人列表 */
export function useSOSContacts() {
  return useAuthQuery(
    ['sos', 'contacts'],
    (token) => commonApi.getSOSContacts(token),
  );
}

// ============ Mutation Hooks ============

/** 發送求救 */
export function useSendSOS() {
  const queryClient = useQueryClient();

  return useAuthMutation(
    (token, params: SosSendParams) =>
      apiService.sendSosAlert(token, params),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['sos'] });
      },
    },
  );
}

/** 取消求救 */
export function useCancelSOS() {
  const queryClient = useQueryClient();

  return useAuthMutation(
    (token, alertId: number) => apiService.cancelSosAlert(token, alertId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['sos'] });
      },
    },
  );
}

/** 新增聯絡人 */
export function useAddSOSContact() {
  const queryClient = useQueryClient();

  return useAuthMutation(
    (token, params: { name: string; phone: string; relationship: string }) =>
      commonApi.addSOSContact(token, params),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['sos', 'contacts'] });
      },
    },
  );
}

/** 更新聯絡人 */
export function useUpdateSOSContact() {
  const queryClient = useQueryClient();

  return useAuthMutation(
    (token, params: { contactId: number; name: string; phone: string; relationship: string }) =>
      commonApi.updateSOSContact(token, params.contactId, {
        name: params.name,
        phone: params.phone,
        relationship: params.relationship,
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['sos', 'contacts'] });
      },
    },
  );
}

/** 刪除聯絡人 */
export function useDeleteSOSContact() {
  const queryClient = useQueryClient();

  return useAuthMutation(
    (token, contactId: number) => commonApi.deleteSOSContact(token, contactId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['sos', 'contacts'] });
      },
    },
  );
}
