/**
 * ============================================================
 * MINI 貓咪系統 Query Hooks (useMiniQueries.ts)
 * ============================================================
 * #056 Profile / #057 探索 / #058 塗鴉牆 / #059 筆記
 * #060 副貓圖鑑 / #061 養成系統
 *
 * 查詢：
 * - useMiniProfile：MINI 基本資料
 * - useExplorationStatus：探索狀態
 * - useGraffiti：景點塗鴉牆
 * - useNotes：景點私人筆記
 * - useSubCatCollection：副貓圖鑑
 * - useSubCatBonuses：副貓加成
 * - useNurtureStatus：養成狀態
 * - useNurtureLogs：養成紀錄
 * - useCatFood：貓糧數量
 *
 * Mutation：
 * - useUpdateMiniName：更改 MINI 名字
 * - useStartExploration：開始探索
 * - useClaimExploration：領取探索結果
 * - useCreateGraffiti：新增塗鴉留言
 * - useDeleteGraffiti：刪除塗鴉留言
 * - useCreateNote：新增筆記
 * - useUpdateNote：更新筆記
 * - useDeleteNote：刪除筆記
 * - useFeedMini：餵食 MINI
 *
 * 更新日期：2026-03-10
 */

import { useQueryClient } from '@tanstack/react-query';
import { useAuthQuery, useAuthMutation, queryKeys } from './useAuthQuery';
import { miniApi } from '../services/miniApi';
import type {
  MiniProfileResponse,
  UpdateMiniNameResponse,
  StartExplorationParams,
  StartExplorationResponse,
  ExplorationStatusResponse,
  ClaimExplorationResponse,
  CreateGraffitiParams,
  CreateGraffitiResponse,
  GraffitiListResponse,
  NotesListResponse,
  CreateNoteParams,
  CreateNoteResponse,
  UpdateNoteParams,
  UpdateNoteResponse,
  SubCatType,
  SubCatCatalogResponse,
  SubCatCollectionResponse,
  SubCatBonusesResponse,
  NurtureStatusResponse,
  FeedResponse,
  NurtureLogsResponse,
  CatFoodResponse,
} from '../types/mini';

// ============ Query Keys（引用中央 queryKeys，不重複定義） ============

const miniQueryKeys = {
  profile: queryKeys.miniProfile,
  explorationStatus: queryKeys.explorationStatus,
  graffiti: queryKeys.graffiti,
  notes: queryKeys.notes,
};

// ============ #056 Profile Hooks ============

/** MINI Profile 查詢 */
export function useMiniProfile() {
  return useAuthQuery<MiniProfileResponse>(
    miniQueryKeys.profile,
    (token) => miniApi.getProfile(token),
  );
}

/** 更改 MINI 名字 */
export function useUpdateMiniName() {
  const queryClient = useQueryClient();

  return useAuthMutation<UpdateMiniNameResponse, string>(
    (token, name) => miniApi.updateName(token, name),
    {
      onSuccess: (data) => {
        queryClient.setQueryData<MiniProfileResponse | undefined>(
          miniQueryKeys.profile,
          (old) => old ? { profile: { ...old.profile, name: data.profile.name } } : old,
        );
      },
    },
  );
}

// ============ #057 探索 Hooks ============

/** 探索狀態查詢 */
export function useExplorationStatus() {
  return useAuthQuery<ExplorationStatusResponse>(
    miniQueryKeys.explorationStatus,
    (token) => miniApi.getExplorationStatus(token),
    { refetchInterval: 10000 },
  );
}

/** 開始探索 */
export function useStartExploration() {
  const queryClient = useQueryClient();

  return useAuthMutation<StartExplorationResponse, StartExplorationParams>(
    (token, params) => miniApi.startExploration(token, params),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: miniQueryKeys.explorationStatus });
      },
    },
  );
}

/** 領取探索結果 */
export function useClaimExploration() {
  const queryClient = useQueryClient();

  return useAuthMutation<ClaimExplorationResponse, number>(
    (token, explorationId) => miniApi.claimExploration(token, explorationId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: miniQueryKeys.explorationStatus });
        queryClient.invalidateQueries({ queryKey: ['collection'] });
      },
    },
  );
}

// ============ #058 塗鴉牆 Hooks ============

/** 景點塗鴉牆查詢（支援懶載入，Modal 動畫完成後再觸發） */
export function useGraffiti(placeId: number, isActive = true) {
  return useAuthQuery<GraffitiListResponse>(
    miniQueryKeys.graffiti(placeId),
    (token) => miniApi.getGraffiti(token, placeId),
    { enabled: !!placeId && isActive },
  );
}

/** 新增塗鴉留言 */
export function useCreateGraffiti() {
  const queryClient = useQueryClient();

  return useAuthMutation<CreateGraffitiResponse, { placeId: number; params: CreateGraffitiParams }>(
    (token, { placeId, params }) => miniApi.createGraffiti(token, placeId, params),
    {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: miniQueryKeys.graffiti(variables.placeId) });
      },
    },
  );
}

/** 刪除塗鴉留言 */
export function useDeleteGraffiti() {
  const queryClient = useQueryClient();

  return useAuthMutation<{ success: boolean }, { graffitiId: number; placeId: number }>(
    (token, { graffitiId }) => miniApi.deleteGraffiti(token, graffitiId),
    {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: miniQueryKeys.graffiti(variables.placeId) });
      },
    },
  );
}

// ============ #059 筆記 Hooks ============

/** 景點筆記查詢（支援懶載入，Modal 動畫完成後再觸發） */
export function useNotes(placeId: number, isActive = true) {
  return useAuthQuery<NotesListResponse>(
    miniQueryKeys.notes(placeId),
    (token) => miniApi.getNotes(token, placeId),
    { enabled: !!placeId && isActive },
  );
}

/** 新增筆記 */
export function useCreateNote() {
  const queryClient = useQueryClient();

  return useAuthMutation<CreateNoteResponse, { placeId: number; params: CreateNoteParams }>(
    (token, { placeId, params }) => miniApi.createNote(token, placeId, params),
    {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: miniQueryKeys.notes(variables.placeId) });
      },
    },
  );
}

/** 更新筆記 */
export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useAuthMutation<UpdateNoteResponse, { noteId: number; placeId: number; params: UpdateNoteParams }>(
    (token, { noteId, params }) => miniApi.updateNote(token, noteId, params),
    {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: miniQueryKeys.notes(variables.placeId) });
      },
    },
  );
}

/** 刪除筆記 */
export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useAuthMutation<{ success: boolean }, { noteId: number; placeId: number }>(
    (token, { noteId }) => miniApi.deleteNote(token, noteId),
    {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: miniQueryKeys.notes(variables.placeId) });
      },
    },
  );
}

// ============ #060 副貓圖鑑 Hooks ============

/** 副貓目錄查詢（可按類型篩選） */
export function useSubCatCatalog(type?: SubCatType) {
  return useAuthQuery<SubCatCatalogResponse>(
    queryKeys.subCatCatalog(type),
    (token) => miniApi.getSubCatCatalog(token, type),
  );
}

/** 用戶副貓圖鑑（含收集進度） */
export function useSubCatCollection() {
  return useAuthQuery<SubCatCollectionResponse>(
    queryKeys.subCatCollection,
    (token) => miniApi.getSubCatCollection(token),
  );
}

/** 副貓加成效果彙總 */
export function useSubCatBonuses() {
  return useAuthQuery<SubCatBonusesResponse>(
    queryKeys.subCatBonuses,
    (token) => miniApi.getSubCatBonuses(token),
  );
}

// ============ #061 養成系統 Hooks ============

/** 養成狀態查詢（飽食度、羈絆、成長階段） */
export function useNurtureStatus() {
  return useAuthQuery<NurtureStatusResponse>(
    queryKeys.nurtureStatus,
    (token) => miniApi.getNurtureStatus(token),
  );
}

/** 餵食 MINI */
export function useFeedMini() {
  const queryClient = useQueryClient();

  return useAuthMutation<FeedResponse, void>(
    (token) => miniApi.feed(token),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.nurtureStatus });
        queryClient.invalidateQueries({ queryKey: queryKeys.catFood });
        queryClient.invalidateQueries({ queryKey: queryKeys.nurtureLogs });
        queryClient.invalidateQueries({ queryKey: queryKeys.miniProfile });
      },
    },
  );
}

/** 養成紀錄查詢 */
export function useNurtureLogs(limit = 20) {
  return useAuthQuery<NurtureLogsResponse>(
    queryKeys.nurtureLogs,
    (token) => miniApi.getNurtureLogs(token, limit),
  );
}

/** 貓糧數量查詢 */
export function useCatFood() {
  return useAuthQuery<CatFoodResponse>(
    queryKeys.catFood,
    (token) => miniApi.getCatFood(token),
  );
}
