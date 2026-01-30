/**
 * 募資系統 API 服務
 *
 * 提供群眾募資相關的 API 端點封裝，包含：
 * - 募資活動列表與詳情
 * - 參與募資（IAP 內購驗證）
 * - 個人贊助記錄
 *
 * @module CrowdfundingApiService
 * @see 後端合約: contracts/APP.md Phase 5
 *
 * API 端點清單：
 * - GET /api/crowdfund/campaigns - 取得募資活動列表
 * - GET /api/crowdfund/campaigns/:id - 取得募資活動詳情
 * - POST /api/crowdfund/contribute - 參與募資
 * - GET /api/crowdfund/my-contributions - 取得個人贊助記錄
 */
import { ApiBase } from './base';
import {
  CampaignsResponse,
  CampaignDetail,
  ContributeParams,
  ContributeResponse,
  MyContributionsResponse,
} from '../types/crowdfunding';

// ========== API 服務類別 ==========

/**
 * 募資 API 服務類別
 *
 * 繼承 ApiBase 基礎類別，提供募資相關的 API 方法
 * 所有方法都需要認證（authToken）
 */
class CrowdfundingApiService extends ApiBase {
  // ========== 募資活動 ==========

  /**
   * 取得募資活動列表
   *
   * 支援篩選條件：
   * - status: 活動狀態（active/completed/cancelled）
   * - page/limit: 分頁參數
   *
   * @param token - 用戶認證 Token
   * @param params - 查詢參數（可選）
   * @returns 募資活動列表與分頁資訊
   *
   * @example
   * const result = await crowdfundingApi.getCampaigns(token, {
   *   status: 'active',
   *   page: 1,
   *   limit: 10
   * });
   */
  async getCampaigns(
    token: string,
    params?: { status?: string; page?: number; limit?: number }
  ): Promise<CampaignsResponse> {
    // 建立查詢參數
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    // 組合完整端點
    const queryString = query.toString();
    const endpoint = `/api/crowdfund/campaigns${queryString ? `?${queryString}` : ''}`;

    return this.request<CampaignsResponse>(endpoint, {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 取得募資活動詳情
   *
   * 包含活動完整資訊、目前募資進度、獎勵方案等
   *
   * @param token - 用戶認證 Token
   * @param campaignId - 募資活動 ID
   * @returns 募資活動詳細資訊
   *
   * @example
   * const detail = await crowdfundingApi.getCampaignDetail(token, 'campaign-123');
   */
  async getCampaignDetail(token: string, campaignId: string): Promise<CampaignDetail> {
    return this.request<CampaignDetail>(`/api/crowdfund/campaigns/${campaignId}`, {
      headers: this.authHeaders(token),
    });
  }

  // ========== 贊助功能 ==========

  /**
   * 參與募資（IAP 驗證）
   *
   * 透過 App Store / Google Play 內購完成贊助
   * 後端會驗證購買收據，確保交易有效
   *
   * 流程：
   * 1. 前端完成 IAP 購買，取得收據
   * 2. 呼叫此 API，提交收據給後端驗證
   * 3. 後端驗證成功後，記錄贊助並發放獎勵
   *
   * @param token - 用戶認證 Token
   * @param params - 贊助參數（包含 campaignId、receipt 等）
   * @returns 贊助結果
   *
   * @example
   * const result = await crowdfundingApi.contribute(token, {
   *   campaignId: 'campaign-123',
   *   tierId: 'tier-1',
   *   receipt: 'iap-receipt-data',
   *   platform: 'ios'
   * });
   */
  async contribute(token: string, params: ContributeParams): Promise<ContributeResponse> {
    return this.request<ContributeResponse>('/api/crowdfund/contribute', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify(params),
    });
  }

  // ========== 個人記錄 ==========

  /**
   * 取得個人募資記錄
   *
   * 查詢用戶過去的所有贊助記錄
   * 包含贊助金額、獎勵領取狀態等
   *
   * @param token - 用戶認證 Token
   * @param params - 分頁參數（可選）
   * @returns 個人贊助記錄列表
   *
   * @example
   * const contributions = await crowdfundingApi.getMyContributions(token, {
   *   page: 1,
   *   limit: 20
   * });
   */
  async getMyContributions(
    token: string,
    params?: { page?: number; limit?: number }
  ): Promise<MyContributionsResponse> {
    // 建立查詢參數
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    // 組合完整端點
    const queryString = query.toString();
    const endpoint = `/api/crowdfund/my-contributions${queryString ? `?${queryString}` : ''}`;

    return this.request<MyContributionsResponse>(endpoint, {
      headers: this.authHeaders(token),
    });
  }
}

// ========== 匯出單例 ==========

/** 募資 API 服務單例，供全域使用 */
export const crowdfundingApi = new CrowdfundingApiService();
