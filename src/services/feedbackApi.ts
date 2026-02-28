/**
 * ============================================================
 * 使用者回饋 API 服務 (feedbackApi.ts)
 * ============================================================
 * 掛載路徑: /api/feedback
 *
 * 端點:
 * - POST /api/feedback — 提交使用者回饋（JWT 認證）
 *
 * 更新日期：2026-02-28（#064 新增）
 * @see 後端契約: contracts/APP.md > 使用者回饋系統
 */
import { ApiBase } from './base';
import type { CreateFeedbackRequest, CreateFeedbackResponse } from '../types/feedback';

class FeedbackApiService extends ApiBase {

  /**
   * 提交使用者回饋
   *
   * @param token - JWT Token
   * @param payload - 回饋內容（type + message + 可選 screenshots/deviceInfo）
   * @returns { success: true, feedbackId: number }
   */
  async submitFeedback(
    token: string,
    payload: CreateFeedbackRequest,
  ): Promise<CreateFeedbackResponse> {
    return this.request<CreateFeedbackResponse>('/api/feedback', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify(payload),
    });
  }
}

export const feedbackApi = new FeedbackApiService();
