/**
 * API 基礎設施 - 共用的 request 方法和類型
 */
import { API_BASE_URL } from '../constants/translations';

export interface ApiErrorResponse {
  success: false;
  message?: string;
  error?: string;
  code?: string;
  detail?: string;
  reason?: string;
}

export class ApiError extends Error {
  status: number;
  serverMessage?: string;
  code?: string;

  constructor(status: number, message: string, serverMessage?: string, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.serverMessage = serverMessage;
    this.code = code;
  }
}

export class ApiBase {
  protected baseUrl = API_BASE_URL;

  protected async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log('[ApiBase] Full URL:', url);
    console.log('[ApiBase] Authorization:', options.headers && 'Authorization' in options.headers ? 'Bearer ***' : 'none');
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
    });

    // 嘗試解析 JSON 回應
    let data: T | ApiErrorResponse;
    try {
      data = await response.json();
    } catch {
      // 無法解析 JSON
      if (!response.ok) {
        throw new ApiError(response.status, `API Error: ${response.status}`);
      }
      throw new Error('Invalid JSON response');
    }

    // 檢查 HTTP 狀態碼
    if (!response.ok) {
      const errorData = data as ApiErrorResponse;
      // 嘗試從多個可能的欄位提取錯誤訊息
      const serverMessage = errorData.message || errorData.error || errorData.detail || errorData.reason;
      console.log('[ApiBase] HTTP error response:', JSON.stringify(errorData));
      throw new ApiError(
        response.status,
        `API Error: ${response.status}`,
        serverMessage,
        errorData.code
      );
    }

    return data as T;
  }

  protected authHeaders(token: string): Record<string, string> {
    return {
      'Authorization': `Bearer ${token}`,
    };
  }
}

export const API_BASE = API_BASE_URL;
