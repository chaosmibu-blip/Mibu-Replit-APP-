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
    return this.request<ProfileResponse>('/api/profile', {
      method: 'PATCH',
      headers: this.authHeaders(token),
      body: JSON.stringify(params),
    });
  }

  async deleteAccount(token: string): Promise<DeleteAccountResponse> {
    const url = `${this.baseUrl}/api/user/account`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
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
}

export const authApi = new AuthApiService();
