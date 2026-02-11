/**
 * @fileoverview Mibu App 全域狀態管理 Context
 *
 * 這個檔案是整個 App 的狀態中樞，負責管理：
 * - 用戶認證狀態（登入/登出、Token 管理）
 * - 語言設定（多語系切換）
 * - 扭蛋收藏（本地快取 + 同步）
 * - 全域 UI 狀態（loading、error）
 * - 角色切換（一般用戶 / 商家）
 * - 未讀通知數量
 *
 * @example
 * // 在元件中使用
 * const { state, setUser, t } = useApp();
 *
 * @see docs/memory-state.md 詳細狀態管理說明
 * @see docs/memory-auth-flow.md 認證流程說明
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { AppState, Language, User, GachaItem, GachaResponse, UserRole } from '../types';
import { TRANSLATIONS, DEFAULT_LEVEL } from '../constants/translations';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { apiService } from '../services/api';
import { pushNotificationService } from '../services/pushNotificationService';
import { preloadService } from '../services/preloadService';
import { disconnectSocket } from '../services/socket';
import { setOnUnauthorized, resetUnauthorizedFlag } from '../services/base';
import { mailboxApi } from '../services/mailboxApi';

// ============ Token 安全儲存工具 ============
// iOS/Android 使用 SecureStore（加密儲存）
// Web 使用 AsyncStorage（localStorage 包裝）

/**
 * 安全儲存 Token
 * @param token - JWT Token 字串
 * @description iOS 用 Keychain，Android 用 EncryptedSharedPreferences
 */
const saveToken = async (token: string): Promise<void> => {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem('@mibu_token', token);
  } else {
    await SecureStore.setItemAsync('mibu_token', token);
  }
};

/**
 * 讀取已儲存的 Token
 * @returns Token 字串或 null（未登入/已過期）
 */
const loadToken = async (): Promise<string | null> => {
  if (Platform.OS === 'web') {
    return await AsyncStorage.getItem('@mibu_token');
  }
  return await SecureStore.getItemAsync('mibu_token');
};

/**
 * 清除已儲存的 Token（登出時使用）
 */
const removeToken = async (): Promise<void> => {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem('@mibu_token');
  } else {
    await SecureStore.deleteItemAsync('mibu_token');
  }
};

// ============ Context 型別定義 ============

/**
 * AppContext 提供的方法和狀態
 *
 * @property state - 全域狀態物件
 * @property t - 當前語言的翻譯字典（如 t.login、t.logout）
 * @property updateState - 部分更新狀態（適合一次改多個欄位）
 * @property setLanguage - 切換語言（zh-TW / en）
 * @property setUser - 設定/清除用戶（登入/登出）
 * @property getToken - 取得當前 Token
 * @property addToCollection - 新增扭蛋到收藏
 * @property setResult - 設定扭蛋結果（抽完顯示用）
 * @property setLoading - 設定全域 loading 狀態
 * @property setError - 設定全域錯誤訊息
 * @property switchRole - 切換用戶角色（一般/商家）
 * @property refreshUnreadCount - 刷新未讀通知數量
 * @property setUnreadCount - 手動設定未讀數量
 */
interface AppContextType {
  state: AppState;
  t: Record<string, string>;
  updateState: (updates: Partial<AppState>) => void;
  setLanguage: (lang: Language) => void;
  setUser: (user: User | null, token?: string | null) => void;
  getToken: () => Promise<string | null>;
  addToCollection: (items: GachaItem[]) => void;
  setResult: (result: GachaResponse | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  switchRole: (role: UserRole) => Promise<boolean>;
  refreshUnreadCount: () => Promise<void>;
  setUnreadCount: (count: number) => void;
}

// ============ 預設狀態 ============

/**
 * App 初始狀態
 *
 * State 結構說明：
 * - language: 當前語言（'zh-TW' | 'en'）
 * - user: 當前用戶資料（null = 未登入）
 * - country/city: 當前選擇的地點（扭蛋用）
 * - countryId/regionId: 地點 ID（API 用）
 * - level: 當前扭蛋等級（common/rare/epic/legendary）
 * - loading: 全域 loading 狀態
 * - error: 全域錯誤訊息
 * - result: 最近一次扭蛋結果
 * - collection: 本地扭蛋收藏
 * - view: 當前檢視（legacy，可忽略）
 * - isAuthenticated: 是否已登入
 * - unreadItemCount: 物品箱未讀數量
 */
const defaultState: AppState = {
  language: 'zh-TW',
  user: null,
  country: '',
  city: '',
  countryId: null,
  regionId: null,
  level: DEFAULT_LEVEL,
  loading: false,
  error: null,
  result: null,
  collection: [],
  view: 'home',
  isAuthenticated: false,
  unreadItemCount: 0,
  unreadMailboxCount: 0,
};

/** Context 實例 */
const AppContext = createContext<AppContextType | undefined>(undefined);

// StorageKeys 已統一集中管理於 src/constants/storageKeys.ts

// ============ Provider 元件 ============

/**
 * App 全域狀態 Provider
 *
 * 使用方式：在 App 最外層包裝
 * @example
 * <AppProvider>
 *   <App />
 * </AppProvider>
 */
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);

  // App 啟動時載入本地儲存的資料
  useEffect(() => {
    loadStoredData();
  }, []);

  // ============ 初始化：載入本地資料 ============

  /**
   * 載入本地儲存的資料
   *
   * 啟動流程：
   * 1. 並行讀取語言、收藏、Token
   * 2. 如果有 Token，呼叫 API 驗證並取得最新用戶資料
   * 3. 如果 API 失敗（網路問題），fallback 到本地快取
   * 4. 如果 Token 無效，清除登入狀態
   */
  const loadStoredData = async () => {
    try {
      // 並行讀取，加快啟動速度
      const [storedLanguage, storedCollection, storedToken] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE),
        AsyncStorage.getItem(STORAGE_KEYS.COLLECTION),
        loadToken(),
      ]);

      const updates: Partial<AppState> = {};

      // 恢復語言設定
      if (storedLanguage) {
        updates.language = storedLanguage as Language;
      }

      // 恢復本地收藏
      if (storedCollection) {
        updates.collection = JSON.parse(storedCollection);
      }

      // 如果有 Token，呼叫 API 取得最新用戶資料
      if (storedToken) {
        try {
          const freshUser = await apiService.getUserWithToken(storedToken);
          if (freshUser && freshUser.id) {
            // Token 有效，更新用戶資料
            updates.user = freshUser;
            updates.isAuthenticated = true;
            // 更新本地快取
            await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(freshUser));
            // 註冊推播通知 + 背景預載入常用資料
            pushNotificationService.registerTokenWithBackend(storedToken).catch(console.error);
            preloadService.preloadAfterAuth();
          } else {
            // Token 無效，清除登入狀態
            await removeToken();
            await AsyncStorage.removeItem(STORAGE_KEYS.USER);
          }
        } catch (apiError) {
          console.error('Token validation failed:', apiError);
          // API 呼叫失敗（可能是網路問題或 Token 過期）
          // 嘗試使用本地快取的用戶資料
          const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);
          if (storedUser) {
            // 有快取，暫時使用（下次連網會再驗證）
            const user = JSON.parse(storedUser);
            updates.user = user;
            updates.isAuthenticated = true;
          } else {
            // 沒有快取，清除 Token
            await removeToken();
          }
        }
      } else {
        // 沒有 Token，檢查是否有訪客用戶資料
        const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);
        if (storedUser) {
          const user = JSON.parse(storedUser);
          // 如果是訪客用戶，恢復登入狀態
          if (user.id === 'guest' || user.provider === 'guest') {
            updates.user = user;
            updates.isAuthenticated = true;
          }
        }
      }

      // 一次性更新所有狀態，減少 re-render
      if (Object.keys(updates).length > 0) {
        setState(prev => ({ ...prev, ...updates }));
      }
    } catch (error) {
      console.error('Error loading stored data:', error);
    }
  };

  // ============ State Actions ============

  /**
   * 部分更新狀態
   * @param updates - 要更新的欄位
   * @example updateState({ loading: true, error: null })
   */
  const updateState = useCallback((updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * 切換語言並持久化
   * @param lang - 目標語言 ('zh-TW' | 'en')
   */
  const setLanguage = useCallback(async (lang: Language) => {
    setState(prev => ({ ...prev, language: lang }));
    await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  }, []);

  /**
   * 設定/清除用戶
   *
   * @param user - 用戶資料（null = 登出）
   * @param token - JWT Token（登入時提供）
   *
   * 登入時：儲存用戶資料 + Token + 註冊推播
   * 登出時：清除所有用戶資料 + 取消推播註冊
   */
  const setUser = useCallback(async (user: User | null, token?: string | null) => {
    // 更新 state
    if (user) {
      // 登入：更新用戶狀態
      setState(prev => ({
        ...prev,
        user,
        isAuthenticated: true
      }));
    } else {
      // 登出：回歸初始狀態，只保留語言偏好（跟裝置走不跟帳號走）
      setState(prev => ({
        ...defaultState,
        language: prev.language,
      }));
    }

    if (user) {
      // === 登入流程 ===
      resetUnauthorizedFlag(); // 重置 401 旗標，讓新 session 的 401 可以再次觸發
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      if (token) {
        await saveToken(token);
        // 登入成功後註冊推播通知 + 背景預載入常用資料
        pushNotificationService.registerTokenWithBackend(token).catch(console.error);
        preloadService.preloadAfterAuth();
      }
    } else {
      // === 登出流程 ===
      // 先取消推播註冊
      const currentToken = await loadToken();
      if (currentToken) {
        pushNotificationService.unregisterToken(currentToken).catch(console.error);
      }
      // 白名單制：清除所有 AsyncStorage，只保留 UX 相關設定
      // 這些跟裝置走（非敏感用戶資料），登出後不需重設
      const allKeys = await AsyncStorage.getAllKeys();
      const keepKeys: string[] = [
        STORAGE_KEYS.LANGUAGE,
        STORAGE_KEYS.AVATAR_PRESET,
        STORAGE_KEYS.CUSTOM_AVATAR_URL,
      ];
      const TUTORIAL_PREFIX = '@mibu_tutorial_';
      const keysToRemove = allKeys.filter(k =>
        !keepKeys.includes(k) && !k.startsWith(TUTORIAL_PREFIX)
      );
      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
      }
      await removeToken();
      preloadService.clearCache();
      disconnectSocket(); // 斷開 WebSocket 連線，避免殭屍連線
    }
  }, []);

  /**
   * 取得當前 Token
   * @returns Token 字串或 null
   */
  const getToken = useCallback(async (): Promise<string | null> => {
    try {
      return await loadToken();
    } catch {
      return null;
    }
  }, []);

  /**
   * 新增扭蛋到收藏
   *
   * @param items - 要新增的扭蛋陣列
   * @description 會自動去重（根據 id），並持久化到本地
   */
  const addToCollection = useCallback(async (items: GachaItem[]) => {
    setState(prev => {
      // 去重：只新增不存在的項目
      const existingIds = new Set(prev.collection.map(i => i.id));
      const newItems = items.filter(i => !existingIds.has(i.id));

      // 如果沒有新項目，直接返回不觸發 re-render
      if (newItems.length === 0) return prev;

      const updatedCollection = [...prev.collection, ...newItems];

      // 持久化到本地（非同步，不阻塞 UI）
      AsyncStorage.setItem(STORAGE_KEYS.COLLECTION, JSON.stringify(updatedCollection));

      return { ...prev, collection: updatedCollection };
    });
  }, []);

  /**
   * 設定扭蛋結果
   * @param result - 扭蛋 API 回傳的結果（用於顯示抽獎動畫）
   */
  const setResult = useCallback((result: GachaResponse | null) => {
    setState(prev => ({ ...prev, result }));
  }, []);

  /**
   * 設定全域 loading 狀態
   * @param loading - 是否顯示 loading
   */
  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  /**
   * 設定全域錯誤訊息
   * @param error - 錯誤訊息（null = 清除錯誤）
   */
  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  // ============ 角色切換 ============

  /**
   * 切換用戶角色
   *
   * @param role - 目標角色 ('user' | 'merchant')
   * @returns 是否切換成功
   *
   * 流程：
   * 1. 呼叫後端 API 切換角色
   * 2. 驗證回應的 activeRole 是否正確
   * 3. 更新本地用戶資料
   * 4. 持久化到 AsyncStorage
   */
  const switchRole = useCallback(async (role: UserRole): Promise<boolean> => {
    try {
      const token = await loadToken();
      if (!token) return false;

      // 呼叫後端切換角色 API
      const response = await apiService.switchRole(token, role);

      // 驗證回應有 activeRole
      if (!response.activeRole) {
        console.error('Switch role response missing activeRole');
        return false;
      }

      // 驗證 activeRole 與請求的角色一致
      if (response.activeRole !== role) {
        console.error('Switch role response activeRole mismatch:', response.activeRole, 'vs requested:', role);
        return false;
      }

      // 取得完整用戶資料
      let userData: User | null = response.user || null;

      if (!userData || !userData.id) {
        // 如果 response.user 不完整，重新 fetch
        const freshUserData = await apiService.getUserWithToken(token);
        if (!freshUserData || !freshUserData.id) {
          console.error('Failed to fetch user data after role switch');
          return false;
        }
        userData = freshUserData;
      }

      // 組合完整的用戶物件，使用 API 確認的 activeRole
      const updatedUser: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        avatar: userData.avatar,
        profileImageUrl: userData.profileImageUrl,
        role: userData.role,
        activeRole: response.activeRole as UserRole, // 使用 switch API 回傳的角色
        isApproved: userData.isApproved,
        isSuperAdmin: userData.isSuperAdmin,
        accessibleRoles: userData.accessibleRoles,
        provider: userData.provider,
        providerId: userData.providerId,
      };

      // 先持久化，再更新 state（確保一致性）
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));

      // 更新 state
      setState(prev => ({ ...prev, user: updatedUser, isAuthenticated: true }));

      return true;
    } catch (error) {
      console.error('Failed to switch role:', error);
      return false;
    }
  }, []);

  // ============ 通知相關 ============

  /**
   * 刷新未讀通知數量
   * @description 從後端 API 取得最新的未讀數量
   */
  const refreshUnreadCount = useCallback(async () => {
    try {
      const token = await loadToken();
      if (!token) return;

      // 同時拉取紅點狀態和信箱未讀數量
      const [statusData, mailboxData] = await Promise.allSettled([
        apiService.getNotificationStatus(token),
        mailboxApi.getUnreadCount(token),
      ]);

      // 紅點狀態是 boolean（有/沒有），轉成 0/1 給 badge 顯示
      const hasUnreadItem = statusData.status === 'fulfilled'
        ? (statusData.value.itembox ? 1 : 0)
        : 0;
      const mailboxCount = mailboxData.status === 'fulfilled'
        ? (mailboxData.value.unreadCount || 0)
        : 0;

      setState(prev => ({
        ...prev,
        unreadItemCount: hasUnreadItem,
        unreadMailboxCount: mailboxCount,
      }));
    } catch (error) {
      // 靜默處理錯誤，此功能非核心功能
    }
  }, []);

  /**
   * 手動設定未讀數量
   * @param count - 未讀數量
   * @description 用於本地更新（如：打開物品箱後清零）
   */
  const setUnreadCount = useCallback((count: number) => {
    setState(prev => ({ ...prev, unreadItemCount: count }));
  }, []);

  // ============ 401 攔截器註冊 ============
  // 在 base.ts 的 request() 偵測到 401 時，自動執行登出清理
  // service 層不直接依賴 router/context，透過回調解耦

  useEffect(() => {
    setOnUnauthorized(() => {
      // 觸發完整登出流程（清 Token、快取、推播、Socket）
      setUser(null);
    });
    return () => setOnUnauthorized(null);
  }, [setUser]);

  // ============ 翻譯字典 ============

  /** 當前語言的翻譯字典 */
  const t = TRANSLATIONS[state.language];

  // ============ Provider 渲染 ============

  return (
    <AppContext.Provider
      value={{
        state,
        t,
        updateState,
        setLanguage,
        setUser,
        getToken,
        addToCollection,
        setResult,
        setLoading,
        setError,
        switchRole,
        refreshUnreadCount,
        setUnreadCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// ============ Hook ============

/**
 * 取得 App 全域狀態的 Hook
 *
 * @returns AppContextType
 * @throws 如果在 AppProvider 外部使用會拋出錯誤
 *
 * @example
 * const { state, setUser, t } = useApp();
 * console.log(state.user?.name);
 * console.log(t.login); // "登入"
 */
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
