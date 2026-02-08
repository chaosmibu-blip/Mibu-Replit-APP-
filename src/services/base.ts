/**
 * API 基礎設施模組
 *
 * 提供所有 API 服務的基礎類別和共用工具
 * 包含統一的 HTTP 請求方法、錯誤處理機制、認證標頭生成
 *
 * @module services/base
 * @see 後端契約: contracts/APP.md
 *
 * ============ 串接端點 ============
 * 此模組不直接串接端點，而是提供基礎設施給其他 API 服務使用
 *
 * ============ 主要功能 ============
 * - ApiBase: 所有 API 服務的基底類別
 * - ApiError: 統一的 API 錯誤類別
 * - request(): 通用 HTTP 請求方法（含超時機制）
 * - authHeaders(): 生成 Bearer Token 認證標頭
 *
 * 更新日期：2026-02-08（加入 AbortController 超時機制）
 */
import { API_BASE_URL } from '../constants/translations';

// ============ 類型定義 ============

/**
 * API 錯誤回應格式
 *
 * 後端回傳錯誤時的統一格式
 * 包含多種可能的錯誤訊息欄位，因為不同端點的回傳格式略有不同
 */
export interface ApiErrorResponse {
  /** 操作是否成功（錯誤時固定為 false） */
  success: false;
  /** 錯誤訊息（主要欄位） */
  message?: string;
  /** 錯誤訊息（部分端點使用） */
  error?: string;
  /** 錯誤碼（如 E1001, E2001 等） */
  code?: string;
  /** 詳細錯誤說明 */
  detail?: string;
  /** 錯誤原因 */
  reason?: string;
}

// ============ 錯誤類別 ============

/**
 * API 錯誤類別
 *
 * 封裝 API 請求失敗時的錯誤資訊
 * 繼承自 Error，並加入 HTTP 狀態碼和伺服器回傳的錯誤訊息
 *
 * @example
 * try {
 *   await apiService.getUser();
 * } catch (error) {
 *   if (error instanceof ApiError) {
 *     console.log('HTTP 狀態碼:', error.status);
 *     console.log('伺服器訊息:', error.serverMessage);
 *   }
 * }
 */
export class ApiError extends Error {
  /** HTTP 狀態碼（如 401, 404, 500） */
  status: number;
  /** 伺服器回傳的錯誤訊息 */
  serverMessage?: string;
  /** 錯誤碼（如 E1001） */
  code?: string;

  /**
   * 建立 API 錯誤實例
   *
   * @param status - HTTP 狀態碼
   * @param message - 錯誤訊息（給開發者看的）
   * @param serverMessage - 伺服器回傳的訊息（可顯示給用戶）
   * @param code - 錯誤碼
   */
  constructor(status: number, message: string, serverMessage?: string, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.serverMessage = serverMessage;
    this.code = code;
  }
}

// ============ 基礎類別 ============

/**
 * API 基礎服務類別
 *
 * 所有 API 服務模組都繼承自此類別
 * 提供統一的請求方法和認證標頭生成
 *
 * @example
 * class UserApi extends ApiBase {
 *   async getUser(token: string) {
 *     return this.request('/api/user', {
 *       headers: this.authHeaders(token),
 *     });
 *   }
 * }
 */
export class ApiBase {
  /** API 基礎網址（從環境變數讀取） */
  protected baseUrl = API_BASE_URL;

  /**
   * 預設超時時間（毫秒）
   * 子類別可覆寫此值，例如 AI 扭蛋服務需要更長時間
   * @example
   * class GachaApi extends ApiBase {
   *   protected defaultTimeout = 120_000; // AI 生成需要 2 分鐘
   * }
   */
  protected defaultTimeout = 30_000; // 30 秒

  /**
   * 發送 HTTP 請求
   *
   * 統一處理所有 API 請求，包含：
   * - 自動設定 Content-Type 和 Accept 標頭
   * - JSON 回應解析
   * - HTTP 錯誤狀態碼處理
   * - 錯誤訊息提取
   * - AbortController 超時機制（預設 30 秒）
   *
   * @template T - 回應資料的型別
   * @param endpoint - API 端點路徑（如 /api/auth/login）
   * @param options - fetch 請求選項
   * @param timeout - 自訂超時時間（毫秒），不傳則使用 defaultTimeout
   * @returns 解析後的 JSON 回應
   * @throws {ApiError} 當 HTTP 狀態碼非 2xx 或超時時拋出
   *
   * @example
   * // 一般請求（30 秒超時）
   * const user = await this.request<User>('/api/auth/user', {
   *   headers: this.authHeaders(token),
   * });
   *
   * // 自訂超時（AI 生成用 120 秒）
   * const result = await this.request<AiResult>('/api/ai/generate', opts, 120_000);
   */
  protected async request<T>(endpoint: string, options: RequestInit = {}, timeout?: number): Promise<T> {
    // 組合完整 URL
    const url = `${this.baseUrl}${endpoint}`;

    // 建立超時控制器
    const timeoutMs = timeout ?? this.defaultTimeout;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      // 發送請求，自動加入 JSON 標頭 + 超時信號
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
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
        // 無法解析 JSON（可能是 HTML 錯誤頁面或空回應）
        if (!response.ok) {
          throw new ApiError(response.status, `API Error: ${response.status}`);
        }
        throw new Error('Invalid JSON response');
      }

      // 檢查 HTTP 狀態碼
      if (!response.ok) {
        const errorData = data as ApiErrorResponse;
        // 嘗試從多個可能的欄位提取錯誤訊息
        // 不同端點可能使用不同的欄位名稱
        const serverMessage = errorData.message || errorData.error || errorData.detail || errorData.reason;
        throw new ApiError(
          response.status,
          `API Error: ${response.status}`,
          serverMessage,
          errorData.code
        );
      }

      return data as T;
    } catch (error) {
      // 超時錯誤轉換為 ApiError
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiError(0, `請求超時（${timeoutMs / 1000} 秒）`, '網路連線逾時，請稍後再試');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * 生成認證標頭
   *
   * 將 JWT Token 轉換為 Bearer Token 格式的認證標頭
   *
   * @param token - JWT Token
   * @returns 包含 Authorization 標頭的物件
   *
   * @example
   * const response = await fetch('/api/user', {
   *   headers: this.authHeaders(token),
   * });
   */
  protected authHeaders(token: string): Record<string, string> {
    return {
      'Authorization': `Bearer ${token}`,
    };
  }
}

// ============ 匯出 ============

/** API 基礎網址（供其他模組使用） */
export const API_BASE = API_BASE_URL;
