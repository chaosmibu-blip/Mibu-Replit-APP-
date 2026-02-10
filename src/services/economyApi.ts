/**
 * 經濟系統 API 服務
 *
 * 處理用戶金幣、權益、成就、每日任務等功能
 * #039 重構：等級制 → 金幣制
 *
 * @module services/economyApi
 * @see 後端契約: contracts/APP.md Phase 5
 * @updated 2026-02-05 #039 經濟系統重構
 *
 * ============ 串接端點 ============
 * 金幣系統（#039 新增）:
 * - GET  /api/user/coins                    - 取得用戶金幣資訊
 * - GET  /api/user/coins/history            - 取得金幣交易記錄
 * - GET  /api/user/perks                    - 取得用戶權益資訊
 * - GET  /api/user/specialist/eligibility   - 取得策劃師申請資格
 *
 * 每日任務（HomeScreen 用，尚未遷移到 rulesApi）:
 * - GET  /api/user/daily-tasks              - 取得每日任務列表
 *
 * 已遷移到 rulesApi（#043 統一規則引擎）:
 * - 成就列表 → GET /api/rules?type=achievement
 * - 領取獎勵 → POST /api/rules/:id/claim
 *
 */
import { ApiBase } from './base';
import {
  DailyTasksResponse,
  UserCoinsResponse,
  UserPerksResponse,
  CoinHistoryResponse,
  SpecialistEligibilityResponse,
} from '../types/economy';

// ============ API 服務類別 ============

/**
 * 經濟系統 API 服務類別
 *
 * 管理用戶的遊戲化系統：金幣、權益、成就
 * #039 重構：等級制 → 金幣制
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

  /**
   * 取得策劃師申請資格
   * #039: 改用 hasInvitation 取代等級要求
   *
   * @param token - JWT Token
   * @returns 申請資格狀態
   */
  async getSpecialistEligibility(token: string): Promise<SpecialistEligibilityResponse> {
    return this.request<SpecialistEligibilityResponse>('/api/user/specialist/eligibility', {
      headers: this.authHeaders(token),
    });
  }

  // #043: getAchievements / claimAchievement 已遷移到 rulesApi，舊端點已由後端移除

  /**
   * 申請成為策劃師
   *
   * 達到等級要求後，用戶可申請成為策劃師
   *
   * @param token - JWT Token
   * @param params - 申請資料
   * @param params.regionIds - 服務地區 ID 列表
   * @param params.categories - 擅長類別列表
   * @param params.experience - 相關經驗說明
   * @param params.motivation - 申請動機
   * @returns 申請結果
   */
  async applySpecialist(
    token: string,
    params: {
      regionIds: string[];
      categories: string[];
      experience: string;
      motivation: string;
    }
  ): Promise<{ success: boolean; message: string; applicationId: string }> {
    return this.request<{ success: boolean; message: string; applicationId: string }>(
      '/api/user/specialist/apply',
      {
        method: 'POST',
        headers: this.authHeaders(token),
        body: JSON.stringify(params),
      }
    );
  }

  /**
   * 取得每日任務列表
   *
   * 每日任務會在每天重置
   *
   * @param token - JWT Token
   * @returns 每日任務列表和完成狀態
   */
  async getDailyTasks(token: string): Promise<DailyTasksResponse> {
    return this.request<DailyTasksResponse>('/api/user/daily-tasks', {
      headers: this.authHeaders(token),
    });
  }

  // #043: completeDailyTask 已遷移到 rulesApi.claimReward()，舊端點已由後端移除
}

// ============ 匯出 ============

/** 經濟系統 API 服務實例 */
export const economyApi = new EconomyApiService();
