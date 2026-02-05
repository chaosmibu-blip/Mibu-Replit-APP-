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
 * 成就與任務:
 * - GET  /api/user/achievements             - 取得成就列表
 * - POST /api/user/achievements/:id/claim   - 領取成就獎勵
 * - GET  /api/user/daily-tasks              - 取得每日任務列表
 * - POST /api/user/daily-tasks/:id/complete - 領取每日任務獎勵
 *
 * 向後兼容（已棄用）:
 * - GET  /api/user/level                    - 固定回傳 level: 1
 * - GET  /api/user/experience/history       - 已棄用
 */
import { ApiBase } from './base';
import {
  LevelInfo,
  ExperienceHistoryResponse,
  AchievementsResponse,
  AchievementCategory,
  ClaimAchievementResponse,
  DailyTasksResponse,
  CompleteDailyTaskResponse,
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

  // ============ 向後兼容（已棄用） ============

  /**
   * 取得用戶等級資訊（已棄用）
   * #039: 後端固定回傳 level: 1，保留向後兼容
   *
   * @deprecated 請改用 getCoins() 和 getPerks()
   * @param token - JWT Token
   * @returns 等級資訊
   */
  async getLevelInfo(token: string): Promise<LevelInfo> {
    return this.request<LevelInfo>('/api/user/level', {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 取得經驗值歷史記錄
   *
   * 查看用戶過去獲得經驗值的來源和時間
   *
   * @param token - JWT Token
   * @param params - 分頁參數
   * @returns 經驗值歷史記錄列表
   */
  async getExperienceHistory(
    token: string,
    params?: { page?: number; limit?: number }
  ): Promise<ExperienceHistoryResponse> {
    // 組裝查詢參數
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const queryString = query.toString();
    const endpoint = `/api/user/experience/history${queryString ? `?${queryString}` : ''}`;

    return this.request<ExperienceHistoryResponse>(endpoint, {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 取得成就列表
   *
   * 支援依類別篩選和只顯示已解鎖的成就
   *
   * @param token - JWT Token
   * @param params - 篩選參數
   * @param params.category - 成就類別
   * @param params.unlockedOnly - 是否只顯示已解鎖
   * @returns 成就列表
   */
  async getAchievements(
    token: string,
    params?: { category?: AchievementCategory; unlockedOnly?: boolean }
  ): Promise<AchievementsResponse> {
    // 組裝查詢參數
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.unlockedOnly) query.append('unlockedOnly', 'true');

    const queryString = query.toString();
    const endpoint = `/api/user/achievements${queryString ? `?${queryString}` : ''}`;

    return this.request<AchievementsResponse>(endpoint, {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 領取成就獎勵
   *
   * 成就解鎖後，用戶需手動領取獎勵
   *
   * @param token - JWT Token
   * @param achievementId - 成就 ID
   * @returns 領取結果和獎勵內容
   */
  async claimAchievement(token: string, achievementId: string): Promise<ClaimAchievementResponse> {
    return this.request<ClaimAchievementResponse>(`/api/user/achievements/${achievementId}/claim`, {
      method: 'POST',
      headers: this.authHeaders(token),
    });
  }

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

  /**
   * 領取每日任務獎勵
   *
   * 完成任務後，領取對應的經驗值獎勵
   *
   * @param token - JWT Token
   * @param taskId - 任務 ID
   * @returns 領取結果和獲得的經驗值
   */
  async completeDailyTask(token: string, taskId: number): Promise<CompleteDailyTaskResponse> {
    return this.request<CompleteDailyTaskResponse>(
      `/api/user/daily-tasks/${taskId}/complete`,
      {
        method: 'POST',
        headers: this.authHeaders(token),
      }
    );
  }
}

// ============ 匯出 ============

/** 經濟系統 API 服務實例 */
export const economyApi = new EconomyApiService();
