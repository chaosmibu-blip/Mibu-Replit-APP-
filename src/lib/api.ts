/**
 * @fileoverview API 基礎工具函數
 *
 * 這個檔案提供：
 * 1. Token 管理（安全儲存/讀取/清除）
 * 2. 統一的 HTTP 請求封裝
 * 3. 自動處理 401 未授權錯誤
 * 4. 網路錯誤處理
 *
 * 使用方式：
 * @example
 * import { api } from '@/lib/api';
 *
 * // GET 請求
 * const user = await api.get<User>('/api/user/me');
 *
 * // POST 請求
 * const result = await api.post<GachaResponse>('/api/gacha', { city: '台北' });
 *
 * @see docs/contracts/APP.md API 契約文件
 * @see src/services/api.ts 高階 API 服務（封裝業務邏輯）
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============ 常數定義 ============

/**
 * API 基礎 URL
 * 從環境變數讀取，沒設定則使用預設值
 */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://591965a7-25f6-479c-b527-3890b1193c21-00-1m08cwv9a4rev.picard.replit.dev';

/** Token 儲存的 Key */
const TOKEN_KEY = 'auth_token';

// ============ Token 管理 ============

/**
 * 讀取已儲存的 Token
 *
 * @returns JWT Token 或 null（未登入）
 * @description iOS/Android 使用 SecureStore（加密），Web 使用 AsyncStorage
 */
async function getToken(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      return await AsyncStorage.getItem(TOKEN_KEY);
    }
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Failed to get token:', error);
    return null;
  }
}

/**
 * 儲存 Token
 *
 * @param token - JWT Token 字串
 * @description 登入成功後呼叫，將 Token 安全儲存
 */
export async function setToken(token: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } else {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    }
  } catch (error) {
    console.error('Failed to save token:', error);
  }
}

/**
 * 清除 Token
 *
 * @description 登出時呼叫，清除本地儲存的 Token
 */
export async function clearToken(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
  } catch (error) {
    console.error('Failed to clear token:', error);
  }
}

// ============ 型別定義 ============

/**
 * API 回應的統一格式（內部使用）
 * @template T - 回應資料的型別
 */
interface ApiResponse<T> {
  data?: T;       // 成功時的資料
  error?: string; // 失敗時的錯誤訊息
  status: number; // HTTP 狀態碼
}

/**
 * API 錯誤類別
 *
 * 包含 HTTP 狀態碼，方便上層處理不同類型的錯誤
 *
 * @example
 * try {
 *   await api.get('/api/user/me');
 * } catch (error) {
 *   if (error instanceof ApiError && error.status === 404) {
 *     // 處理 404 錯誤
 *   }
 * }
 */
class ApiError extends Error {
  /** HTTP 狀態碼（0 表示網路錯誤） */
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// ============ 401 未授權回調 ============

/** 401 未授權時的回調函數（通常是導向登入頁） */
let onUnauthorized: (() => void) | null = null;

/**
 * 設定 401 未授權的回調
 *
 * @param callback - 收到 401 時要執行的函數
 *
 * @example
 * // 在 App 初始化時設定
 * setOnUnauthorized(() => {
 *   navigation.reset({ routes: [{ name: 'Login' }] });
 * });
 */
export function setOnUnauthorized(callback: () => void): void {
  onUnauthorized = callback;
}

// ============ 核心請求函數 ============

/**
 * 統一的 HTTP 請求函數
 *
 * @template T - 預期的回應資料型別
 * @param endpoint - API 端點（如 '/api/user/me'）
 * @param options - fetch 選項（method, body, headers 等）
 * @returns 回應資料
 * @throws {ApiError} API 錯誤或網路錯誤
 *
 * 功能：
 * 1. 自動帶上 Token（如果有）
 * 2. 自動設定 Content-Type: application/json
 * 3. 401 時自動清除 Token 並觸發回調
 * 4. 統一的錯誤處理
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // 組合完整 URL
  const url = `${API_BASE_URL}${endpoint}`;

  // 讀取 Token
  const token = await getToken();

  // 設定 Headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  // 如果有 Token，加到 Authorization header
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  try {
    // 發送請求
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // === 處理 401 未授權 ===
    if (response.status === 401) {
      // 清除無效的 Token
      await clearToken();
      // 觸發回調（通常是導向登入頁）
      if (onUnauthorized) {
        onUnauthorized();
      }
      throw new ApiError('未授權，請重新登入', 401);
    }

    // === 處理其他錯誤狀態 ===
    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(
        errorText || `API 錯誤: ${response.status}`,
        response.status
      );
    }

    // === 處理成功回應 ===
    // 只有 content-type 是 JSON 才解析
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }

    // 非 JSON 回應（如 204 No Content）
    return {} as T;
  } catch (error) {
    // === 錯誤處理 ===

    // ApiError 直接往上拋
    if (error instanceof ApiError) {
      throw error;
    }

    // 網路錯誤（fetch 失敗）
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError('網路連線錯誤，請檢查網路', 0);
    }

    // 其他未知錯誤
    throw new ApiError(
      error instanceof Error ? error.message : '未知錯誤',
      0
    );
  }
}

// ============ API 方法封裝 ============

/**
 * API 請求方法集合
 *
 * 提供 RESTful 風格的 HTTP 方法
 *
 * @example
 * // GET
 * const users = await api.get<User[]>('/api/users');
 *
 * // POST
 * const newUser = await api.post<User>('/api/users', { name: 'John' });
 *
 * // PUT（完整更新）
 * await api.put('/api/users/1', { name: 'John', email: 'john@example.com' });
 *
 * // PATCH（部分更新）
 * await api.patch('/api/users/1', { name: 'Jane' });
 *
 * // DELETE
 * await api.delete('/api/users/1');
 */
export const api = {
  /**
   * GET 請求
   * @template T - 回應資料型別
   * @param endpoint - API 端點
   * @param options - 額外的 fetch 選項
   */
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  /**
   * POST 請求
   * @template T - 回應資料型別
   * @param endpoint - API 端點
   * @param body - 請求內容（會自動 JSON.stringify）
   * @param options - 額外的 fetch 選項
   */
  post: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  /**
   * PUT 請求（完整更新資源）
   * @template T - 回應資料型別
   * @param endpoint - API 端點
   * @param body - 請求內容
   * @param options - 額外的 fetch 選項
   */
  put: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  /**
   * PATCH 請求（部分更新資源）
   * @template T - 回應資料型別
   * @param endpoint - API 端點
   * @param body - 請求內容
   * @param options - 額外的 fetch 選項
   */
  patch: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  /**
   * DELETE 請求
   * @template T - 回應資料型別
   * @param endpoint - API 端點
   * @param options - 額外的 fetch 選項
   */
  delete: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};

// ============ 特定 API 函數 ============

import type { ItineraryV3Payload, ItineraryV3Response, ItineraryPace } from '../types';

/**
 * 生成 AI 行程（V3 版本）
 *
 * @param city - 城市名稱
 * @param district - 區域名稱
 * @param pace - 行程節奏（'relaxed' | 'moderate' | 'packed'）
 * @returns AI 生成的行程資料
 *
 * @description
 * 這是 AI 行程生成的核心 API。
 * 注意：AI 生成需要 1-2 分鐘，前端需要顯示適當的 loading 狀態。
 *
 * @example
 * const itinerary = await generateItineraryV3('台北市', '信義區', 'moderate');
 */
export async function generateItineraryV3(
  city: string,
  district: string,
  pace: ItineraryPace = 'moderate'
): Promise<ItineraryV3Response> {
  const payload: ItineraryV3Payload = { city, district, pace };
  return api.post<ItineraryV3Response>('/api/gacha/itinerary/v3', payload);
}

// ============ Export ============

export { ApiError };
