import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { AppState, Language, User, GachaItem, GachaResponse, UserRole } from '../types';
import { TRANSLATIONS, DEFAULT_LEVEL } from '../constants/translations';
import { apiService } from '../services/api';
import { pushNotificationService } from '../services/pushNotificationService';

const saveToken = async (token: string): Promise<void> => {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem('@mibu_token', token);
  } else {
    await SecureStore.setItemAsync('mibu_token', token);
  }
};

const loadToken = async (): Promise<string | null> => {
  if (Platform.OS === 'web') {
    return await AsyncStorage.getItem('@mibu_token');
  }
  return await SecureStore.getItemAsync('mibu_token');
};

const removeToken = async (): Promise<void> => {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem('@mibu_token');
  } else {
    await SecureStore.deleteItemAsync('mibu_token');
  }
};

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
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  LANGUAGE: '@mibu_language',
  COLLECTION: '@mibu_collection',
  USER: '@mibu_user',
  TOKEN: '@mibu_token',
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const [storedLanguage, storedCollection, storedToken] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE),
        AsyncStorage.getItem(STORAGE_KEYS.COLLECTION),
        loadToken(),
      ]);

      const updates: Partial<AppState> = {};

      if (storedLanguage) {
        updates.language = storedLanguage as Language;
      }

      if (storedCollection) {
        updates.collection = JSON.parse(storedCollection);
      }

      // 如果有 Token，呼叫 API 取得最新用戶資料
      if (storedToken) {
        try {
          const freshUser = await apiService.getUserWithToken(storedToken);
          if (freshUser && freshUser.id) {
            updates.user = freshUser;
            updates.isAuthenticated = true;
            // 更新本地快取
            await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(freshUser));
            // 註冊推播通知
            pushNotificationService.registerTokenWithBackend(storedToken).catch(console.error);
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

      if (Object.keys(updates).length > 0) {
        setState(prev => ({ ...prev, ...updates }));
      }
    } catch (error) {
      console.error('Error loading stored data:', error);
    }
  };

  const updateState = useCallback((updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const setLanguage = useCallback(async (lang: Language) => {
    setState(prev => ({ ...prev, language: lang }));
    await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  }, []);

  const setUser = useCallback(async (user: User | null, token?: string | null) => {
    setState(prev => ({
      ...prev,
      user,
      isAuthenticated: !!user
    }));
    if (user) {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      if (token) {
        await saveToken(token);
        // 登入成功後註冊推播通知
        pushNotificationService.registerTokenWithBackend(token).catch(console.error);
      }
    } else {
      // 登出時取消推播註冊
      const currentToken = await loadToken();
      if (currentToken) {
        pushNotificationService.unregisterToken(currentToken).catch(console.error);
      }
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
      await removeToken();
    }
  }, []);

  const getToken = useCallback(async (): Promise<string | null> => {
    try {
      return await loadToken();
    } catch {
      return null;
    }
  }, []);

  const addToCollection = useCallback(async (items: GachaItem[]) => {
    setState(prev => {
      const existingIds = new Set(prev.collection.map(i => i.id));
      const newItems = items.filter(i => !existingIds.has(i.id));
      if (newItems.length === 0) return prev;
      const updatedCollection = [...prev.collection, ...newItems];
      
      AsyncStorage.setItem(STORAGE_KEYS.COLLECTION, JSON.stringify(updatedCollection));
      
      return { ...prev, collection: updatedCollection };
    });
  }, []);

  const setResult = useCallback((result: GachaResponse | null) => {
    setState(prev => ({ ...prev, result }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const switchRole = useCallback(async (role: UserRole): Promise<boolean> => {
    try {
      const token = await loadToken();
      if (!token) return false;

      const response = await apiService.switchRole(token, role);
      
      // Validate response has activeRole
      if (!response.activeRole) {
        console.error('Switch role response missing activeRole');
        return false;
      }

      // Validate the activeRole matches what we requested
      if (response.activeRole !== role) {
        console.error('Switch role response activeRole mismatch:', response.activeRole, 'vs requested:', role);
        return false;
      }

      // Use the response.user if available, otherwise fetch fresh data
      let userData: User | null = response.user || null;
      
      if (!userData || !userData.id) {
        // Fallback to re-fetching if response.user is incomplete
        const freshUserData = await apiService.getUserWithToken(token);
        if (!freshUserData || !freshUserData.id) {
          console.error('Failed to fetch user data after role switch');
          return false;
        }
        userData = freshUserData;
      }

      // Create complete user object with the confirmed activeRole from the switch response
      const updatedUser: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        avatar: userData.avatar,
        profileImageUrl: userData.profileImageUrl,
        role: userData.role,
        activeRole: response.activeRole as UserRole, // Use confirmed activeRole from switch response
        isApproved: userData.isApproved,
        isSuperAdmin: userData.isSuperAdmin,
        accessibleRoles: userData.accessibleRoles,
        provider: userData.provider,
        providerId: userData.providerId,
      };

      // Persist first, then update state to ensure consistency
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      
      // Synchronously update state
      setState(prev => ({ ...prev, user: updatedUser, isAuthenticated: true }));
      
      // Verify state was updated correctly before returning success
      return true;
    } catch (error) {
      console.error('Failed to switch role:', error);
      return false;
    }
  }, []);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const token = await loadToken();
      if (!token) return;
      
      const data = await apiService.getUnreadCounts(token);
      const unreadCount = data.unread?.itembox || 0;
      setState(prev => ({ ...prev, unreadItemCount: unreadCount }));
    } catch (error) {
      // 靜默處理錯誤，此功能非核心功能
    }
  }, []);

  const setUnreadCount = useCallback((count: number) => {
    setState(prev => ({ ...prev, unreadItemCount: count }));
  }, []);

  const t = TRANSLATIONS[state.language];

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

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
