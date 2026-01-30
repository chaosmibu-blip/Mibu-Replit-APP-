/**
 * 推薦系統 API 服務
 *
 * 處理推薦碼生成、驗證、獎勵發放、排行榜等功能
 *
 * @module services/referralApi
 * @see 後端契約: contracts/APP.md Phase 5
 *
 * ============ 串接端點 ============
 * - GET  /api/referral/my-code              - 取得我的推薦碼
 * - POST /api/referral/generate-code        - 生成推薦碼
 * - GET  /api/referral/validate/:code       - 驗證推薦碼
 * - POST /api/referral/apply                - 使用推薦碼
 * - GET  /api/referral/my-referrals         - 取得推薦人列表
 * - POST /api/referral/merchant             - 提交商家推薦
 * - GET  /api/referral/balance              - 取得餘額
 * - GET  /api/referral/transactions         - 取得獎勵/提現記錄
 * - POST /api/referral/withdraw             - 申請提現
 * - GET  /api/referral/leaderboard          - 取得推薦排行榜
 * - GET  /api/referral/leaderboard/my-rank  - 取得我的排名
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

// ============ API 服務類別 ============

/**
 * 推薦系統 API 服務類別
 *
 * 管理推薦碼機制和獎勵系統
 */
class ReferralApiService extends ApiBase {

  /**
   * 取得我的推薦碼
   *
   * 若用戶尚未生成推薦碼，回傳 null
   *
   * @param token - JWT Token
   * @returns 推薦碼資訊
   */
  async getMyCode(token: string): Promise<ReferralCode | null> {
    return this.request<ReferralCode | null>('/api/referral/my-code', {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 生成推薦碼
   *
   * 每個用戶只能有一個推薦碼
   *
   * @param token - JWT Token
   * @returns 新生成的推薦碼
   */
  async generateCode(token: string): Promise<GenerateCodeResponse> {
    return this.request<GenerateCodeResponse>('/api/referral/generate-code', {
      method: 'POST',
      headers: this.authHeaders(token),
    });
  }

  /**
   * 驗證推薦碼
   *
   * 檢查推薦碼是否有效（存在且未過期）
   *
   * @param token - JWT Token
   * @param code - 要驗證的推薦碼
   * @returns 驗證結果
   */
  async validateCode(token: string, code: string): Promise<ValidateCodeResponse> {
    return this.request<ValidateCodeResponse>(`/api/referral/validate/${encodeURIComponent(code)}`, {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 使用推薦碼
   *
   * 新用戶使用推薦碼後，雙方都可獲得獎勵
   *
   * @param token - JWT Token
   * @param params - 使用參數
   * @returns 使用結果和獎勵內容
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
   *
   * 查看透過我的推薦碼註冊的用戶
   *
   * @param token - JWT Token
   * @param params - 分頁參數
   * @returns 推薦人列表
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
   *
   * 推薦新商家加入平台
   *
   * @param token - JWT Token
   * @param params - 商家資訊
   * @returns 提交結果
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
   *
   * 查詢推薦獎勵餘額
   *
   * @param token - JWT Token
   * @returns 餘額資訊
   */
  async getBalance(token: string): Promise<ReferralBalance> {
    return this.request<ReferralBalance>('/api/referral/balance', {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 取得獎勵/提現記錄
   *
   * 查看過去的獎勵入帳和提現記錄
   *
   * @param token - JWT Token
   * @param params - 查詢參數
   * @param params.type - 記錄類型篩選
   * @returns 交易記錄列表
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
   *
   * 將推薦獎勵餘額提現到指定帳戶
   *
   * @param token - JWT Token
   * @param params - 提現參數
   * @returns 提現結果
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
   *
   * #030: 後端回傳 { leaderboard, period }，沒有 success 欄位
   *
   * @param token - JWT Token
   * @param params - 查詢參數
   * @param params.period - 時間區間（weekly/monthly/all）
   * @returns 排行榜資料
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
   *
   * 查詢用戶在推薦排行榜的位置
   *
   * @param token - JWT Token
   * @returns 排名資訊
   */
  async getMyRank(token: string): Promise<MyRankResponse> {
    return this.request<MyRankResponse>('/api/referral/leaderboard/my-rank', {
      headers: this.authHeaders(token),
    });
  }
}

// ============ 匯出 ============

/** 推薦系統 API 服務實例 */
export const referralApi = new ReferralApiService();
