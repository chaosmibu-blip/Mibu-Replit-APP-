/**
 * 認證相關 API - 登入、註冊、Token 管理
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

class AuthApiService extends ApiBase {
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

  async login(username: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const data = await this.request<User>('/api/auth/user');
      return data;
    } catch {
      return null;
    }
  }

  async getUserWithToken(token: string): Promise<User> {
    return this.request<User>('/api/auth/user', {
      headers: this.authHeaders(token),
    });
  }

  async switchRole(token: string, role: UserRole): Promise<{ user: User; activeRole: string }> {
    return this.request<{ user: User; activeRole: string }>('/api/auth/switch-role', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify({ role }),
    });
  }

  async logout(token: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/api/auth/logout', {
      method: 'POST',
      headers: this.authHeaders(token),
    });
  }

  async getProfile(token: string): Promise<UserProfile> {
    return this.request<UserProfile>('/api/profile', {
      headers: this.authHeaders(token),
    });
  }

  async updateProfile(token: string, params: UpdateProfileParams): Promise<ProfileResponse> {
    return this.request<ProfileResponse>('/api/account/profile', {
      method: 'PATCH',
      headers: this.authHeaders(token),
      body: JSON.stringify(params),
    });
  }

  /**
   * 刪除用戶帳號
   * DELETE /api/auth/account (#011 端點對齊)
   */
  async deleteAccount(token: string): Promise<DeleteAccountResponse> {
    return this.request<DeleteAccountResponse>('/api/auth/account', {
      method: 'DELETE',
      headers: this.authHeaders(token),
    });
  }

  /**
   * 統一的 Mobile 登入 API（取代舊的 /api/auth/apple 和 /api/auth/google）
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

  // ========== 帳號綁定 (Phase 6) ==========

  /**
   * 綁定新身份（Apple/Google）
   * POST /api/auth/bind
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
   * GET /api/auth/identities
   */
  async getIdentities(token: string): Promise<{ identities: LinkedIdentity[]; primary: string }> {
    return this.request<{ identities: LinkedIdentity[]; primary: string }>('/api/auth/identities', {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 解除綁定
   * DELETE /api/auth/identities/:id
   */
  async unlinkIdentity(
    token: string,
    identityId: string
  ): Promise<{ success: boolean; message: string }> {
    const url = `${this.baseUrl}/api/auth/identities/${identityId}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  }
}

/** 綁定身份資料 */
export interface LinkedIdentity {
  id: string;
  provider: 'apple' | 'google';
  providerId: string;
  email: string | null;
  isPrimary: boolean;
  linkedAt: string; // ISO 8601
}

export const authApi = new AuthApiService();
