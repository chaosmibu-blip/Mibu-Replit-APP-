/**
 * 經濟系統 API 服務
 *
 * 處理用戶金幣、權益、自己人申請等功能
 * #039 重構：等級制 → 金幣制
 * #053 重構：specialist → partner 改名
 *
 * @module services/economyApi
 * @see 後端契約: contracts/APP.md v3.2.0
 * @updated 2026-02-20 #053 specialist→partner
 *
 * ============ 串接端點 ============
 * 金幣系統（#039 新增）:
 * - GET  /api/user/coins                    - 取得用戶金幣資訊
 * - GET  /api/user/coins/history            - 取得金幣交易記錄
 * - GET  /api/user/perks                    - 取得用戶權益資訊
 *
 * 自己人申請（#053 路徑變更）:
 * - GET  /api/partner/eligibility           - 取得自己人申請資格
 * - POST /api/partner/apply                 - 申請成為自己人
 * - GET  /api/partner/application-status    - 查詢申請狀態
 * - POST /api/partner/mark-invited          - 標記已顯示邀請彈窗
 *
 * 已遷移到 rulesApi（#043 統一規則引擎）:
 * - 成就列表 → GET /api/rules?type=achievement
 * - 每日任務 → GET /api/rules?type=quest&resetType=daily
 * - 領取獎勵 → POST /api/rules/:id/claim
 *
 */
import { ApiBase } from './base';
import {
  UserCoinsResponse,
  UserPerksResponse,
  CoinHistoryResponse,
  PartnerEligibilityResponse,
  PartnerApplicationStatusResponse,
} from '../types/economy';

// ============ API 服務類別 ============

/**
 * 經濟系統 API 服務類別
 *
 * 管理用戶的遊戲化系統：金幣、權益、自己人申請
 * #039 重構：等級制 → 金幣制
 * #053 重構：specialist → partner
 */
class EconomyApiService extends ApiBase {

  // ============ 金幣系統（#039 新增） ============

  /**
   * 取得用戶金幣資訊
   *
   * @param token - JWT Token
   * @returns 金幣餘額和累計數據
   */
  async getCoins(token: string): Promise<UserCoinsResponse> {
    return this.request<UserCoinsResponse>('/api/user/coins', {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 取得金幣交易記錄
   *
   * @param token - JWT Token
   * @param params - 分頁參數
   * @returns 交易記錄列表
   */
  async getCoinsHistory(
    token: string,
    params?: { page?: number; limit?: number }
  ): Promise<CoinHistoryResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const queryString = query.toString();
    const endpoint = `/api/user/coins/history${queryString ? `?${queryString}` : ''}`;

    return this.request<CoinHistoryResponse>(endpoint, {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 取得用戶權益資訊
   *
   * @param token - JWT Token
   * @returns 權益內容（每日扭蛋上限、背包格數等）
   */
  async getPerks(token: string): Promise<UserPerksResponse> {
    return this.request<UserPerksResponse>('/api/user/perks', {
      headers: this.authHeaders(token),
    });
  }

  // ============ 自己人申請（#053 specialist→partner） ============

  /**
   * 取得自己人申請資格
   * #053: 移除邀請制，所有登入用戶皆可申請
   *
   * @param token - JWT Token
   * @returns 申請資格狀態
   */
  async getPartnerEligibility(token: string): Promise<PartnerEligibilityResponse> {
    return this.request<PartnerEligibilityResponse>('/api/partner/eligibility', {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 申請成為自己人
   * #053: 改用 surveyResponses JSONB 格式
   *
   * @param token - JWT Token
   * @param surveyResponses - 問卷回答（自由格式）
   * @returns 申請結果
   */
  async applyPartner(
    token: string,
    surveyResponses: Record<string, unknown>,
  ): Promise<{ success: boolean; application: { id: number; status: 'pending'; createdAt: string } }> {
    return this.request('/api/partner/apply', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify({ surveyResponses }),
    });
  }

  /**
   * 查詢自己人申請狀態
   * #053: 新增端點
   *
   * @param token - JWT Token
   * @returns 申請狀態與詳情
   */
  async getPartnerApplicationStatus(token: string): Promise<PartnerApplicationStatusResponse> {
    return this.request<PartnerApplicationStatusResponse>('/api/partner/application-status', {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 標記已顯示自己人邀請彈窗
   * #053: specialist→partner 路徑變更
   *
   * @param token - JWT Token
   */
  async markPartnerInvited(token: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/api/partner/mark-invited', {
      method: 'POST',
      headers: this.authHeaders(token),
    });
  }

  // #043: getDailyTasks / completeDailyTask 已遷移到 rulesApi，舊端點已由後端移除
}

// ============ 匯出 ============

/** 經濟系統 API 服務實例 */
export const economyApi = new EconomyApiService();
