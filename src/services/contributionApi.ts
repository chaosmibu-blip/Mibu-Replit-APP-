/**
 * 用戶貢獻系統 API 服務
 *
 * 提供用戶貢獻相關的 API 端點封裝，包含：
 * - 回報歇業/搬遷
 * - 建議新景點
 * - 景點黑名單管理
 * - 社群投票系統（Lv.7+ 用戶）
 *
 * @module ContributionApiService
 * @see 後端合約: contracts/APP.md Phase 6
 *
 * API 端點清單：
 * - POST /api/contribution/report-closed - 回報歇業/搬遷
 * - GET /api/contribution/my-reports - 取得個人回報記錄
 * - POST /api/contribution/suggest-place - 建議新景點
 * - GET /api/contribution/my-suggestions - 取得個人建議記錄
 * - GET /api/collection/blacklist - 取得黑名單
 * - POST /api/collection/:placeId/blacklist - 加入黑名單
 * - DELETE /api/collection/:placeId/blacklist - 移除黑名單
 * - GET /api/contribution/pending-votes - 取得待投票景點
 * - POST /api/contribution/vote/:placeId - 投票排除/保留
 * - GET /api/contribution/pending-suggestions - 取得待投票建議
 * - POST /api/contribution/vote-suggestion/:id - 建議景點投票
 */
import { ApiBase } from './base';
import {
  ReportClosedParams,
  ReportClosedResponse,
  MyReportsResponse,
  SuggestPlaceParams,
  SuggestPlaceResponse,
  MySuggestionsResponse,
  BlacklistResponse,
  BlacklistActionResponse,
  PendingVotesResponse,
  VotePlaceParams,
  VotePlaceResponse,
  PendingSuggestionsResponse,
  VoteSuggestionParams,
  VoteSuggestionResponse,
} from '../types/contribution';

// ========== API 服務類別 ==========

/**
 * 用戶貢獻 API 服務類別
 *
 * 繼承 ApiBase 基礎類別，提供用戶貢獻相關的 API 方法
 * 所有方法都需要認證（authToken）
 */
class ContributionApiService extends ApiBase {
  // ========== 回報歇業 ==========

  /**
   * 回報歇業/搬遷
   *
   * 用戶回報景點已歇業或搬遷
   * 回報後由系統或管理員審核處理
   *
   * @param token - 用戶認證 Token
   * @param params - 回報參數（景點 ID、回報類型、說明等）
   * @returns 回報結果
   *
   * @example
   * const result = await contributionApi.reportClosed(token, {
   *   placeId: 'place-123',
   *   type: 'closed',
   *   reason: '店面已拉下鐵門'
   * });
   */
  async reportClosed(token: string, params: ReportClosedParams): Promise<ReportClosedResponse> {
    return this.request<ReportClosedResponse>('/api/contribution/report-closed', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify(params),
    });
  }

  /**
   * 取得個人回報記錄
   *
   * 查詢用戶過去提交的所有回報記錄
   * 包含審核狀態（pending/approved/rejected）
   *
   * @param token - 用戶認證 Token
   * @param params - 查詢參數（分頁、狀態篩選）
   * @returns 個人回報記錄列表
   *
   * @example
   * const reports = await contributionApi.getMyReports(token, {
   *   status: 'pending',
   *   page: 1,
   *   limit: 20
   * });
   */
  async getMyReports(
    token: string,
    params?: { page?: number; limit?: number; status?: string }
  ): Promise<MyReportsResponse> {
    // 建立查詢參數
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.status) query.append('status', params.status);

    // 組合完整端點
    const queryString = query.toString();
    const endpoint = `/api/contribution/my-reports${queryString ? `?${queryString}` : ''}`;

    return this.request<MyReportsResponse>(endpoint, {
      headers: this.authHeaders(token),
    });
  }

  // ========== 建議景點 ==========

  /**
   * 建議新景點
   *
   * 用戶提交新景點建議
   * 建議會進入審核流程，高等級用戶可參與投票
   *
   * @param token - 用戶認證 Token
   * @param params - 景點建議參數（名稱、地址、類型等）
   * @returns 建議提交結果
   *
   * @example
   * const result = await contributionApi.suggestPlace(token, {
   *   name: '好吃拉麵店',
   *   address: '台北市大安區...',
   *   category: 'restaurant',
   *   description: '超推薦的拉麵'
   * });
   */
  async suggestPlace(token: string, params: SuggestPlaceParams): Promise<SuggestPlaceResponse> {
    return this.request<SuggestPlaceResponse>('/api/contribution/suggest-place', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify(params),
    });
  }

  /**
   * 取得個人建議記錄
   *
   * 查詢用戶過去提交的所有景點建議
   * 包含審核狀態與投票進度
   *
   * @param token - 用戶認證 Token
   * @param params - 查詢參數（分頁、狀態篩選）
   * @returns 個人建議記錄列表
   *
   * @example
   * const suggestions = await contributionApi.getMySuggestions(token, {
   *   status: 'approved',
   *   page: 1
   * });
   */
  async getMySuggestions(
    token: string,
    params?: { page?: number; limit?: number; status?: string }
  ): Promise<MySuggestionsResponse> {
    // 建立查詢參數
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.status) query.append('status', params.status);

    // 組合完整端點
    const queryString = query.toString();
    const endpoint = `/api/contribution/my-suggestions${queryString ? `?${queryString}` : ''}`;

    return this.request<MySuggestionsResponse>(endpoint, {
      headers: this.authHeaders(token),
    });
  }

  // ========== 黑名單 ==========

  /**
   * 取得黑名單
   *
   * 取得用戶標記為不想去的景點列表
   * 這些景點不會出現在扭蛋結果中
   *
   * @param token - 用戶認證 Token
   * @returns 黑名單景點列表
   *
   * @example
   * const blacklist = await contributionApi.getBlacklist(token);
   */
  async getBlacklist(token: string): Promise<BlacklistResponse> {
    return this.request<BlacklistResponse>('/api/collection/blacklist', {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 加入黑名單
   *
   * 將景點加入黑名單，之後扭蛋不會抽到此景點
   *
   * @param token - 用戶認證 Token
   * @param placeId - 景點 ID
   * @returns 操作結果
   *
   * @example
   * await contributionApi.addToBlacklist(token, 'place-123');
   */
  async addToBlacklist(token: string, placeId: string): Promise<BlacklistActionResponse> {
    return this.request<BlacklistActionResponse>(`/api/collection/${placeId}/blacklist`, {
      method: 'POST',
      headers: this.authHeaders(token),
    });
  }

  /**
   * 移除黑名單
   *
   * 將景點從黑名單移除，恢復正常扭蛋機率
   *
   * 注意：此方法直接使用 fetch 而非 this.request
   * 因為 DELETE 請求的處理方式略有不同
   *
   * @param token - 用戶認證 Token
   * @param placeId - 景點 ID
   * @returns 操作結果
   *
   * @example
   * await contributionApi.removeFromBlacklist(token, 'place-123');
   */
  async removeFromBlacklist(token: string, placeId: string): Promise<BlacklistActionResponse> {
    // 改用 this.request() 統一走 base.ts（含超時機制）
    return this.request<BlacklistActionResponse>(
      `/api/collection/${placeId}/blacklist`,
      {
        method: 'DELETE',
        headers: this.authHeaders(token),
      }
    );
  }

  // ========== 投票系統 ==========

  /**
   * 取得待投票景點（Lv.7+）
   *
   * 高等級用戶可以參與景點品質投票
   * 決定是否將某些景點從系統中排除
   *
   * 需要用戶達到 Lv.7 以上才能使用此功能
   *
   * @param token - 用戶認證 Token
   * @param params - 分頁參數
   * @returns 待投票景點列表
   *
   * @example
   * const pendingVotes = await contributionApi.getPendingVotes(token, {
   *   page: 1,
   *   limit: 10
   * });
   */
  async getPendingVotes(
    token: string,
    params?: { page?: number; limit?: number }
  ): Promise<PendingVotesResponse> {
    // 建立查詢參數
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    // 組合完整端點
    const queryString = query.toString();
    const endpoint = `/api/contribution/pending-votes${queryString ? `?${queryString}` : ''}`;

    return this.request<PendingVotesResponse>(endpoint, {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 投票排除/保留
   *
   * 對景點進行投票，決定是否排除
   * 當排除票數達到門檻，景點會被標記為無效
   *
   * @param token - 用戶認證 Token
   * @param placeId - 景點 ID
   * @param params - 投票參數（vote: 'exclude' | 'keep'）
   * @returns 投票結果
   *
   * @example
   * await contributionApi.votePlace(token, 'place-123', {
   *   vote: 'exclude',
   *   reason: '實際去過，已歇業'
   * });
   */
  async votePlace(
    token: string,
    placeId: string,
    params: VotePlaceParams
  ): Promise<VotePlaceResponse> {
    return this.request<VotePlaceResponse>(`/api/contribution/vote/${placeId}`, {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify(params),
    });
  }

  /**
   * 取得待投票建議景點
   *
   * 取得其他用戶提交的景點建議，供高等級用戶投票審核
   *
   * @param token - 用戶認證 Token
   * @param params - 分頁參數
   * @returns 待投票建議列表
   *
   * @example
   * const pendingSuggestions = await contributionApi.getPendingSuggestions(token);
   */
  async getPendingSuggestions(
    token: string,
    params?: { page?: number; limit?: number }
  ): Promise<PendingSuggestionsResponse> {
    // 建立查詢參數
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    // 組合完整端點
    const queryString = query.toString();
    const endpoint = `/api/contribution/pending-suggestions${queryString ? `?${queryString}` : ''}`;

    return this.request<PendingSuggestionsResponse>(endpoint, {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 建議景點投票
   *
   * 對用戶提交的景點建議進行投票
   * 決定是否將建議的景點加入系統
   *
   * @param token - 用戶認證 Token
   * @param suggestionId - 建議 ID
   * @param params - 投票參數（vote: 'approve' | 'reject'）
   * @returns 投票結果
   *
   * @example
   * await contributionApi.voteSuggestion(token, 'suggestion-123', {
   *   vote: 'approve'
   * });
   */
  async voteSuggestion(
    token: string,
    suggestionId: string,
    params: VoteSuggestionParams
  ): Promise<VoteSuggestionResponse> {
    return this.request<VoteSuggestionResponse>(`/api/contribution/vote-suggestion/${suggestionId}`, {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify(params),
    });
  }
}

// ========== 匯出單例 ==========

/** 用戶貢獻 API 服務單例，供全域使用 */
export const contributionApi = new ContributionApiService();
