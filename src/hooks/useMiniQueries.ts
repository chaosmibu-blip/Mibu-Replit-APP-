/**
 * ============================================================
 * MINI 貓咪系統 Query Hooks (useMiniQueries.ts)
 * ============================================================
 * #056 Profile / #057 探索 / #058 塗鴉牆 / #059 筆記
 *
 * 查詢：
 * - useMiniProfile：MINI 基本資料
 * - useExplorationStatus：探索狀態
 * - useGraffiti：景點塗鴉牆
 * - useNotes：景點私人筆記
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
 *
 * 更新日期：2026-02-25
 */

import { useQueryClient } from '@tanstack/react-query';
import { useAuthQuery, useAuthMutation } from './useAuthQuery';
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
} from '../types/mini';

// ============ Query Keys ============

export const miniQueryKeys = {
  profile: ['mini', 'profile'] as const,
  explorationStatus: ['mini', 'exploration', 'status'] as const,
  graffiti: (placeId: number) => ['mini', 'graffiti', placeId] as const,
  notes: (placeId: number) => ['mini', 'notes', placeId] as const,
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
