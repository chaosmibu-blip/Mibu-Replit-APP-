/**
 * ============================================================
 * React Query Provider (QueryProvider.tsx)
 * ============================================================
 * 統一資料快取基礎設施，提供：
 * - QueryClient 全域配置（staleTime、retry、gcTime）
 * - React Native 專用的 online/focus 管理
 * - 集中管理所有 API 資料的快取策略
 *
 * 設計原則：
 * - staleTime 5 分鐘：減少不必要的重複請求（1,000 DAU 足夠）
 * - gcTime 30 分鐘：保持快取但不佔太多記憶體
 * - retry 1 次：網路問題重試一次，避免無限重試
 *
 * 更新日期：2026-02-12（Phase 3 統一快取策略）
 */

import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ============ QueryClient 配置 ============

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /** 資料視為新鮮的時間（5 分鐘） */
      staleTime: 5 * 60 * 1000,
      /** 快取保留時間（30 分鐘，過期後 GC 回收） */
      gcTime: 30 * 60 * 1000,
      /** 失敗重試次數（1 次，避免過多重試） */
      retry: 1,
      /** 重試延遲：第 1 次 1 秒，第 2 次 3 秒 */
      retryDelay: (attemptIndex) => Math.min(1000 * (attemptIndex + 1), 3000),
      /** 視窗重新聚焦時不自動重新請求（RN 不需要） */
      refetchOnWindowFocus: false,
      /** 重新連線時自動重新請求 */
      refetchOnReconnect: true,
    },
    mutations: {
      /** mutation 失敗不重試 */
      retry: false,
    },
  },
});

// ============ Provider ============

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * React Query Provider
 *
 * 放在 AppProvider 最外層，讓所有 Context 和 Screen 都能使用
 */
export function MibuQueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

// ============ 工具：匯出 queryClient 供手動操作 ============

/**
 * 取得 QueryClient 實例
 *
 * 用於在 Context 或 Service 層手動操作快取：
 * - invalidateQueries：使特定查詢過期（如建立行程後刷新列表）
 * - setQueryData：直接更新快取（樂觀更新）
 * - removeQueries：登出時清除所有快取
 */
export { queryClient };
