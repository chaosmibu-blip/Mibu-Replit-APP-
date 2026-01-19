/**
 * 經濟系統 API - 等級、經驗、成就
 *
 * @see 後端合約: contracts/APP.md Phase 5
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
} from '../types/economy';

class EconomyApiService extends ApiBase {
  /**
   * 取得用戶等級資訊
   * GET /api/user/level
   */
  async getLevelInfo(token: string): Promise<LevelInfo> {
    return this.request<LevelInfo>('/api/user/level', {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 取得經驗值歷史記錄
   * GET /api/user/experience/history
   */
  async getExperienceHistory(
    token: string,
    params?: { page?: number; limit?: number }
  ): Promise<ExperienceHistoryResponse> {
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
   * GET /api/user/achievements
   */
  async getAchievements(
    token: string,
    params?: { category?: AchievementCategory; unlockedOnly?: boolean }
  ): Promise<AchievementsResponse> {
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
   * POST /api/user/achievements/:id/claim
   */
  async claimAchievement(token: string, achievementId: string): Promise<ClaimAchievementResponse> {
    return this.request<ClaimAchievementResponse>(`/api/user/achievements/${achievementId}/claim`, {
      method: 'POST',
      headers: this.authHeaders(token),
    });
  }

  /**
   * 申請成為策劃師
   * POST /api/user/specialist/apply
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
   * GET /api/user/daily-tasks
   */
  async getDailyTasks(token: string): Promise<DailyTasksResponse> {
    return this.request<DailyTasksResponse>('/api/user/daily-tasks', {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 領取每日任務獎勵
   * POST /api/user/daily-tasks/:id/complete
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

export const economyApi = new EconomyApiService();
