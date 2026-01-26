/**
 * 推薦系統 API
 *
 * @see 後端合約: contracts/APP.md Phase 5
 */
import { ApiBase } from './base';
import {
  ReferralCode,
  GenerateCodeResponse,
  ValidateCodeResponse,
  ApplyCodeParams,
  ApplyCodeResponse,
  MyReferralsResponse,
  MerchantRecommendParams,
  MerchantRecommendResponse,
  ReferralBalance,
  TransactionsResponse,
  WithdrawParams,
  WithdrawResponse,
  LeaderboardPeriod,
  LeaderboardEntry,
  LeaderboardResponse,
  MyRankResponse,
} from '../types/referral';

class ReferralApiService extends ApiBase {
  /**
   * 取得我的推薦碼
   * GET /api/referral/my-code
   */
  async getMyCode(token: string): Promise<ReferralCode | null> {
    return this.request<ReferralCode | null>('/api/referral/my-code', {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 生成推薦碼
   * POST /api/referral/generate-code
   */
  async generateCode(token: string): Promise<GenerateCodeResponse> {
    return this.request<GenerateCodeResponse>('/api/referral/generate-code', {
      method: 'POST',
      headers: this.authHeaders(token),
    });
  }

  /**
   * 驗證推薦碼
   * GET /api/referral/validate/:code
   */
  async validateCode(token: string, code: string): Promise<ValidateCodeResponse> {
    return this.request<ValidateCodeResponse>(`/api/referral/validate/${encodeURIComponent(code)}`, {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 使用推薦碼
   * POST /api/referral/apply
   */
  async applyCode(token: string, params: ApplyCodeParams): Promise<ApplyCodeResponse> {
    return this.request<ApplyCodeResponse>('/api/referral/apply', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify(params),
    });
  }

  /**
   * 取得推薦人列表
   * GET /api/referral/my-referrals
   */
  async getMyReferrals(
    token: string,
    params?: { page?: number; limit?: number }
  ): Promise<MyReferralsResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const queryString = query.toString();
    const endpoint = `/api/referral/my-referrals${queryString ? `?${queryString}` : ''}`;

    return this.request<MyReferralsResponse>(endpoint, {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 提交商家推薦
   * POST /api/referral/merchant
   */
  async recommendMerchant(
    token: string,
    params: MerchantRecommendParams
  ): Promise<MerchantRecommendResponse> {
    return this.request<MerchantRecommendResponse>('/api/referral/merchant', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify(params),
    });
  }

  /**
   * 取得餘額
   * GET /api/referral/balance
   */
  async getBalance(token: string): Promise<ReferralBalance> {
    return this.request<ReferralBalance>('/api/referral/balance', {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 取得獎勵/提現記錄
   * GET /api/referral/transactions
   */
  async getTransactions(
    token: string,
    params?: { page?: number; limit?: number; type?: string }
  ): Promise<TransactionsResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.type) query.append('type', params.type);

    const queryString = query.toString();
    const endpoint = `/api/referral/transactions${queryString ? `?${queryString}` : ''}`;

    return this.request<TransactionsResponse>(endpoint, {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 申請提現
   * POST /api/referral/withdraw
   */
  async withdraw(token: string, params: WithdrawParams): Promise<WithdrawResponse> {
    return this.request<WithdrawResponse>('/api/referral/withdraw', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify(params),
    });
  }

  /**
   * 取得推薦排行榜
   * GET /api/referral/leaderboard
   *
   * #030: 後端回傳 { leaderboard, period }，沒有 success 欄位
   */
  async getLeaderboard(
    token: string,
    params?: { period?: LeaderboardPeriod }
  ): Promise<LeaderboardResponse> {
    const query = new URLSearchParams();
    if (params?.period) query.append('period', params.period);

    const queryString = query.toString();
    const endpoint = `/api/referral/leaderboard${queryString ? `?${queryString}` : ''}`;

    try {
      const data = await this.request<{ leaderboard: LeaderboardEntry[]; period: LeaderboardPeriod }>(
        endpoint,
        { headers: this.authHeaders(token) }
      );
      // 後端沒有 success 欄位，HTTP 200 就是成功
      return {
        success: true,
        leaderboard: data.leaderboard || [],
        period: data.period || 'weekly',
      };
    } catch (error) {
      console.error('[ReferralApi] getLeaderboard error:', error);
      return { success: false, leaderboard: [], period: 'weekly' };
    }
  }

  /**
   * 取得我的排名
   * GET /api/referral/leaderboard/my-rank
   */
  async getMyRank(token: string): Promise<MyRankResponse> {
    return this.request<MyRankResponse>('/api/referral/leaderboard/my-rank', {
      headers: this.authHeaders(token),
    });
  }
}

export const referralApi = new ReferralApiService();
