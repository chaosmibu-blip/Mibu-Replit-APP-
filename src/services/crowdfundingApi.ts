/**
 * 募資系統 API
 *
 * @see 後端合約: contracts/APP.md Phase 5
 */
import { ApiBase } from './base';
import {
  CampaignsResponse,
  CampaignDetail,
  ContributeParams,
  ContributeResponse,
  MyContributionsResponse,
} from '../types/crowdfunding';

class CrowdfundingApiService extends ApiBase {
  /**
   * 取得募資活動列表
   * GET /api/crowdfund/campaigns
   */
  async getCampaigns(
    token: string,
    params?: { status?: string; page?: number; limit?: number }
  ): Promise<CampaignsResponse> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const queryString = query.toString();
    const endpoint = `/api/crowdfund/campaigns${queryString ? `?${queryString}` : ''}`;

    return this.request<CampaignsResponse>(endpoint, {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 取得募資活動詳情
   * GET /api/crowdfund/campaigns/:id
   */
  async getCampaignDetail(token: string, campaignId: string): Promise<CampaignDetail> {
    return this.request<CampaignDetail>(`/api/crowdfund/campaigns/${campaignId}`, {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 參與募資（IAP 驗證）
   * POST /api/crowdfund/contribute
   */
  async contribute(token: string, params: ContributeParams): Promise<ContributeResponse> {
    return this.request<ContributeResponse>('/api/crowdfund/contribute', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify(params),
    });
  }

  /**
   * 取得個人募資記錄
   * GET /api/crowdfund/my-contributions
   */
  async getMyContributions(
    token: string,
    params?: { page?: number; limit?: number }
  ): Promise<MyContributionsResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const queryString = query.toString();
    const endpoint = `/api/crowdfund/my-contributions${queryString ? `?${queryString}` : ''}`;

    return this.request<MyContributionsResponse>(endpoint, {
      headers: this.authHeaders(token),
    });
  }
}

export const crowdfundingApi = new CrowdfundingApiService();
