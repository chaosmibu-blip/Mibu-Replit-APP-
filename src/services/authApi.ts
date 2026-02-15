/**
 * 認證相關 API 服務
 *
 * 處理用戶認證、Token 管理、帳號綁定等功能
 * 只支援 Google / Apple OAuth 登入
 *
 * @module services/authApi
 * @see 後端契約: contracts/APP.md
 *
 * ============ 串接端點 ============
 * - GET  /api/auth/user        - 取得當前用戶
 * - POST /api/auth/switch-role - 切換角色
 * - POST /api/auth/logout      - 用戶登出
 * - GET  /api/profile          - 取得用戶檔案
 * - PATCH /api/profile         - 更新用戶檔案
 * - DELETE /api/auth/account   - 刪除帳號 (#011)
 * - POST /api/auth/mobile      - Mobile OAuth 登入
 * - POST /api/auth/guest       - 訪客登入（#049 後端建帳 + 發 JWT）
 * （帳號綁定 API 已移除：bindIdentity / getIdentities / unlinkIdentity）
 *
 * #044 已移除：密碼登入/註冊、帳號合併（2026-02-10）
 */
import { ApiBase } from './base';
import {
  User,
  AuthResponse,
  UserRole,
  UserProfile,
  UpdateProfileParams,
  ProfileResponse,
  DeleteAccountResponse,
  GuestLoginResponse,
} from '../types';

// ============ API 服務類別 ============

/**
 * 認證 API 服務類別
 *
 * 提供用戶認證相關的所有功能
 */
class AuthApiService extends ApiBase {

  // ============ 基本認證 ============
  // #044: 密碼登入/註冊已移除，只保留 OAuth（mobileAuth）

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
    deviceId?: string; // #046: 訪客自動升級，後端用此找同裝置訪客帳號
  }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/mobile', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // ============ #049 訪客登入 ============

  /**
   * 訪客登入（後端建帳 + 發 JWT）
   *
   * 取代前端自行產生 UUID 的舊做法。
   * 同一 deviceId 重複呼叫不會重複建帳（冪等操作）。
   *
   * @param deviceId - 裝置唯一識別碼
   * @returns 訪客帳號資訊 + JWT Token
   */
  async guestLogin(deviceId: string): Promise<GuestLoginResponse> {
    return this.request<GuestLoginResponse>('/api/auth/guest', {
      method: 'POST',
      body: JSON.stringify({ deviceId }),
    });
  }

  // ============ 帳號綁定 (Phase 6) ============

  // #044: 帳號合併功能已移除
  // #044: 帳號綁定功能已移除（bindIdentity / getIdentities / unlinkIdentity）

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

// LinkedIdentity 型別已移除（帳號綁定功能已移除）

// ============ 匯出 ============

/** 認證 API 服務實例 */
export const authApi = new AuthApiService();
