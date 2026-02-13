/**
 * ============================================================
 * 物品箱 Query Hooks (useInventoryQueries.ts)
 * ============================================================
 * ItemBoxScreen 專用
 *
 * 查詢：
 * - useInventory：背包列表
 * - useInventoryCount：背包數量統計
 *
 * Mutation：
 * - useRedeemItem：核銷優惠券
 * - useDeleteItem：刪除物品
 * - useMarkItemRead：標記已讀
 *
 * 更新日期：2026-02-12（Phase 3 統一快取策略）
 */

import { useQueryClient } from '@tanstack/react-query';
import { useAuthQuery, useAuthMutation } from './useAuthQuery';
import { inventoryApi } from '../services/inventoryApi';
import type { InventoryResponse, RedeemResponse, OpenPlacePackResponse } from '../types';

// ============ 查詢 Hooks ============

/** 背包列表 */
export function useInventory() {
  return useAuthQuery<InventoryResponse>(
    ['inventory', 'list'],
    (token) => inventoryApi.getInventory(token),
  );
}

/** 背包數量統計 */
export function useInventoryCount() {
  return useAuthQuery(
    ['inventory', 'count'],
    (token) => inventoryApi.getInventoryCount(token),
  );
}

// ============ Mutation Hooks ============

/** 核銷優惠券 */
export function useRedeemItem() {
  const queryClient = useQueryClient();

  return useAuthMutation<RedeemResponse, { itemId: number; dailyCode: string }>(
    (token, { itemId, dailyCode }) => inventoryApi.redeemInventoryItem(token, itemId, dailyCode),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['inventory'] });
      },
    },
  );
}

/** 刪除物品 */
export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useAuthMutation<{ success: boolean; message: string }, number>(
    (token, itemId) => inventoryApi.deleteInventoryItem(token, itemId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['inventory'] });
      },
    },
  );
}

/** 開啟景點包 */
export function useOpenPlacePack() {
  const queryClient = useQueryClient();

  return useAuthMutation<OpenPlacePackResponse, { itemId: number; selectedCity: string }>(
    (token, { itemId, selectedCity }) => inventoryApi.openPlacePack(token, itemId, selectedCity),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['inventory'] });
      },
    },
  );
}

/** 標記已讀 */
export function useMarkItemRead() {
  const queryClient = useQueryClient();

  return useAuthMutation(
    (token, itemId: number) => inventoryApi.markInventoryItemRead(token, itemId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['inventory'] });
      },
    },
  );
}
