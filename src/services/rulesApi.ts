/**
 * 規則引擎 API 服務（#043 統一規則引擎）
 *
 * 統一成就、任務、觸發獎勵的 API 端點
 * 取代舊的 economyApi 中分散的 getAchievements / getDailyTasks
 *
 * @module services/rulesApi
 * @see 後端契約: contracts/APP.md #043
 * @created 2026-02-10
 *
 * ============ 串接端點 ============
 * - GET  /api/rules               - 取得規則列表（含進度）
 * - GET  /api/rules/chain/:chainId - 取得任務鏈詳情
 * - GET  /api/rules/:code          - 取得單一規則詳情
 * - POST /api/rules/:id/claim      - 領取已完成規則的獎勵
 */
import { ApiBase } from './base';
import {
  RuleType,
  RuleStatus,
  RulesListResponse,
  RuleChainDetail,
  RuleDetailResponse,
  ClaimRuleResponse,
} from '../types/rules';

// ============ API 服務類別 ============

/**
 * 規則引擎 API 服務類別
 *
 * 提供統一的成就/任務/獎勵查詢和領取功能
 */
class RulesApiService extends ApiBase {

  /**
   * 取得規則列表（含用戶進度）
   *
   * 後端已按 type 分好組（achievements / quests / rewardTriggers）
   * 支援篩選 type 和 status
   *
   * @param token - JWT Token
   * @param params - 篩選參數（可選）
   * @param params.type - 篩選規則類型
   * @param params.status - 篩選用戶進度狀態
   * @returns 分組後的規則列表
   */
  async getRules(
    token: string,
    params?: { type?: RuleType; status?: RuleStatus; resetType?: 'none' | 'daily' | 'weekly' }
  ): Promise<RulesListResponse> {
    const query = new URLSearchParams();
    if (params?.type) query.append('type', params.type);
    if (params?.status) query.append('status', params.status);
    if (params?.resetType) query.append('resetType', params.resetType);

    const queryString = query.toString();
    const endpoint = `/api/rules${queryString ? `?${queryString}` : ''}`;

    return this.request<RulesListResponse>(endpoint, {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 取得任務鏈詳情
   *
   * 用於多步驟任務，顯示所有步驟和完成進度
   *
   * @param token - JWT Token
   * @param chainId - 任務鏈 ID
   * @returns 任務鏈的所有步驟和進度
   */
  async getChain(token: string, chainId: string): Promise<RuleChainDetail> {
    return this.request<RuleChainDetail>(`/api/rules/chain/${chainId}`, {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 取得單一規則詳情
   *
   * 包含完整條件定義和即時進度百分比
   *
   * @param token - JWT Token
   * @param code - 規則代碼
   * @returns 規則詳情 + 用戶進度 + 條件結果
   */
  async getRuleDetail(token: string, code: string): Promise<RuleDetailResponse> {
    return this.request<RuleDetailResponse>(`/api/rules/${code}`, {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 領取已完成規則的獎勵
   *
   * 規則必須是 completed 狀態才能領取
   * 領取後狀態變為 claimed
   *
   * @param token - JWT Token
   * @param ruleId - 規則的數字 ID
   * @returns 領取結果（含獎勵內容和信箱 ID）
   */
  async claimReward(token: string, ruleId: number): Promise<ClaimRuleResponse> {
    return this.request<ClaimRuleResponse>(`/api/rules/${ruleId}/claim`, {
      method: 'POST',
      headers: this.authHeaders(token),
    });
  }
}

// ============ 匯出 ============

/** 規則引擎 API 服務實例 */
export const rulesApi = new RulesApiService();
