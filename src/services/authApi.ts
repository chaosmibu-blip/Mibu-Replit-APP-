/**
 * 認證相關 API 服務
 *
 * 處理用戶認證、註冊、登入、Token 管理、帳號綁定等功能
 *
 * @module services/authApi
 * @see 後端契約: contracts/APP.md
 *
 * ============ 串接端點 ============
 * - POST /api/auth/register    - 用戶註冊
 * - POST /api/auth/login       - 用戶登入
 * - GET  /api/auth/user        - 取得當前用戶
 * - POST /api/auth/switch-role - 切換角色
 * - POST /api/auth/logout      - 用戶登出
 * - GET  /api/profile          - 取得用戶檔案
 * - PATCH /api/profile         - 更新用戶檔案
 * - DELETE /api/auth/account   - 刪除帳號 (#011)
 * - POST /api/auth/mobile      - Mobile OAuth 登入
 * - POST /api/auth/bind        - 綁定新身份 (Phase 6)
 * - GET  /api/auth/identities  - 取得綁定身份列表 (Phase 6)
 * - DELETE /api/auth/identities/:id - 解除綁定 (Phase 6)
 * - POST /api/auth/merge       - 帳號合併 (#036)
 * - GET  /api/auth/merge-history - 查詢合併歷史 (#036)
 */
import { ApiBase } from './base';
import {
  User,
  AuthResponse,
  UserRole,
  UserProfile,
  UpdateProfileParams,
  ProfileResponse,
  DeleteAccountResponse
} from '../types';

// ============ #036 帳號合併型別 ============

/**
 * 帳號合併結果摘要
 *
 * 記錄合併過程中移轉的資料數量
 */
export interface MergeSummary {
  /** 移轉的收藏數量 */
  collections: number;
  /** 移轉的行程數量 */
  itineraries: number;
  /** 移轉的我的最愛數量 */
  favorites: number;
  /** 移轉的成就數量 */
  achievements: number;
  /** 移轉的通知數量 */
  notifications: number;
  /** 合併的經驗值 */
  expMerged: number;
  /** 合併的餘額 */
  balanceMerged: number;
}

/**
 * 帳號合併回應
 */
export interface MergeAccountResponse {
  /** 操作是否成功 */
  success: boolean;
  /** 合併記錄 ID */
  mergeId?: number;
  /** 合併摘要 */
  summary?: MergeSummary;
  /** 回應訊息 */
  message?: string;
  /** 錯誤碼 */
  code?: string;
}

/**
 * 合併歷史記錄項目
 */
export interface MergeHistoryItem {
  /** 記錄 ID */
  id: number;
  /** 被合併的副帳號 ID */
  secondaryUserId: string;
  /** 合併狀態 */
  status: 'pending' | 'processing' | 'completed' | 'failed';
  /** 已合併的資料表統計 */
  mergedTables: Record<string, number> | null;
  /** 發起時間（ISO 8601） */
  initiatedAt: string;
  /** 完成時間（ISO 8601），若未完成為 null */
  completedAt: string | null;
}

/**
 * 合併歷史回應
 */
export interface MergeHistoryResponse {
  /** 合併歷史記錄列表 */
  merges: MergeHistoryItem[];
}

// ============ API 服務類別 ============

/**
 * 認證 API 服務類別
 *
 * 提供用戶認證相關的所有功能
 */
class AuthApiService extends ApiBase {

  // ============ 基本認證 ============

  /**
   * 用戶註冊
   *
   * @param params - 註冊參數
   * @param params.username - 用戶名稱
   * @param params.password - 密碼
   * @param params.name - 顯示名稱
   * @param params.role - 用戶角色
   * @returns 認證回應，包含 token 和用戶資料
   *
   * @example
   * const result = await authApi.register({
   *   username: 'user@example.com',
   *   password: 'secret123',
   *   name: '王小明',
   *   role: 'traveler',
   * });
   */
  async register(params: {
    username: string;
    password: string;
    name: string;
    role: UserRole;
  }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  /**
   * 用戶登入
   *
   * @param username - 用戶名稱（通常是 email）
   * @param password - 密碼
   * @returns 認證回應，包含 token 和用戶資料
   *
   * @example
   * const result = await authApi.login('user@example.com', 'secret123');
   * // 儲存 token
   * await SecureStore.setItemAsync('token', result.token);
   */
  async login(username: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  /**
   * 取得當前用戶資料
   *
   * 不需要傳入 token，依賴 cookie 或 session
   *
   * @returns 用戶資料，若未登入則回傳 null
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const data = await this.request<User>('/api/auth/user');
      return data;
    } catch {
      // 未登入或 token 過期
      return null;
    }
  }

  /**
   * 使用 Token 取得用戶資料
   *
   * @param token - JWT Token
   * @returns 用戶資料
   * @throws {ApiError} 當 token 無效或過期時
   */
  async getUserWithToken(token: string): Promise<User> {
    return this.request<User>('/api/auth/user', {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 切換用戶角色
   *
   * 用戶可在 traveler、merchant、specialist 等角色間切換
   *
   * @param token - JWT Token
   * @param role - 要切換到的角色
   * @returns 更新後的用戶資料和當前角色
   */
  async switchRole(token: string, role: UserRole): Promise<{ user: User; activeRole: string }> {
    return this.request<{ user: User; activeRole: string }>('/api/auth/switch-role', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify({ role }),
    });
  }

  /**
   * 用戶登出
   *
   * @param token - JWT Token
   * @returns 登出結果
   */
  async logout(token: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/api/auth/logout', {
      method: 'POST',
      headers: this.authHeaders(token),
    });
  }

  // ============ 用戶檔案 ============

  /**
   * 取得用戶檔案
   *
   * @param token - JWT Token
   * @returns 用戶檔案資料
   */
  async getProfile(token: string): Promise<UserProfile> {
    return this.request<UserProfile>('/api/profile', {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 更新用戶檔案
   *
   * @param token - JWT Token
   * @param params - 要更新的欄位
   * @returns 更新後的用戶檔案
   */
  async updateProfile(token: string, params: UpdateProfileParams): Promise<ProfileResponse> {
    return this.request<ProfileResponse>('/api/profile', {
      method: 'PATCH',
      headers: this.authHeaders(token),
      body: JSON.stringify(params),
    });
  }

  /**
   * 刪除用戶帳號
   *
   * 此操作不可逆，會永久刪除用戶所有資料
   * #011 端點對齊
   *
   * @param token - JWT Token
   * @returns 刪除結果
   */
  async deleteAccount(token: string): Promise<DeleteAccountResponse> {
    return this.request<DeleteAccountResponse>('/api/auth/account', {
      method: 'DELETE',
      headers: this.authHeaders(token),
    });
  }

  // ============ Mobile OAuth ============

  /**
   * 統一的 Mobile 登入 API
   *
   * 取代舊的 /api/auth/apple 和 /api/auth/google 端點
   * 支援 Apple Sign In 和 Google Sign In
   *
   * @param params - 登入參數
   * @param params.provider - 登入提供者（apple 或 google）
   * @param params.identityToken - 第三方提供的 identity token
   * @param params.user - 用戶 ID（可選）
   * @param params.portal - 入口點（可選）
   * @param params.email - Email（可選，Apple 首次登入可能提供）
   * @param params.fullName - 全名（可選，Apple 首次登入可能提供）
   * @returns 認證回應
   */
  async mobileAuth(params: {
    provider: 'apple' | 'google';
    identityToken: string;
    user?: string;
    portal?: string;
    email?: string | null;
    fullName?: { givenName?: string | null; familyName?: string | null };
  }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/mobile', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // ============ 帳號綁定 (Phase 6) ============

  /**
   * 綁定新身份（Apple/Google）
   *
   * 讓用戶可以同時使用多種登入方式
   *
   * @param token - JWT Token（當前登入的帳號）
   * @param params - 綁定參數
   * @param params.provider - 要綁定的提供者
   * @param params.identityToken - 第三方 identity token
   * @returns 綁定結果和新的身份資料
   */
  async bindIdentity(
    token: string,
    params: {
      provider: 'apple' | 'google';
      identityToken: string;
    }
  ): Promise<{ success: boolean; message: string; identity: LinkedIdentity }> {
    return this.request<{ success: boolean; message: string; identity: LinkedIdentity }>(
      '/api/auth/bind',
      {
        method: 'POST',
        headers: this.authHeaders(token),
        body: JSON.stringify(params),
      }
    );
  }

  /**
   * 取得綁定身份列表
   *
   * @param token - JWT Token
   * @returns 已綁定的身份列表和主要身份 ID
   */
  async getIdentities(token: string): Promise<{ identities: LinkedIdentity[]; primary: string }> {
    return this.request<{ identities: LinkedIdentity[]; primary: string }>('/api/auth/identities', {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 解除綁定
   *
   * 移除一個已綁定的登入方式
   * 注意：必須保留至少一個登入方式
   *
   * @param token - JWT Token
   * @param identityId - 要解除的身份 ID
   * @returns 解除結果
   */
  async unlinkIdentity(
    token: string,
    identityId: string
  ): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(
      `/api/auth/identities/${identityId}`,
      {
        method: 'DELETE',
        headers: this.authHeaders(token),
      }
    );
  }

  // ============ #036 帳號合併 ============

  /**
   * 執行帳號合併
   *
   * 將副帳號的資料合併到主帳號（當前登入的帳號）
   * 合併後副帳號將無法登入
   *
   * @param token - 主帳號的 JWT Token
   * @param secondaryToken - 副帳號的 JWT Token
   * @returns 合併結果和資料移轉摘要
   *
   * @example
   * // 用戶先登入副帳號取得 secondaryToken
   * // 然後用主帳號的 token 呼叫合併
   * const result = await authApi.mergeAccount(mainToken, secondaryToken);
   * if (result.success) {
   *   console.log(`已合併 ${result.summary?.collections} 個收藏`);
   * }
   */
  async mergeAccount(
    token: string,
    secondaryToken: string
  ): Promise<MergeAccountResponse> {
    try {
      const result = await this.request<{
        success: boolean;
        mergeId: number;
        summary: MergeSummary;
        message: string;
      }>('/api/auth/merge', {
        method: 'POST',
        headers: this.authHeaders(token),
        body: JSON.stringify({ secondaryToken }),
      });
      return result;
    } catch (error) {
      // 處理錯誤回應，提取伺服器訊息
      if (error instanceof Error) {
        const apiError = error as any;
        return {
          success: false,
          message: apiError.serverMessage || apiError.message || '合併失敗',
          code: apiError.code,
        };
      }
      return { success: false, message: '合併失敗，請稍後再試' };
    }
  }

  /**
   * 查詢合併歷史
   *
   * 取得該用戶過去的帳號合併記錄
   *
   * @param token - JWT Token
   * @returns 合併歷史記錄列表
   */
  async getMergeHistory(token: string): Promise<MergeHistoryResponse> {
    return this.request<MergeHistoryResponse>('/api/auth/merge-history', {
      headers: this.authHeaders(token),
    });
  }

  // ============ #038 頭像上傳 ============

  /**
   * 上傳自訂頭像
   *
   * 使用 Base64 JSON 格式上傳圖片
   * 支援 jpg/png/webp 格式，限制 2MB
   *
   * @param token - JWT Token
   * @param base64 - 圖片的 Base64 字串（不含 data:image/xxx;base64, 前綴）
   * @param mimeType - 圖片 MIME 類型，預設 image/jpeg
   * @returns 上傳結果和新的頭像 URL
   *
   * @example
   * const result = await authApi.uploadAvatar(token, imageResult.assets[0].base64, 'image/jpeg');
   * if (result.success) {
   *   console.log('新頭像:', result.avatarUrl);
   * }
   */
  async uploadAvatar(
    token: string,
    base64: string,
    mimeType: string = 'image/jpeg'
  ): Promise<UploadAvatarResponse> {
    try {
      // 改用 this.request() 統一走 base.ts（含超時機制）
      const result = await this.request<{ avatarUrl: string; message?: string }>(
        '/api/avatar/upload',
        {
          method: 'POST',
          headers: this.authHeaders(token),
          body: JSON.stringify({ image: base64, mimeType }),
        }
      );
      return {
        success: true,
        avatarUrl: result.avatarUrl,
        message: result.message || '上傳成功',
      };
    } catch (error) {
      // 保留 try-catch：caller 依賴 { success: false } 回傳，不可改為 throw
      console.error('Upload avatar error:', error);
      const apiError = error as any;
      return {
        success: false,
        message: apiError.serverMessage || apiError.message || '上傳失敗，請稍後再試',
        code: apiError.code,
      };
    }
  }
}

// ============ 類型定義 ============

/**
 * #038 頭像上傳回應
 */
export interface UploadAvatarResponse {
  /** 是否成功 */
  success: boolean;
  /** 新頭像 URL（成功時） */
  avatarUrl?: string;
  /** 訊息 */
  message?: string;
  /** 錯誤碼（失敗時） */
  code?: string;
}

/**
 * 綁定身份資料
 *
 * 記錄用戶已綁定的登入方式
 */
export interface LinkedIdentity {
  /** 身份 ID */
  id: string;
  /** 登入提供者 */
  provider: 'apple' | 'google';
  /** 第三方提供者的用戶 ID */
  providerId: string;
  /** 關聯的 Email */
  email: string | null;
  /** 是否為主要身份 */
  isPrimary: boolean;
  /** 綁定時間（ISO 8601） */
  linkedAt: string;
}

// ============ 匯出 ============

/** 認證 API 服務實例 */
export const authApi = new AuthApiService();
