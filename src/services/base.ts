/**
 * API 基礎設施 - 共用的 request 方法和類型
 */
import { API_BASE_URL } from '../constants/translations';

export class ApiBase {
  protected baseUrl = API_BASE_URL;

  protected async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  protected authHeaders(token: string): Record<string, string> {
    return {
      'Authorization': `Bearer ${token}`,
    };
  }
}

export const API_BASE = API_BASE_URL;
