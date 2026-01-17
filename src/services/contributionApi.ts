/**
 * 用戶貢獻系統 API - 回報、建議、黑名單、投票
 *
 * @see 後端合約: contracts/APP.md Phase 6
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

class ContributionApiService extends ApiBase {
  // ========== 回報歇業 ==========

  /**
   * 回報歇業/搬遷
   * POST /api/contribution/report-closed
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
   * GET /api/contribution/my-reports
   */
  async getMyReports(
    token: string,
    params?: { page?: number; limit?: number; status?: string }
  ): Promise<MyReportsResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.status) query.append('status', params.status);

    const queryString = query.toString();
    const endpoint = `/api/contribution/my-reports${queryString ? `?${queryString}` : ''}`;

    return this.request<MyReportsResponse>(endpoint, {
      headers: this.authHeaders(token),
    });
  }

  // ========== 建議景點 ==========

  /**
   * 建議新景點
   * POST /api/contribution/suggest-place
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
   * GET /api/contribution/my-suggestions
   */
  async getMySuggestions(
    token: string,
    params?: { page?: number; limit?: number; status?: string }
  ): Promise<MySuggestionsResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.status) query.append('status', params.status);

    const queryString = query.toString();
    const endpoint = `/api/contribution/my-suggestions${queryString ? `?${queryString}` : ''}`;

    return this.request<MySuggestionsResponse>(endpoint, {
      headers: this.authHeaders(token),
    });
  }

  // ========== 黑名單 ==========

  /**
   * 取得黑名單
   * GET /api/collection/blacklist
   */
  async getBlacklist(token: string): Promise<BlacklistResponse> {
    return this.request<BlacklistResponse>('/api/collection/blacklist', {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 加入黑名單
   * POST /api/collection/:placeId/blacklist
   */
  async addToBlacklist(token: string, placeId: string): Promise<BlacklistActionResponse> {
    return this.request<BlacklistActionResponse>(`/api/collection/${placeId}/blacklist`, {
      method: 'POST',
      headers: this.authHeaders(token),
    });
  }

  /**
   * 移除黑名單
   * DELETE /api/collection/:placeId/blacklist
   */
  async removeFromBlacklist(token: string, placeId: string): Promise<BlacklistActionResponse> {
    const url = `${this.baseUrl}/api/collection/${placeId}/blacklist`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  }

  // ========== 投票系統 ==========

  /**
   * 取得待投票景點（Lv.7+）
   * GET /api/contribution/pending-votes
   */
  async getPendingVotes(
    token: string,
    params?: { page?: number; limit?: number }
  ): Promise<PendingVotesResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const queryString = query.toString();
    const endpoint = `/api/contribution/pending-votes${queryString ? `?${queryString}` : ''}`;

    return this.request<PendingVotesResponse>(endpoint, {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 投票排除/保留
   * POST /api/contribution/vote/:placeId
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
   * GET /api/contribution/pending-suggestions
   */
  async getPendingSuggestions(
    token: string,
    params?: { page?: number; limit?: number }
  ): Promise<PendingSuggestionsResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const queryString = query.toString();
    const endpoint = `/api/contribution/pending-suggestions${queryString ? `?${queryString}` : ''}`;

    return this.request<PendingSuggestionsResponse>(endpoint, {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 建議景點投票
   * POST /api/contribution/vote-suggestion/:id
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

export const contributionApi = new ContributionApiService();
