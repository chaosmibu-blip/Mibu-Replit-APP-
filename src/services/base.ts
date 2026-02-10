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
 * - request(): 通用 HTTP 請求方法（含超時 + 401 攔截 + 智慧重試）
 * - authHeaders(): 生成 Bearer Token 認證標頭
 * - setOnUnauthorized(): 註冊 401 回調（由 AppContext 掛載）
 * - resetUnauthorizedFlag(): 登入後重置防重入旗標
 *
 * 更新日期：2026-02-10（401 攔截器 + 智慧重試機制）
 */
import { API_BASE_URL } from '../constants/translations';

// ============ 401 攔截器 ============
// 統一處理所有 API 的 401 未授權回應
// 由 AppContext 註冊回調，service 層不直接依賴 router 或 context

/** 401 未授權回調函數（由 AppContext 註冊） */
let _onUnauthorized: (() => void) | null = null;
/** 防重入旗標：多個併發請求同時 401 時只觸發一次 */
let _unauthorizedHandled = false;

/**
 * 註冊 401 未授權回調
 * @param callback - 收到 401 時要執行的函數（通常是登出 + 清理）
 */
export function setOnUnauthorized(callback: (() => void) | null): void {
  _onUnauthorized = callback;
}

/**
 * 重置 401 防重入旗標
 * @description 用戶重新登入後呼叫，讓下次 401 可以再次觸發登出
 */
export function resetUnauthorizedFlag(): void {
  _unauthorizedHandled = false;
}

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
   * - HTTP 錯誤狀態碼處理 + 401 統一攔截
   * - 錯誤訊息提取
   * - AbortController 超時機制（預設 30 秒）
   * - 智慧重試（網路錯誤全方法重試、5xx 只重試 GET、最多 1 次）
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
    const url = `${this.baseUrl}${endpoint}`;
    const timeoutMs = timeout ?? this.defaultTimeout;
    const method = (options.method || 'GET').toUpperCase();
    const isGet = method === 'GET';

    // 重試策略：網路錯誤全部重試、5xx 只重試 GET、其餘不重試
    const maxAttempts = 2; // 最多 2 次（1 次原始 + 1 次重試）

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      // 每次嘗試建立獨立的超時控制器
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
            // 401 未授權：觸發統一登出
            if (response.status === 401 && _onUnauthorized && !_unauthorizedHandled) {
              _unauthorizedHandled = true;
              _onUnauthorized();
            }
            // 5xx + GET → 重試
            if (response.status >= 500 && isGet && attempt < maxAttempts) {
              await this.retryDelay();
              continue;
            }
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

          // 401 未授權：觸發統一登出（防重入，多個併發 401 只處理一次）
          if (response.status === 401 && _onUnauthorized && !_unauthorizedHandled) {
            _unauthorizedHandled = true;
            _onUnauthorized();
          }

          // 5xx + GET → 重試
          if (response.status >= 500 && isGet && attempt < maxAttempts) {
            await this.retryDelay();
            continue;
          }

          throw new ApiError(
            response.status,
            `API Error: ${response.status}`,
            serverMessage,
            errorData.code
          );
        }

        return data as T;
      } catch (error) {
        // 超時錯誤（AbortError）：不重試，可能已到達 server
        // 注意：RN 原生環境沒有 DOMException，改用 error.name 判斷（Web + RN 通用）
        if (error instanceof Error && error.name === 'AbortError') {
          throw new ApiError(0, `請求超時（${timeoutMs / 1000} 秒）`, '網路連線逾時，請稍後再試');
        }

        // 已處理的 ApiError（4xx 等）：直接拋出不重試
        if (error instanceof ApiError) {
          throw error;
        }

        // 網路錯誤（TypeError: Network request failed）：重試所有方法
        // 因為請求沒到達 server，重試是安全的
        if (attempt < maxAttempts) {
          await this.retryDelay();
          continue;
        }

        throw error;
      } finally {
        clearTimeout(timeoutId);
      }
    }

    // TypeScript 需要，邏輯上不會執行到這裡
    throw new Error('Unexpected: retry loop exited without return or throw');
  }

  /**
   * 重試等待（1 秒）
   * @description 網路錯誤或 5xx 重試前的延遲，讓網路或 server 有時間恢復
   */
  private retryDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 1000));
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
