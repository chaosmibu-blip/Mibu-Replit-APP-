/**
 * ============================================================
 * App 全域狀態 Context (AppContext.tsx)
 * ============================================================
 * 重構後職責：
 * - 扭蛋收藏（collection, result, addToCollection, setResult）
 * - 未讀通知（unreadItemCount, unreadMailboxCount）
 * - 組合 Provider（I18nProvider + AuthProvider + GachaProvider）
 *
 * 認證狀態 → AuthContext.tsx
 * 語言翻譯 → I18nContext.tsx
 *
 * 變更說明（2026-02-12）
 * - Phase 1：拆分為 AuthContext + I18nContext + AppContext（slim）
 * - Phase 3：移除 useApp()（所有消費者已遷移完畢）
 *
 * @see docs/memory-state.md 詳細狀態管理說明
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GachaItem, GachaResponse } from '../types';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { apiService } from '../services/api';
import { mailboxApi } from '../services/mailboxApi';
import { loadToken } from './tokenUtils';
import { AuthProvider, useAuth } from './AuthContext';
import { I18nProvider } from './I18nContext';
import { MibuQueryProvider } from './QueryProvider';

// ============ 型別定義 ============

interface GachaNotificationState {
  result: GachaResponse | null;
  collection: GachaItem[];
  unreadItemCount: number;
  unreadMailboxCount: number;
}

interface GachaContextType {
  gachaState: GachaNotificationState;
  addToCollection: (items: GachaItem[]) => void;
  setResult: (result: GachaResponse | null) => void;
  refreshUnreadCount: () => Promise<void>;
  setUnreadCount: (count: number) => void;
}

// ============ Context ============

const GachaContext = createContext<GachaContextType | undefined>(undefined);

const defaultGachaState: GachaNotificationState = {
  result: null,
  collection: [],
  unreadItemCount: 0,
  unreadMailboxCount: 0,
};

// ============ Gacha & Notification Provider ============

function GachaProvider({ children }: { children: ReactNode }) {
  const [gachaState, setGachaState] = useState<GachaNotificationState>(defaultGachaState);
  const { user } = useAuth();
  const prevUserRef = useRef(user);

  // ========== 初始化：載入收藏 ==========
  useEffect(() => {
    loadCollection();
  }, []);

  // ========== 登出時重置狀態 ==========
  useEffect(() => {
    // 偵測 user 從非 null 變 null（登出）
    if (prevUserRef.current && !user) {
      setGachaState(defaultGachaState);
    }
    prevUserRef.current = user;
  }, [user]);

  const loadCollection = async () => {
    try {
      const storedCollection = await AsyncStorage.getItem(STORAGE_KEYS.COLLECTION);
      if (storedCollection) {
        setGachaState(prev => ({ ...prev, collection: JSON.parse(storedCollection) }));
      }
    } catch (error) {
      console.error('Error loading collection:', error);
    }
  };

  // ========== Actions ==========

  /** 新增扭蛋到收藏（自動去重 + 持久化） */
  const addToCollection = useCallback((items: GachaItem[]) => {
    setGachaState(prev => {
      const existingIds = new Set(prev.collection.map(i => i.id));
      const newItems = items.filter(i => !existingIds.has(i.id));
      if (newItems.length === 0) return prev;

      const updatedCollection = [...prev.collection, ...newItems];
      AsyncStorage.setItem(STORAGE_KEYS.COLLECTION, JSON.stringify(updatedCollection));
      return { ...prev, collection: updatedCollection };
    });
  }, []);

  /** 設定扭蛋結果 */
  const setResult = useCallback((result: GachaResponse | null) => {
    setGachaState(prev => ({ ...prev, result }));
  }, []);

  /** 刷新未讀通知數量 */
  const refreshUnreadCount = useCallback(async () => {
    try {
      const token = await loadToken();
      if (!token) return;

      const [statusData, mailboxData] = await Promise.allSettled([
        apiService.getNotificationStatus(token),
        mailboxApi.getUnreadCount(token),
      ]);

      const hasUnreadItem = statusData.status === 'fulfilled'
        ? (statusData.value.itembox ? 1 : 0)
        : 0;
      const mailboxCount = mailboxData.status === 'fulfilled'
        ? (mailboxData.value.unreadCount || 0)
        : 0;

      setGachaState(prev => ({
        ...prev,
        unreadItemCount: hasUnreadItem,
        unreadMailboxCount: mailboxCount,
      }));
    } catch {
      // 靜默處理，非核心功能
    }
  }, []);

  /** 手動設定未讀數量（如打開物品箱後清零） */
  const setUnreadCount = useCallback((count: number) => {
    setGachaState(prev => ({ ...prev, unreadItemCount: count }));
  }, []);

  // ========== Memoized Value ==========
  const value = useMemo<GachaContextType>(() => ({
    gachaState,
    addToCollection,
    setResult,
    refreshUnreadCount,
    setUnreadCount,
  }), [gachaState, addToCollection, setResult, refreshUnreadCount, setUnreadCount]);

  return (
    <GachaContext.Provider value={value}>
      {children}
    </GachaContext.Provider>
  );
}

// ============ 組合 Provider ============

/**
 * App 全域狀態 Provider（組合 I18n + Auth + Gacha）
 *
 * 巢狀順序：QueryProvider（最外層） > I18n > Auth > Gacha（可使用 useAuth）
 */
export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <MibuQueryProvider>
      <I18nProvider>
        <AuthProvider>
          <GachaProvider>
            {children}
          </GachaProvider>
        </AuthProvider>
      </I18nProvider>
    </MibuQueryProvider>
  );
}

// ============ Hooks ============

// re-export 方便統一引入
export { useAuth } from './AuthContext';
export { useI18n } from './I18nContext';

/**
 * 取得扭蛋與通知狀態的 Hook
 */
export function useGacha() {
  const context = useContext(GachaContext);
  if (context === undefined) {
    throw new Error('useGacha must be used within a GachaProvider');
  }
  return context;
}

