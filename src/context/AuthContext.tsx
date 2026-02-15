/**
 * ============================================================
 * 認證 Context (AuthContext.tsx)
 * ============================================================
 * 負責用戶認證相關的全域狀態：
 * - 用戶資料（user）與認證狀態（isAuthenticated）
 * - Token 安全存取（getToken）
 * - 登入/登出流程（setUser）
 * - 角色切換（switchRole）
 * - 401 未授權攔截器
 *
 * 從 AppContext 拆分而來，減少不相關狀態變更造成的 re-render
 *
 * 更新日期：2026-02-12（Context 拆分 Phase 1）
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole } from '../types';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { apiService } from '../services/api';
import { pushNotificationService } from '../services/pushNotificationService';
import { preloadService } from '../services/preloadService';
import { disconnectSocket } from '../services/socket';
import { setOnUnauthorized, resetUnauthorizedFlag } from '../services/base';
import { saveToken, loadToken, removeToken } from './tokenUtils';
import { queryClient } from './QueryProvider';

// ============ 型別定義 ============

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  getToken: () => Promise<string | null>;
  setUser: (user: User | null, token?: string | null) => void;
  switchRole: (role: UserRole) => Promise<boolean>;
}

// ============ Context ============

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============ Provider ============

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ========== 初始化：驗證 Token 並恢復用戶狀態 ==========
  useEffect(() => {
    loadAuthData();
  }, []);

  const loadAuthData = async () => {
    try {
      const storedToken = await loadToken();

      if (storedToken) {
        try {
          const freshUser = await apiService.getUserWithToken(storedToken);
          if (freshUser && freshUser.id) {
            setUserState(freshUser);
            setIsAuthenticated(true);
            await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(freshUser));
            pushNotificationService.registerTokenWithBackend(storedToken).catch(console.error);
            preloadService.preloadAfterAuth();
          } else {
            await removeToken();
            await AsyncStorage.removeItem(STORAGE_KEYS.USER);
          }
        } catch (apiError) {
          console.error('Token validation failed:', apiError);
          // 網路問題 fallback 到本地快取
          const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);
          if (storedUser) {
            const cachedUser = JSON.parse(storedUser);
            setUserState(cachedUser);
            setIsAuthenticated(true);
          } else {
            await removeToken();
          }
        }
      }
      // #049: 訪客現在有 JWT Token，走正常 token 路徑，不再需要舊的 guest fallback
    } catch (error) {
      console.error('Error loading auth data:', error);
    }
  };

  // ========== Actions ==========

  /**
   * 設定/清除用戶
   * 登入時：儲存用戶資料 + Token + 註冊推播
   * 登出時：清除所有用戶資料 + 取消推播註冊
   */
  const setUser = useCallback(async (user: User | null, token?: string | null) => {
    if (user) {
      // === 登入 ===
      setUserState(user);
      setIsAuthenticated(true);
      resetUnauthorizedFlag();
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      if (token) {
        await saveToken(token);
        pushNotificationService.registerTokenWithBackend(token).catch(console.error);
        preloadService.preloadAfterAuth();
      }
    } else {
      // === 登出 ===
      setUserState(null);
      setIsAuthenticated(false);
      // 取消推播
      const currentToken = await loadToken();
      if (currentToken) {
        pushNotificationService.unregisterToken(currentToken).catch(console.error);
      }
      // 白名單制清除 AsyncStorage
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
      queryClient.clear(); // 清除 React Query 快取（Phase 3）
      disconnectSocket();
    }
  }, []);

  /** 取得當前 Token */
  const getToken = useCallback(async (): Promise<string | null> => {
    try {
      return await loadToken();
    } catch {
      return null;
    }
  }, []);

  /** 切換用戶角色 */
  const switchRole = useCallback(async (role: UserRole): Promise<boolean> => {
    try {
      const token = await loadToken();
      if (!token) return false;

      const response = await apiService.switchRole(token, role);

      if (!response.activeRole || response.activeRole !== role) {
        console.error('Switch role response mismatch');
        return false;
      }

      let userData: User | null = response.user || null;
      if (!userData || !userData.id) {
        const freshUserData = await apiService.getUserWithToken(token);
        if (!freshUserData || !freshUserData.id) {
          console.error('Failed to fetch user data after role switch');
          return false;
        }
        userData = freshUserData;
      }

      const updatedUser: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        avatar: userData.avatar,
        profileImageUrl: userData.profileImageUrl,
        role: userData.role,
        activeRole: response.activeRole as UserRole,
        isApproved: userData.isApproved,
        isSuperAdmin: userData.isSuperAdmin,
        accessibleRoles: userData.accessibleRoles,
        provider: userData.provider,
        providerId: userData.providerId,
      };

      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      setUserState(updatedUser);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Failed to switch role:', error);
      return false;
    }
  }, []);

  // ========== 401 攔截器 ==========
  useEffect(() => {
    setOnUnauthorized(() => {
      setUser(null);
    });
    return () => setOnUnauthorized(null);
  }, [setUser]);

  // ========== Memoized Value（避免不必要的 re-render） ==========
  const value = useMemo<AuthContextType>(() => ({
    user,
    isAuthenticated,
    getToken,
    setUser,
    switchRole,
  }), [user, isAuthenticated, getToken, setUser, switchRole]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ============ Hook ============

/**
 * 取得認證狀態的 Hook
 *
 * @example
 * const { user, isAuthenticated, getToken, setUser } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
